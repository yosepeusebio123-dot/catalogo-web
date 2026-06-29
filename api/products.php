<?php
declare(strict_types=1);
require_once __DIR__ . '/../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true) ?? [];

if ($method === 'GET') {
    if (isset($_GET['categories'])) {
        $categories = db()->query('SELECT * FROM categories ORDER BY name')->fetchAll();
        json_response(['ok' => true, 'categories' => $categories]);
    }

    $where = [];
    $params = [];

    if (!empty($_GET['category'])) {
        $where[] = 'c.name = ?';
        $params[] = $_GET['category'];
    }

    if (!empty($_GET['q'])) {
        $where[] = '(p.name LIKE ? OR p.brand LIKE ? OR p.description LIKE ?)';
        $term = '%' . $_GET['q'] . '%';
        array_push($params, $term, $term, $term);
    }

    $sql = 'SELECT p.*, c.name AS category_name, c.icon, c.accent
            FROM products p
            INNER JOIN categories c ON c.id = p.category_id';

    if ($where) {
        $sql .= ' WHERE ' . implode(' AND ', $where);
    }

    $sort = $_GET['sort'] ?? 'featured';
    $sql .= match ($sort) {
        'price_asc' => ' ORDER BY p.price ASC',
        'price_desc' => ' ORDER BY p.price DESC',
        'newest' => ' ORDER BY p.created_at DESC',
        default => ' ORDER BY p.featured DESC, p.created_at DESC',
    };

    $stmt = db()->prepare($sql);
    $stmt->execute($params);
    json_response(['ok' => true, 'products' => $stmt->fetchAll()]);
}

if ($method === 'POST') {
    require_admin();
    $stmt = db()->prepare('INSERT INTO products (category_id, name, brand, price, stock, image_url, description, featured)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    $stmt->execute([
        (int)$input['category_id'],
        trim((string)$input['name']),
        trim((string)$input['brand']),
        (float)$input['price'],
        (int)$input['stock'],
        trim((string)$input['image_url']),
        trim((string)$input['description']),
        !empty($input['featured']) ? 1 : 0,
    ]);
    json_response(['ok' => true, 'id' => (int)db()->lastInsertId()]);
}

if ($method === 'PUT') {
    require_admin();
    $stmt = db()->prepare('UPDATE products
        SET category_id = ?, name = ?, brand = ?, price = ?, stock = ?, image_url = ?, description = ?, featured = ?
        WHERE id = ?');
    $stmt->execute([
        (int)$input['category_id'],
        trim((string)$input['name']),
        trim((string)$input['brand']),
        (float)$input['price'],
        (int)$input['stock'],
        trim((string)$input['image_url']),
        trim((string)$input['description']),
        !empty($input['featured']) ? 1 : 0,
        (int)$input['id'],
    ]);
    json_response(['ok' => true]);
}

if ($method === 'DELETE') {
    require_admin();
    $id = (int)($_GET['id'] ?? 0);
    $stmt = db()->prepare('DELETE FROM products WHERE id = ?');
    $stmt->execute([$id]);
    json_response(['ok' => true]);
}

json_response(['ok' => false, 'message' => 'Metodo no soportado.'], 405);
