# 🚀 Guia Rápido de Integração - Sistema Dual de Sorteios

## Checklist de Implementação

### ✅ Passo 1: Backup do Banco de Dados
```bash
mysqldump -u [usuario] -p [database] > backup_antes_migracao.sql
```

### ✅ Passo 2: Executar Migração do Banco
```bash
# Conectar ao MySQL
mysql -u [usuario] -p [database]

# Executar o script de migração
source public/server/db/schema_migration_periods.sql;

# Verificar se as tabelas foram criadas
SHOW TABLES LIKE 'numeros_%';
DESCRIBE numeros_mensais;
DESCRIBE numeros_periodicos;
```

### ✅ Passo 3: Atualizar AdminPanel.jsx

Localize o arquivo `src/pages/AdminPanel.jsx` e faça as seguintes alterações:

**ANTES:**
```jsx
import ImportData from '../components/admin/ImportData'
import ExportData from '../components/admin/ExportData'
```

**DEPOIS:**
```jsx
import ImportData from '../components/admin/ImportDataNew'
import ExportData from '../components/admin/ExportDataNew'
```

### ✅ Passo 4: Testar Upload Mensal

1. Crie uma planilha de teste `teste_mensal.xlsx`:
```
NOME/RAZAO SOCIAL          | CPF/CNPJ            | DATA DE NASCIMENTO/ABERTURA | QTD_NUMEROS_SORTE
FILIPI YOSHIYUKI GONÇALVES | 051.893.921-99      | 01/02/1982                  | 5
YOSHIDA SUSHI LTDA         | 00.623.904/0001-73  | 07/08/1999                  | 3
```

2. No painel admin:
   - Vá para "Importar Dados Mensais"
   - Selecione mês: Janeiro
   - Selecione ano: 2025
   - Upload do arquivo
   - Confirme o período
   - Verifique o sucesso

### ✅ Passo 5: Testar Upload Periódico

1. Use a mesma planilha ou crie outra
2. No painel admin:
   - Vá para "Importar Dados Periódicos"
   - Selecione período: 1º Trimestre
   - Selecione ano: 2025
   - Upload do arquivo
   - Confirme o período
   - Verifique o sucesso

### ✅ Passo 6: Verificar Dados no Banco

```sql
-- Ver números mensais
SELECT * FROM numeros_mensais LIMIT 10;

-- Ver números periódicos
SELECT * FROM numeros_periodicos LIMIT 10;

-- Ver chaves com período
SELECT * FROM chaves_acesso WHERE tipo_sorteio IS NOT NULL LIMIT 10;

-- Ver logs de upload
SELECT * FROM upload_logs ORDER BY created_at DESC LIMIT 5;
```

### ✅ Passo 7: Testar Exportação

1. No painel admin, vá para "Exportar Dados"
2. Teste exportar "Números Mensais":
   - Selecione tipo: Mensal
   - Selecione mês: Janeiro
   - Selecione ano: 2025
   - Clique em Exportar
   - Verifique o CSV baixado

3. Teste exportar "Números Periódicos":
   - Selecione tipo: Periódico
   - Selecione período: 1º Trimestre
   - Selecione ano: 2025
   - Clique em Exportar
   - Verifique o CSV baixado

### ✅ Passo 8: Testar Consulta Pública (Opcional)

Se você quiser atualizar a consulta pública para usar o novo endpoint:

**Em ConsultaNumeros.jsx**, substitua o endpoint:
```jsx
// ANTES
const response = await fetch('/server/user/getNumbers.php', {

// DEPOIS
const response = await fetch('/server/user/getNumbersPeriodo.php', {
```

E adicione o campo de data de nascimento no formulário.

## 🔍 Validação da Migração

Execute estes comandos SQL para verificar se tudo está correto:

```sql
-- 1. Verificar estrutura das novas tabelas
SHOW CREATE TABLE numeros_mensais;
SHOW CREATE TABLE numeros_periodicos;

-- 2. Verificar se os campos foram adicionados
DESCRIBE usuarios;
DESCRIBE chaves_acesso;
DESCRIBE upload_logs;

-- 3. Verificar índices
SHOW INDEX FROM numeros_mensais;
SHOW INDEX FROM numeros_periodicos;

-- 4. Contar registros (deve ser 0 se é nova instalação)
SELECT COUNT(*) as total_mensais FROM numeros_mensais;
SELECT COUNT(*) as total_periodicos FROM numeros_periodicos;
```

## 🐛 Troubleshooting

### Problema: Erro ao criar tabelas
**Solução**: Verifique se o usuário MySQL tem permissão de CREATE e ALTER

### Problema: Componente não aparece
**Solução**: Verifique se importou corretamente no AdminPanel.jsx

### Problema: Upload falha sem mensagem
**Solução**: Verifique o arquivo `public/server/php-error.log`

### Problema: Números não aparecem na consulta
**Solução**: Certifique-se de que CPF e data de nascimento estão corretos

### Problema: CSV vazio na exportação
**Solução**: Verifique se há dados no período selecionado

## 📊 Monitoramento

Para monitorar o sistema após a migração:

```sql
-- Ver uploads recentes
SELECT 
    uploaded_by,
    tipo_sorteio,
    periodo_referencia,
    periodo_ano,
    processed_lines,
    numbers_generated,
    status,
    created_at
FROM upload_logs
ORDER BY created_at DESC
LIMIT 20;

-- Ver distribuição de números por período mensal
SELECT 
    periodo_mes,
    periodo_ano,
    COUNT(*) as quantidade
FROM numeros_mensais
GROUP BY periodo_mes, periodo_ano
ORDER BY periodo_ano DESC, periodo_mes;

-- Ver distribuição de números por período periódico
SELECT 
    periodo_tipo,
    periodo_ano,
    COUNT(*) as quantidade
FROM numeros_periodicos
GROUP BY periodo_tipo, periodo_ano
ORDER BY periodo_ano DESC, periodo_tipo;
```

## ✨ Próximos Passos

Após a migração bem-sucedida:

1. ✅ Treinar equipe no novo formato de planilha
2. ✅ Atualizar documentação interna
3. ✅ Comunicar mudanças aos usuários (se aplicável)
4. ✅ Monitorar logs por 1 semana
5. ✅ Fazer backup regular do banco de dados

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs:
   - PHP: `public/server/php-error.log`
   - Banco: Tabela `upload_logs`
   - Browser: Console do desenvolvedor (F12)

2. Teste com dados pequenos primeiro (1-2 linhas)

3. Verifique se todos os arquivos foram criados corretamente:
   ```bash
   ls -la public/server/admin/uploadCsvPeriodo.php
   ls -la public/server/admin/export*Periodo.php
   ls -la src/components/admin/*New.jsx
   ```

---

**Tempo estimado de migração**: 15-30 minutos
**Nível de dificuldade**: Médio
**Reversível**: Sim (com backup do banco)
