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
    $premiadoPor = $data['premiadoPor'] ?? 'admin';

    if (!$usuarioId || !$numero) {
        echo json_encode(['success' => false, 'message' => 'Dados incompletos.']);
        exit;
    }

    global $conn;
    if (!$conn) {
        echo json_encode(['success' => false, 'message' => 'Conexão com o banco não encontrada.']);
        exit;
    }

    // Inserir em ganhadores oficiais
    $stmt = $conn->prepare('INSERT INTO ganhadores (usuario_id, numero, premiado_por) VALUES (?, ?, ?)');
    $stmt->bind_param('iss', $usuarioId, $numero, $premiadoPor);
    
    if ($stmt->execute()) {
        // Remover de possíveis ganhadores se existir
        $stmt2 = $conn->prepare('DELETE FROM possiveis_ganhadores WHERE usuario_id = ? AND numero = ?');
        $stmt2->bind_param('is', $usuarioId, $numero);
        $stmt2->execute();
        
        echo json_encode(['success' => true, 'message' => 'Marcado como ganhador oficial.']);
    } else {
        if ($conn->errno === 1062) { // Duplicate entry
            echo json_encode(['success' => false, 'message' => 'Já está marcado como ganhador.']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro ao marcar: ' . $conn->error]);
        }
    }
}
?>
