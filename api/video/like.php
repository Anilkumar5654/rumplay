<?php
require_once '../db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(['success' => false, 'error' => 'Method not allowed'], 405);
}

$user = requireAuth();
$input = json_decode(file_get_contents('php://input'), true);
$videoId = $input['video_id'] ?? '';

if (empty($videoId)) {
    respond(['success' => false, 'error' => 'Video ID required'], 400);
}

$db = getDB();

$stmt = $db->prepare("SELECT id FROM video_likes WHERE video_id = :video_id AND user_id = :user_id");
$stmt->execute(['video_id' => $videoId, 'user_id' => $user['id']]);
$exists = $stmt->fetch();

if ($exists) {
    $stmt = $db->prepare("DELETE FROM video_likes WHERE video_id = :video_id AND user_id = :user_id");
    $stmt->execute(['video_id' => $videoId, 'user_id' => $user['id']]);
    
    $stmt = $db->prepare("UPDATE videos SET likes = GREATEST(0, likes - 1) WHERE id = :id");
    $stmt->execute(['id' => $videoId]);
    
    respond(['success' => true, 'liked' => false]);
} else {
    $likeId = generateUUID();
    $stmt = $db->prepare("
        INSERT INTO video_likes (id, video_id, user_id, created_at)
        VALUES (:id, :video_id, :user_id, NOW())
    ");
    $stmt->execute([
        'id' => $likeId,
        'video_id' => $videoId,
        'user_id' => $user['id']
    ]);
    
    $stmt = $db->prepare("UPDATE videos SET likes = likes + 1 WHERE id = :id");
    $stmt->execute(['id' => $videoId]);
    
    respond(['success' => true, 'liked' => true]);
}
