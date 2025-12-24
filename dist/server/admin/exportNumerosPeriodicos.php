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
    
    $periodoTipo = $input['periodoReferencia'] ?? null;
    $periodoAno = $input['periodoAno'] ?? null;
    
    global $conn;
    if (!$conn) {
        echo json_encode(['success' => false, 'message' => 'Conexão com o banco não encontrada.']);
        exit;
    }
    
    try {
        $sql = "SELECT 
            n.numero,
            u.cpf,
            COALESCE(u.razao_social, u.name) as razao_social,
            n.periodo_tipo,
            n.periodo_ano,
            n.created_at,
            n.uploaded_by
        FROM numeros_periodicos n
        INNER JOIN usuarios u ON n.usuario_id = u.id
        WHERE 1=1";
        
        $params = [];
        $types = '';
        
        if (!empty($periodoTipo)) {
            $sql .= " AND n.periodo_tipo = ?";
            $params[] = $periodoTipo;
            $types .= 's';
        }
        
        if (!empty($periodoAno)) {
            $sql .= " AND n.periodo_ano = ?";
            $params[] = $periodoAno;
            $types .= 's';
        }
        
        $sql .= " ORDER BY n.created_at DESC, n.id DESC";
        
        $stmt = $conn->prepare($sql);
        
        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }
        
        $stmt->execute();
        $result = $stmt->get_result();
        
        $numeros = [];
        while ($row = $result->fetch_assoc()) {
            // Formatar número 000/00000
            $parts = explode('/', $row['numero']);
            $numeroFormatado = str_pad($parts[0], 3, '0', STR_PAD_LEFT) . '/' . str_pad($parts[1], 5, '0', STR_PAD_LEFT);
            
            $numeros[] = [
                'numero' => $numeroFormatado,
                'cpf' => $row['cpf'],
                'razao_social' => $row['razao_social'],
                'periodo_tipo' => $row['periodo_tipo'],
                'periodo_ano' => $row['periodo_ano'],
                'created_at' => $row['created_at'],
                'uploaded_by' => $row['uploaded_by']
            ];
        }
        
        echo json_encode([
            'success' => true,
            'content' => $numeros
        ]);
        
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Erro ao buscar números periódicos: ' . $e->getMessage()
        ]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Método não permitido.']);
}
