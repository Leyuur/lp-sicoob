<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../php-error.log');
include_once __DIR__ . '/../db/config.php';

header('Content-Type: application/json; charset=utf-8');

// Gera número único no formato 0/00000
function gerarNumeroSorteUnico($conn)
{
    $tentativas = 0;
    do {
        $parte1 = strval(rand(0, 9));
        $parte2 = str_pad(strval(rand(0, 99999)), 5, '0', STR_PAD_LEFT);
        $numero = $parte1 . '/' . $parte2;
        $stmt = $conn->prepare('SELECT id FROM numeros WHERE numero = ? LIMIT 1');
        $stmt->bind_param('s', $numero);
        $stmt->execute();
        $exists = $stmt->get_result()->num_rows > 0;
        $tentativas++;
    } while ($exists && $tentativas < 200);
    if ($exists) {
        return null;
    }
    return $numero;
}

// Gera chave de acesso única de 44 dígitos
function gerarChaveAcessoUnica($conn)
{
    $tentativas = 0;
    do {
        // Gera 44 dígitos aleatórios
        $chave = '';
        for ($i = 0; $i < 44; $i++) {
            $chave .= strval(rand(0, 9));
        }
        
        // Verifica se já existe
        $stmt = $conn->prepare('SELECT id FROM chaves_acesso WHERE chave_acesso = ? LIMIT 1');
        $stmt->bind_param('s', $chave);
        $stmt->execute();
        $exists = $stmt->get_result()->num_rows > 0;
        $tentativas++;
    } while ($exists && $tentativas < 200);
    
    if ($exists) {
        return null;
    }
    return $chave;
}

// Valida CPF
function validarCPF($cpf)
{
    $cpf = preg_replace('/\D/', '', $cpf);
    if (strlen($cpf) != 11) return false;
    if (preg_match('/^(\d)\1{10}$/', $cpf)) return false;

    for ($t = 9; $t < 11; $t++) {
        $d = 0;
        for ($c = 0; $c < $t; $c++) {
            $d += $cpf[$c] * (($t + 1) - $c);
        }
        $d = ((10 * $d) % 11) % 10;
        if ($cpf[$c] != $d) return false;
    }
    return true;
}

// Valida formato de CPF com pontuação
function validarFormatoCpf($valor)
{
    $valor = trim($valor);
    $digitos = preg_replace('/\D/', '', $valor);

    // CPF: xxx.xxx.xxx-xx
    if (preg_match('/^\d{3}\.\d{3}\.\d{3}-\d{2}$/', $valor)) {
        if (!validarCPF($valor)) {
            return ['valido' => false, 'motivo' => 'CPF com dígito verificador inválido'];
        }
        return ['valido' => true];
    }

    // Formato incorreto
    if (strlen($digitos) == 11) {
        return ['valido' => false, 'motivo' => 'CPF fora do formato xxx.xxx.xxx-xx'];
    }

    return ['valido' => false, 'motivo' => 'CPF com quantidade de dígitos incorreta'];
}

// Valida linha completa da planilha
function validarLinha($linha, $numeroLinha, $conn = null)
{
    $erros = [];

    // Valida CPF (obrigatório)
    if (!isset($linha['cpf']) || trim($linha['cpf']) === '') {
        $erros[] = "CPF está vazio";
    } else {
        $validacao = validarFormatoCpf($linha['cpf']);
        if (!$validacao['valido']) {
            $erros[] = $validacao['motivo'] . " (valor recebido: {$linha['cpf']})";
        }
    }

    // Valida QUANTIDADE DE NÚMEROS (obrigatório)
    if (!isset($linha['quantidadeNumeros']) || trim($linha['quantidadeNumeros']) === '') {
        $erros[] = "Quantidade de números está vazia";
    } else {
        $qtd = intval($linha['quantidadeNumeros']);
        if ($qtd < 1 || $qtd > 60) {
            $erros[] = "Quantidade de números inválida (deve ser entre 1 e 60 por participante, recebido: {$linha['quantidadeNumeros']})";
        }
    }

    return [
        'valido' => count($erros) === 0,
        'erros' => $erros
    ];
}

