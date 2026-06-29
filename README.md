# Lion Shop - Catalogo Web XAMPP

Proyecto mejorado para una tienda de tecnologia usando HTML, CSS, JavaScript, PHP y MySQL.
## puertos de acceso
http://localhost:8082
http://localhost:8083

- Catalogo publico dinamico conectado a MySQL.
- Productos divididos por seccion: Parlantes, Linternas, Herramientas de construccion, TV Box, Cargadores y cables, Accesorios tecnologicos, Seguridad y camaras.
- Busqueda, filtros por seccion y orden por precio/destacados.
- Panel administrador para registrar, editar y eliminar productos.
- Zona de usuario con registro/login, favoritos y consultas.
- Base de datos lista para importar en phpMyAdmin.

## Instalacion en XAMPP

1. Copia la carpeta `catalogo-tech-xampp` dentro de `C:\xampp\htdocs\`.
2. Abre XAMPP e inicia Apache y MySQL.
3. Entra a `http://localhost/phpmyadmin`.
4. Importa el archivo `database/catalogo_tech.sql`. El archivo ya incluye `CREATE DATABASE`, `CREATE TABLE` e `INSERT INTO`.
5. Abre `http://localhost/catalogo-tech-xampp/`.

## Accesos de prueba

- Admin: `admin@liontech.pe`
- Cliente: `cliente@liontech.pe`
- Contrasena admin: `yosep2006`
- Contrasena cliente demo: `123456`

## Configuracion

La conexion esta en `config/database.php`.
Los datos de tienda, autor, SEO y WhatsApp estan en `config/site.php`.

Por defecto usa:

- Host: `localhost`
- Base de datos: `catalogo_tech`
- Usuario: `root`
- Contrasena vacia

Si tu XAMPP tiene otra clave de MySQL, cambiala en `DB_PASS`.

## Cambios antes de subir a hosting

1. En `config/site.php`, cambia `STORE_WHATSAPP` por tu numero real con codigo de pais. Ejemplo para Peru: `51987654321`.
2. En `config/site.php`, ajusta nombre, ciudad, descripcion y palabras clave.
3. En `robots.txt` y `sitemap.xml`, cambia `https://tudominio.com` por tu dominio real.
4. En tu hosting, crea la base de datos MySQL e importa `database/catalogo_tech.sql`.
