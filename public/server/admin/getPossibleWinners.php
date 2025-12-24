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
    // Primeiro verificar se as colunas existem
    $checkColumns = $conn->query("SHOW COLUMNS FROM possiveis_ganhadores LIKE 'data_sorteio'");
    $hasNewColumns = $checkColumns && $checkColumns->num_rows > 0;
    
    if ($hasNewColumns) {
        // Query com as novas colunas
        $stmt = $conn->prepare('
            SELECT 
                pg.id,
                pg.usuario_id,
                pg.numero,
                pg.tipo_sorteio,
                pg.periodo_referencia,
                pg.periodo_ano,
                pg.data_sorteio,
                pg.data_indicacao,
                pg.indicado_por,
                u.cpf,
                u.razao_social,
                u.data_nascimento_abertura
            FROM possiveis_ganhadores pg
            INNER JOIN usuarios u ON pg.usuario_id = u.id
            ORDER BY pg.data_indicacao DESC
        ');
    } else {
        // Query sem as novas colunas (compatibilidade)
        $stmt = $conn->prepare('
            SELECT 
                pg.id,
                pg.usuario_id,
                pg.numero,
                pg.data_indicacao,
                pg.indicado_por,
                u.cpf,
                u.razao_social,
                u.data_nascimento_abertura
            FROM possiveis_ganhadores pg
            INNER JOIN usuarios u ON pg.usuario_id = u.id
            ORDER BY pg.data_indicacao DESC
        ');
    }
    
    $stmt->execute();
    $result = $stmt->get_result();

    $possibleWinners = [];
    while ($row = $result->fetch_assoc()) {
        // Adicionar valores padrão se as colunas não existirem
        if (!$hasNewColumns) {
            $row['tipo_sorteio'] = 'mensal';
            $row['periodo_referencia'] = 'janeiro';
            $row['periodo_ano'] = 2026;
            $row['data_sorteio'] = date('Y-m-d');
        }
        $possibleWinners[] = $row;
    }

    echo json_encode([
        'success' => true,
        'content' => $possibleWinners,
        'has_new_schema' => $hasNewColumns
    ]);

    $stmt->close();
    $conn->close();

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao buscar possíveis contemplados: ' . $e->getMessage()
    ]);
}
?>
