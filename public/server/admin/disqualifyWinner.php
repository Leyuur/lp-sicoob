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
    $possibleWinnerId = isset($input['possibleWinnerId']) ? intval($input['possibleWinnerId']) : 0;
    $motivo = isset($input['motivo']) ? trim($input['motivo']) : '';
    $premiadoPor = isset($input['premiadoPor']) ? trim($input['premiadoPor']) : 'admin';

    if (!$possibleWinnerId) {
        echo json_encode([
            'success' => false,
            'message' => 'ID do possível ganhador não fornecido'
        ]);
        exit;
    }

    if (empty($motivo)) {
        echo json_encode([
            'success' => false,
            'message' => 'Motivo da desclassificação é obrigatório'
        ]);
        exit;
    }

    // Buscar dados do possível ganhador
    $sqlSelect = "SELECT 
                    usuario_id,
                    numero,
                    tipo_sorteio,
                    periodo_referencia,
                    periodo_ano,
                    data_indicacao
                  FROM possiveis_ganhadores 
                  WHERE id = ?";
    
    $stmt = $conn->prepare($sqlSelect);
    $stmt->bind_param("i", $possibleWinnerId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Possível contemplado não encontrado'
        ]);
        exit;
    }
    
    $winner = $result->fetch_assoc();
    $stmt->close();

    // Inserir em ganhadores com status desclassificado
    $sqlInsert = "INSERT INTO ganhadores 
                  (usuario_id, numero, tipo_sorteio, periodo_referencia, periodo_ano, data_indicacao, indicado_por, status, motivo_desclassificacao) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, 'desclassificado', ?)";
    
    $stmtInsert = $conn->prepare($sqlInsert);
    $stmtInsert->bind_param(
        "isssssss",
        $winner['usuario_id'],
        $winner['numero'],
        $winner['tipo_sorteio'],
        $winner['periodo_referencia'],
        $winner['periodo_ano'],
        $winner['data_indicacao'],
        $premiadoPor,
        $motivo
    );
    
    if ($stmtInsert->execute()) {
        // Remover de possíveis ganhadores
        $sqlDelete = "DELETE FROM possiveis_ganhadores WHERE id = ?";
        $stmtDelete = $conn->prepare($sqlDelete);
        $stmtDelete->bind_param("i", $possibleWinnerId);
        $stmtDelete->execute();
        $stmtDelete->close();
        
        echo json_encode([
            'success' => true,
            'message' => 'Contemplado desclassificado com sucesso!'
        ]);
    } else {
        if ($conn->errno === 1062) {
            echo json_encode([
                'success' => false,
                'message' => 'Este número já está registrado'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Erro ao desclassificar: ' . $conn->error
            ]);
        }
    }

    $stmtInsert->close();
    $conn->close();

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Erro: ' . $e->getMessage()
    ]);
}
?>
