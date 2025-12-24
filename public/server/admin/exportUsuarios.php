<?php
date_default_timezone_set('America/Sao_Paulo');

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
    $minNumbers = $input['minNumbers'] ?? null;
    $maxNumbers = $input['maxNumbers'] ?? null;
    
    // Query otimizada com LEFT JOIN para contar números
    $sql = "SELECT 
                u.cpf,
                u.created_at,
                COUNT(n.id) as qtd_numeros
            FROM usuarios u
            LEFT JOIN numeros n ON u.id = n.usuario_id";
    
    $conditions = [];
    $params = [];
    $types = '';
    
    if ($dateFrom) {
        $conditions[] = "u.created_at >= ?";
        $params[] = $dateFrom . ' 00:00:00';
        $types .= 's';
    }
    
    if ($dateTo) {
        $conditions[] = "u.created_at <= ?";
        $params[] = $dateTo . ' 23:59:59';
        $types .= 's';
    }
    
    if (count($conditions) > 0) {
        $sql .= " WHERE " . implode(" AND ", $conditions);
    }
    
    $sql .= " GROUP BY u.id, u.cpf, u.created_at";
    
    // Aplicar filtros de quantidade após o GROUP BY
    $havingConditions = [];
    if ($minNumbers !== null && $minNumbers !== '') {
        $havingConditions[] = "COUNT(n.id) >= ?";
        $params[] = intval($minNumbers);
        $types .= 'i';
    }
    
    if ($maxNumbers !== null && $maxNumbers !== '') {
        $havingConditions[] = "COUNT(n.id) <= ?";
        $params[] = intval($maxNumbers);
        $types .= 'i';
    }
    
    if (count($havingConditions) > 0) {
        $sql .= " HAVING " . implode(" AND ", $havingConditions);
    }
    
    $sql .= " ORDER BY u.created_at DESC";
    
    $stmt = $conn->prepare($sql);
    
    if (count($params) > 0) {
        $stmt->bind_param($types, ...$params);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    $usuarios = [];
    while ($row = $result->fetch_assoc()) {
        $usuarios[] = [
            'cpf' => $row['cpf'],
            'qtd_numeros' => intval($row['qtd_numeros']),
            'created_at' => $row['created_at']
        ];
    }
    
    $stmt->close();
    
    echo json_encode($usuarios);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao buscar usuários: ' . $e->getMessage()
    ]);
}

