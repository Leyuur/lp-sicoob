<?php
date_default_timezone_set('America/Sao_Paulo');
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('display_startup_errors', 1);
include_once __DIR__ . '/../db/config.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $usuarioId = $data['usuarioId'] ?? 0;
    $numero = $data['numero'] ?? '';
    $indicadoPor = $data['indicadoPor'] ?? 'admin';

    if (!$usuarioId || !$numero) {
        echo json_encode(['success' => false, 'message' => 'Dados incompletos.']);
        exit;
    }

    global $conn;
    if (!$conn) {
        echo json_encode(['success' => false, 'message' => 'Conexão com o banco não encontrada.']);
        exit;
    }

    // Verificar se o número existe para esse usuário
    $stmt = $conn->prepare('SELECT id FROM numeros WHERE usuario_id = ? AND numero = ? LIMIT 1');
    $stmt->bind_param('is', $usuarioId, $numero);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        echo json_encode(['success' => false, 'message' => 'Número não pertence a este usuário.']);
        exit;
    }

    // Inserir em possíveis ganhadores
    $stmt = $conn->prepare('INSERT INTO possiveis_ganhadores (usuario_id, numero, indicado_por) VALUES (?, ?, ?)');
    $stmt->bind_param('iss', $usuarioId, $numero, $indicadoPor);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Marcado como possível ganhador.']);
    } else {
        if ($conn->errno === 1062) { // Duplicate entry
            echo json_encode(['success' => false, 'message' => 'Já está marcado como possível ganhador.']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro ao marcar: ' . $conn->error]);
        }
    }
}
?>
