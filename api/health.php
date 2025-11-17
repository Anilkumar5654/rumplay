<?php
require_once __DIR__ . '/db.php';

try {
    $db = getDB();
    
    $stmt = $db->query("SELECT 1");
    $dbStatus = $stmt ? 'connected' : 'error';
    
    respond([
        'success' => true,
        'message' => 'Rumplay API is working',
        'database' => $dbStatus,
        'timestamp' => date('Y-m-d H:i:s'),
        'server' => 'MovieDBR.com'
    ]);
} catch (Exception $e) {
    respond([
        'success' => false,
        'message' => 'Health check failed',
        'database' => 'error',
        'error' => $e->getMessage()
    ], 500);
}
