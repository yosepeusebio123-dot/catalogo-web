const loginPanel = document.querySelector('#loginPanel');
const adminPanel = document.querySelector('#adminPanel');
const adminLoginForm = document.querySelector('#adminLoginForm');
const productForm = document.querySelector('#productForm');
const categorySelect = document.querySelector('#categorySelect');
const adminProducts = document.querySelector('#adminProducts');
const loginMessage = document.querySelector('#loginMessage');
const productMessage = document.querySelector('#productMessage');
const formTitle = document.querySelector('#formTitle');

let products = [];
let categories = [];

async function api(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  return response.json();
}

function money(value) {
  return `S/ ${Number(value).toFixed(2)}`;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }[char]));
}

function getFormData(form) {
  const data = Object.fromEntries(new FormData(form).entries());
  data.featured = form.featured.checked;
  return data;
}

async function checkSession() {
  const data = await api('api/auth.php?action=me');
  if (data.user?.role === 'admin') {
    showAdmin();
  }
}

function showAdmin() {
  loginPanel.classList.add('hidden');
  adminPanel.classList.remove('hidden');
  loadCategories();
  loadProducts();
}

async function loadCategories() {
  const data = await api('api/products.php?categories=1');
  categories = data.categories || [];
  categorySelect.innerHTML = categories.map((category) => (
    `<option value="${category.id}">${escapeHtml(category.name)}</option>`
  )).join('');
}

async function loadProducts() {
  const data = await api('api/products.php?sort=newest');
  products = data.products || [];
  renderProducts();
}

function renderProducts() {
  if (products.length === 0) {
    adminProducts.innerHTML = '<tr><td colspan="5">No hay productos registrados.</td></tr>';
    return;
  }

  adminProducts.innerHTML = products.map((product) => `
    <tr>
      <td>
        <div class="mini-product">
          <img src="${escapeHtml(product.image_url)}" alt="${escapeHtml(product.name)}">
          <div>
            <strong>${escapeHtml(product.name)}</strong>
            <p>${escapeHtml(product.brand)}</p>
          </div>
        </div>
      </td>
      <td>${escapeHtml(product.category_name)}</td>
      <td>${money(product.price)}</td>
      <td>${Number(product.stock)}</td>
      <td>
        <div class="row-actions">
          <button class="edit-btn" data-edit="${product.id}">Editar</button>
          <button class="danger-btn" data-delete="${product.id}">Eliminar</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function resetForm() {
  productForm.reset();
  productForm.id.value = '';
  formTitle.textContent = 'Nuevo producto';
}

function editProduct(productId) {
  const product = products.find((item) => Number(item.id) === Number(productId));
  if (!product) return;

  productForm.id.value = product.id;
  productForm.name.value = product.name;
  productForm.brand.value = product.brand;
  productForm.price.value = product.price;
  productForm.stock.value = product.stock;
  productForm.category_id.value = product.category_id;
  productForm.image_url.value = product.image_url;
  productForm.description.value = product.description;
  productForm.featured.checked = Number(product.featured) === 1;
  formTitle.textContent = 'Editar producto';
  productForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function deleteProduct(productId) {
  if (!confirm('Eliminar este producto del catalogo?')) return;
  const data = await api(`api/products.php?id=${productId}`, { method: 'DELETE' });
  productMessage.textContent = data.ok ? 'Producto eliminado.' : data.message;
  await loadProducts();
}

adminLoginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  loginMessage.textContent = 'Validando acceso...';
  const data = await api('api/auth.php?action=login', {
    method: 'POST',
    body: JSON.stringify(Object.fromEntries(new FormData(adminLoginForm).entries())),
  });

  if (!data.ok || data.user.role !== 'admin') {
    loginMessage.textContent = data.message || 'Este usuario no es administrador.';
    return;
  }

  showAdmin();
});

productForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const payload = getFormData(productForm);
  const isEdit = Boolean(payload.id);
  productMessage.textContent = 'Guardando...';

  const data = await api('api/products.php', {
    method: isEdit ? 'PUT' : 'POST',
    body: JSON.stringify(payload),
  });

  productMessage.textContent = data.ok ? 'Producto guardado correctamente.' : data.message;
  if (data.ok) {
    resetForm();
    await loadProducts();
  }
});

adminProducts.addEventListener('click', (event) => {
  const edit = event.target.closest('[data-edit]');
  const remove = event.target.closest('[data-delete]');
  if (edit) editProduct(edit.dataset.edit);
  if (remove) deleteProduct(remove.dataset.delete);
});

document.querySelector('#refreshProductsBtn').addEventListener('click', loadProducts);
document.querySelector('#cancelEditBtn').addEventListener('click', resetForm);
document.querySelector('#logoutBtn').addEventListener('click', async () => {
  await api('api/auth.php?action=logout', { method: 'POST' });
  window.location.reload();
});

document.addEventListener('DOMContentLoaded', checkSession);
