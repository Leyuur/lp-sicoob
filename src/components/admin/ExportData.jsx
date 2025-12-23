import { useState } from 'react'
import { Download, Filter, FileSpreadsheet } from 'lucide-react'
import { toast } from 'react-toastify'

function ExportData() {
  const [exportType, setExportType] = useState('usuarios')
  const [loading, setLoading] = useState(false)

  const exportTypes = [
    { id: 'usuarios', label: 'Usuários', endpoint: '/server/admin/exportUsuarios.php' },
    { id: 'numeros', label: 'Números da Sorte', endpoint: '/server/admin/exportNumeros.php' },
    { id: 'chaves', label: 'Chaves de Acesso', endpoint: '/server/admin/exportChaves.php' },
    { id: 'notas', label: 'Notas Fiscais', endpoint: '/server/admin/exportNotas.php' }
  ]

  const handleExport = async () => {
    setLoading(true)
    
    try {
      const selectedType = exportTypes.find(t => t.id === exportType)
      
      const response = await fetch(selectedType.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const data = await response.json()

      if (data.success) {
        // Converter dados para CSV
        const csvContent = convertToCSV(data.content, exportType)
        
        // Download do arquivo
        downloadCSV(csvContent, `${exportType}_${new Date().toISOString().split('T')[0]}.csv`)
        
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
        headers = ['ID', 'Nome', 'CPF', 'Data de Nascimento', 'Data de Cadastro']
        rows = data.map(item => [
          item.id || '',
          item.name || '',
          item.cpf || '',
          item.data_nascimento || '',
          item.created_at || ''
        ])
        break

      case 'numeros':
        headers = ['ID', 'Usuário ID', 'CPF', 'Número', 'Data de Criação']
        rows = data.map(item => [
          item.id || '',
          item.usuario_id || '',
          item.cpf || '',
          item.numero || '',
          item.created_at || ''
        ])
        break

      case 'chaves':
        headers = ['ID', 'Usuário ID', 'CPF', 'Chave de Acesso', 'Quantidade de Números', 'Enviado Por', 'Data']
        rows = data.map(item => [
          item.id || '',
          item.usuario_id || '',
          item.cpf || '',
          item.chave_acesso || '',
          item.quantidade_numeros || '',
          item.uploaded_by || '',
          item.created_at || ''
        ])
        break

      case 'notas':
        headers = ['ID', 'Usuário ID', 'CPF', 'Chave de Acesso', 'Quantidade de Números', 'Data']
        rows = data.map(item => [
          item.id || '',
          item.usuario_id || '',
          item.cpf || '',
          item.chave_acesso || '',
          item.quantidade_numeros || '',
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
        <p className="text-gray-400">Exporte dados do sistema em formato CSV</p>
      </div>

      {/* Seleção de Tipo */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <Filter size={24} className="text-[#04c8b0]" />
          <h3 className="text-white font-bold text-lg">Selecione o tipo de exportação</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {exportTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setExportType(type.id)}
              className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                exportType === type.id
                  ? 'bg-[#04c8b0] border-[#04c8b0] text-white'
                  : 'bg-gray-900 border-gray-700 text-white hover:border-[#04c8b0]'
              }`}
            >
              <FileSpreadsheet size={32} className="mx-auto mb-3" />
              <p className="font-bold text-center">{type.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Informações do Tipo Selecionado */}
      <div className="bg-blue-900/30 border-2 border-blue-500 rounded-xl p-6">
        <h3 className="text-blue-400 font-bold text-lg mb-3">Sobre esta exportação:</h3>
        
        {exportType === 'usuarios' && (
          <p className="text-gray-300">
            Exporta todos os usuários cadastrados no sistema com ID, Nome, CPF, Data de Nascimento e Data de Cadastro.
          </p>
        )}
        
        {exportType === 'numeros' && (
          <p className="text-gray-300">
            Exporta todos os números da sorte gerados com informações do usuário associado.
          </p>
        )}
        
        {exportType === 'chaves' && (
          <p className="text-gray-300">
            Exporta todas as chaves de acesso cadastradas com quantidade de números e responsável pelo upload.
          </p>
        )}
        
        {exportType === 'notas' && (
          <p className="text-gray-300">
            Exporta todas as notas fiscais (chaves de acesso) vinculadas aos participantes.
          </p>
        )}
      </div>

      {/* Botão de Exportar */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <button
          onClick={handleExport}
          disabled={loading}
          className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Exportando...</span>
            </>
          ) : (
            <>
              <Download size={20} />
              <span>Exportar {exportTypes.find(t => t.id === exportType)?.label}</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default ExportData
