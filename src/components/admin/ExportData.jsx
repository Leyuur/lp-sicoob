import { useState } from 'react'
import { Download, Filter, FileSpreadsheet, Calendar } from 'lucide-react'
import { toast } from 'react-toastify'

function ExportData() {
  const [exportType, setExportType] = useState('usuarios')
  const [loading, setLoading] = useState(false)
  
  // Filtros para período
  const [periodoSelecionado, setPeriodoSelecionado] = useState('')
  const [periodoAno] = useState(2026)

  const exportTypes = [
    { id: 'usuarios', label: 'Usuários', endpoint: '/server/admin/exportUsuariosPeriodo.php', supportsPeriod: false },
    { id: 'numeros', label: 'Números da Sorte', endpoint: null, supportsPeriod: true }
  ]

  const periodosNumerosOptions = [
    { value: 'janeiro', label: 'Janeiro', tipo: 'mensal' },
    { value: 'fevereiro', label: 'Fevereiro', tipo: 'mensal' },
    { value: 'marco', label: 'Março', tipo: 'mensal' },
    { value: 'abril', label: 'Abril', tipo: 'mensal' },
    { value: 'maio', label: 'Maio', tipo: 'mensal' },
    { value: 'junho', label: 'Junho', tipo: 'mensal' },
    { value: 'julho', label: 'Julho', tipo: 'mensal' },
    { value: 'agosto', label: 'Agosto', tipo: 'mensal' },
    { value: 'setembro', label: 'Setembro', tipo: 'mensal' },
    { value: 'outubro', label: 'Outubro', tipo: 'mensal' },
    { value: 'novembro', label: 'Novembro', tipo: 'mensal' },
    { value: 'dezembro', label: 'Dezembro', tipo: 'mensal' },
    { value: 'trimestre_1', label: '1º Trimestre', tipo: 'periodico' },
    { value: 'trimestre_2', label: '2º Trimestre', tipo: 'periodico' },
    { value: 'trimestre_3', label: '3º Trimestre', tipo: 'periodico' },
    { value: 'trimestre_4', label: '4º Trimestre', tipo: 'periodico' },
    { value: 'semestral', label: 'Semestral', tipo: 'periodico' },
    { value: 'anual', label: 'Anual', tipo: 'periodico' }
  ]

  const selectedExportType = exportTypes.find(t => t.id === exportType)

  const handleExport = async () => {
    setLoading(true)
    
    try {
      const selectedType = exportTypes.find(t => t.id === exportType)
      
      // Determinar endpoint baseado no tipo
      let endpoint = selectedType.endpoint
      
      if (exportType === 'numeros') {
        if (!periodoSelecionado) {
          toast.error('Selecione o período para exportar', {
            position: "top-right",
            autoClose: 5000,
          })
          setLoading(false)
          return
        }
        
        // Encontrar o período selecionado para determinar o tipo
        const periodo = periodosNumerosOptions.find(p => p.value === periodoSelecionado)
        
        // Determinar endpoint baseado no tipo do período
        if (periodo.tipo === 'mensal') {
          endpoint = '/server/admin/exportNumerosMensais.php'
        } else {
          endpoint = '/server/admin/exportNumerosPeriodicos.php'
        }
      }
      
      // Preparar filtros
      const filters = {}
      
      // Se for números, adicionar o período
      if (exportType === 'numeros' && periodoSelecionado) {
        filters.periodoReferencia = periodoSelecionado
        filters.periodoAno = periodoAno
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters)
      })

      const data = await response.json()

      if (data.success) {
        // Converter dados para CSV
        const periodo = periodosNumerosOptions.find(p => p.value === periodoSelecionado)
        const tipoSorteio = periodo ? periodo.tipo : null
        const csvContent = convertToCSV(data.content, exportType, tipoSorteio)
        
        if (!csvContent || csvContent.trim().length === 0) {
          toast.warning('Nenhum dado encontrado para exportar', {
            position: "top-right",
            autoClose: 3000,
          })
          return
        }
        
        // Nome do arquivo com filtros
        let filename = exportType === 'numeros' 
          ? `numeros_${periodoSelecionado}_${periodoAno}`
          : `${exportType}_${new Date().toISOString().split('T')[0]}`
        
        filename += '.csv'
        
        // Download do arquivo
        downloadCSV(csvContent, filename)
        
        toast.success(`${selectedType.label} exportado com sucesso!`, {
          position: "top-right",
          autoClose: 3000,
        })
      } else {
        toast.error(data.message || 'Erro ao exportar dados', {
          position: "top-right",
          autoClose: 5000,
        })
      }
    } catch (error) {
      console.error('Erro ao exportar:', error)
      toast.error('Erro ao exportar dados', {
        position: "top-right",
        autoClose: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  const convertToCSV = (data, type, tipoSorteio = null) => {
    if (!data || data.length === 0) return ''

    // Função para formatar CPF/CNPJ com máscara
    const formatCpfCnpj = (value) => {
      if (!value) return ''
      const cleaned = value.replace(/\D/g, '')
      
      if (cleaned.length === 11) {
        // CPF: xxx.xxx.xxx-xx
        return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
      } else if (cleaned.length === 14) {
        // CNPJ: xx.xxx.xxx/xxxx-xx
        return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
      }
      return value
    }

    let headers = []
    let rows = []

    switch (type) {
      case 'usuarios':
        headers = ['CPF/CNPJ', 'Nome/Razão Social', 'Data Nascimento/Abertura', 'Qtd Números Total', 'Data Cadastro']
        rows = data.map(item => [
          formatCpfCnpj(item.cpf || ''),
          item.name || item.razao_social || '',
          item.data_nascimento_abertura || '',
          item.qtd_numeros || '',
          item.created_at || ''
        ])
        break

      case 'numeros':
        if (tipoSorteio === 'mensal') {
          headers = ['Nome/Razão Social', 'CPF/CNPJ', 'Número da Sorte', 'Série', 'Elemento Sorteável', 'Mês', 'Ano', 'Data Geração', 'Enviado Por']
          rows = data.map(item => {
            const numero = item.numero || ''
            const [serie, elemento] = numero.split('/')
            return [
              item.name || item.razao_social || '',
              formatCpfCnpj(item.cpf || ''),
              numero,
              serie || '',
              elemento || '',
              item.periodo_mes || '',
              item.periodo_ano || '',
              item.created_at || '',
              item.uploaded_by || ''
            ]
          })
        } else if (tipoSorteio === 'periodico') {
          headers = ['Nome/Razão Social', 'CPF/CNPJ', 'Número da Sorte', 'Série', 'Elemento Sorteável', 'Período', 'Ano', 'Data Geração', 'Enviado Por']
          rows = data.map(item => {
            const numero = item.numero || ''
            const [serie, elemento] = numero.split('/')
            return [
              item.name || item.razao_social || '',
              formatCpfCnpj(item.cpf || ''),
              numero,
              serie || '',
              elemento || '',
              item.periodo_tipo || '',
              item.periodo_ano || '',
              item.created_at || '',
              item.uploaded_by || ''
            ]
          })
        }
        break

      default:
        return ''
    }

    // Construir CSV
    const csvRows = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ]

    return csvRows.join('\n')
  }

  const downloadCSV = (content, filename) => {
    const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* Título */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-2xl font-bold text-[#04c8b0] mb-2">Exportar Dados</h2>
        <p className="text-gray-400">Baixe relatórios em formato CSV</p>
      </div>

      {/* Formulário de Exportação */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="space-y-6">
          {/* Tipo de Exportação */}
          <div>
            <label className="block text-gray-300 font-semibold mb-3">
              <FileSpreadsheet className="inline mr-2" size={20} />
              Tipo de Dados
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exportTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => {
                    setExportType(type.id)
                    setPeriodoSelecionado('')
                  }}
                  className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                    exportType === type.id
                      ? 'border-[#04c8b0] bg-[#04c8b0]/20 text-white'
                      : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <p className="font-bold text-lg">{type.label}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {type.id === 'usuarios' ? 'Lista de participantes' : 'Números organizados por período'}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Filtros de Período - apenas para Números da Sorte */}
          {exportType === 'numeros' && (
            <div className="bg-blue-900/30 border border-blue-500 rounded-xl p-6">
              <h3 className="text-blue-400 font-bold text-lg mb-4 flex items-center gap-2">
                <Calendar size={20} />
                Selecione o Período
              </h3>
              
              <div className="space-y-4">
                {/* Período - obrigatório para números */}
                <div>
                  <label className="block text-gray-300 font-semibold mb-2">Período *</label>
                  <select
                    value={periodoSelecionado}
                    onChange={(e) => setPeriodoSelecionado(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-[#04c8b0] focus:outline-none"
                  >
                    <option value="">Selecione o período...</option>
                    <optgroup label="Mensal">
                      {periodosNumerosOptions.filter(p => p.tipo === 'mensal').map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Periódico">
                      {periodosNumerosOptions.filter(p => p.tipo === 'periodico').map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {/* Ano */}
                <div>
                  <label className="block text-gray-300 font-semibold mb-2">Ano</label>
                  <div className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600">
                    2026
                  </div>
                </div>

                {periodoSelecionado && (
                  <div className="mt-4 p-3 bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-300">
                      <strong>Filtro aplicado:</strong> {
                        periodosNumerosOptions.find(p => p.value === periodoSelecionado)?.label
                      } {periodoAno}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Botão de Exportar */}
          <button
            onClick={handleExport}
            disabled={loading || (exportType === 'numeros' && !periodoSelecionado)}
            className="w-full px-6 py-4 bg-gradient-to-r from-[#04c8b0] to-[#03a088] hover:from-[#03a088] hover:to-[#04c8b0] text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Exportando...</span>
              </>
            ) : (
              <>
                <Download size={24} />
                <span>
                  {exportType === 'numeros' && !periodoSelecionado 
                    ? 'Selecione o período'
                    : `Exportar ${selectedExportType?.label}`
                  }
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Informações */}
      <div className="bg-yellow-900/30 border border-yellow-500 rounded-xl p-6">
        <h3 className="text-yellow-400 font-bold mb-2">ℹ️ Informações</h3>
        <ul className="space-y-2 text-gray-300 text-sm">
          <li>• <strong>Usuários:</strong> Exporta lista completa de participantes cadastrados</li>
          <li>• <strong>Números da Sorte:</strong> Você deve escolher entre Mensal ou Periódico</li>
          <li>• Para números, você pode filtrar por período e ano específicos (opcional)</li>
          <li>• Os arquivos são exportados em formato CSV (compatível com Excel)</li>
          <li>• Números podem se repetir entre sorteios mensais e periódicos</li>
        </ul>
      </div>
    </div>
  )
}

export default ExportData