try {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (!isset($data['rows']) || !is_array($data['rows'])) {
        // Registra log de erro
        $uploadedBy = $data['uploadedBy'] ?? 'admin';
        $stmt = $conn->prepare('INSERT INTO upload_logs (status, message, total_lines, processed_lines, uploaded_by, created_at) VALUES (?, ?, ?, ?, ?, NOW())');
        $status = 'error';
        $message = 'Dados inválidos - formato de arquivo incorreto';
        $totalLinhas = 0;
        $processedLines = 0;
        $stmt->bind_param('ssiis', $status, $message, $totalLinhas, $processedLines, $uploadedBy);
        $stmt->execute();
        
        echo json_encode([
            'success' => false,
            'message' => 'Dados inválidos'
        ]);
        exit;
    }

    $rows = $data['rows'];
    $uploadedBy = $data['uploadedBy'] ?? 'admin';

    // Validação completa antes de qualquer inserção
    $errosValidacao = [];
    foreach ($rows as $index => $row) {
        $numeroLinha = $index + 2; // +2 porque pulamos o header e começamos em 1
        $validacao = validarLinha($row, $numeroLinha, $conn);
        if (!$validacao['valido']) {
            $errosValidacao[] = [
                'linha' => $numeroLinha,
                'erros' => $validacao['erros']
            ];
        }
    }

    // Se houver erros de validação, retorna sem inserir nada
    if (count($errosValidacao) > 0) {
        // Registra log de erro de validação
        $stmt = $conn->prepare('INSERT INTO upload_logs (status, message, total_lines, processed_lines, error_count, uploaded_by, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())');
        $status = 'error';
        $message = 'Erros de validação encontrados: ' . count($errosValidacao) . ' linha(s) com erro';
        $totalLinhas = count($rows);
        $processedLines = 0;
        $errorCount = count($errosValidacao);
        $stmt->bind_param('ssiiss', $status, $message, $totalLinhas, $processedLines, $errorCount, $uploadedBy);
        $stmt->execute();
        
        echo json_encode([
            'success' => false,
            'message' => 'Erros de validação encontrados',
            'errors' => $errosValidacao
        ]);
        exit;
    }

    // Inicia transação
    $conn->begin_transaction();

    $totalLinhas = count($rows);
    $linhasProcessadas = 0;
    $numerosGerados = 0;
    $cpfsAfetados = [];

    foreach ($rows as $row) {
        // Limpa CPF
        $cpf = preg_replace('/\D/', '', $row['cpf']);
        
        // Gera chave de acesso única automaticamente
        $chaveAcesso = gerarChaveAcessoUnica($conn);
        if ($chaveAcesso === null) {
            throw new Exception("Não foi possível gerar chave de acesso única após 200 tentativas");
        }
        
        $quantidadeNumeros = intval($row['quantidadeNumeros']);

        // Verifica se usuário já existe, senão cria
        $stmt = $conn->prepare('SELECT id FROM usuarios WHERE cpf = ? LIMIT 1');
        $stmt->bind_param('s', $cpf);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            // Usuário já existe - mantém os dados originais, não sobrescreve
            $usuario = $result->fetch_assoc();
            $usuarioId = $usuario['id'];
        } else {
            // Cria novo usuário
            $stmt = $conn->prepare('INSERT INTO usuarios (name, cpf, created_at) VALUES (?, ?, NOW())');
            $name = 'Participante';
            $stmt->bind_param('ss', $name, $cpf);
            $stmt->execute();
            $usuarioId = $conn->insert_id;
        }

        // Verifica quantidade atual de números do usuário
        $stmt = $conn->prepare('SELECT COUNT(*) as total FROM numeros WHERE usuario_id = ?');
        $stmt->bind_param('i', $usuarioId);
        $stmt->execute();
        $resultCount = $stmt->get_result();
        $currentCount = $resultCount->fetch_assoc()['total'];
        
        // Verifica se adicionar os novos números ultrapassa o limite de 60
        if ($currentCount + $quantidadeNumeros > 60) {
            throw new Exception("Limite de 60 números excedido para o CPF {$row['cpf']}. Usuário já possui {$currentCount} números.");
        }

        // Adiciona CPF à lista de afetados
        if (!in_array($cpf, $cpfsAfetados)) {
            $cpfsAfetados[] = $cpf;
        }

        // Insere a chave de acesso
        $stmt = $conn->prepare('INSERT INTO chaves_acesso (usuario_id, chave_acesso, quantidade_numeros, uploaded_by, created_at) VALUES (?, ?, ?, ?, NOW())');
        $stmt->bind_param('isis', $usuarioId, $chaveAcesso, $quantidadeNumeros, $uploadedBy);
        $stmt->execute();
        $chaveId = $conn->insert_id;

        // Gera os números da sorte
        for ($i = 0; $i < $quantidadeNumeros; $i++) {
            $numero = gerarNumeroSorteUnico($conn);
            if ($numero === null) {
                throw new Exception("Não foi possível gerar número único após 200 tentativas");
            }

            // Insere o número
            $stmt = $conn->prepare('INSERT INTO numeros (usuario_id, numero, created_at) VALUES (?, ?, NOW())');
            $stmt->bind_param('is', $usuarioId, $numero);
            $stmt->execute();
            $numerosGerados++;
        }

        $linhasProcessadas++;
    }

    // Registra log de sucesso
    $stmt = $conn->prepare('INSERT INTO upload_logs (status, message, total_lines, processed_lines, numbers_generated, users_affected, uploaded_by, affected_users, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())');
    $status = 'success';
    $message = "Upload realizado com sucesso: {$linhasProcessadas} linhas processadas, {$numerosGerados} números gerados";
    $usersAffected = count($cpfsAfetados);
    $affectedUsersJson = json_encode($cpfsAfetados);
    $stmt->bind_param('ssiiiiss', $status, $message, $totalLinhas, $linhasProcessadas, $numerosGerados, $usersAffected, $uploadedBy, $affectedUsersJson);
    $stmt->execute();

    $conn->commit();

    echo json_encode([
        'success' => true,
        'message' => $message,
        'totalLinhas' => $totalLinhas,
        'linhasProcessadas' => $linhasProcessadas,
        'numerosGerados' => $numerosGerados,
        'usuariosAfetados' => $usersAffected
    ]);

} catch (Exception $e) {
    if (isset($conn)) {
        $conn->rollback();
    }
    
    $errorMessage = $e->getMessage();
    
    // Registra log de erro
    if (isset($conn)) {
        $stmt = $conn->prepare('INSERT INTO upload_logs (status, message, total_lines, processed_lines, uploaded_by, created_at) VALUES (?, ?, ?, ?, ?, NOW())');
        $status = 'error';
        $totalLinhas = $totalLinhas ?? 0;
        $linhasProcessadas = $linhasProcessadas ?? 0;
        $stmt->bind_param('ssiis', $status, $errorMessage, $totalLinhas, $linhasProcessadas, $uploadedBy);
        $stmt->execute();
    }
    
    echo json_encode([
        'success' => false,
        'message' => 'Erro no processamento: ' . $errorMessage
    ]);
}
