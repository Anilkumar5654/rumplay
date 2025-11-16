<?php
require_once '../db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    respond(['success' => false, 'error' => 'Method not allowed'], 405);
}

$db = getDB();

$page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
$limit = isset($_GET['limit']) ? min(50, max(1, intval($_GET['limit']))) : 20;
$offset = ($page - 1) * $limit;

$stmt = $db->prepare("
    SELECT 
        s.*,
        u.username as author_name,
        u.profile_pic as author_avatar,
        c.name as channel_name,
        c.handle as channel_handle
    FROM shorts s
    INNER JOIN users u ON s.user_id = u.id
    INNER JOIN channels c ON s.channel_id = c.id
    ORDER BY s.created_at DESC
    LIMIT :limit OFFSET :offset
");

$stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
$stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
$stmt->execute();

$shorts = $stmt->fetchAll();

respond([
    'success' => true,
    'shorts' => $shorts,
    'page' => $page,
    'limit' => $limit
]);
