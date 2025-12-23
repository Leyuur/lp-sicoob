<?php
date_default_timezone_set('America/Sao_Paulo');
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('display_startup_errors', 1);
include_once __DIR__ . '/../db/config.php';

// Headers CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    global $conn;
    if (!$conn) {
        echo json_encode(['success' => false, 'message' => 'Conexão com o banco não encontrada.']);
        exit;
    }

    $stmt = $conn->prepare('
        SELECT 
            g.id,
            g.usuario_id as participantId,
            g.numero as numero_sorte,
            g.data_premiacao as data_sorteio,
            g.premiado_por as premiadoPor,
            u.name as nome,
            u.cpf as participantCpf
        FROM ganhadores g
        INNER JOIN usuarios u ON g.usuario_id = u.id
        ORDER BY g.data_premiacao DESC
    ');
    $stmt->execute();
    $result = $stmt->get_result();

    $winners = [];
    while ($row = $result->fetch_assoc()) {
        $winners[] = $row;
    }

    echo json_encode(['success' => true, 'winners' => $winners]);
}
?>
