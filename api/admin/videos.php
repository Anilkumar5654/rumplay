<?php
require_once '../db.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $user = requireRole(['admin', 'superadmin']);
    
    $db = getDB();
    $stmt = $db->prepare("
        SELECT 
            v.*,
            u.username as author_name,
            c.name as channel_name
        FROM videos v
        INNER JOIN users u ON v.user_id = u.id
        INNER JOIN channels c ON v.channel_id = c.id
        ORDER BY v.created_at DESC
    ");
    $stmt->execute();
    $videos = $stmt->fetchAll();
    
    foreach ($videos as &$video) {
        $video['tags'] = json_decode($video['tags'], true);
    }
    
    respond(['success' => true, 'videos' => $videos]);
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $user = requireRole(['admin', 'superadmin']);
    $input = json_decode(file_get_contents('php://input'), true);
    
    $videoId = $input['video_id'] ?? '';
    
    if (empty($videoId)) {
        respond(['success' => false, 'error' => 'Video ID required'], 400);
    }
    
    $db = getDB();
    $stmt = $db->prepare("DELETE FROM videos WHERE id = :id");
    $stmt->execute(['id' => $videoId]);
    
    respond(['success' => true, 'message' => 'Video deleted']);
}

respond(['success' => false, 'error' => 'Method not allowed'], 405);
