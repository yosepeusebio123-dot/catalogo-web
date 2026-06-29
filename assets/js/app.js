const state = {
  products: [],
  categories: [],
  selectedCategory: '',
  search: '',
  sort: 'featured',
  user: null,
};

const storeConfig = window.STORE_CONFIG || { name: 'Lion Shop', whatsapp: '51918473162' };

const sectionedCatalog = document.querySelector('#sectionedCatalog');
const categoryRow = document.querySelector('#categoryRow');
const resultCount = document.querySelector('#resultCount');
const searchInput = document.querySelector('#searchInput');
const sortSelect = document.querySelector('#sortSelect');
const clearFiltersBtn = document.querySelector('#clearFiltersBtn');
const productDialog = document.querySelector('#productDialog');
const dialogContent = document.querySelector('#dialogContent');

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

function whatsappUrl(product) {
  // Numero con prefijo Peru +51 ya incluido en storeConfig.whatsapp
  const number = storeConfig.whatsapp.startsWith('51') ? storeConfig.whatsapp : '51' + storeConfig.whatsapp;
  const text = `Hola ${storeConfig.name}, quiero consultar por: *${product.name}*. Precio: ${money(product.price)}`;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

async function loadSession() {
  const data = await api('api/auth.php?action=me');
  state.user = data.user;
}

async function loadCategories() {
  const data = await api('api/products.php?categories=1');
  state.categories = data.categories || [];
  renderCategories();
}

async function loadProducts() {
  const params = new URLSearchParams();
  if (state.selectedCategory) params.set('category', state.selectedCategory);
  if (state.search) params.set('q', state.search);
  params.set('sort', state.sort);

  sectionedCatalog.innerHTML = '<p class="form-note">Cargando catalogo...</p>';
  const data = await api(`api/products.php?${params.toString()}`);
  state.products = data.products || [];
  renderSectionedProducts();
}

function renderCategories() {
  const allButton = `<button class="chip-btn ${state.selectedCategory === '' ? 'active' : ''}" data-category="">Todo</button>`;
  const buttons = state.categories.map((category) => `
    <button class="chip-btn ${state.selectedCategory === category.name ? 'active' : ''}" data-category="${escapeHtml(category.name)}">
      ${escapeHtml(category.name)}
    </button>
  `).join('');
  categoryRow.innerHTML = allButton + buttons;
}

function renderSectionedProducts() {
  resultCount.textContent = `${state.products.length} producto${state.products.length === 1 ? '' : 's'} encontrados`;

  if (state.products.length === 0) {
    sectionedCatalog.innerHTML = '<p class="form-note">No hay productos con esos filtros.</p>';
    return;
  }

  if (state.selectedCategory || state.search) {
    sectionedCatalog.innerHTML = `
      <section class="product-section">
        <div class="product-section-head">
          <div>
            <span class="kicker">Resultados</span>
            <h2>${escapeHtml(state.selectedCategory || 'Busqueda')}</h2>
          </div>
        </div>
        <div class="products-grid">${state.products.map(productCard).join('')}</div>
      </section>
    `;
    return;
  }

  const grouped = state.categories
    .map((category) => ({
      category,
      products: state.products.filter((product) => product.category_name === category.name),
    }))
    .filter((group) => group.products.length > 0);

  sectionedCatalog.innerHTML = grouped.map((group) => `
    <section class="product-section" id="section-${group.category.id}">
      <div class="product-section-head">
        <div>
          <span class="kicker">Seccion</span>
          <h2>${escapeHtml(group.category.name)}</h2>
        </div>
        <button class="secondary-btn" data-category="${escapeHtml(group.category.name)}">Ver solo esta seccion</button>
      </div>
      <div class="products-grid">${group.products.map(productCard).join('')}</div>
    </section>
  `).join('');
}

function productCard(product) {
  return `
    <article class="product-card">
      <img class="product-image" src="${escapeHtml(product.image_url)}" alt="${escapeHtml(product.name)}">
      <div class="product-content">
        <span class="badge">${escapeHtml(product.category_name)}</span>
        <h3>${escapeHtml(product.name)}</h3>
        <p>${escapeHtml(product.brand)}</p>
        <div class="price-line">
          <span class="price">${money(product.price)}</span>
          <span class="stock">${Number(product.stock)} und.</span>
        </div>
        <div class="card-actions">
          <button class="primary-btn" data-detail="${product.id}">Ver detalle</button>
          <button class="icon-btn" data-favorite="${product.id}" title="Guardar favorito">+</button>
        </div>
      </div>
    </article>
  `;
}

function openDetail(productId) {
  const product = state.products.find((item) => Number(item.id) === Number(productId));
  if (!product) return;

  const stockColor = Number(product.stock) > 5 ? '#12805c' : Number(product.stock) > 0 ? '#d97706' : '#c0263b';
  const stockLabel = Number(product.stock) > 0 ? `${Number(product.stock)} en stock` : 'Sin stock';

  dialogContent.innerHTML = `
    <div class="dialog-grid">
      <div class="dialog-img-wrap">
        <img src="${escapeHtml(product.image_url)}" alt="${escapeHtml(product.name)}">
      </div>
      <div class="dialog-copy">
        <span class="badge">${escapeHtml(product.category_name)}</span>
        <h2 class="dialog-title">${escapeHtml(product.name)}</h2>
        <p class="dialog-brand">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
          ${escapeHtml(product.brand)}
        </p>
        <p class="dialog-desc">${escapeHtml(product.description)}</p>
        <div class="dialog-price-block">
          <span class="price dialog-price">${money(product.price)}</span>
          <span class="dialog-stock-badge" style="background:${stockColor}20;color:${stockColor}">
            <span class="stock-dot" style="background:${stockColor}"></span>
            ${stockLabel}
          </span>
        </div>
        <div class="dialog-actions">
          <a class="dialog-wa-btn" href="${whatsappUrl(product)}" target="_blank" rel="noopener">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
            Consultar por WhatsApp
          </a>
          <a class="dialog-user-btn" href="usuario.php">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Consultar como usuario
          </a>
        </div>
      </div>
    </div>
  `;
  productDialog.showModal();
}

async function addFavorite(productId) {
  if (!state.user) {
    window.location.href = 'usuario.php';
    return;
  }

  const data = await api('api/user.php?action=favorite', {
    method: 'POST',
    body: JSON.stringify({ product_id: productId }),
  });

  if (data.ok) {
    alert('Producto guardado en favoritos.');
  }
}

categoryRow.addEventListener('click', (event) => {
  const button = event.target.closest('[data-category]');
  if (!button) return;
  state.selectedCategory = button.dataset.category;
  renderCategories();
  loadProducts();
});

sectionedCatalog.addEventListener('click', (event) => {
  const categoryButton = event.target.closest('[data-category]');
  const detail = event.target.closest('[data-detail]');
  const favorite = event.target.closest('[data-favorite]');
  if (categoryButton) {
    state.selectedCategory = categoryButton.dataset.category;
    renderCategories();
    loadProducts();
    document.querySelector('#catalogo').scrollIntoView({ behavior: 'smooth' });
  }
  if (detail) openDetail(detail.dataset.detail);
  if (favorite) addFavorite(favorite.dataset.favorite);
});

searchInput.addEventListener('input', () => {
  state.search = searchInput.value.trim();
  clearTimeout(searchInput.timer);
  searchInput.timer = setTimeout(loadProducts, 280);
});

sortSelect.addEventListener('change', () => {
  state.sort = sortSelect.value;
  loadProducts();
});

clearFiltersBtn.addEventListener('click', () => {
  state.selectedCategory = '';
  state.search = '';
  state.sort = 'featured';
  searchInput.value = '';
  sortSelect.value = 'featured';
  renderCategories();
  loadProducts();
});

document.querySelector('#closeDialog').addEventListener('click', () => productDialog.close());

document.addEventListener('DOMContentLoaded', async () => {
  await loadSession();
  await loadCategories();
  await loadProducts();
});
