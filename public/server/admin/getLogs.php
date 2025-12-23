<?php
date_default_timezone_set('America/Sao_Paulo');
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../php-error.log');
include_once __DIR__ . '/../db/config.php';
date_default_timezone_set('America/Sao_Paulo');

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    global $conn;
    if (!$conn) {
        echo json_encode(['success' => false, 'message' => 'Conexão com o banco não encontrada.']);
        exit;
    }

    // Buscar todos os logs ordenados por data (mais recentes primeiro)
    $stmt = $conn->prepare('
        SELECT 
            id,
            uploaded_by,
            total_lines,
            processed_lines,
            error_count,
            numbers_generated,
            users_affected,
            affected_users,
            status,
            message,
            DATE_SUB(created_at, INTERVAL 3 HOUR) as created_at
        FROM upload_logs 
        ORDER BY created_at DESC
        LIMIT 100
    ');
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    $logs = [];
    while ($row = $result->fetch_assoc()) {
        $affectedUsersList = null;
        if (!empty($row['affected_users'])) {
            $affectedUsersList = json_decode($row['affected_users'], true);
        }
        
        $logs[] = [
            'id' => $row['id'],
            'uploadedBy' => $row['uploaded_by'],
            'totalLines' => (int)$row['total_lines'],
            'processedLines' => (int)$row['processed_lines'],
            'errorCount' => (int)$row['error_count'],
            'numbersGenerated' => (int)$row['numbers_generated'],
            'usersAffected' => (int)$row['users_affected'],
            'affectedUsers' => $affectedUsersList,
            'status' => $row['status'],
            'message' => $row['message'],
            'createdAt' => $row['created_at']
        ];
    }

    echo json_encode([
        'success' => true,
        'content' => $logs
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Método não permitido.']);
}
?>
