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
    $searchTerm = isset($input['searchTerm']) ? trim($input['searchTerm']) : '';

    if (empty($searchTerm)) {
        echo json_encode([
            'success' => false,
            'message' => 'Termo de busca não fornecido'
        ]);
        exit;
    }

    // Remover pontuação para buscar por CPF/CNPJ
    $cleanedTerm = preg_replace('/\D/', '', $searchTerm);

    // Buscar por CPF/CNPJ ou por nome
    $sql = "SELECT 
                u.id,
                u.cpf,
                u.razao_social,
                u.data_nascimento_abertura,
                u.created_at
            FROM usuarios u
            WHERE u.cpf LIKE ? 
               OR u.razao_social LIKE ?
            LIMIT 1";
    
    $likeTerm = "%{$cleanedTerm}%";
    $likeNameTerm = "%{$searchTerm}%";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $likeTerm, $likeNameTerm);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        echo json_encode(['success' => false, 'message' => 'Participante não encontrado.']);
        exit;
    }

    $user = $result->fetch_assoc();
    $userId = $user['id'];

    // Buscar números mensais
    $sqlNumerosMensais = "SELECT numero FROM numeros_mensais WHERE usuario_id = ? ORDER BY numero";
    $stmtMensais = $conn->prepare($sqlNumerosMensais);
    $stmtMensais->bind_param("i", $userId);
    $stmtMensais->execute();
    $resultMensais = $stmtMensais->get_result();
    
    $numeros = [];
    while ($row = $resultMensais->fetch_assoc()) {
        $numeros[] = $row['numero'];
    }
    $stmtMensais->close();

    // Buscar números periódicos
    $sqlNumerosPeriodicos = "SELECT numero FROM numeros_periodicos WHERE usuario_id = ? ORDER BY numero";
    $stmtPeriodicos = $conn->prepare($sqlNumerosPeriodicos);
    $stmtPeriodicos->bind_param("i", $userId);
    $stmtPeriodicos->execute();
    $resultPeriodicos = $stmtPeriodicos->get_result();
    
    while ($row = $resultPeriodicos->fetch_assoc()) {
        $numeros[] = $row['numero'];
    }
    $stmtPeriodicos->close();

    // Remover duplicatas e ordenar
    $numeros = array_unique($numeros);
    sort($numeros);

    // Buscar histórico de chaves de acesso
    $sqlChaves = "SELECT 
                    chave_acesso,
                    quantidade_numeros,
                    tipo_sorteio,
                    periodo_referencia,
                    periodo_ano,
                    uploaded_by,
                    created_at
                  FROM chaves_acesso 
                  WHERE usuario_id = ? 
                  ORDER BY created_at DESC";
    
    $stmtChaves = $conn->prepare($sqlChaves);
    $stmtChaves->bind_param("i", $userId);
    $stmtChaves->execute();
    $chavesResult = $stmtChaves->get_result();
    $historico = [];
    while ($row = $chavesResult->fetch_assoc()) {
        $historico[] = $row;
    }
    $stmtChaves->close();

    echo json_encode([
        'success' => true,
        'content' => [
            'id' => $user['id'],
            'cpf' => $user['cpf'],
            'razao_social' => $user['razao_social'],
            'data_nascimento_abertura' => $user['data_nascimento_abertura'],
            'numeros' => $numeros,
            'historico' => $historico,
            'created_at' => $user['created_at']
        ]
    ]);

    $stmt->close();
    $conn->close();

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao buscar participante: ' . $e->getMessage()
    ]);
}
?>
