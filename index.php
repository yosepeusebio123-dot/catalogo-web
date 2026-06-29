<?php
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/site.php';
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?= STORE_NAME ?> | Catalogo tech en <?= STORE_CITY ?></title>
  <meta name="description" content="<?= STORE_DESCRIPTION ?>">
  <meta name="keywords" content="<?= STORE_KEYWORDS ?>">
  <meta name="robots" content="index, follow">
  <meta name="author" content="<?= STORE_AUTHOR ?>">
  <meta property="og:title" content="<?= STORE_NAME ?> - Catalogo tecnologico">
  <meta property="og:description" content="<?= STORE_DESCRIPTION ?>">
  <meta property="og:type" content="website">
  <meta property="og:image" content="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="stylesheet" href="assets/css/style.css">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Store",
    "name": "<?= STORE_NAME ?>",
    "description": "<?= STORE_DESCRIPTION ?>",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "<?= STORE_CITY ?>",
      "addressCountry": "PE"
    },
    "telephone": "+<?= STORE_WHATSAPP ?>"
  }
  </script>
</head>
<body>
  <header class="site-header">
    <div class="top-strip">
      <span>Delivery rapido en <?= STORE_CITY ?></span>
      <span>Reportes y pedidos por WhatsApp</span>
    </div>
    <nav class="navbar">
      <a class="brand" href="index.php" aria-label="<?= STORE_NAME ?>">
        <span class="brand-mark">LS</span>
        <span>
          <strong><?= STORE_NAME ?></strong>
          <small>Autor: <?= STORE_AUTHOR ?></small>
        </span>
      </a>
      <div class="nav-actions">
        <a class="ghost-link" href="usuario.php">Usuario</a>
        <a class="solid-link" href="admin.php">Admin</a>
      </div>
    </nav>
  </header>

  <main>
    <section class="hero">
      <div class="hero-copy">
        <span class="kicker">LionShop</span>
        <h1>Catalogo de los productos tecnologicos.</h1>
        <p>Parlantes, linternas, herramientas, TV Box, accesorios y camaras con consultas directas por WhatsApp.</p>
        <div class="hero-actions">
          <a class="primary-btn" href="#catalogo">Ver catalogo</a>
          <a class="secondary-btn" href="https://wa.me/<?= STORE_WHATSAPP ?>?text=Hola%20<?= urlencode(STORE_NAME) ?>,%20quiero%20consultar%20por%20un%20producto" target="_blank" rel="noopener">WhatsApp</a>
        </div>
      </div>
      <div class="hero-device" aria-hidden="true">
        <div class="screen-card">
          <span class="signal"></span>
          <h2>LionShop</h2>
          <p>Stock activo</p>
          <strong>WhatsApp</strong>
        </div>
        <div class="floating-chip chip-one">5G</div>
        <div class="floating-chip chip-two">RGB</div>
        <div class="floating-chip chip-three">Solar</div>
      </div>
    </section>

    <section class="toolbar-section" id="catalogo">
      <div class="section-title">
        <span class="kicker">Explora</span>
        <h2>Productos por seccion</h2>
      </div>
      <div class="search-panel">
        <label>
          <span>Buscar</span>
          <input id="searchInput" type="search" placeholder="cargador, parlante,...">
        </label>
        <label>
          <span>Orden</span>
          <select id="sortSelect">
            <option value="featured">Destacados</option>
            <option value="newest">Mas recientes</option>
            <option value="price_asc">Menor precio</option>
            <option value="price_desc">Mayor precio</option>
          </select>
        </label>
      </div>
    </section>

    <section class="category-row" id="categoryRow"></section>

    <section class="catalog-shell">
      <div class="catalog-stats">
        <p id="resultCount">Cargando secciones...</p>
        <button class="text-btn" id="clearFiltersBtn">Limpiar filtros</button>
      </div>
      <div class="sectioned-catalog" id="sectionedCatalog"></div>
    </section>
  </main>

  <dialog class="product-dialog" id="productDialog">
    <button class="dialog-close" id="closeDialog" aria-label="Cerrar">x</button>
    <div id="dialogContent"></div>
  </dialog>

  <footer class="footer">
    <strong><?= STORE_NAME ?></strong>
    <span>Catalogo de productos y reportes por WhatsApp.</span>
    <span>Autor: <?= STORE_AUTHOR ?></span>
  </footer>

  <script>
    window.STORE_CONFIG = {
      name: "<?= STORE_NAME ?>",
      whatsapp: "<?= STORE_WHATSAPP ?>"
    };
  </script>
  <script src="assets/js/app.js"></script>
</body>
</html>
