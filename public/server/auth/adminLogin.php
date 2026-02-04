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
            'username' => 'drtechs.dev',
            'password' => 'DrtechsDevSicoob@2026#',
            'name' => 'DRTechs Dev (Master)'
        ],
        [
            'username' => 'vila.rica',
            'password' => 'VilaRica.office@2026#',
            'name' => 'Vila Rica'
        ],
        [
            'username' => 'alex.rocha',
            'password' => 'Q7@F!9$Lx#4A2Hk',
            'name' => 'Alex Rocha'
        ],
        [
            'username' => 'kelvin.matos',
            'password' => 'M3@R!8$Wq#9Z5P',
            'name' => 'Kelvin Matos'
        ],
        [
            'username' => 'paulo.cesar',
            'password' => 'K8@T!2$E7#N4mS',
            'name' => 'Paulo Cesar'
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
