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
            u.cpf,
            COALESCE(u.razao_social, u.name) as nome,
            u.data_nascimento_abertura
        FROM ganhadores g
        INNER JOIN usuarios u ON g.usuario_id = u.id
        WHERE g.status = "contemplado"
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
        } else {
            // Determinar categoria dos periódicos
            $periodico = $row['periodo_referencia'];
            if (strpos($periodico, 'trimestre') !== false) {
                $categoria = 'Trimestral';
                $periodoFormatado = str_replace('trimestre_', '', $periodico) . 'º Trimestre';
            } elseif ($periodico === 'semestral') {
                $categoria = 'Semestral';
                $periodoFormatado = 'Semestral';
            } elseif ($periodico === 'anual') {
                $categoria = 'Anual';
                $periodoFormatado = 'Anual';
            } else {
                $periodoFormatado = ucfirst($periodico);
            }
        }
        
        $winners[] = [
            'id' => $row['id'],
            'participantId' => $row['usuario_id'],
            'numero_sorte' => $row['numero'],
            'tipo_sorteio' => $row['tipo_sorteio'],
            'tipo_sorteio_formatado' => $categoria,
            'periodo_referencia' => $row['periodo_referencia'],
            'periodo_formatado' => $periodoFormatado,
            'periodo_ano' => $row['periodo_ano'],
            'data_indicacao' => $row['data_indicacao'],
            'premiadoPor' => $row['indicado_por'],
            'nome' => $row['nome'],
            'participantCpf' => $row['cpf']
        ];
    }

    echo json_encode([
        'success' => true,
        'winners' => $winners
    ]);

    $stmt->close();
    $conn->close();

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao buscar ganhadores: ' . $e->getMessage()
    ]);
}
?>
