<?php
require_once '../db.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $user = requireRole(['admin', 'superadmin']);
    
    $db = getDB();
    $stmt = $db->prepare("SELECT id, username, name, email, role, created_at FROM users ORDER BY created_at DESC");
    $stmt->execute();
    $users = $stmt->fetchAll();
    
    respond(['success' => true, 'users' => $users]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user = requireRole(['superadmin']);
    $input = json_decode(file_get_contents('php://input'), true);
    
    $targetUserId = $input['user_id'] ?? '';
    $newRole = $input['role'] ?? '';
    
    if (empty($targetUserId) || empty($newRole)) {
        respond(['success' => false, 'error' => 'User ID and role required'], 400);
    }
    
    $db = getDB();
    $stmt = $db->prepare("UPDATE users SET role = :role WHERE id = :id");
    $stmt->execute(['role' => $newRole, 'id' => $targetUserId]);
    
    respond(['success' => true, 'message' => 'User role updated']);
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $user = requireRole(['superadmin']);
    $input = json_decode(file_get_contents('php://input'), true);
    
    $targetUserId = $input['user_id'] ?? '';
    
    if (empty($targetUserId)) {
        respond(['success' => false, 'error' => 'User ID required'], 400);
    }
    
    $db = getDB();
    $stmt = $db->prepare("DELETE FROM users WHERE id = :id");
    $stmt->execute(['id' => $targetUserId]);
    
    respond(['success' => true, 'message' => 'User deleted']);
}

respond(['success' => false, 'error' => 'Method not allowed'], 405);
