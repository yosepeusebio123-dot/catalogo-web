const userLoginPanel = document.querySelector('#userLoginPanel');
const userPanel = document.querySelector('#userPanel');
const userLoginForm = document.querySelector('#userLoginForm');
const userRegisterForm = document.querySelector('#userRegisterForm');
const userAuthMessage = document.querySelector('#userAuthMessage');
const welcomeTitle = document.querySelector('#welcomeTitle');
const userProducts = document.querySelector('#userProducts');
const favoriteProducts = document.querySelector('#favoriteProducts');
const messageForm = document.querySelector('#messageForm');
const messageProductSelect = document.querySelector('#messageProductSelect');
const messageStatus = document.querySelector('#messageStatus');

let sessionUser = null;
let allProducts = [];
const storeConfig = window.STORE_CONFIG || { name: 'Lion Shop', whatsapp: '51918473162' };

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

async function checkSession() {
  const data = await api('api/auth.php?action=me');
  if (data.user) {
    sessionUser = data.user;
    showUserPanel();
  }
}

async function showUserPanel() {
  userLoginPanel.classList.add('hidden');
  userPanel.classList.remove('hidden');
  welcomeTitle.textContent = `Hola, ${sessionUser.name}`;
  await loadProducts();
  await loadFavorites();
}

async function loadProducts() {
  const data = await api('api/products.php?sort=featured');
  allProducts = data.products || [];
  userProducts.innerHTML = allProducts.map((product) => compactCard(product, 'Guardar', 'favorite')).join('');
  messageProductSelect.innerHTML = '<option value="">Consulta general</option>' + allProducts.map((product) => (
    `<option value="${product.id}">${escapeHtml(product.name)}</option>`
  )).join('');
}

async function loadFavorites() {
  const data = await api('api/user.php?action=favorites');
  const favorites = data.favorites || [];
  favoriteProducts.innerHTML = favorites.length
    ? favorites.map((product) => compactCard(product, 'Quitar', 'remove')).join('')
    : '<p class="form-note">Aun no tienes favoritos.</p>';
}

function compactCard(product, actionLabel, action) {
  return `
    <article class="compact-card">
      <img src="${escapeHtml(product.image_url)}" alt="${escapeHtml(product.name)}">
      <div>
        <h3>${escapeHtml(product.name)}</h3>
        <p>${money(product.price)} - ${escapeHtml(product.category_name)}</p>
      </div>
      <button class="icon-btn" data-${action}="${product.id}">${escapeHtml(actionLabel)}</button>
    </article>
  `;
}

function buildWhatsappMessage(formData) {
  const number = storeConfig.whatsapp.startsWith('51') ? storeConfig.whatsapp : '51' + storeConfig.whatsapp;
  const product = allProducts.find((item) => Number(item.id) === Number(formData.product_id));
  const productText = product ? `*${product.name}* - S/ ${Number(product.price).toFixed(2)}` : 'Consulta general';
  const text = `Hola ${storeConfig.name}! Soy *${sessionUser.name}*.\nProducto: ${productText}\nAsunto: ${formData.subject}\nMensaje: ${formData.message}`;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

async function loginOrRegister(form, action) {
  userAuthMessage.textContent = 'Procesando...';
  const data = await api(`api/auth.php?action=${action}`, {
    method: 'POST',
    body: JSON.stringify(Object.fromEntries(new FormData(form).entries())),
  });

  if (!data.ok) {
    userAuthMessage.textContent = data.message;
    return;
  }

  sessionUser = data.user;
  showUserPanel();
}

document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((item) => item.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach((form) => form.classList.remove('active'));
    tab.classList.add('active');
    document.querySelector(`#user${tab.dataset.tab === 'login' ? 'Login' : 'Register'}Form`).classList.add('active');
  });
});

userLoginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  loginOrRegister(userLoginForm, 'login');
});

userRegisterForm.addEventListener('submit', (event) => {
  event.preventDefault();
  loginOrRegister(userRegisterForm, 'register');
});

userProducts.addEventListener('click', async (event) => {
  const favorite = event.target.closest('[data-favorite]');
  if (!favorite) return;
  await api('api/user.php?action=favorite', {
    method: 'POST',
    body: JSON.stringify({ product_id: favorite.dataset.favorite }),
  });
  await loadFavorites();
});

favoriteProducts.addEventListener('click', async (event) => {
  const remove = event.target.closest('[data-remove]');
  if (!remove) return;
  await api(`api/user.php?action=favorite&product_id=${remove.dataset.remove}`, { method: 'DELETE' });
  await loadFavorites();
});

messageForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  messageStatus.textContent = 'Enviando consulta...';
  const payload = Object.fromEntries(new FormData(messageForm).entries());
  const data = await api('api/user.php?action=message', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (data.ok) {
    const url = buildWhatsappMessage(payload);
    messageStatus.innerHTML = `Consulta guardada. Abriendo WhatsApp para enviar el reporte. <a href="${url}" target="_blank" rel="noopener">Abrir WhatsApp</a>`;
    window.open(url, '_blank', 'noopener');
    messageForm.reset();
    return;
  }
  messageStatus.textContent = data.message;
});

document.querySelector('#userLogoutBtn').addEventListener('click', async () => {
  await api('api/auth.php?action=logout', { method: 'POST' });
  window.location.reload();
});

document.addEventListener('DOMContentLoaded', checkSession);
