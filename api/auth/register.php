<?php
require_once '../db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(['success' => false, 'error' => 'Method not allowed'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$email = strtolower(trim($input['email'] ?? ''));
$username = trim($input['username'] ?? '');
$displayName = trim($input['displayName'] ?? '');
$password = $input['password'] ?? '';

if (empty($email) || empty($username) || empty($displayName) || strlen($password) < 8) {
    respond(['success' => false, 'error' => 'Invalid input'], 400);
}

$db = getDB();

$stmt = $db->prepare("SELECT id FROM users WHERE email = :email OR username = :username");
$stmt->execute(['email' => $email, 'username' => $username]);
if ($stmt->fetch()) {
    respond(['success' => false, 'error' => 'User already exists'], 400);
}

$userId = generateUUID();
$passwordData = hashPassword($password);
$role = ($email === 'superadmin@moviedbr.com') ? 'superadmin' : 'user';

$stmt = $db->prepare("
    INSERT INTO users (
        id, username, name, email, password_hash, password_salt, 
        role, created_at, updated_at
    ) VALUES (
        :id, :username, :name, :email, :password_hash, :password_salt,
        :role, NOW(), NOW()
    )
");

$stmt->execute([
    'id' => $userId,
    'username' => $username,
    'name' => $displayName,
    'email' => $email,
    'password_hash' => $passwordData['hash'],
    'password_salt' => $passwordData['salt'],
    'role' => $role
]);

$token = generateToken();
$expiresAt = date('Y-m-d H:i:s', time() + (30 * 24 * 60 * 60));

$stmt = $db->prepare("
    INSERT INTO sessions (token, user_id, expires_at, created_at)
    VALUES (:token, :user_id, :expires_at, NOW())
");
$stmt->execute([
    'token' => $token,
    'user_id' => $userId,
    'expires_at' => $expiresAt
]);

respond([
    'success' => true,
    'token' => $token,
    'user' => [
        'id' => $userId,
        'username' => $username,
        'name' => $displayName,
        'email' => $email,
        'role' => $role
    ]
]);
