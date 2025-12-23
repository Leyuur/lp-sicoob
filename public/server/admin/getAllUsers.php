<?php
date_default_timezone_set('America/Sao_Paulo');
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../php-error.log');
include_once __DIR__ . '/../db/config.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    global $conn;
    if (!$conn) {
        echo json_encode(['success' => false, 'message' => 'Conexão com o banco não encontrada.']);
        exit;
    }

    // Buscar todos os usuários com contagem de números
    $sql = "SELECT 
                u.id,
                u.cpf,
                u.created_at,
                COALESCE(COUNT(DISTINCT n.id), 0) AS qtd_numeros
            FROM usuarios u
            LEFT JOIN numeros n ON n.usuario_id = u.id
            GROUP BY u.id, u.cpf, u.created_at
            ORDER BY u.id DESC";
    
    $result = $conn->query($sql);
    
    if (!$result) {
        echo json_encode(['success' => false, 'message' => 'Erro na consulta.']);
        exit;
    }
    
    $users = [];
    while ($row = $result->fetch_assoc()) {
        $users[] = [
            'id' => (int)$row['id'],
            'cpf' => $row['cpf'],
            'qtd_numeros' => (int)$row['qtd_numeros'],
            'created_at' => $row['created_at']
        ];
    }
    
    echo json_encode([
        'success' => true,
        'content' => $users
    ]);
}
?>
