<?php
date_default_timezone_set('America/Sao_Paulo');
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('display_startup_errors', 1);
include_once __DIR__ . '/../db/config.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $numero = $data['numero'] ?? '';

    if (!$numero) {
        echo json_encode(['success' => false, 'message' => 'Número não informado.']);
        exit;
    }

    global $conn;
    if (!$conn) {
        echo json_encode(['success' => false, 'message' => 'Conexão com o banco não encontrada.']);
        exit;
    }

    // Buscar todos os usuários que possuem esse número
    $stmt = $conn->prepare('
        SELECT 
            n.id as numero_id,
            n.numero,
            n.usuario_id,
            u.name,
            u.cpf,
            n.created_at
        FROM numeros n
        INNER JOIN usuarios u ON n.usuario_id = u.id
        WHERE n.numero = ?
        ORDER BY n.created_at DESC
    ');
    $stmt->bind_param('s', $numero);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        echo json_encode(['success' => false, 'message' => 'Número não encontrado.']);
        exit;
    }

    $owners = [];
    while ($row = $result->fetch_assoc()) {
        // Buscar chave de acesso associada a este número
        $stmt2 = $conn->prepare('
            SELECT 
                ca.chave_acesso,
                ca.quantidade_numeros,
                ca.uploaded_by,
                ca.created_at AS data_upload
            FROM chaves_acesso ca
            WHERE ca.usuario_id = ?
            ORDER BY ca.created_at DESC
            LIMIT 10
        ');
        $stmt2->bind_param('i', $row['usuario_id']);
        $stmt2->execute();
        $rsChaves = $stmt2->get_result();
        $chaves = [];
        while ($c = $rsChaves->fetch_assoc()) {
            $chaves[] = [
                'chave' => $c['chave_acesso'],
                'quantidade_numeros' => $c['quantidade_numeros'],
                'uploaded_by' => $c['uploaded_by'],
                'dataUpload' => $c['data_upload']
            ];
        }

        $owners[] = [
            'participantId' => $row['usuario_id'],
            'participantName' => $row['name'],
            'participantCpf' => $row['cpf'],
            'numero' => $row['numero'],
            'dataGeracao' => $row['created_at'],
            'chaves' => $chaves
        ];
    }

    echo json_encode([
        'success' => true,
        'content' => [
            'numero' => $numero,
            'owners' => $owners
        ]
    ]);
}
?>
