<?php
require_once '../db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(['success' => false, 'error' => 'Method not allowed'], 405);
}

$user = requireAuth();

$title = trim($_POST['title'] ?? '');
$description = trim($_POST['description'] ?? '');
$category = trim($_POST['category'] ?? 'General');
$visibility = $_POST['visibility'] ?? 'public';
$tags = isset($_POST['tags']) ? (array)$_POST['tags'] : [];

if (empty($title)) {
    respond(['success' => false, 'error' => 'Title is required'], 400);
}

if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    respond(['success' => false, 'error' => 'Video file is required'], 400);
}

$uploadDir = '../uploads/videos/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

$videoFile = $_FILES['file'];
$videoExt = pathinfo($videoFile['name'], PATHINFO_EXTENSION);
$videoName = generateUUID() . '.' . $videoExt;
$videoPath = $uploadDir . $videoName;

if (!move_uploaded_file($videoFile['tmp_name'], $videoPath)) {
    respond(['success' => false, 'error' => 'Failed to upload video'], 500);
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

$videoUrl = 'https://moviedbr.com/uploads/videos/' . $videoName;
$videoId = generateUUID();

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
    INSERT INTO videos (
        id, user_id, channel_id, title, description, video_url, 
        thumbnail, privacy, category, tags, created_at
    ) VALUES (
        :id, :user_id, :channel_id, :title, :description, :video_url,
        :thumbnail, :privacy, :category, :tags, NOW()
    )
");

$stmt->execute([
    'id' => $videoId,
    'user_id' => $user['id'],
    'channel_id' => $channelId,
    'title' => $title,
    'description' => $description,
    'video_url' => $videoUrl,
    'thumbnail' => $thumbnailUrl,
    'privacy' => $visibility,
    'category' => $category,
    'tags' => json_encode($tags)
]);

respond([
    'success' => true,
    'message' => 'Video uploaded successfully',
    'video' => [
        'id' => $videoId,
        'title' => $title,
        'video_url' => $videoUrl,
        'thumbnail' => $thumbnailUrl
    ]
]);
