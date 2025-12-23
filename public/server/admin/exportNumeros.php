<?php
date_default_timezone_set('America/Sao_Paulo');
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../php-error.log');

include_once __DIR__ . '/../db/config.php';
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true);
    
    $dateFrom = $input['dateFrom'] ?? null;
    $dateTo = $input['dateTo'] ?? null;
    
    global $conn;
    if (!$conn) {
        echo json_encode(['success' => false, 'message' => 'Conexão com o banco não encontrada.']);
        exit;
    }
    
    try {
        // Query otimizada com JOIN direto - sem filtros desnecessários
        $sql = "SELECT 
            n.numero,
            u.cpf,
            u.created_at
        FROM numeros n
        INNER JOIN usuarios u ON n.usuario_id = u.id";
        
        $params = [];
        $types = '';
        $conditions = [];
        
        if (!empty($dateFrom)) {
            $conditions[] = "u.created_at >= ?";
            $params[] = $dateFrom . ' 00:00:00';
            $types .= 's';
        }
        
        if (!empty($dateTo)) {
            $conditions[] = "u.created_at <= ?";
            $params[] = $dateTo . ' 23:59:59';
            $types .= 's';
        }
        
        if (count($conditions) > 0) {
            $sql .= " WHERE " . implode(' AND ', $conditions);
        }
        
        $sql .= " ORDER BY u.created_at DESC, n.id DESC";
        
        $stmt = $conn->prepare($sql);
        
        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }
        
        $stmt->execute();
        $result = $stmt->get_result();
        
        $numeros = [];
        while ($row = $result->fetch_assoc()) {
            $numeros[] = [
                'numero' => $row['numero'],
                'cpf' => $row['cpf'],
                'created_at' => $row['created_at']
            ];
        }
        
        echo json_encode([
            'success' => true,
            'content' => $numeros
        ]);
        
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Erro ao buscar números: ' . $e->getMessage()
        ]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Método não permitido.']);
}
