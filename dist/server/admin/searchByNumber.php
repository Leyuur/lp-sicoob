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

    if (empty($numero)) {
        echo json_encode([
            'success' => false,
            'message' => 'Número não fornecido'
        ]);
        exit;
    }

    // Primeiro, tentar buscar nas tabelas mensais
    $sql = "SELECT 
                nm.numero,
                nm.periodo_mes as periodo,
                nm.periodo_ano as ano,
                'mensal' as tipo_sorteio,
                nm.created_at,
                u.id as usuario_id,
                u.cpf,
                u.razao_social,
                u.data_nascimento_abertura,
                ca.chave_acesso,
                ca.quantidade_numeros,
                ca.tipo_sorteio as chave_tipo_sorteio,
                ca.periodo_referencia,
                ca.periodo_ano as chave_periodo_ano,
                ca.uploaded_by,
                ca.created_at as chave_created_at,
                (SELECT COUNT(*) FROM numeros_mensais WHERE usuario_id = u.id) +
                (SELECT COUNT(*) FROM numeros_periodicos WHERE usuario_id = u.id) as total_numeros
            FROM numeros_mensais nm
            INNER JOIN usuarios u ON nm.usuario_id = u.id
            INNER JOIN chaves_acesso ca ON ca.usuario_id = u.id 
                AND ca.tipo_sorteio = 'mensal' 
                AND ca.periodo_referencia = nm.periodo_mes
                AND ca.periodo_ano = nm.periodo_ano
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
        // Se não encontrou em mensais, buscar em periódicos
        $stmt->close();
        
        $sql = "SELECT 
                    np.numero,
                    np.periodo_tipo as periodo,
                    np.periodo_ano as ano,
                    'periodico' as tipo_sorteio,
                    np.created_at,
                    u.id as usuario_id,
                    u.cpf,
                    u.razao_social,
                    u.data_nascimento_abertura,
                    ca.chave_acesso,
                    ca.quantidade_numeros,
                    ca.tipo_sorteio as chave_tipo_sorteio,
                    ca.periodo_referencia,
                    ca.periodo_ano as chave_periodo_ano,
                    ca.uploaded_by,
                    ca.created_at as chave_created_at,
                    (SELECT COUNT(*) FROM numeros_mensais WHERE usuario_id = u.id) +
                    (SELECT COUNT(*) FROM numeros_periodicos WHERE usuario_id = u.id) as total_numeros
                FROM numeros_periodicos np
                INNER JOIN usuarios u ON np.usuario_id = u.id
                INNER JOIN chaves_acesso ca ON ca.usuario_id = u.id 
                    AND ca.tipo_sorteio = 'periodico' 
                    AND ca.periodo_referencia = np.periodo_tipo
                    AND ca.periodo_ano = np.periodo_ano
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

    if ($numeroData) {
        echo json_encode([
            'success' => true,
            'content' => [
                'numero' => $numeroData['numero'],
                'tipo_sorteio' => $numeroData['tipo_sorteio'],
                'periodo' => $numeroData['periodo'],
                'ano' => $numeroData['ano'],
                'usuario' => [
                    'id' => $numeroData['usuario_id'],
                    'cpf' => $numeroData['cpf'],
                    'razao_social' => $numeroData['razao_social'],
                    'data_nascimento_abertura' => $numeroData['data_nascimento_abertura'],
                    'total_numeros' => $numeroData['total_numeros']
                ],
                'chave' => [
                    'chave_acesso' => $numeroData['chave_acesso'],
                    'quantidade_numeros' => $numeroData['quantidade_numeros'],
                    'tipo_sorteio' => $numeroData['chave_tipo_sorteio'],
                    'periodo_referencia' => $numeroData['periodo_referencia'],
                    'periodo_ano' => $numeroData['chave_periodo_ano'],
                    'uploaded_by' => $numeroData['uploaded_by'],
                    'created_at' => $numeroData['chave_created_at']
                ]
            ]
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Número da sorte não encontrado'
        ]);
    }

    $stmt->close();
    $conn->close();

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao buscar número: ' . $e->getMessage()
    ]);
}
?>
