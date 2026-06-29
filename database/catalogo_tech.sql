CREATE DATABASE IF NOT EXISTS catalogo_tech
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE catalogo_tech;

DROP TABLE IF EXISTS product_favorites;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'customer') NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL UNIQUE,
  icon VARCHAR(20) NOT NULL DEFAULT 'box',
  accent VARCHAR(20) NOT NULL DEFAULT '#2dd4bf'
);

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  name VARCHAR(160) NOT NULL,
  brand VARCHAR(80) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  image_url TEXT NOT NULL,
  description TEXT NOT NULL,
  featured TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_products_categories
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ON DELETE RESTRICT
);

CREATE TABLE product_favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_favorite (user_id, product_id),
  CONSTRAINT fk_favorites_users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_favorites_products FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NULL,
  subject VARCHAR(160) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('nuevo', 'respondido') NOT NULL DEFAULT 'nuevo',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_messages_users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_messages_products FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- Contraseñas hasheadas con bcrypt cost 12 (PASSWORD_BCRYPT):
--   admin@liontech.pe   → admin123A
--   cliente@liontech.pe → cliente123C
INSERT INTO users (name, email, password_hash, role) VALUES
('Administrador Lion Shop', 'admin@liontech.pe', '$2y$12$3IvNhsffMy051t2M7sdd4u8YmUtqtYvgxN3VcHnv/EaodEqSO2Qkm', 'admin'),
('Cliente Demo', 'cliente@liontech.pe', '$2y$12$X5f0mKTTyg1A6JVdXDOB0uKY1f7KOJB7wUNn0ZpEBgcFqndko/3k6', 'customer');

INSERT INTO categories (name, icon, accent) VALUES
('Parlantes', 'speaker', '#f97316'),
('Linternas', 'flashlight', '#f59e0b'),
('Herramientas de construccion', 'hammer', '#64748b'),
('TV Box', 'tv', '#38bdf8'),
('Cargadores y cables', 'plug', '#22c55e'),
('Accesorios tecnologicos', 'headphones', '#a78bfa'),
('Seguridad y camaras', 'camera', '#ef4444');

INSERT INTO products (category_id, name, brand, price, stock, image_url, description, featured) VALUES
(1, 'Parlante Bluetooth Recargable 8"', 'MegaSound', 189.00, 18, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=900&q=80', 'Parlante portatil con Bluetooth, entrada USB, micro SD, radio FM y luces LED.', 1),
(1, 'Parlante Karaoke 12" con Microfono', 'PowerBass', 369.00, 9, 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=900&q=80', 'Equipo de sonido potente para reuniones, incluye microfono inalambrico y control remoto.', 1),
(2, 'Linterna LED Recargable Alta Potencia', 'LumiPro', 49.00, 35, 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=900&q=80', 'Linterna compacta con luz frontal intensa, bateria recargable y cuerpo resistente.', 1),
(2, 'Linterna Minera con Cabezal Ajustable', 'WorkLight', 39.00, 28, 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80', 'Ideal para trabajo nocturno, camping, construccion y emergencias.', 0),
(3, 'Taladro Percutor 650W', 'ToolMax', 159.00, 12, 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=900&q=80', 'Taladro electrico para concreto, madera y metal. Incluye selector de velocidad.', 1),
(3, 'Amoladora Angular 4 1/2"', 'ConstructPro', 179.00, 10, 'https://images.unsplash.com/photo-1581147036324-c1c89c2c8b5c?auto=format&fit=crop&w=900&q=80', 'Herramienta para corte y desbaste, pensada para uso en obra y taller.', 0),
(4, 'TV Box Android 4K 64GB', 'SmartView', 149.00, 22, 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=900&q=80', 'Convierte tu TV en Smart TV con apps, WiFi, control remoto y salida HDMI.', 1),
(4, 'TV Stick Streaming Full HD', 'StreamGo', 119.00, 16, 'https://images.unsplash.com/photo-1601944177325-f8867652837f?auto=format&fit=crop&w=900&q=80', 'Dispositivo compacto para ver peliculas, series y contenido online.', 0),
(5, 'Cargador Tipo C Carga Rapida 25W', 'FastCharge', 35.00, 40, 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=900&q=80', 'Adaptador de carga rapida compatible con celulares Android y otros equipos USB-C.', 0),
(5, 'Cable USB Tipo C Reforzado 1M', 'CablePro', 15.00, 60, 'https://images.unsplash.com/photo-1615526675159-e248c3021d3f?auto=format&fit=crop&w=900&q=80', 'Cable resistente para carga y transferencia de datos.', 0),
(6, 'Audifonos Bluetooth Inalambricos', 'SoundFit', 69.00, 26, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80', 'Audifonos comodos con estuche recargable y buen sonido para uso diario.', 0),
(7, 'Camara WiFi de Seguridad 360', 'SafeCam', 129.00, 14, 'https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?auto=format&fit=crop&w=900&q=80', 'Camara para casa o negocio con vision nocturna, audio bidireccional y app movil.', 0);
