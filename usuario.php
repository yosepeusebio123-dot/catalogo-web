<?php
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/site.php';
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Zona Usuario | <?= STORE_NAME ?></title>
  <meta name="description" content="Zona de usuario de <?= STORE_NAME ?> para guardar favoritos y enviar consultas por productos.">
  <meta name="robots" content="noindex, follow">
  <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
  <header class="site-header">
    <nav class="navbar">
      <a class="brand" href="index.php">
        <span class="brand-mark">LS</span>
        <span><strong><?= STORE_NAME ?></strong><small>Usuario</small></span>
      </a>
      <div class="nav-actions">
        <a class="ghost-link" href="index.php">Catalogo</a>
        <button class="solid-link button-reset" id="userLogoutBtn">Salir</button>
      </div>
    </nav>
  </header>

  <main class="user-zone">
    <section class="login-card" id="userLoginPanel">
      <span class="kicker">Cuenta cliente</span>
      <h1>Interactua con la tienda</h1>
      <div class="auth-tabs">
        <button class="tab active" data-tab="login">Ingresar</button>
        <button class="tab" data-tab="register">Registrarse</button>
      </div>
      <form id="userLoginForm" class="stack-form auth-form active">
        <input type="email" name="email" value="cliente@liontech.pe" placeholder="Correo" required>
        <input type="password" name="password" placeholder="Contrasena" required autocomplete="current-password">
        <button class="primary-btn" type="submit">Entrar</button>
      </form>
      <form id="userRegisterForm" class="stack-form auth-form">
        <input type="text" name="name" placeholder="Nombre completo" required>
        <input type="email" name="email" placeholder="Correo" required>
        <input type="password" name="password" placeholder="Minimo 8 caracteres con letras y numeros" required minlength="8">
        <button class="primary-btn" type="submit">Crear cuenta</button>
      </form>
      <p class="form-note" id="userAuthMessage"></p>
    </section>

    <section class="user-panel hidden" id="userPanel">
      <div class="section-title">
        <span class="kicker">Mi espacio</span>
        <h1 id="welcomeTitle">Hola</h1>
      </div>
      <div class="user-grid">
        <section class="admin-card">
          <h2>Productos para guardar</h2>
          <div class="compact-products" id="userProducts"></div>
        </section>
        <section class="admin-card">
          <h2>Mis favoritos</h2>
          <div class="compact-products" id="favoriteProducts"></div>
        </section>
        <section class="admin-card wide">
          <h2>Enviar reporte por WhatsApp</h2>
          <form id="messageForm" class="stack-form">
            <select name="product_id" id="messageProductSelect">
              <option value="">Consulta general</option>
            </select>
            <input type="text" name="subject" placeholder="Asunto" value="Consulta de producto" required>
            <textarea name="message" rows="4" placeholder="Escribe tu mensaje para la tienda" required></textarea>
            <button class="primary-btn" type="submit">Enviar por WhatsApp</button>
          </form>
          <p class="form-note" id="messageStatus"></p>
        </section>
      </div>
    </section>
  </main>

  <script>
    window.STORE_CONFIG = {
      name: "<?= STORE_NAME ?>",
      whatsapp: "<?= STORE_WHATSAPP ?>"
    };
  </script>
  <script src="assets/js/user.js"></script>
</body>
</html>
