<?php
require_once '../db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user = requireAuth();
    $input = json_decode(file_get_contents('php://input'), true);
    $videoId = $input['video_id'] ?? '';
    $comment = trim($input['comment'] ?? '');
    
    if (empty($videoId) || empty($comment)) {
        respond(['success' => false, 'error' => 'Video ID and comment required'], 400);
    }
    
    $db = getDB();
    $commentId = generateUUID();
    
    $stmt = $db->prepare("
        INSERT INTO video_comments (id, video_id, user_id, comment, created_at)
        VALUES (:id, :video_id, :user_id, :comment, NOW())
    ");
    
    $stmt->execute([
        'id' => $commentId,
        'video_id' => $videoId,
        'user_id' => $user['id'],
        'comment' => $comment
    ]);
    
    respond([
        'success' => true,
        'comment' => [
            'id' => $commentId,
            'video_id' => $videoId,
            'user_id' => $user['id'],
            'username' => $user['username'],
            'comment' => $comment,
            'created_at' => date('Y-m-d H:i:s')
        ]
    ]);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $videoId = $_GET['video_id'] ?? '';
    
    if (empty($videoId)) {
        respond(['success' => false, 'error' => 'Video ID required'], 400);
    }
    
    $db = getDB();
    $stmt = $db->prepare("
        SELECT 
            c.*,
            u.username,
            u.profile_pic as user_avatar
        FROM video_comments c
        INNER JOIN users u ON c.user_id = u.id
        WHERE c.video_id = :video_id
        ORDER BY c.created_at DESC
    ");
    
    $stmt->execute(['video_id' => $videoId]);
    $comments = $stmt->fetchAll();
    
    respond([
        'success' => true,
        'comments' => $comments
    ]);
}

respond(['success' => false, 'error' => 'Method not allowed'], 405);
