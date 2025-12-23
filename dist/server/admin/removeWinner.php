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

    if (!$usuarioId || !$numero) {
        echo json_encode(['success' => false, 'message' => 'Dados incompletos.']);
        exit;
    }

    global $conn;
    if (!$conn) {
        echo json_encode(['success' => false, 'message' => 'Conexão com o banco não encontrada.']);
        exit;
    }

    $stmt = $conn->prepare('DELETE FROM ganhadores WHERE usuario_id = ? AND numero = ?');
    $stmt->bind_param('is', $usuarioId, $numero);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Removido dos ganhadores.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Erro ao remover.']);
    }
}
?>
