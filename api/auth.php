<?php
declare(strict_types=1);
require_once __DIR__ . '/../config/database.php';

// Opciones bcrypt: cost 12 es seguro y rapido en hardware moderno
const HASH_OPTIONS = ['cost' => 12];

// Proteccion contra fuerza bruta: max 10 intentos por IP cada 15 minutos
function check_rate_limit(): void
{
    $ip  = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $key = 'login_attempts_' . md5($ip);
    $max = 10;
    $ttl = 900; // 15 minutos

    $attempts = (int)($_SESSION[$key]['count'] ?? 0);
    $since    = (int)($_SESSION[$key]['since'] ?? 0);

    if (time() - $since > $ttl) {
        // Ventana expirada: reinicia
        $_SESSION[$key] = ['count' => 0, 'since' => time()];
        return;
    }

    if ($attempts >= $max) {
        $wait = $ttl - (time() - $since);
        json_response(['ok' => false, 'message' => "Demasiados intentos. Espera {$wait} segundos."], 429);
    }
}

function increment_attempts(): void
{
    $ip  = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $key = 'login_attempts_' . md5($ip);
    $_SESSION[$key]['count'] = (int)($_SESSION[$key]['count'] ?? 0) + 1;
    if (empty($_SESSION[$key]['since'])) {
        $_SESSION[$key]['since'] = time();
    }
}

function reset_attempts(): void
{
    $ip  = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $key = 'login_attempts_' . md5($ip);
    unset($_SESSION[$key]);
}

function validate_password(string $password): ?string
{
    if (strlen($password) < 8) {
        return 'La contraseña debe tener al menos 8 caracteres.';
    }
    if (!preg_match('/[A-Za-z]/', $password)) {
        return 'La contraseña debe contener al menos una letra.';
    }
    if (!preg_match('/[0-9]/', $password)) {
        return 'La contraseña debe contener al menos un numero.';
    }
    return null;
}

// ─── Rutas ───────────────────────────────────────────────────────────────────

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];
$input  = json_decode(file_get_contents('php://input'), true) ?? [];

if ($method === 'GET' && $action === 'me') {
    json_response(['ok' => true, 'user' => current_user()]);
}

if ($method === 'POST' && $action === 'login') {
    check_rate_limit();

    $email    = trim((string)($input['email'] ?? ''));
    $password = (string)($input['password'] ?? '');

    $stmt = db()->prepare('SELECT id, name, email, password_hash, role FROM users WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        increment_attempts();
        // Mensaje generico para no revelar si el correo existe
        json_response(['ok' => false, 'message' => 'Correo o contraseña incorrectos.'], 422);
    }

    // Re-hashear si el algoritmo o el cost cambiaron
    if (password_needs_rehash($user['password_hash'], PASSWORD_BCRYPT, HASH_OPTIONS)) {
        $newHash = password_hash($password, PASSWORD_BCRYPT, HASH_OPTIONS);
        db()->prepare('UPDATE users SET password_hash = ? WHERE id = ?')
           ->execute([$newHash, $user['id']]);
    }

    reset_attempts();

    // Regenerar ID de sesion para prevenir session fixation
    session_regenerate_id(true);

    unset($user['password_hash']);
    $_SESSION['user'] = $user;
    json_response(['ok' => true, 'user' => $user]);
}

if ($method === 'POST' && $action === 'register') {
    $name     = trim((string)($input['name'] ?? ''));
    $email    = trim((string)($input['email'] ?? ''));
    $password = (string)($input['password'] ?? '');

    if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        json_response(['ok' => false, 'message' => 'Completa nombre y correo valido.'], 422);
    }

    $passError = validate_password($password);
    if ($passError !== null) {
        json_response(['ok' => false, 'message' => $passError], 422);
    }

    try {
        $hash = password_hash($password, PASSWORD_BCRYPT, HASH_OPTIONS);
        $stmt = db()->prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, "customer")');
        $stmt->execute([$name, $email, $hash]);
    } catch (PDOException $exception) {
        json_response(['ok' => false, 'message' => 'Ese correo ya esta registrado.'], 409);
    }

    // Regenerar sesion tras registro tambien
    session_regenerate_id(true);

    $_SESSION['user'] = [
        'id'    => (int)db()->lastInsertId(),
        'name'  => $name,
        'email' => $email,
        'role'  => 'customer',
    ];

    json_response(['ok' => true, 'user' => $_SESSION['user']]);
}

if ($method === 'POST' && $action === 'logout') {
    $_SESSION = [];
    session_destroy();
    json_response(['ok' => true]);
}

json_response(['ok' => false, 'message' => 'Ruta no encontrada.'], 404);
