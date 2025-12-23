import { useState } from 'react'
import { Download, Filter, FileSpreadsheet, Calendar } from 'lucide-react'
import { toast } from 'react-toastify'

function ExportData() {
  const [exportType, setExportType] = useState('usuarios')
  const [loading, setLoading] = useState(false)
  
  // Filtros para período
  const [tipoSorteio, setTipoSorteio] = useState('todos')
  const [periodoReferencia, setPeriodoReferencia] = useState('')
  const [periodoAno, setPeriodoAno] = useState(new Date().getFullYear())

  const exportTypes = [
    { id: 'usuarios', label: 'Usuários', endpoint: '/server/admin/exportUsuariosPeriodo.php', supportsPeriod: true },
    { id: 'numeros_mensais', label: 'Números Mensais', endpoint: '/server/admin/exportNumerosMensais.php', supportsPeriod: true },
    { id: 'numeros_periodicos', label: 'Números Periódicos', endpoint: '/server/admin/exportNumerosPeriodicos.php', supportsPeriod: true },
    { id: 'chaves', label: 'Chaves de Acesso', endpoint: '/server/admin/exportChavesPeriodo.php', supportsPeriod: true },
    { id: 'notas', label: 'Notas Fiscais', endpoint: '/server/admin/exportNotas.php', supportsPeriod: false }
  ]

  const mesesOptions = [
    { value: 'janeiro', label: 'Janeiro' },
    { value: 'fevereiro', label: 'Fevereiro' },
    { value: 'marco', label: 'Março' },
    { value: 'abril', label: 'Abril' },
    { value: 'maio', label: 'Maio' },
    { value: 'junho', label: 'Junho' },
    { value: 'julho', label: 'Julho' },
    { value: 'agosto', label: 'Agosto' },
    { value: 'setembro', label: 'Setembro' },
    { value: 'outubro', label: 'Outubro' },
    { value: 'novembro', label: 'Novembro' },
    { value: 'dezembro', label: 'Dezembro' }
  ]

  const periodosPeriodicosOptions = [
    { value: 'trimestre_1', label: '1º Trimestre' },
    { value: 'trimestre_2', label: '2º Trimestre' },
    { value: 'trimestre_3', label: '3º Trimestre' },
    { value: 'trimestre_4', label: '4º Trimestre' },
    { value: 'semestral', label: 'Semestral' },
    { value: 'anual', label: 'Anual' }
  ]

  const anosOptions = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i)

  const selectedExportType = exportTypes.find(t => t.id === exportType)

  const handleExport = async () => {
    setLoading(true)
    
    try {
      const selectedType = exportTypes.find(t => t.id === exportType)
      
      // Preparar filtros
      const filters = {}
      
      // Se o tipo de exportação suporta período e um período foi selecionado
      if (selectedType.supportsPeriod && tipoSorteio !== 'todos') {
        filters.tipoSorteio = tipoSorteio
        filters.periodoReferencia = periodoReferencia || null
        filters.periodoAno = periodoAno
      }
      
      const response = await fetch(selectedType.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters)
      })

      const data = await response.json()

      if (data.success) {
        // Converter dados para CSV
        const csvContent = convertToCSV(data.content, exportType)
        
        if (!csvContent || csvContent.trim().length === 0) {
          toast.warning('Nenhum dado encontrado para exportar', {
            position: "top-right",
            autoClose: 3000,
          })
          return
        }
        
        // Nome do arquivo com filtros
        let filename = `${exportType}_${new Date().toISOString().split('T')[0]}`
        if (periodoReferencia) {
          filename += `_${periodoReferencia}_${periodoAno}`
        }
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

  const convertToCSV = (data, type) => {
    if (!data || data.length === 0) return ''

    let headers = []
    let rows = []

    switch (type) {
      case 'usuarios':
        headers = ['CPF/CNPJ', 'Nome/Razão Social', 'Data Nascimento/Abertura', 'Qtd Números', 'Data Cadastro']
        rows = data.map(item => [
          item.cpf || '',
          item.name || item.razao_social || '',
          item.data_nascimento_abertura || '',
          item.qtd_numeros || '',
          item.created_at || ''
        ])
        break

      case 'numeros_mensais':
        headers = ['Número', 'CPF/CNPJ', 'Mês', 'Ano', 'Data Geração', 'Enviado Por']
        rows = data.map(item => [
          item.numero || '',
          item.cpf || '',
          item.periodo_mes || '',
          item.periodo_ano || '',
          item.created_at || '',
          item.uploaded_by || ''
        ])
        break

      case 'numeros_periodicos':
        headers = ['Número', 'CPF/CNPJ', 'Período', 'Ano', 'Data Geração', 'Enviado Por']
        rows = data.map(item => [
          item.numero || '',
          item.cpf || '',
          item.periodo_tipo || '',
          item.periodo_ano || '',
          item.created_at || '',
          item.uploaded_by || ''
        ])
        break

      case 'chaves':
        headers = ['Chave de Acesso', 'CPF/CNPJ', 'Qtd Números', 'Tipo Sorteio', 'Período', 'Ano', 'Enviado Por', 'Data']
        rows = data.map(item => [
          item.chave_acesso || '',
          item.cpf || '',
          item.quantidade_numeros || '',
          item.tipo_sorteio || '',
          item.periodo_referencia || '',
          item.periodo_ano || '',
          item.uploaded_by || '',
          item.created_at || ''
        ])
        break

      case 'notas':
        headers = ['ID', 'CPF', 'Nome', 'Número Nota', 'Valor', 'Data Compra', 'Enviado Por', 'Data Upload']
        rows = data.map(item => [
          item.id || '',
          item.cpf || '',
          item.nome || '',
          item.numero_nota || '',
          item.valor || '',
          item.data_compra || '',
          item.uploaded_by || '',
          item.created_at || ''
        ])
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {exportTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => {
                    setExportType(type.id)
                    setPeriodoReferencia('')
                    setTipoSorteio('todos')
                  }}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                    exportType === type.id
                      ? 'border-[#04c8b0] bg-[#04c8b0]/20 text-white'
                      : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <p className="font-bold">{type.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Filtros de Período - apenas para tipos que suportam */}
          {selectedExportType?.supportsPeriod && (
            <div className="bg-blue-900/30 border border-blue-500 rounded-xl p-6">
              <h3 className="text-blue-400 font-bold text-lg mb-4 flex items-center gap-2">
                <Calendar size={20} />
                Filtrar por Período (Opcional)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Tipo de Sorteio */}
                <div>
                  <label className="block text-gray-300 font-semibold mb-2">Tipo de Sorteio</label>
                  <select
                    value={tipoSorteio}
                    onChange={(e) => {
                      setTipoSorteio(e.target.value)
                      setPeriodoReferencia('')
                    }}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-[#04c8b0] focus:outline-none"
                  >
                    <option value="todos">Todos</option>
                    <option value="mensal">Mensal</option>
                    <option value="periodico">Periódico</option>
                  </select>
                </div>

                {/* Período Específico */}
                {tipoSorteio !== 'todos' && (
                  <div>
                    <label className="block text-gray-300 font-semibold mb-2">
                      {tipoSorteio === 'mensal' ? 'Mês' : 'Período'}
                    </label>
                    <select
                      value={periodoReferencia}
                      onChange={(e) => setPeriodoReferencia(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-[#04c8b0] focus:outline-none"
                    >
                      <option value="">Todos</option>
                      {(tipoSorteio === 'mensal' ? mesesOptions : periodosPeriodicosOptions).map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Ano */}
                {tipoSorteio !== 'todos' && (
                  <div>
                    <label className="block text-gray-300 font-semibold mb-2">Ano</label>
                    <select
                      value={periodoAno}
                      onChange={(e) => setPeriodoAno(parseInt(e.target.value))}
                      className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-[#04c8b0] focus:outline-none"
                    >
                      {anosOptions.map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {tipoSorteio !== 'todos' && periodoReferencia && (
                <div className="mt-4 p-3 bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-300">
                    <strong>Filtro aplicado:</strong> {tipoSorteio === 'mensal' ? 'Mensal' : 'Periódico'} - {
                      (tipoSorteio === 'mensal' ? mesesOptions : periodosPeriodicosOptions)
                        .find(p => p.value === periodoReferencia)?.label
                    } {periodoAno}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Botão de Exportar */}
          <button
            onClick={handleExport}
            disabled={loading}
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
                <span>Exportar {selectedExportType?.label}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Informações */}
      <div className="bg-yellow-900/30 border border-yellow-500 rounded-xl p-6">
        <h3 className="text-yellow-400 font-bold mb-2">ℹ️ Informações</h3>
        <ul className="space-y-2 text-gray-300 text-sm">
          <li>• Os arquivos são exportados em formato CSV (compatível com Excel)</li>
          <li>• Use os filtros de período para exportar dados específicos de um mês ou período</li>
          <li>• O nome do arquivo incluirá a data e o período selecionado</li>
          <li>• Números podem se repetir entre tabelas mensais e periódicas</li>
        </ul>
      </div>
    </div>
  )
}

export default ExportData
