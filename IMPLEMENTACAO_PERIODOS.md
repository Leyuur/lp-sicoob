# SICOOB - Implementação de Sistema Dual de Sorteios

## 📋 Resumo das Alterações

Este documento descreve as alterações implementadas no sistema SICOOB para suportar dois tipos distintos de sorteios: **Mensal** e **Periódico**.

## 🎯 Principais Funcionalidades

### 1. Duas Tabelas de Números Independentes
- **`numeros_mensais`**: Para sorteios mensais (Janeiro a Dezembro)
- **`numeros_periodicos`**: Para sorteios periódicos (Trimestral, Semestral, Anual)
- Os números podem se repetir entre as tabelas, mas não dentro da mesma tabela/período

### 2. Novo Formato de Planilha
A planilha agora possui 4 colunas obrigatórias:
- **Coluna A - NOME/RAZAO SOCIAL**: Nome completo da pessoa física ou jurídica
- **Coluna B - CPF/CNPJ**: Formato xxx.xxx.xxx-xx ou xx.xxx.xxx/xxxx-xx
- **Coluna C - DATA DE NASCIMENTO/ABERTURA**: Formato dd/mm/aaaa
- **Coluna D - QTD_NUMEROS_SORTE**: Quantidade de números da sorte

### 3. Seleção de Período Antes do Upload
Antes de fazer o upload, o administrador deve confirmar:
- **Para dados mensais**: Escolher mês (Janeiro a Dezembro) + Ano
- **Para dados periódicos**: Escolher período (1º Trim, 2º Trim, 3º Trim, 4º Trim, Semestral, Anual) + Ano

### 4. Confirmação Obrigatória
- Exibe resumo antes do upload
- Confirmação é obrigatória
- Período não pode ser alterado após upload

## 📁 Arquivos Criados/Modificados

### Backend (PHP)

#### Novos Arquivos:
1. **`schema_migration_periods.sql`** - Script de migração do banco de dados
2. **`uploadCsvPeriodo.php`** - Novo endpoint de upload com suporte a períodos
3. **`exportNumerosMensais.php`** - Exportação de números mensais
4. **`exportNumerosPeriodicos.php`** - Exportação de números periódicos
5. **`exportChavesPeriodo.php`** - Exportação de chaves com filtro de período
6. **`exportUsuariosPeriodo.php`** - Exportação de usuários com filtro de período
7. **`getNumbersPeriodo.php`** - Consulta de números para usuários (frontend)

### Frontend (React)

#### Novos Componentes:
1. **`ImportDataNew.jsx`** - Componente de import com duas seções (mensal/periódico)
2. **`ExportDataNew.jsx`** - Componente de export com filtros de período

## 🗄️ Estrutura do Banco de Dados

### Novas Tabelas:

```sql
-- Números para sorteios mensais
CREATE TABLE numeros_mensais (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNSIGNED NOT NULL,
  numero VARCHAR(32) NOT NULL,
  periodo_mes ENUM('janeiro', 'fevereiro', 'marco', ...) NOT NULL,
  periodo_ano YEAR NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  uploaded_by VARCHAR(255) NOT NULL,
  UNIQUE KEY uq_numero_periodo (numero, periodo_mes, periodo_ano)
);

-- Números para sorteios periódicos
CREATE TABLE numeros_periodicos (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNSIGNED NOT NULL,
  numero VARCHAR(32) NOT NULL,
  periodo_tipo ENUM('trimestre_1', 'trimestre_2', 'trimestre_3', 
                    'trimestre_4', 'semestral', 'anual') NOT NULL,
  periodo_ano YEAR NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  uploaded_by VARCHAR(255) NOT NULL,
  UNIQUE KEY uq_numero_periodo (numero, periodo_tipo, periodo_ano)
);
```

### Tabelas Atualizadas:

```sql
-- Usuários - novos campos
ALTER TABLE usuarios 
  ADD COLUMN data_nascimento_abertura DATE,
  ADD COLUMN razao_social VARCHAR(255);

-- Chaves de acesso - campos de período
ALTER TABLE chaves_acesso 
  ADD COLUMN tipo_sorteio ENUM('mensal', 'periodico'),
  ADD COLUMN periodo_referencia VARCHAR(50),
  ADD COLUMN periodo_ano YEAR;

-- Upload logs - rastreamento de período
ALTER TABLE upload_logs
  ADD COLUMN tipo_sorteio ENUM('mensal', 'periodico'),
  ADD COLUMN periodo_referencia VARCHAR(50),
  ADD COLUMN periodo_ano YEAR;
```

## 🚀 Passos de Migração

### 1. Executar Script de Migração
```bash
# Conectar ao MySQL e executar:
mysql -u [usuario] -p [database] < schema_migration_periods.sql
```

