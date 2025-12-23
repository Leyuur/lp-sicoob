<?php
date_default_timezone_set('America/Sao_Paulo');
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('display_startup_errors', 1);
include_once __DIR__ . '/../db/config.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    global $conn;
    if (!$conn) {
        echo json_encode(['success' => false, 'message' => 'Conexão com o banco não encontrada.']);
        exit;
    }

    $stmt = $conn->prepare('
        SELECT 
            pg.id,
            pg.usuario_id as participantId,
            pg.numero,
            pg.data_indicacao as dataIndicacao,
            pg.indicado_por as indicadoPor,
            u.name as participantName,
            u.cpf as participantCpf
        FROM possiveis_ganhadores pg
        INNER JOIN usuarios u ON pg.usuario_id = u.id
        ORDER BY pg.data_indicacao DESC
    ');
    $stmt->execute();
    $result = $stmt->get_result();

    $possibleWinners = [];
    while ($row = $result->fetch_assoc()) {
        $possibleWinners[] = $row;
    }

    echo json_encode(['success' => true, 'content' => $possibleWinners]);
}
?>
