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
    $numero = isset($input['numero']) ? trim($input['numero']) : '';
    $dataSorteio = isset($input['dataSorteio']) ? trim($input['dataSorteio']) : '';
    $indicadoPor = isset($input['indicadoPor']) ? trim($input['indicadoPor']) : 'admin';

    if (empty($numero) || empty($dataSorteio)) {
        echo json_encode([
            'success' => false,
            'message' => 'Número e data do sorteio são obrigatórios'
        ]);
        exit;
    }

    // Buscar em numeros_mensais
    $sql = "SELECT 
                nm.usuario_id,
                nm.periodo_mes as periodo,
                nm.periodo_ano as ano,
                'mensal' as tipo_sorteio,
                u.cpf,
                u.razao_social
            FROM numeros_mensais nm
            INNER JOIN usuarios u ON nm.usuario_id = u.id
            WHERE nm.numero = ?
            LIMIT 1";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $numero);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $numeroData = null;
    
    if ($result->num_rows > 0) {
        $numeroData = $result->fetch_assoc();
    } else {
        // Buscar em numeros_periodicos
        $stmt->close();
        
        $sql = "SELECT 
                    np.usuario_id,
                    np.periodo_tipo as periodo,
                    np.periodo_ano as ano,
                    'periodico' as tipo_sorteio,
                    u.cpf,
                    u.razao_social
                FROM numeros_periodicos np
                INNER JOIN usuarios u ON np.usuario_id = u.id
                WHERE np.numero = ?
                LIMIT 1";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $numero);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            $numeroData = $result->fetch_assoc();
        }
    }

    if (!$numeroData) {
        echo json_encode([
            'success' => false,
            'message' => 'Número não encontrado'
        ]);
        exit;
    }

    // Verificar se o número já foi contemplado
    $sqlCheckGanhador = "SELECT id FROM ganhadores WHERE numero = ? LIMIT 1";
    $stmtCheck = $conn->prepare($sqlCheckGanhador);
    $stmtCheck->bind_param("s", $numero);
    $stmtCheck->execute();
    $resultCheck = $stmtCheck->get_result();
    
    if ($resultCheck->num_rows > 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Este número já foi contemplado anteriormente e não pode ser marcado novamente'
        ]);
        $stmtCheck->close();
        exit;
    }
    $stmtCheck->close();

    // Inserir em possíveis ganhadores
    $sqlInsert = "INSERT INTO possiveis_ganhadores 
                  (usuario_id, numero, tipo_sorteio, periodo_referencia, periodo_ano, data_indicacao, indicado_por) 
                  VALUES (?, ?, ?, ?, ?, ?, ?)";
    
    $stmtInsert = $conn->prepare($sqlInsert);
    $stmtInsert->bind_param(
        "issssss",
        $numeroData['usuario_id'],
        $numero,
        $numeroData['tipo_sorteio'],
        $numeroData['periodo'],
        $numeroData['ano'],
        $dataSorteio,
        $indicadoPor
    );
    
    if ($stmtInsert->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Número marcado como possível contemplado'
        ]);
    } else {
        if ($conn->errno === 1062) {
            echo json_encode([
                'success' => false,
                'message' => 'Este número já está marcado como possível contemplado'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Erro ao marcar: ' . $conn->error
            ]);
        }
    }

    $stmt->close();
    $stmtInsert->close();
    $conn->close();

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Erro: ' . $e->getMessage()
    ]);
}
?>
