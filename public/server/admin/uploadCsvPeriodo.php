<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../php-error.log');
include_once __DIR__ . '/../db/config.php';

header('Content-Type: application/json; charset=utf-8');

// Gera número único no formato 0/00000 para um tipo específico de sorteio e período
function gerarNumeroSorteUnico($conn, $tipoSorteio, $periodoReferencia, $periodoAno) {
    $tentativas = 0;
    do {
        $serie = rand(0, 9);
        $sequencia = str_pad(rand(0, 99999), 5, '0', STR_PAD_LEFT);
        $numero = $serie . '/' . $sequencia;
        
        // Verifica unicidade na tabela correspondente ao tipo e período
        if ($tipoSorteio === 'mensal') {
            $stmt = $conn->prepare('SELECT id FROM numeros_mensais WHERE numero = ? AND periodo_mes = ? AND periodo_ano = ? LIMIT 1');
            $stmt->bind_param('sss', $numero, $periodoReferencia, $periodoAno);
        } else {
            $stmt = $conn->prepare('SELECT id FROM numeros_periodicos WHERE numero = ? AND periodo_tipo = ? AND periodo_ano = ? LIMIT 1');
            $stmt->bind_param('sss', $numero, $periodoReferencia, $periodoAno);
        }
        $stmt->execute();
        $result = $stmt->get_result();
        $exists = $result->num_rows > 0;
        $tentativas++;
    } while ($exists && $tentativas < 200);
    
    if ($exists) {
        throw new Exception('Não foi possível gerar número único após 200 tentativas');
    }
    return $numero;
}

// Valida CPF
function validarCPF($cpf) {
    $cpf = preg_replace('/\D/', '', $cpf);
    if (strlen($cpf) != 11) return false;
    if (preg_match('/^(\d)\1{10}$/', $cpf)) return false;

    for ($t = 9; $t < 11; $t++) {
        for ($d = 0, $c = 0; $c < $t; $c++) {
            $d += $cpf[$c] * (($t + 1) - $c);
        }
        $d = ((10 * $d) % 11) % 10;
        if ($cpf[$c] != $d) return false;
    }
    return true;
}

// Valida CNPJ
function validarCNPJ($cnpj) {
    $cnpj = preg_replace('/\D/', '', $cnpj);
    if (strlen($cnpj) != 14) return false;
    if (preg_match('/^(\d)\1{13}$/', $cnpj)) return false;
    
    // Validação dos dígitos verificadores do CNPJ
    $tamanho = strlen($cnpj) - 2;
    $numeros = substr($cnpj, 0, $tamanho);
    $digitos = substr($cnpj, $tamanho);
    $soma = 0;
    $pos = $tamanho - 7;
    
    for ($i = $tamanho; $i >= 1; $i--) {
        $soma += $numeros[$tamanho - $i] * $pos--;
        if ($pos < 2) $pos = 9;
    }
    
    $resultado = $soma % 11 < 2 ? 0 : 11 - $soma % 11;
    if ($resultado != $digitos[0]) return false;
    
    $tamanho = $tamanho + 1;
    $numeros = substr($cnpj, 0, $tamanho);
    $soma = 0;
    $pos = $tamanho - 7;
    
    for ($i = $tamanho; $i >= 1; $i--) {
        $soma += $numeros[$tamanho - $i] * $pos--;
        if ($pos < 2) $pos = 9;
    }
    
    $resultado = $soma % 11 < 2 ? 0 : 11 - $soma % 11;
    if ($resultado != $digitos[1]) return false;
    
    return true;
}

