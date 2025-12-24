<?php
date_default_timezone_set('America/Sao_Paulo');

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../db/config.php';

try {
    $stmt = $conn->prepare('
        SELECT 
            g.id,
            g.usuario_id,
            g.numero,
            g.tipo_sorteio,
            g.periodo_referencia,
            g.periodo_ano,
            g.data_indicacao,
            g.indicado_por,
            g.status,
            g.motivo_desclassificacao,
            u.cpf,
            COALESCE(u.razao_social, u.name) as nome,
            u.data_nascimento_abertura
        FROM ganhadores g
        INNER JOIN usuarios u ON g.usuario_id = u.id
        ORDER BY g.data_indicacao DESC
    ');
    $stmt->execute();
    $result = $stmt->get_result();

    $winners = [];
    while ($row = $result->fetch_assoc()) {
        // Determinar categoria do sorteio
        $categoria = '';
        if ($row['tipo_sorteio'] === 'mensal') {
            $categoria = 'Mensal';
            // Formatar nome do mês
            $meses = [
                'janeiro' => 'Janeiro', 'fevereiro' => 'Fevereiro', 'marco' => 'Março',
                'abril' => 'Abril', 'maio' => 'Maio', 'junho' => 'Junho',
                'julho' => 'Julho', 'agosto' => 'Agosto', 'setembro' => 'Setembro',
                'outubro' => 'Outubro', 'novembro' => 'Novembro', 'dezembro' => 'Dezembro'
            ];
            $periodoFormatado = $meses[$row['periodo_referencia']] ?? ucfirst($row['periodo_referencia']);
        } elseif ($row['tipo_sorteio'] === 'periodico') {
            $categoria = 'Periódico';
            $periodoFormatado = $row['periodo_referencia'] . 'º Período';
        } else {
            $categoria = ucfirst($row['tipo_sorteio']);
            $periodoFormatado = $row['periodo_referencia'];
        }

        // Formatar número da sorte
        $numeroFormatado = str_pad($row['numero'], 10, '0', STR_PAD_LEFT);
        $numeroFormatado = substr($numeroFormatado, 0, 3) . '.' . 
                          substr($numeroFormatado, 3, 3) . '.' . 
                          substr($numeroFormatado, 6, 4);

        $winners[] = [
            'id' => (int)$row['id'],
            'usuario_id' => (int)$row['usuario_id'],
            'nome' => $row['nome'],
            'participantCpf' => $row['cpf'] ? 
                substr($row['cpf'], 0, 3) . '.' . 
                substr($row['cpf'], 3, 3) . '.' . 
                substr($row['cpf'], 6, 3) . '-' . 
                substr($row['cpf'], 9, 2) : 
                'N/A',
            'numero' => $row['numero'], // Número original sem formatação
            'numero_sorte' => $numeroFormatado,
            'tipo_sorteio_formatado' => $categoria,
            'periodo_formatado' => $periodoFormatado,
            'periodo_ano' => $row['periodo_ano'],
            'data_indicacao' => $row['data_indicacao'],
            'indicado_por' => $row['indicado_por'],
            'status' => $row['status'],
            'motivo_desclassificacao' => $row['motivo_desclassificacao']
        ];
    }

    echo json_encode([
        'success' => true,
        'winners' => $winners,
        'total' => count($winners)
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    error_log("Erro ao buscar ganhadores: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao buscar ganhadores'
    ], JSON_UNESCAPED_UNICODE);
}
?>
