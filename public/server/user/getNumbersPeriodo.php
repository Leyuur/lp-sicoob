<?php
date_default_timezone_set('America/Sao_Paulo');
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../php-error.log');
include_once __DIR__ . '/../db/config.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true);
    
    $cpfCnpj = preg_replace('/\D/', '', $input['cpfCnpj'] ?? '');
    $dataNascimentoAbertura = $input['dataNascimentoAbertura'] ?? '';

    if (empty($cpfCnpj)) {
        echo json_encode(['success' => false, 'message' => 'CPF/CNPJ não informado.']);
        exit;
    }

    if (empty($dataNascimentoAbertura)) {
        echo json_encode(['success' => false, 'message' => 'Data de nascimento/abertura não informada.']);
        exit;
    }

    global $conn;
    if (!$conn) {
        echo json_encode(['success' => false, 'message' => 'Conexão com o banco não encontrada.']);
        exit;
    }

    // Converter data de dd/mm/yyyy para yyyy-mm-dd
    $partes = explode('/', $dataNascimentoAbertura);
    if (count($partes) === 3) {
        $dataMySQL = sprintf('%04d-%02d-%02d', $partes[2], $partes[1], $partes[0]);
    } else {
        $dataMySQL = $dataNascimentoAbertura;
    }

    // Buscar usuário pelo CPF/CNPJ e data de nascimento
    $stmt = $conn->prepare('SELECT id, cpf, name, razao_social, data_nascimento_abertura FROM usuarios WHERE cpf = ? AND data_nascimento_abertura = ? LIMIT 1');
    $stmt->bind_param('ss', $cpfCnpj, $dataMySQL);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        echo json_encode(['success' => false, 'message' => 'Participante não encontrado ou dados incorretos.']);
        exit;
    }

    $user = $result->fetch_assoc();
    $usuarioId = $user['id'];

    // Buscar números mensais agrupados por período
    $stmt = $conn->prepare('
        SELECT numero, periodo_mes, periodo_ano, created_at 
        FROM numeros_mensais 
        WHERE usuario_id = ? 
        ORDER BY periodo_ano DESC, periodo_mes DESC, created_at DESC
    ');
    $stmt->bind_param('i', $usuarioId);
    $stmt->execute();
    $numerosMensaisResult = $stmt->get_result();
    $numerosMensais = [];
    while ($row = $numerosMensaisResult->fetch_assoc()) {
        $key = $row['periodo_mes'] . '/' . $row['periodo_ano'];
        if (!isset($numerosMensais[$key])) {
            $numerosMensais[$key] = [
                'periodo' => $row['periodo_mes'],
                'ano' => $row['periodo_ano'],
                'numeros' => []
            ];
        }
        $numerosMensais[$key]['numeros'][] = $row['numero'];
    }

    // Buscar números periódicos agrupados por período
    $stmt = $conn->prepare('
        SELECT numero, periodo_tipo, periodo_ano, created_at 
        FROM numeros_periodicos 
        WHERE usuario_id = ? 
        ORDER BY periodo_ano DESC, periodo_tipo DESC, created_at DESC
    ');
    $stmt->bind_param('i', $usuarioId);
    $stmt->execute();
    $numerosPeriodicosResult = $stmt->get_result();
    $numerosPeriodicos = [];
    while ($row = $numerosPeriodicosResult->fetch_assoc()) {
        $key = $row['periodo_tipo'] . '/' . $row['periodo_ano'];
        if (!isset($numerosPeriodicos[$key])) {
            $numerosPeriodicos[$key] = [
                'periodo' => $row['periodo_tipo'],
                'ano' => $row['periodo_ano'],
                'numeros' => []
            ];
        }
        $numerosPeriodicos[$key]['numeros'][] = $row['numero'];
    }

    // Contar totais
    $totalNumerosMensais = 0;
    foreach ($numerosMensais as $grupo) {
        $totalNumerosMensais += count($grupo['numeros']);
    }

    $totalNumerosPeriodicos = 0;
    foreach ($numerosPeriodicos as $grupo) {
        $totalNumerosPeriodicos += count($grupo['numeros']);
    }

    echo json_encode([
        'success' => true,
        'content' => [
            'cpf' => $user['cpf'],
            'nome' => $user['name'] ?: $user['razao_social'],
            'totalNumerosMensais' => $totalNumerosMensais,
            'totalNumerosPeriodicos' => $totalNumerosPeriodicos,
            'numerosMensais' => array_values($numerosMensais),
            'numerosPeriodicos' => array_values($numerosPeriodicos)
        ]
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Método não permitido.']);
}
?>