// Valida formato de CPF/CNPJ com pontuação
function validarFormatoCpfCnpj($valor) {
    $valor = trim($valor);
    $digitos = preg_replace('/\D/', '', $valor);

    // CPF: xxx.xxx.xxx-xx
    if (preg_match('/^\d{3}\.\d{3}\.\d{3}-\d{2}$/', $valor)) {
        if (strlen($digitos) == 11 && validarCPF($digitos)) {
            return ['valido' => true, 'tipo' => 'CPF', 'valor' => $digitos];
        }
        return ['valido' => false, 'motivo' => 'CPF inválido'];
    }
    
    // CNPJ: xx.xxx.xxx/xxxx-xx
    if (preg_match('/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/', $valor)) {
        if (strlen($digitos) == 14 && validarCNPJ($digitos)) {
            return ['valido' => true, 'tipo' => 'CNPJ', 'valor' => $digitos];
        }
        return ['valido' => false, 'motivo' => 'CNPJ inválido'];
    }

    // Formato incorreto
    if (strlen($digitos) == 11) {
        return ['valido' => false, 'motivo' => 'CPF com formato incorreto. Use: xxx.xxx.xxx-xx'];
    }
    if (strlen($digitos) == 14) {
        return ['valido' => false, 'motivo' => 'CNPJ com formato incorreto. Use: xx.xxx.xxx/xxxx-xx'];
    }

    return ['valido' => false, 'motivo' => 'CPF/CNPJ com quantidade de dígitos incorreta'];
}

// Valida data no formato dd/mm/yyyy
function validarData($data) {
    if (empty($data)) return ['valido' => false, 'motivo' => 'Data vazia'];
    
    $partes = explode('/', $data);
    if (count($partes) != 3) {
        return ['valido' => false, 'motivo' => 'Data com formato incorreto. Use: dd/mm/aaaa'];
    }
    
    list($dia, $mes, $ano) = $partes;
    
    if (!checkdate($mes, $dia, $ano)) {
        return ['valido' => false, 'motivo' => 'Data inválida'];
    }
    
    // Converte para formato MySQL (yyyy-mm-dd)
    $dataMySQL = sprintf('%04d-%02d-%02d', $ano, $mes, $dia);
    
    return ['valido' => true, 'data' => $dataMySQL];
}

