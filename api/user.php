<?php
declare(strict_types=1);
require_once __DIR__ . '/../config/database.php';

$user = require_user();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$input = json_decode(file_get_contents('php://input'), true) ?? [];

if ($method === 'GET' && $action === 'favorites') {
    $stmt = db()->prepare('SELECT p.*, c.name AS category_name
        FROM product_favorites f
        INNER JOIN products p ON p.id = f.product_id
        INNER JOIN categories c ON c.id = p.category_id
        WHERE f.user_id = ?
        ORDER BY f.created_at DESC');
    $stmt->execute([$user['id']]);
    json_response(['ok' => true, 'favorites' => $stmt->fetchAll()]);
}

if ($method === 'POST' && $action === 'favorite') {
    $stmt = db()->prepare('INSERT IGNORE INTO product_favorites (user_id, product_id) VALUES (?, ?)');
    $stmt->execute([$user['id'], (int)$input['product_id']]);
    json_response(['ok' => true]);
}

if ($method === 'DELETE' && $action === 'favorite') {
    $stmt = db()->prepare('DELETE FROM product_favorites WHERE user_id = ? AND product_id = ?');
    $stmt->execute([$user['id'], (int)($_GET['product_id'] ?? 0)]);
    json_response(['ok' => true]);
}

if ($method === 'POST' && $action === 'message') {
    $subject = trim((string)($input['subject'] ?? 'Consulta de producto'));
    $message = trim((string)($input['message'] ?? ''));
    $productId = !empty($input['product_id']) ? (int)$input['product_id'] : null;

    if ($message === '') {
        json_response(['ok' => false, 'message' => 'Escribe tu consulta.'], 422);
    }

    $stmt = db()->prepare('INSERT INTO messages (user_id, product_id, subject, message) VALUES (?, ?, ?, ?)');
    $stmt->execute([$user['id'], $productId, $subject, $message]);
    json_response(['ok' => true]);
}

json_response(['ok' => false, 'message' => 'Ruta no encontrada.'], 404);
