<?php
require_once '../db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    respond(['success' => false, 'error' => 'Method not allowed'], 405);
}

$userId = $_GET['user_id'] ?? '';

if (empty($userId)) {
    respond(['success' => false, 'error' => 'User ID required'], 400);
}

$db = getDB();
$stmt = $db->prepare("SELECT * FROM users WHERE id = :id");
$stmt->execute(['id' => $userId]);
$user = $stmt->fetch();

if (!$user) {
    respond(['success' => false, 'error' => 'User not found'], 404);
}

respond(['success' => true, 'user' => formatUserResponse($user)]);
