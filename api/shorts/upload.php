<?php
require_once '../db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(['success' => false, 'error' => 'Method not allowed'], 405);
}

$user = requireAuth();

$description = trim($_POST['description'] ?? '');

if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    respond(['success' => false, 'error' => 'Short video file is required'], 400);
}

$uploadDir = '../uploads/shorts/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

$shortFile = $_FILES['file'];
$shortExt = pathinfo($shortFile['name'], PATHINFO_EXTENSION);
$shortName = generateUUID() . '.' . $shortExt;
$shortPath = $uploadDir . $shortName;

if (!move_uploaded_file($shortFile['tmp_name'], $shortPath)) {
    respond(['success' => false, 'error' => 'Failed to upload short'], 500);
}

$thumbnailUrl = '';
if (isset($_FILES['thumbnail']) && $_FILES['thumbnail']['error'] === UPLOAD_ERR_OK) {
    $thumbDir = '../uploads/thumbnails/';
    if (!is_dir($thumbDir)) {
        mkdir($thumbDir, 0755, true);
    }
    
    $thumbFile = $_FILES['thumbnail'];
    $thumbExt = pathinfo($thumbFile['name'], PATHINFO_EXTENSION);
    $thumbName = generateUUID() . '.' . $thumbExt;
    $thumbPath = $thumbDir . $thumbName;
    
    if (move_uploaded_file($thumbFile['tmp_name'], $thumbPath)) {
        $thumbnailUrl = 'https://moviedbr.com/uploads/thumbnails/' . $thumbName;
    }
}

if (empty($thumbnailUrl)) {
    $thumbnailUrl = 'https://moviedbr.com/uploads/thumbnails/default.jpg';
}

$shortUrl = 'https://moviedbr.com/uploads/shorts/' . $shortName;
$shortId = generateUUID();

$db = getDB();

$channelStmt = $db->prepare("SELECT id FROM channels WHERE user_id = :user_id LIMIT 1");
$channelStmt->execute(['user_id' => $user['id']]);
$channel = $channelStmt->fetch();

if (!$channel) {
    $channelId = generateUUID();
    $channelStmt = $db->prepare("
        INSERT INTO channels (id, user_id, name, handle, description, created_at)
        VALUES (:id, :user_id, :name, :handle, :description, NOW())
    ");
    $channelStmt->execute([
        'id' => $channelId,
        'user_id' => $user['id'],
        'name' => $user['name'] . "'s Channel",
        'handle' => '@' . $user['username'],
        'description' => 'Welcome to my channel'
    ]);
} else {
    $channelId = $channel['id'];
}

$stmt = $db->prepare("
    INSERT INTO shorts (
        id, user_id, channel_id, short_url, thumbnail, description, created_at
    ) VALUES (
        :id, :user_id, :channel_id, :short_url, :thumbnail, :description, NOW()
    )
");

$stmt->execute([
    'id' => $shortId,
    'user_id' => $user['id'],
    'channel_id' => $channelId,
    'short_url' => $shortUrl,
    'thumbnail' => $thumbnailUrl,
    'description' => $description
]);

respond([
    'success' => true,
    'message' => 'Short uploaded successfully',
    'short' => [
        'id' => $shortId,
        'short_url' => $shortUrl,
        'thumbnail' => $thumbnailUrl
    ]
]);
