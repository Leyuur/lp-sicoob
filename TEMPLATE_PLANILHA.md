# 📋 Template de Planilha - Sistema SICOOB

## Estrutura da Planilha

A planilha deve ter **exatamente 4 colunas** com os seguintes cabeçalhos:

### Cabeçalhos (Linha 1):
1. `NOME/RAZAO SOCIAL`
2. `CPF/CNPJ`
3. `DATA DE NASCIMENTO/ABERTURA`
4. `QTD_NUMEROS_SORTE`

## 📝 Descrição das Colunas

### Coluna A: NOME/RAZAO SOCIAL
- **Obrigatório**: Sim
- **Tipo**: Texto
- **Descrição**: Nome completo da pessoa física ou razão social da pessoa jurídica
- **Exemplos**:
  - `FILIPI YOSHIYUKI GONÇALVES YAMASHITA`
  - `YOSHIDA SUSHI LTDA`
  - `MARIA SILVA SANTOS`

### Coluna B: CPF/CNPJ
- **Obrigatório**: Sim
- **Tipo**: Texto (manter zeros à esquerda!)
- **Formato CPF**: `xxx.xxx.xxx-xx` (11 dígitos com pontos e hífen)
- **Formato CNPJ**: `xx.xxx.xxx/xxxx-xx` (14 dígitos com pontos, barra e hífen)
- **Exemplos**:
  - CPF: `051.893.921-99`
  - CPF: `008.688.581-20`
  - CNPJ: `12.345.678/0001-99`
  - CNPJ: `00.623.904/0001-73`

⚠️ **IMPORTANTE**: 
- No Excel, formatar a coluna como "Texto" antes de colar os dados
- Isso evita que o Excel remova os zeros à esquerda
- Para formatar: Selecione a coluna B → Formato de Células → Texto

### Coluna C: DATA DE NASCIMENTO/ABERTURA
- **Obrigatório**: Sim
- **Tipo**: Texto
- **Formato**: `dd/mm/aaaa` (dia/mês/ano com barras)
- **Exemplos**:
  - `01/02/1982`
  - `07/08/1999`
  - `24/06/1986`
  - `10/01/2000`

⚠️ **IMPORTANTE**: 
- Use sempre 2 dígitos para dia e mês
- Use sempre 4 dígitos para ano
- Não use formato `mm/dd/yyyy` (formato americano)

### Coluna D: QTD_NUMEROS_SORTE
- **Obrigatório**: Sim
- **Tipo**: Número inteiro
- **Mínimo**: 1
- **Máximo**: 10.000
- **Exemplos**:
  - `150`
  - `90`
  - `8`
  - `130`

## 📊 Exemplo Completo

```
NOME/RAZAO SOCIAL                      | CPF/CNPJ            | DATA DE NASCIMENTO/ABERTURA | QTD_NUMEROS_SORTE
FILIPI YOSHIYUKI GONÇALVES YAMASHITA   | 051.893.921-99      | 01/02/1982                  | 150
YOSHIDA SUSHI LTDA                     | 00.623.904/0001-73  | 07/08/1999                  | 90
AUTOELETRICA MIKE                      | 37.562.378/0001-99  | 05/03/2000                  | 8
PRISCILA TRAUER TAJES                  | 008.688.581-20      | 24/06/1986                  | 130
CONECTA MAIS                           | 79.222.308/0001-26  | 10/01/2000                  | 30
```

## ✅ Checklist Antes de Enviar

- [ ] Arquivo está em formato `.xlsx` (Excel)
- [ ] Cabeçalhos estão corretos (linha 1)
- [ ] Coluna CPF/CNPJ formatada como "Texto"
- [ ] CPFs/CNPJs com pontuação completa (xxx.xxx.xxx-xx)
- [ ] Datas no formato dd/mm/aaaa
- [ ] Quantidade de números entre 1 e 10.000
- [ ] Sem linhas vazias no meio dos dados
- [ ] Todos os campos preenchidos

## 🚫 Erros Comuns

### ❌ Erro: CPF sem formatação
```
123456789
```
✅ **Correto:**
```
001.234.567-89
```

### ❌ Erro: Data em formato incorreto
```
1982-02-01
02/01/82
```
✅ **Correto:**
```
01/02/1982
```

### ❌ Erro: Zeros à esquerda removidos
```
51.893.921-99  (falta o zero)
```
✅ **Correto:**
```
051.893.921-99
```

### ❌ Erro: CNPJ incorreto
```
12345678000199
12.345.678.0001.99
```
✅ **Correto:**
```
12.345.678/0001-99
```

## 🎯 Dicas de Excel

### Como formatar coluna como texto:
1. Selecione toda a coluna B (CPF/CNPJ)
2. Clique com botão direito → "Formatar Células"
3. Escolha "Texto" na lista de categorias
4. Clique OK
5. Agora cole os dados

### Como copiar dados mantendo formato:
1. Copie os dados (Ctrl+C)
2. Cole como "Valores" (Ctrl+Alt+V → Valores)

### Como verificar se está correto:
1. Clique em uma célula com CPF/CNPJ
2. Verifique na barra de fórmulas se os zeros estão presentes
3. Se não estiver, refaça a formatação

## 📥 Download Template

Você pode criar uma planilha vazia com os cabeçalhos corretos:

1. Abra o Excel
2. Na linha 1, digite:
   - A1: `NOME/RAZAO SOCIAL`
   - B1: `CPF/CNPJ`
   - C1: `DATA DE NASCIMENTO/ABERTURA`
   - D1: `QTD_NUMEROS_SORTE`
3. Formate a coluna B como "Texto"
4. Formate a coluna C como "Texto"
5. Salve como `template_sicoob.xlsx`

## 🔄 Processo de Upload

### Upload Mensal:
1. Prepare a planilha conforme este template
2. No painel admin, vá para "Importar Dados Mensais"
3. Selecione o mês (Janeiro a Dezembro)
4. Selecione o ano
5. Faça upload do arquivo
6. Revise o resumo na confirmação
7. Confirme o envio

### Upload Periódico:
1. Prepare a planilha conforme este template
2. No painel admin, vá para "Importar Dados Periódicos"
3. Selecione o período (1º Trim, 2º Trim, etc.)
4. Selecione o ano
5. Faça upload do arquivo
6. Revise o resumo na confirmação
7. Confirme o envio

## ⚠️ Validações do Sistema

O sistema vai validar:
- ✅ Todos os campos obrigatórios preenchidos
- ✅ CPF/CNPJ com formato correto e dígitos verificadores válidos
- ✅ Data válida e no formato correto
- ✅ Quantidade de números dentro do limite
- ✅ Período selecionado é válido
- ✅ Não há duplicatas no período

Se houver erros, o sistema irá:
1. Parar o processamento
2. Mostrar lista de erros por linha
3. **Não inserir nenhum dado** até que todos os erros sejam corrigidos

## 📞 Suporte

Em caso de dúvidas sobre o formato da planilha:
1. Verifique os exemplos neste documento
2. Compare com a imagem de exemplo fornecida
3. Teste com uma planilha pequena (2-3 linhas) primeiro

---

**Última atualização**: Dezembro 2025
**Versão do sistema**: 2.0
