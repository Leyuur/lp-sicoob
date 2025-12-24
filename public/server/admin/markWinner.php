<?php
date_default_timezone_set('America/Sao_Paulo');

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
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
    $premiadoPor = isset($input['premiadoPor']) ? trim($input['premiadoPor']) : 'admin';

    if (!$possibleWinnerId) {
        echo json_encode([
            'success' => false,
            'message' => 'ID do possível ganhador não fornecido'
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

    // Determinar categoria do sorteio
    $categoria = '';
    if ($winner['tipo_sorteio'] === 'mensal') {
        $categoria = 'mensal';
    } else {
        // Determinar categoria dos periódicos
        $periodico = $winner['periodo_referencia'];
        if (strpos($periodico, 'trimestre') !== false) {
            $categoria = 'trimestral';
        } elseif ($periodico === 'semestral') {
            $categoria = 'semestral';
        } elseif ($periodico === 'anual') {
            $categoria = 'anual';
        }
    }

    // Verificar se usuário já ganhou nesta categoria
    $sqlCheck = "SELECT COUNT(*) as total FROM ganhadores g
                 WHERE g.usuario_id = ?
                 AND (
                     (? = 'mensal' AND g.tipo_sorteio = 'mensal')
                     OR (? = 'trimestral' AND g.periodo_referencia LIKE 'trimestre_%')
                     OR (? = 'semestral' AND g.periodo_referencia = 'semestral')
                     OR (? = 'anual' AND g.periodo_referencia = 'anual')
                 )";
    
    $stmtCheck = $conn->prepare($sqlCheck);
    $stmtCheck->bind_param("issss", $winner['usuario_id'], $categoria, $categoria, $categoria, $categoria);
    $stmtCheck->execute();
    $checkResult = $stmtCheck->get_result();
    $checkData = $checkResult->fetch_assoc();
    $stmtCheck->close();

    if ($checkData['total'] > 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Este usuário já foi contemplado na categoria ' . $categoria . '. Cada pessoa pode ganhar no máximo 1x por categoria (mensal, trimestral, semestral, anual).'
        ]);
        exit;
    }

    // Inserir em ganhadores oficiais
    $sqlInsert = "INSERT INTO ganhadores 
                  (usuario_id, numero, tipo_sorteio, periodo_referencia, periodo_ano, data_indicacao, indicado_por, status) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, 'contemplado')";
    
    $stmtInsert = $conn->prepare($sqlInsert);
    $stmtInsert->bind_param(
        "issssss",
        $winner['usuario_id'],
        $winner['numero'],
        $winner['tipo_sorteio'],
        $winner['periodo_referencia'],
        $winner['periodo_ano'],
        $winner['data_indicacao'],
        $premiadoPor
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
            'message' => 'Contemplado confirmado com sucesso!'
        ]);
    } else {
        if ($conn->errno === 1062) {
            echo json_encode([
                'success' => false,
                'message' => 'Este número já está registrado como contemplado'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Erro ao confirmar: ' . $conn->error
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
