<?php
date_default_timezone_set('America/Sao_Paulo');

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../db/config.php';

try {
    $input = json_decode(file_get_contents('php://input'), true);
    $winnerId = isset($input['winnerId']) ? intval($input['winnerId']) : 0;

    if (!$winnerId) {
        echo json_encode([
            'success' => false,
            'message' => 'ID do ganhador não fornecido'
        ]);
        exit;
    }

    // Verificar se o ganhador existe
    $stmt = $conn->prepare('SELECT id FROM ganhadores WHERE id = ?');
    $stmt->bind_param('i', $winnerId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Ganhador não encontrado'
        ]);
        exit;
    }
    $stmt->close();

    // Remover ganhador
    $stmt = $conn->prepare('DELETE FROM ganhadores WHERE id = ?');
    $stmt->bind_param('i', $winnerId);
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Ganhador removido com sucesso'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Erro ao remover ganhador: ' . $conn->error
        ]);
    }

    $stmt->close();
    $conn->close();

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Erro: ' . $e->getMessage()
    ]);
}
?>
