<?php
require_once '../../db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(['success' => false, 'error' => 'Method not allowed'], 405);
}

$user = requireAuth();

if (!isset($_FILES['profile_pic'])) {
    respond(['success' => false, 'error' => 'Profile picture file is required'], 400);
}

$uploadDir = '../../uploads/profiles/';
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

$file = $_FILES['profile_pic'];
$allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
$maxSize = 5 * 1024 * 1024;

if (!in_array($file['type'], $allowedTypes)) {
    respond(['success' => false, 'error' => 'Invalid image format. Only JPG and PNG allowed'], 400);
}

if ($file['size'] > $maxSize) {
    respond(['success' => false, 'error' => 'Image file too large. Max 5MB'], 400);
}

$ext = pathinfo($file['name'], PATHINFO_EXTENSION);
$uuid = generateUUID();
$filename = $uuid . '.' . $ext;
$filepath = $uploadDir . $filename;

if (!move_uploaded_file($file['tmp_name'], $filepath)) {
    respond(['success' => false, 'error' => 'Failed to upload image'], 500);
}

$profilePicPath = '/uploads/profiles/' . $filename;

$db = getDB();
$stmt = $db->prepare("UPDATE users SET profile_pic = :profile_pic, updated_at = NOW() WHERE id = :id");
$success = $stmt->execute(['profile_pic' => $profilePicPath, 'id' => $user['id']]);

if (!$success) {
    respond(['success' => false, 'error' => 'Failed to update profile picture in database'], 500);
}

respond([
    'success' => true,
    'profile_pic_url' => $profilePicPath,
    'message' => 'Profile picture updated successfully'
]);
