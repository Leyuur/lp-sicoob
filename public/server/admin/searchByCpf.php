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
    
    $cpf = preg_replace('/\D/', '', $input['cpf'] ?? '');

    if (empty($cpf)) {
        echo json_encode(['success' => false, 'message' => 'CPF não informado.']);
        exit;
    }

    global $conn;
    if (!$conn) {
        echo json_encode(['success' => false, 'message' => 'Conexão com o banco não encontrada.']);
        exit;
    }

    // Buscar usuário pelo CPF
    $stmt = $conn->prepare('SELECT id, cpf FROM usuarios WHERE cpf = ? LIMIT 1');
    $stmt->bind_param('s', $cpf);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        echo json_encode(['success' => false, 'message' => 'Usuário não encontrado.']);
        exit;
    }

    $user = $result->fetch_assoc();
    $usuarioId = $user['id'];

    // Buscar números da sorte
    $stmt = $conn->prepare('SELECT numero FROM numeros WHERE usuario_id = ? ORDER BY created_at DESC');
    $stmt->bind_param('i', $usuarioId);
    $stmt->execute();
    $numerosResult = $stmt->get_result();
    $numeros = [];
    while ($row = $numerosResult->fetch_assoc()) {
        $numeros[] = $row['numero'];
    }

    // Buscar histórico de chaves de acesso
    $stmt = $conn->prepare('SELECT chave_acesso, quantidade_numeros, uploaded_by, created_at FROM chaves_acesso WHERE usuario_id = ? ORDER BY created_at DESC');
    $stmt->bind_param('i', $usuarioId);
    $stmt->execute();
    $historicoResult = $stmt->get_result();
    $historico = [];
    while ($row = $historicoResult->fetch_assoc()) {
        $historico[] = $row;
    }

    echo json_encode([
        'success' => true,
        'content' => [
            'cpf' => $user['cpf'],
            'numeros' => $numeros,
            'historico' => $historico
        ]
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Método não permitido.']);
}
?>
