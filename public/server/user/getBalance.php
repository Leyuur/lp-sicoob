<?php
date_default_timezone_set('America/Sao_Paulo');
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('display_startup_errors', 1);
include_once __DIR__ . '/../db/config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $userId = $data['userId'] ?? '';

    if ($userId) {
        global $conn;
        
        if (!$conn) {
            echo json_encode(['success' => false, 'message' => 'Conexão com o banco não encontrada.']);
            exit;
        }

        $sql = "SELECT id, usuario_id, saldo, atualizado_em FROM saldos WHERE usuario_id = ? LIMIT 1";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $saldo = $result->fetch_assoc();
            echo json_encode(['success' => true, 'content' => $saldo]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Saldo não encontrado.']);
        }
        exit;
    }
    
    echo json_encode(['success' => false, 'message' => 'userId não informado.']);
    exit;
}
