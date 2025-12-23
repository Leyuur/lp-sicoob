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
    
    $tipoSorteio = $input['tipoSorteio'] ?? null;
    $periodoReferencia = $input['periodoReferencia'] ?? null;
    $periodoAno = $input['periodoAno'] ?? null;
    
    global $conn;
    if (!$conn) {
        echo json_encode(['success' => false, 'message' => 'Conexão com o banco não encontrada.']);
        exit;
    }
    
    try {
        $sql = "SELECT 
            c.chave_acesso,
            u.cpf,
            c.quantidade_numeros,
            c.tipo_sorteio,
            c.periodo_referencia,
            c.periodo_ano,
            c.uploaded_by,
            c.created_at
        FROM chaves_acesso c
        INNER JOIN usuarios u ON c.usuario_id = u.id
        WHERE 1=1";
        
        $params = [];
        $types = '';
        
        if (!empty($tipoSorteio) && $tipoSorteio !== 'todos') {
            $sql .= " AND c.tipo_sorteio = ?";
            $params[] = $tipoSorteio;
            $types .= 's';
        }
        
        if (!empty($periodoReferencia)) {
            $sql .= " AND c.periodo_referencia = ?";
            $params[] = $periodoReferencia;
            $types .= 's';
        }
        
        if (!empty($periodoAno)) {
            $sql .= " AND c.periodo_ano = ?";
            $params[] = $periodoAno;
            $types .= 's';
        }
        
        $sql .= " ORDER BY c.created_at DESC";
        
        $stmt = $conn->prepare($sql);
        
        if (!empty($params)) {
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
                'tipo_sorteio' => $row['tipo_sorteio'],
                'periodo_referencia' => $row['periodo_referencia'],
                'periodo_ano' => $row['periodo_ano'],
                'uploaded_by' => $row['uploaded_by'],
                'created_at' => $row['created_at']
            ];
        }
        
        echo json_encode([
            'success' => true,
            'content' => $chaves
        ]);
        
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Erro ao buscar chaves: ' . $e->getMessage()
        ]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Método não permitido.']);
}
