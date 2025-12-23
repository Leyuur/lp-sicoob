<?php
date_default_timezone_set('America/Sao_Paulo');
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../php-error.log');
include_once __DIR__ . '/../db/config.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $query = trim($data['query'] ?? '');

    if (!$query) {
        echo json_encode(['success' => false, 'message' => 'Nenhum termo de busca informado.']);
        exit;
    }

    global $conn;
    if (!$conn) {
        echo json_encode(['success' => false, 'message' => 'Conexão com o banco não encontrada.']);
        exit;
    }

    // Remove formatação de CPF para busca
    $cpf = preg_replace('/\D/', '', $query);
    
    // Buscar por CPF
    $stmt = $conn->prepare('SELECT id, cpf, created_at FROM usuarios WHERE cpf = ? LIMIT 1');
    $stmt->bind_param('s', $cpf);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        echo json_encode(['success' => false, 'message' => 'Participante não encontrado.']);
        exit;
    }

    $user = $result->fetch_assoc();
    $userId = $user['id'];

    // Buscar números da sorte
    $stmt = $conn->prepare('SELECT numero FROM numeros WHERE usuario_id = ? ORDER BY created_at DESC');
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $numerosResult = $stmt->get_result();
    $numeros = [];
    while ($row = $numerosResult->fetch_assoc()) {
        $numeros[] = $row['numero'];
    }

    // Buscar histórico de chaves de acesso
    $stmt = $conn->prepare('SELECT chave_acesso, quantidade_numeros, uploaded_by, created_at FROM chaves_acesso WHERE usuario_id = ? ORDER BY created_at DESC');
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $chavesResult = $stmt->get_result();
    $historico = [];
    while ($row = $chavesResult->fetch_assoc()) {
        $historico[] = $row;
    }

    echo json_encode([
        'success' => true,
        'content' => [
            'id' => $user['id'],
            'cpf' => $user['cpf'],
            'numeros' => $numeros,
            'historico' => $historico
        ]
    ]);
}
?>
