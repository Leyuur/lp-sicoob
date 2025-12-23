<?php
date_default_timezone_set('America/Sao_Paulo');
error_reporting(E_ALL);
ini_set('display_errors', 0);
include_once __DIR__ . '/../db/config.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true);
    
    $username = $input['username'] ?? '';
    $password = $input['password'] ?? '';

    global $conn;
    if (!$conn) {
        echo json_encode(['success' => false, 'message' => 'Erro de conexão']);
        exit;
    }

    // Lista de admins autorizados
    $admins = [
        [
            'username' => 'crisduarte',
            'password' => 'Cassol@2025',
            'name' => 'Cristian Duarte (Dev)'
        ],
        [
            'username' => 'yuriduarte',
            'password' => 'Cassol@2025',
            'name' => 'Yuri Duarte (Dev)'
        ],
    ];

    // Busca o admin na lista
    $adminEncontrado = null;
    foreach ($admins as $admin) {
        if ($admin['username'] === $username && $admin['password'] === $password) {
            $adminEncontrado = $admin;
            break;
        }
    }

    if ($adminEncontrado) {
        echo json_encode([
            'success' => true,
            'content' => [
                'username' => $adminEncontrado['username'],
                'name' => $adminEncontrado['name'],
                'isAdmin' => true,
                'token' => bin2hex(random_bytes(16))
            ]
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Credenciais inválidas'
        ]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Método não permitido']);
}
?>
