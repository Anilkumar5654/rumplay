<?php
require_once '../db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    respond(['success' => false, 'error' => 'Method not allowed'], 405);
}

$user = getAuthUser();

if (!$user) {
    respond(['success' => false, 'error' => 'Unauthorized'], 401);
}

unset($user['password_hash'], $user['password_salt']);

respond([
    'success' => true,
    'user' => $user
]);
