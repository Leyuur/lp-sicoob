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
    
    $nomeFilter = $input['nomeFilter'] ?? '';
    $cpfFilter = $input['cpfFilter'] ?? '';
    $dataInicio = $input['dataInicio'] ?? '';
    $dataFim = $input['dataFim'] ?? '';
    $valorMinimo = $input['valorMinimo'] ?? '';
    $valorMaximo = $input['valorMaximo'] ?? '';
    
    global $conn;
    if (!$conn) {
        echo json_encode(['success' => false, 'message' => 'Conexão com o banco não encontrada.']);
        exit;
    }
    
    try {
        $sql = "SELECT 
            nf.id,
            nf.numero_nota,
            nf.valor,
            nf.data_compra,
            nf.uploaded_by,
            nf.created_at,
            u.id as usuario_id,
            u.name as nome,
            u.cpf
        FROM notas_fiscais nf
        INNER JOIN usuarios u ON nf.usuario_id = u.id
        WHERE 1=1";
        
        $params = [];
        $types = '';
        
        if (!empty($nomeFilter)) {
            $sql .= " AND u.name LIKE ?";
            $params[] = '%' . $nomeFilter . '%';
            $types .= 's';
        }
        
        if (!empty($cpfFilter)) {
            $cpfDigits = preg_replace('/\D/', '', $cpfFilter);
            $sql .= " AND u.cpf LIKE ?";
            $params[] = '%' . $cpfDigits . '%';
            $types .= 's';
        }
        
        if (!empty($dataInicio)) {
            $sql .= " AND nf.data_compra >= ?";
            $params[] = $dataInicio;
            $types .= 's';
        }
        
        if (!empty($dataFim)) {
            $sql .= " AND nf.data_compra <= ?";
            $params[] = $dataFim;
            $types .= 's';
        }
        
        if (!empty($valorMinimo)) {
            $sql .= " AND nf.valor >= ?";
            $params[] = (float)$valorMinimo;
            $types .= 'd';
        }
        
        if (!empty($valorMaximo)) {
            $sql .= " AND nf.valor <= ?";
            $params[] = (float)$valorMaximo;
            $types .= 'd';
        }
        
        $sql .= " ORDER BY nf.created_at DESC";
        
        $stmt = $conn->prepare($sql);
        
        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }
        
        $stmt->execute();
        $result = $stmt->get_result();
        
        $notas = [];
        while ($row = $result->fetch_assoc()) {
            $notas[] = [
                'id' => (int)$row['id'],
                'numero_nota' => $row['numero_nota'],
                'valor' => (float)$row['valor'],
                'data_compra' => $row['data_compra'],
                'uploaded_by' => $row['uploaded_by'],
                'created_at' => $row['created_at'],
                'nome' => $row['nome'],
                'cpf' => $row['cpf']
            ];
        }
        
        echo json_encode([
            'success' => true,
            'data' => $notas
        ]);
        
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Erro ao buscar notas: ' . $e->getMessage()
        ]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Método não permitido.']);
}
