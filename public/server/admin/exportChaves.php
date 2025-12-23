<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../db/config.php';

try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $dateFrom = $input['dateFrom'] ?? null;
    $dateTo = $input['dateTo'] ?? null;
    
    // Query otimizada com JOIN para buscar todas as chaves de uma vez
    $sql = "SELECT 
                c.chave_acesso,
                u.cpf,
                c.quantidade_numeros,
                c.created_at,
                c.uploaded_by
            FROM chaves_acesso c
            INNER JOIN usuarios u ON c.usuario_id = u.id";
    
    $conditions = [];
    $params = [];
    $types = '';
    
    if ($dateFrom) {
        $conditions[] = "c.created_at >= ?";
        $params[] = $dateFrom . ' 00:00:00';
        $types .= 's';
    }
    
    if ($dateTo) {
        $conditions[] = "c.created_at <= ?";
        $params[] = $dateTo . ' 23:59:59';
        $types .= 's';
    }
    
    if (count($conditions) > 0) {
        $sql .= " WHERE " . implode(" AND ", $conditions);
    }
    
    $sql .= " ORDER BY c.created_at DESC";
    
    $stmt = $conn->prepare($sql);
    
    if (count($params) > 0) {
        $stmt->bind_param($types, ...$params);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    $chaves = [];
    while ($row = $result->fetch_assoc()) {
        $chaves[] = [
            'chave_acesso' => $row['chave_acesso'],
            'cpf' => $row['cpf'],
            'quantidade_numeros' => intval($row['quantidade_numeros']),
            'created_at' => $row['created_at'],
            'uploaded_by' => $row['uploaded_by']
        ];
    }
    
    $stmt->close();
    
    echo json_encode($chaves);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao buscar chaves: ' . $e->getMessage()
    ]);
}

