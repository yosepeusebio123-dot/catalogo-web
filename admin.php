<?php
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/site.php';
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Panel Admin | <?= STORE_NAME ?></title>
  <meta name="robots" content="noindex, nofollow">
  <link rel="stylesheet" href="assets/css/style.css">
</head>
<body class="admin-body">
  <header class="site-header">
    <nav class="navbar">
      <a class="brand" href="index.php">
        <span class="brand-mark">LS</span>
        <span><strong><?= STORE_NAME ?></strong><small>Admin</small></span>
      </a>
      <div class="nav-actions">
        <a class="ghost-link" href="index.php">Catalogo</a>
        <button class="solid-link button-reset" id="logoutBtn">Salir</button>
      </div>
    </nav>
  </header>

  <main class="dashboard">
    <section class="login-card" id="loginPanel">
      <span class="kicker">Acceso privado</span>
      <h1>Panel para registrar productos</h1>
      <form id="adminLoginForm" class="stack-form">
        <input type="email" name="email" value="admin@liontech.pe" placeholder="Correo admin" required>
        <input type="password" name="password" placeholder="Contrasena (min. 8 caracteres)" required autocomplete="current-password">
        <button class="primary-btn" type="submit">Entrar al panel</button>
      </form>
      <p class="form-note" id="loginMessage"></p>
    </section>

    <section class="admin-grid hidden" id="adminPanel">
      <aside class="admin-card">
        <span class="kicker">Inventario</span>
        <h2 id="formTitle">Nuevo producto</h2>
        <form id="productForm" class="stack-form">
          <input type="hidden" name="id">
          <input type="text" name="name" placeholder="Nombre del producto" required>
          <input type="text" name="brand" placeholder="Marca" required>
          <div class="two-col">
            <input type="number" name="price" placeholder="Precio S/" min="0" step="0.01" required>
            <input type="number" name="stock" placeholder="Stock" min="0" required>
          </div>
          <select name="category_id" id="categorySelect" required></select>
          <input type="url" name="image_url" placeholder="URL de imagen" required>
          <textarea name="description" rows="4" placeholder="Descripcion del producto" required></textarea>
          <label class="check-line">
            <input type="checkbox" name="featured">
            <span>Producto destacado</span>
          </label>
          <button class="primary-btn" type="submit">Guardar producto</button>
          <button class="secondary-btn" type="button" id="cancelEditBtn">Cancelar edicion</button>
        </form>
        <p class="form-note" id="productMessage"></p>
      </aside>

      <section class="admin-card wide">
        <div class="admin-list-header">
          <div>
            <span class="kicker">Productos</span>
            <h2>Gestion del catalogo</h2>
          </div>
          <button class="secondary-btn" id="refreshProductsBtn">Actualizar</button>
        </div>
        <div class="table-wrap">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoria</th>
                <th>Precio</th>
                <th>Stock</th>
                <th></th>
              </tr>
            </thead>
            <tbody id="adminProducts"></tbody>
          </table>
        </div>
      </section>
    </section>
  </main>

  <script src="assets/js/admin.js"></script>
</body>
</html>
