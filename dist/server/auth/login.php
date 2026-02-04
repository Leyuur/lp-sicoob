<?php 
date_default_timezone_set('America/Sao_Paulo');
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('display_startup_errors', 1);
include_once __DIR__ . '/../db/config.php';

// Headers CORS
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $cpf = $data['cpf'] ?? $data['cpf_cnpj'] ?? '';
    $dataNascimento = $data['data_nascimento'] ?? '';
    
    // Remove formatação do CPF/CNPJ
    $cpf = preg_replace('/[^0-9]/', '', $cpf);

    if ($cpf && $dataNascimento) {
        global $conn;
        
        if (!$conn) {
            echo json_encode(['success' => false, 'message' => 'Conexão com o banco não encontrada.']);
            exit;
        }

        // Converte data de DD/MM/AAAA para AAAA-MM-DD
        $dateparts = explode('/', $dataNascimento);
        if (count($dateparts) === 3) {
            $dataNascimentoFormatted = $dateparts[2] . '-' . $dateparts[1] . '-' . $dateparts[0];
        } else {
            echo json_encode(['success' => false, 'message' => 'Data de nascimento inválida. Use o formato DD/MM/AAAA.']);
            exit;
        }

        // Busca usuário com CPF e data de nascimento
        $sql = "SELECT id, razao_social, cpf, data_nascimento_abertura FROM usuarios WHERE cpf = ? AND data_nascimento_abertura = ? LIMIT 1";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ss", $cpf, $dataNascimentoFormatted);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $user = $result->fetch_assoc();
            
            // Busca números mensais
            $sqlNumerosMensais = "SELECT numero, periodo_mes, periodo_ano FROM numeros_mensais WHERE usuario_id = ? ORDER BY numero";
            $stmtMensais = $conn->prepare($sqlNumerosMensais);
            $stmtMensais->bind_param("i", $user['id']);
            $stmtMensais->execute();
            $resultMensais = $stmtMensais->get_result();
            
            $numbers = [];
            while ($row = $resultMensais->fetch_assoc()) {
                $numbers[] = [
                    'numero' => $row['numero'],
                    'tipo' => 'mensal',
                    'periodo' => ucfirst($row['periodo_mes']),
                    'ano' => $row['periodo_ano']
                ];
            }
            
            // Busca números periódicos
            $sqlNumerosPeriodicos = "SELECT numero, periodo_tipo, periodo_ano FROM numeros_periodicos WHERE usuario_id = ? ORDER BY numero";
            $stmtPeriodicos = $conn->prepare($sqlNumerosPeriodicos);
            $stmtPeriodicos->bind_param("i", $user['id']);
            $stmtPeriodicos->execute();
            $resultPeriodicos = $stmtPeriodicos->get_result();
            
            while ($row = $resultPeriodicos->fetch_assoc()) {
                // Mapear os tipos de período para nomes amigáveis
                $periodoNome = $row['periodo_tipo'];
                switch($row['periodo_tipo']) {
                    case 'trimestre_1':
                        $periodoNome = '1° Trimestre';
                        break;
                    case 'trimestre_2':
                        $periodoNome = '2° Trimestre';
                        break;
                    case 'trimestre_3':
                        $periodoNome = '3° Trimestre';
                        break;
                    case 'trimestre_4':
                        $periodoNome = '4° Trimestre';
                        break;
                    case 'semestral':
                        $periodoNome = 'Semestral';
                        break;
                    case 'anual':
                        $periodoNome = 'Anual';
                        break;
                }
                
                $numbers[] = [
                    'numero' => $row['numero'],
                    'tipo' => 'periodico',
                    'periodo' => $periodoNome,
                    'ano' => $row['periodo_ano']
                ];
            }
            
            echo json_encode([
                'success' => true, 
                'user' => [
                    'name' => $user['razao_social'],
                    'cpf' => $user['cpf']
                ],
                'numbers' => $numbers
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'CPF ou data de nascimento incorretos. Verifique os dados informados.']);
        }
        exit;
    }
    
    echo json_encode(['success' => false, 'message' => 'CPF e data de nascimento são obrigatórios.']);
    exit;
}