### 2. Atualizar Componentes no AdminPanel
Substituir os componentes antigos pelos novos:

```jsx
// Em AdminPanel.jsx, substituir:
import ImportData from '../components/admin/ImportData'
import ExportData from '../components/admin/ExportData'

// Por:
import ImportData from '../components/admin/ImportDataNew'
import ExportData from '../components/admin/ExportDataNew'
```

### 3. Testar Upload Mensal
1. Preparar planilha com formato novo (4 colunas)
2. Selecionar tipo "Mensal"
3. Escolher mês (ex: Janeiro) e ano (ex: 2025)
4. Upload arquivo
5. Confirmar período
6. Verificar sucesso

### 4. Testar Upload Periódico
1. Preparar planilha com formato novo
2. Selecionar tipo "Periódico"
3. Escolher período (ex: 1º Trimestre) e ano
4. Upload arquivo
5. Confirmar período
6. Verificar sucesso

### 5. Testar Exportação
1. Ir para seção de Exportação
2. Selecionar tipo de dados (Usuários, Números Mensais, etc.)
3. Aplicar filtros de período (opcional)
4. Exportar e verificar CSV

## 📊 Períodos Disponíveis

### Mensais (12 opções):
- Janeiro
- Fevereiro
- Março
- Abril
- Maio
- Junho
- Julho
- Agosto
- Setembro
- Outubro
- Novembro
- Dezembro

### Periódicos (6 opções):
- 1º Trimestre (Jan-Mar)
- 2º Trimestre (Abr-Jun)
- 3º Trimestre (Jul-Set)
- 4º Trimestre (Out-Dez)
- Semestral
- Anual

## 🔍 Validações Implementadas

### Upload:
- ✅ Nome/Razão Social obrigatório
- ✅ CPF/CNPJ com validação de formato e dígitos verificadores
- ✅ Data de nascimento/abertura em formato dd/mm/yyyy
- ✅ Quantidade de números entre 1 e 10.000
- ✅ Período de referência obrigatório
- ✅ Confirmação obrigatória antes do upload

### Exportação:
- ✅ Filtros por tipo de sorteio (mensal/periódico/todos)
- ✅ Filtros por período específico
- ✅ Filtros por ano
- ✅ CSV com encoding UTF-8 (compatível com Excel)

## 🎨 Interface

### Componente de Import:
- Duas seções distintas: "Upload de Dados Mensais" e "Upload de Dados Periódicos"
- Seletores de período antes do upload
- Modal de confirmação com resumo dos dados
- Feedback visual de erros por linha
- Estatísticas de upload (linhas processadas, números gerados, etc.)

### Componente de Export:
- Seleção de tipo de dados para exportar
- Filtros opcionais por período
- Visual claro do filtro aplicado
- Nome do arquivo com período incluído

## ⚠️ Observações Importantes

1. **Números Duplicados**: Um mesmo número (ex: 5/12345) pode existir em:
   - Janeiro/2025 (mensal) E 1º Trimestre/2025 (periódico)
   - Mas NÃO pode existir duas vezes em Janeiro/2025

2. **Tabela Antiga**: A tabela `numeros` original foi mantida para compatibilidade. Novos uploads usam as novas tabelas.

3. **CPF vs CNPJ**: O sistema agora aceita ambos com validação adequada.

4. **Data de Nascimento/Abertura**: Necessária para autenticação na consulta pública.

## 📝 Exemplo de Planilha

```
NOME/RAZAO SOCIAL          | CPF/CNPJ            | DATA DE NASCIMENTO/ABERTURA | QTD_NUMEROS_SORTE
João Silva                 | 123.456.789-00      | 15/03/1990                  | 10
Maria Oliveira             | 987.654.321-00      | 22/07/1985                  | 15
Empresa LTDA               | 12.345.678/0001-99  | 10/01/2000                  | 30
```

## 🔄 Fluxo Completo

1. Admin prepara planilha no formato novo
2. Admin seleciona tipo (mensal ou periódico)
3. Admin escolhe período e ano
4. Admin faz upload do arquivo
5. Sistema valida todas as linhas
6. Sistema exibe confirmação com resumo
7. Admin confirma
8. Sistema processa e gera números únicos para aquele período
9. Sistema salva log com informações do período
10. Admin pode exportar dados filtrados por período

## 📞 Suporte

Para dúvidas ou problemas, verifique:
1. Logs do PHP em: `public/server/php-error.log`
2. Logs de upload na tabela `upload_logs`
3. Console do navegador para erros de frontend

---

**Data de Implementação**: Dezembro 2025
**Versão**: 2.0 - Sistema Dual de Sorteios
