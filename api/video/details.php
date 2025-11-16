<?php
require_once '../db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    respond(['success' => false, 'error' => 'Method not allowed'], 405);
}

$videoId = $_GET['id'] ?? '';

if (empty($videoId)) {
    respond(['success' => false, 'error' => 'Video ID required'], 400);
}

$db = getDB();

$stmt = $db->prepare("
    SELECT 
        v.*,
        u.username as author_name,
        u.profile_pic as author_avatar,
        c.name as channel_name,
        c.handle as channel_handle,
        c.subscriber_count
    FROM videos v
    INNER JOIN users u ON v.user_id = u.id
    INNER JOIN channels c ON v.channel_id = c.id
    WHERE v.id = :id
    LIMIT 1
");

$stmt->execute(['id' => $videoId]);
$video = $stmt->fetch();

if (!$video) {
    respond(['success' => false, 'error' => 'Video not found'], 404);
}

$video['tags'] = json_decode($video['tags'], true);

$updateViews = $db->prepare("UPDATE videos SET views = views + 1 WHERE id = :id");
$updateViews->execute(['id' => $videoId]);

respond([
    'success' => true,
    'video' => $video
]);