// Valida linha completa da planilha
function validarLinha($linha, $numeroLinha, $conn = null) {
    $erros = [];

    // Valida NOME/RAZÃO SOCIAL (obrigatório)
    if (!isset($linha['nomeRazaoSocial']) || trim($linha['nomeRazaoSocial']) === '') {
        $erros[] = "Nome/Razão Social está vazio";
    }

    // Valida CPF/CNPJ (obrigatório)
    if (!isset($linha['cpfCnpj']) || trim($linha['cpfCnpj']) === '') {
        $erros[] = "CPF/CNPJ está vazio";
    } else {
        $validacao = validarFormatoCpfCnpj($linha['cpfCnpj']);
        if (!$validacao['valido']) {
            $erros[] = "CPF/CNPJ inválido: " . $validacao['motivo'];
        }
    }

    // Valida DATA DE NASCIMENTO/ABERTURA (obrigatório)
    if (!isset($linha['dataNascimentoAbertura']) || trim($linha['dataNascimentoAbertura']) === '') {
        $erros[] = "Data de nascimento/abertura está vazia";
    } else {
        $validacaoData = validarData($linha['dataNascimentoAbertura']);
        if (!$validacaoData['valido']) {
            $erros[] = "Data de nascimento/abertura inválida: " . $validacaoData['motivo'];
        }
    }

    // Valida QUANTIDADE DE NÚMEROS (obrigatório)
    if (!isset($linha['quantidadeNumeros']) || trim($linha['quantidadeNumeros']) === '') {
        $erros[] = "Quantidade de números está vazia";
    } else {
        $qtd = intval($linha['quantidadeNumeros']);
        if ($qtd <= 0 || $qtd > 10000) {
            $erros[] = "Quantidade de números deve estar entre 1 e 10000";
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
        echo json_encode([
            'success' => false,
            'message' => 'Dados inválidos recebidos.'
        ]);
        exit;
    }

    // Validações obrigatórias de período
    $tipoSorteio = $data['tipoSorteio'] ?? null; // 'mensal' ou 'periodico'
    $periodoReferencia = $data['periodoReferencia'] ?? null;
    $periodoAno = $data['periodoAno'] ?? date('Y');
    $uploadedBy = $data['uploadedBy'] ?? 'admin';

    if (!$tipoSorteio || !in_array($tipoSorteio, ['mensal', 'periodico'])) {
        echo json_encode([
            'success' => false,
            'message' => 'Tipo de sorteio inválido. Deve ser "mensal" ou "periodico".'
        ]);
        exit;
    }

    if (!$periodoReferencia) {
        echo json_encode([
            'success' => false,
            'message' => 'Período de referência é obrigatório.'
        ]);
        exit;
    }

    // Valida períodos permitidos
    $periodosMensais = ['janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho', 
                        'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    $periodosPeriodicos = ['trimestre_1', 'trimestre_2', 'trimestre_3', 'trimestre_4', 
                           'semestral', 'anual'];

    if ($tipoSorteio === 'mensal' && !in_array($periodoReferencia, $periodosMensais)) {
        echo json_encode([
            'success' => false,
            'message' => 'Período mensal inválido. Escolha um mês válido.'
        ]);
        exit;
    }

    if ($tipoSorteio === 'periodico' && !in_array($periodoReferencia, $periodosPeriodicos)) {
        echo json_encode([
            'success' => false,
            'message' => 'Período periódico inválido. Escolha: trimestre_1, trimestre_2, trimestre_3, trimestre_4, semestral ou anual.'
        ]);
        exit;
    }

    $rows = $data['rows'];

    // Validação completa antes de qualquer inserção
    $errosValidacao = [];
    foreach ($rows as $index => $row) {
        $numeroLinha = $index + 2; // +2 porque linha 1 é cabeçalho
        $validacao = validarLinha($row, $numeroLinha);
        
        if (!$validacao['valido']) {
            $errosValidacao[] = [
                'linha' => $numeroLinha,
                'erros' => $validacao['erros']
            ];
        }
    }

    // Se houver erros de validação, retorna sem inserir nada
    if (count($errosValidacao) > 0) {
        $logStmt = $conn->prepare('
            INSERT INTO upload_logs 
            (uploaded_by, tipo_sorteio, periodo_referencia, periodo_ano, total_lines, processed_lines, error_count, status, message) 
            VALUES (?, ?, ?, ?, ?, 0, ?, "error", ?)
        ');
        $totalLinhas = count($rows);
        $errorCount = count($errosValidacao);
        $mensagemErro = 'Validação falhou. Total de erros: ' . $errorCount;
        $logStmt->bind_param('sssiiss', $uploadedBy, $tipoSorteio, $periodoReferencia, $periodoAno, $totalLinhas, $errorCount, $mensagemErro);
        $logStmt->execute();

        echo json_encode([
            'success' => false,
            'message' => 'Erros de validação encontrados. Nenhum dado foi inserido.',
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
        $nomeRazaoSocial = trim($row['nomeRazaoSocial']);
        $cpfCnpjOriginal = trim($row['cpfCnpj']);
        $dataNascimentoAbertura = trim($row['dataNascimentoAbertura']);
        $quantidadeNumeros = intval($row['quantidadeNumeros']);

        // Processa CPF/CNPJ
        $validacaoCpfCnpj = validarFormatoCpfCnpj($cpfCnpjOriginal);
        $cpfCnpj = $validacaoCpfCnpj['valor'];

        // Processa data
        $validacaoData = validarData($dataNascimentoAbertura);
        $dataMySQL = $validacaoData['data'];

        // Verifica se usuário já existe
        $stmt = $conn->prepare('SELECT id FROM usuarios WHERE cpf = ? LIMIT 1');
        $stmt->bind_param('s', $cpfCnpj);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            // Usuário existe - atualiza informações
            $usuario = $result->fetch_assoc();
            $usuarioId = $usuario['id'];

            $stmt = $conn->prepare('UPDATE usuarios SET name = ?, data_nascimento_abertura = ?, razao_social = ? WHERE id = ?');
            $stmt->bind_param('sssi', $nomeRazaoSocial, $dataMySQL, $nomeRazaoSocial, $usuarioId);
            $stmt->execute();
        } else {
            // Cria novo usuário
            $stmt = $conn->prepare('INSERT INTO usuarios (cpf, name, data_nascimento_abertura, razao_social, data_nascimento) VALUES (?, ?, ?, ?, ?)');
            $stmt->bind_param('sssss', $cpfCnpj, $nomeRazaoSocial, $dataMySQL, $nomeRazaoSocial, $dataMySQL);
            $stmt->execute();
            $usuarioId = $conn->insert_id;
        }

        // Gera números da sorte na tabela apropriada
        for ($i = 0; $i < $quantidadeNumeros; $i++) {
            $numero = gerarNumeroSorteUnico($conn, $tipoSorteio, $periodoReferencia, $periodoAno);

            if ($tipoSorteio === 'mensal') {
                $stmt = $conn->prepare('INSERT INTO numeros_mensais (usuario_id, numero, periodo_mes, periodo_ano, uploaded_by) VALUES (?, ?, ?, ?, ?)');
                $stmt->bind_param('issss', $usuarioId, $numero, $periodoReferencia, $periodoAno, $uploadedBy);
            } else {
                $stmt = $conn->prepare('INSERT INTO numeros_periodicos (usuario_id, numero, periodo_tipo, periodo_ano, uploaded_by) VALUES (?, ?, ?, ?, ?)');
                $stmt->bind_param('issss', $usuarioId, $numero, $periodoReferencia, $periodoAno, $uploadedBy);
            }

            $stmt->execute();
            $numerosGerados++;
        }

        // Registra na tabela chaves_acesso (para rastreamento)
        $chaveAcesso = 'UPLOAD_' . time() . '_' . $usuarioId . '_' . uniqid();
        $stmt = $conn->prepare('INSERT INTO chaves_acesso (usuario_id, chave_acesso, quantidade_numeros, tipo_sorteio, periodo_referencia, periodo_ano, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?)');
        $stmt->bind_param('isissis', $usuarioId, $chaveAcesso, $quantidadeNumeros, $tipoSorteio, $periodoReferencia, $periodoAno, $uploadedBy);
        $stmt->execute();

        $cpfsAfetados[] = $cpfCnpj;
        $linhasProcessadas++;
    }

    // Registra log de sucesso
    $stmt = $conn->prepare('
        INSERT INTO upload_logs 
        (uploaded_by, tipo_sorteio, periodo_referencia, periodo_ano, total_lines, processed_lines, error_count, 
         numbers_generated, users_affected, affected_users, status, message) 
        VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?, "success", ?)
    ');
    $usersAffected = count(array_unique($cpfsAfetados));
    $affectedUsersJson = json_encode(array_unique($cpfsAfetados));
    $mensagem = "Upload concluído com sucesso. Tipo: {$tipoSorteio}, Período: {$periodoReferencia}/{$periodoAno}";
    $stmt->bind_param('sssiiiiss', $uploadedBy, $tipoSorteio, $periodoReferencia, $periodoAno, 
                      $totalLinhas, $linhasProcessadas, $numerosGerados, $usersAffected, $affectedUsersJson, $mensagem);
    $stmt->execute();

    $conn->commit();

    echo json_encode([
        'success' => true,
        'message' => $mensagem,
        'stats' => [
            'tipoSorteio' => $tipoSorteio,
            'periodoReferencia' => $periodoReferencia,
            'periodoAno' => $periodoAno,
            'totalLinhas' => $totalLinhas,
            'linhasProcessadas' => $linhasProcessadas,
            'numerosGerados' => $numerosGerados,
            'usuariosAfetados' => $usersAffected
        ]
    ]);

} catch (Exception $e) {
    if (isset($conn)) {
        $conn->rollback();
    }

    // Log do erro
    if (isset($conn) && isset($uploadedBy)) {
        $stmt = $conn->prepare('
            INSERT INTO upload_logs 
            (uploaded_by, tipo_sorteio, periodo_referencia, periodo_ano, total_lines, processed_lines, error_count, status, message) 
            VALUES (?, ?, ?, ?, ?, 0, 1, "error", ?)
        ');
        $totalLinhas = isset($rows) ? count($rows) : 0;
        $tipoSorteio = $tipoSorteio ?? 'mensal';
        $periodoReferencia = $periodoReferencia ?? '';
        $periodoAno = $periodoAno ?? date('Y');
        $mensagemErro = 'Erro no servidor: ' . $e->getMessage();
        $stmt->bind_param('sssiis', $uploadedBy, $tipoSorteio, $periodoReferencia, $periodoAno, $totalLinhas, $mensagemErro);
        $stmt->execute();
    }

    echo json_encode([
        'success' => false,
        'message' => 'Erro no servidor: ' . $e->getMessage()
    ]);
}
