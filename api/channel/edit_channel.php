<?php
require_once '../db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(['success' => false, 'error' => 'Method not allowed'], 405);
}

$user = requireAuth();

$db = getDB();
$channelStmt = $db->prepare("SELECT * FROM channels WHERE user_id = :user_id LIMIT 1");
$channelStmt->execute(['user_id' => $user['id']]);
$channel = $channelStmt->fetch(PDO::FETCH_ASSOC);

if (!$channel) {
    respond(['success' => false, 'error' => 'Channel not found'], 404);
}

$rawBody = file_get_contents('php://input');
$input = json_decode($rawBody, true);

if (!$input) {
    respond(['success' => false, 'error' => 'Invalid JSON payload'], 400);
}

$name = $input['name'] ?? null;
$handle = $input['handle'] ?? null;
$description = $input['description'] ?? null;
$avatar = $input['avatar'] ?? null;
$banner = $input['banner'] ?? null;

$updates = [];
$params = ['id' => $channel['id']];

if ($name !== null && strlen(trim($name)) > 0) {
    $updates[] = "name = :name";
    $params['name'] = trim($name);
}

if ($handle !== null && strlen(trim($handle)) > 0) {
    $handleValue = trim($handle);
    if (!str_starts_with($handleValue, '@')) {
        $handleValue = '@' . $handleValue;
    }
    
    $existingHandleStmt = $db->prepare("SELECT id FROM channels WHERE handle = :handle AND id != :id LIMIT 1");
    $existingHandleStmt->execute(['handle' => $handleValue, 'id' => $channel['id']]);
    $existingHandle = $existingHandleStmt->fetch(PDO::FETCH_ASSOC);
    
    if ($existingHandle) {
        respond(['success' => false, 'error' => 'Handle is already taken'], 400);
    }
    
    if ($channel['handle'] !== $handleValue) {
        $lastHandleChange = $channel['handle_last_changed'] ?? null;
        
        if ($lastHandleChange) {
            $lastChangeTime = strtotime($lastHandleChange);
            $currentTime = time();
            $daysSinceLastChange = ($currentTime - $lastChangeTime) / (60 * 60 * 24);
            
            if ($daysSinceLastChange < 20) {
                $daysRemaining = ceil(20 - $daysSinceLastChange);
                respond([
                    'success' => false,
                    'error' => "Handle can be changed only once every 20 days. Please wait $daysRemaining more days."
                ], 400);
            }
        }
        
        $updates[] = "handle = :handle";
        $updates[] = "handle_last_changed = NOW()";
        $params['handle'] = $handleValue;
    }
}

if ($description !== null) {
    $updates[] = "description = :description";
    $params['description'] = trim($description);
}

if ($avatar !== null && strlen(trim($avatar)) > 0) {
    $updates[] = "avatar = :avatar";
    $params['avatar'] = trim($avatar);
}

if ($banner !== null && strlen(trim($banner)) > 0) {
    $updates[] = "banner = :banner";
    $params['banner'] = trim($banner);
}

if (empty($updates)) {
    respond(['success' => false, 'error' => 'No valid fields to update'], 400);
}

$sql = "UPDATE channels SET " . implode(', ', $updates) . " WHERE id = :id";
$updateStmt = $db->prepare($sql);
$updateStmt->execute($params);

$updatedChannelStmt = $db->prepare("SELECT * FROM channels WHERE id = :id LIMIT 1");
$updatedChannelStmt->execute(['id' => $channel['id']]);
$updatedChannel = $updatedChannelStmt->fetch(PDO::FETCH_ASSOC);

respond([
    'success' => true,
    'channel' => [
        'id' => $updatedChannel['id'],
        'name' => $updatedChannel['name'],
        'handle' => $updatedChannel['handle'],
        'description' => $updatedChannel['description'],
        'avatar' => $updatedChannel['avatar'],
        'banner' => $updatedChannel['banner'],
        'handleLastChanged' => $updatedChannel['handle_last_changed']
    ],
    'message' => 'Channel updated successfully'
]);
