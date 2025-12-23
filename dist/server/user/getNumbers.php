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

        $sql = "SELECT id, numero FROM numeros WHERE usuario_id = ? ORDER BY created_at DESC";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $numeros = [];
            while ($row = $result->fetch_assoc()) {
                $numeros[] = $row;
            }
            echo json_encode(['success' => true, 'content' => $numeros]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Nenhum número encontrado.']);
        }
        exit;
    }
    
    echo json_encode(['success' => false, 'message' => 'userId não informado.']);
    exit;
}