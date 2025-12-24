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
    // Buscar todos os usuários com contagem de números (mensais e periódicos)
    $sql = "SELECT 
                u.id,
                u.cpf,
                u.razao_social,
                u.data_nascimento_abertura,
                u.created_at,
                (SELECT COUNT(*) FROM numeros_mensais WHERE usuario_id = u.id) +
                (SELECT COUNT(*) FROM numeros_periodicos WHERE usuario_id = u.id) AS qtd_numeros
            FROM usuarios u
            ORDER BY qtd_numeros DESC, u.id DESC";
    
    $result = $conn->query($sql);
    
    if (!$result) {
        echo json_encode([
            'success' => false,
            'message' => 'Erro na consulta: ' . $conn->error
        ]);
        exit;
    }
    
    $users = [];
    while ($row = $result->fetch_assoc()) {
        $users[] = [
            'id' => (int)$row['id'],
            'cpf' => $row['cpf'],
            'razao_social' => $row['razao_social'],
            'data_nascimento_abertura' => $row['data_nascimento_abertura'],
            'qtd_numeros' => (int)$row['qtd_numeros'],
            'created_at' => $row['created_at']
        ];
    }
    
    echo json_encode([
        'success' => true,
        'content' => $users
    ]);

    $conn->close();

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao buscar usuários: ' . $e->getMessage()
    ]);
}
?>
