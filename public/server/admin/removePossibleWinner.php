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
    $id = isset($input['id']) ? intval($input['id']) : 0;

    if (!$id) {
        echo json_encode([
            'success' => false,
            'message' => 'ID não fornecido'
        ]);
        exit;
    }

    // Deletar pelo ID da tabela possiveis_ganhadores
    $stmt = $conn->prepare('DELETE FROM possiveis_ganhadores WHERE id = ?');
    $stmt->bind_param('i', $id);
    
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Possível contemplado removido com sucesso'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Possível contemplado não encontrado'
            ]);
        }
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Erro ao remover: ' . $conn->error
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
