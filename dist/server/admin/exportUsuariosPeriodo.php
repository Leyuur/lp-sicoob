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
        // Buscar usuários com números de ambas as tabelas
        $sql = "SELECT DISTINCT
            u.cpf,
            u.name,
            u.razao_social,
            u.data_nascimento_abertura,
            u.created_at
        FROM usuarios u
        WHERE 1=1";
        
        $params = [];
        $types = '';
        
        // Se filtrar por tipo e período, usar subquery para filtrar usuários
        if (!empty($tipoSorteio) && $tipoSorteio !== 'todos') {
            if ($tipoSorteio === 'mensal') {
                $sql = "SELECT DISTINCT
                    u.cpf,
                    u.name,
                    u.razao_social,
                    u.data_nascimento_abertura,
                    u.created_at
                FROM usuarios u
                INNER JOIN numeros_mensais nm ON u.id = nm.usuario_id
                WHERE 1=1";
                
                if (!empty($periodoReferencia)) {
                    $sql .= " AND nm.periodo_mes = ?";
                    $params[] = $periodoReferencia;
                    $types .= 's';
                }
                
                if (!empty($periodoAno)) {
                    $sql .= " AND nm.periodo_ano = ?";
                    $params[] = $periodoAno;
                    $types .= 's';
                }
            } else {
                $sql = "SELECT DISTINCT
                    u.cpf,
                    u.name,
                    u.razao_social,
                    u.data_nascimento_abertura,
                    u.created_at
                FROM usuarios u
                INNER JOIN numeros_periodicos np ON u.id = np.usuario_id
                WHERE 1=1";
                
                if (!empty($periodoReferencia)) {
                    $sql .= " AND np.periodo_tipo = ?";
                    $params[] = $periodoReferencia;
                    $types .= 's';
                }
                
                if (!empty($periodoAno)) {
                    $sql .= " AND np.periodo_ano = ?";
                    $params[] = $periodoAno;
                    $types .= 's';
                }
            }
        }
        
        $sql .= " ORDER BY u.created_at DESC";
        
        $stmt = $conn->prepare($sql);
        
        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }
        
        $stmt->execute();
        $result = $stmt->get_result();
        
        $usuarios = [];
        while ($row = $result->fetch_assoc()) {
            $usuarioId = null;
            
            // Buscar ID do usuário para contar números
            $stmtId = $conn->prepare('SELECT id FROM usuarios WHERE cpf = ? LIMIT 1');
            $stmtId->bind_param('s', $row['cpf']);
            $stmtId->execute();
            $resultId = $stmtId->get_result();
            if ($rowId = $resultId->fetch_assoc()) {
                $usuarioId = $rowId['id'];
            }
            
            // Contar números totais (mensais + periódicos)
            $qtdNumeros = 0;
            
            if ($usuarioId) {
                if (empty($tipoSorteio) || $tipoSorteio === 'todos' || $tipoSorteio === 'mensal') {
                    $stmtCount = $conn->prepare('SELECT COUNT(*) as total FROM numeros_mensais WHERE usuario_id = ?');
                    $stmtCount->bind_param('i', $usuarioId);
                    $stmtCount->execute();
                    $resultCount = $stmtCount->get_result();
                    if ($rowCount = $resultCount->fetch_assoc()) {
                        $qtdNumeros += intval($rowCount['total']);
                    }
                }
                
                if (empty($tipoSorteio) || $tipoSorteio === 'todos' || $tipoSorteio === 'periodico') {
                    $stmtCount = $conn->prepare('SELECT COUNT(*) as total FROM numeros_periodicos WHERE usuario_id = ?');
                    $stmtCount->bind_param('i', $usuarioId);
                    $stmtCount->execute();
                    $resultCount = $stmtCount->get_result();
                    if ($rowCount = $resultCount->fetch_assoc()) {
                        $qtdNumeros += intval($rowCount['total']);
                    }
                }
            }
            
            $usuarios[] = [
                'cpf' => $row['cpf'],
                'name' => $row['name'] ?: $row['razao_social'],
                'razao_social' => $row['razao_social'],
                'data_nascimento_abertura' => $row['data_nascimento_abertura'],
                'qtd_numeros' => $qtdNumeros,
                'created_at' => $row['created_at']
            ];
        }
        
        echo json_encode([
            'success' => true,
            'content' => $usuarios
        ]);
        
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Erro ao buscar usuários: ' . $e->getMessage()
        ]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Método não permitido.']);
}
