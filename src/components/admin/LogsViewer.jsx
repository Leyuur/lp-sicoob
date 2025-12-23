import { useState, useEffect } from 'react'
import { FileText, CheckCircle, AlertCircle, Clock, User, TrendingUp } from 'lucide-react'
import { toast } from 'react-toastify'

function LogsViewer() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all') // all, success, error

  useEffect(() => {
    loadLogs()
  }, [])

  const loadLogs = async () => {
    setLoading(true)
    
    try {
      const response = await fetch('/server/admin/getLogs.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const data = await response.json()

      if (data.success) {
        setLogs(data.content)
      } else {
        toast.error(data.message || 'Erro ao carregar logs', {
          position: "top-right",
          autoClose: 5000,
        })
      }
    } catch (error) {
      console.error('Erro ao carregar logs:', error)
      toast.error('Erro ao carregar logs', {
        position: "top-right",
        autoClose: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = logs.filter(log => {
    if (filter === 'all') return true
    return log.status === filter
  })

  const successCount = logs.filter(l => l.status === 'success').length
  const errorCount = logs.filter(l => l.status === 'error').length
  const totalNumbers = logs.reduce((acc, l) => acc + (l.numbersGenerated || 0), 0)
  const totalUsers = logs.reduce((acc, l) => acc + (l.usersAffected || 0), 0)

  return (
    <div className="space-y-6">
      {/* Título */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-2xl font-bold text-[#04c8b0] mb-2">Histórico de Uploads</h2>
        <p className="text-gray-400">Visualize todos os uploads realizados e seus resultados</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-xl p-6 border border-green-700">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle size={24} className="text-green-400" />
            <span className="text-green-200 text-sm font-medium">Sucessos</span>
          </div>
          <p className="text-white text-3xl font-bold">{successCount}</p>
        </div>

        <div className="bg-gradient-to-br from-red-900 to-red-800 rounded-xl p-6 border border-red-700">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle size={24} className="text-red-400" />
            <span className="text-red-200 text-sm font-medium">Erros</span>
          </div>
          <p className="text-white text-3xl font-bold">{errorCount}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-xl p-6 border border-blue-700">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp size={24} className="text-blue-400" />
            <span className="text-blue-200 text-sm font-medium">Números Gerados</span>
          </div>
          <p className="text-white text-3xl font-bold">{totalNumbers}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-xl p-6 border border-purple-700">
          <div className="flex items-center justify-between mb-2">
            <User size={24} className="text-purple-400" />
            <span className="text-purple-200 text-sm font-medium">Usuários Afetados</span>
          </div>
          <p className="text-white text-3xl font-bold">{totalUsers}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              filter === 'all'
                ? 'bg-[#04c8b0] text-white'
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
          >
            Todos ({logs.length})
          </button>
          <button
            onClick={() => setFilter('success')}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              filter === 'success'
                ? 'bg-green-500 text-white'
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
          >
            Sucessos ({successCount})
          </button>
          <button
            onClick={() => setFilter('error')}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              filter === 'error'
                ? 'bg-red-500 text-white'
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
          >
            Erros ({errorCount})
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#04c8b0] mx-auto"></div>
          <p className="text-gray-400 mt-4">Carregando logs...</p>
        </div>
      )}

      {/* Lista de Logs */}
      {!loading && filteredLogs.length > 0 && (
        <div className="space-y-4">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className={`rounded-xl p-6 border-2 ${
                log.status === 'success'
                  ? 'bg-green-900/20 border-green-500/50'
                  : 'bg-red-900/20 border-red-500/50'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Info Principal */}
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    log.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                  }`}>
                    {log.status === 'success' ? (
                      <CheckCircle size={24} className="text-white" />
                    ) : (
                      <AlertCircle size={24} className="text-white" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className={`font-bold text-lg ${
                        log.status === 'success' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {log.status === 'success' ? 'Upload Bem-sucedido' : 'Erro no Upload'}
                      </h3>
                      <span className="text-gray-400 text-sm flex items-center gap-1">
                        <Clock size={14} />
                        {new Date(log.createdAt).toLocaleString('pt-BR')}
                      </span>
                    </div>

                    <p className="text-gray-300 mb-3">{log.message}</p>

                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <User size={14} />
                      <span>Por: <span className="text-[#04c8b0] font-medium">{log.uploadedBy}</span></span>
                    </div>
                  </div>
                </div>

                {/* Estatísticas */}
                {log.status === 'success' && (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:w-auto">
                    <div className="bg-gray-800 rounded-lg p-3 text-center">
                      <p className="text-gray-400 text-xs mb-1">Linhas</p>
                      <p className="text-white font-bold text-lg">{log.totalLines}</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3 text-center">
                      <p className="text-gray-400 text-xs mb-1">Processadas</p>
                      <p className="text-white font-bold text-lg">{log.processedLines}</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3 text-center">
                      <p className="text-gray-400 text-xs mb-1">Números</p>
                      <p className="text-white font-bold text-lg">{log.numbersGenerated}</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3 text-center">
                      <p className="text-gray-400 text-xs mb-1">Usuários</p>
                      <p className="text-white font-bold text-lg">{log.usersAffected}</p>
                    </div>
                  </div>
                )}

                {log.status === 'error' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-800 rounded-lg p-3 text-center">
                      <p className="text-gray-400 text-xs mb-1">Total Linhas</p>
                      <p className="text-white font-bold text-lg">{log.totalLines}</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3 text-center">
                      <p className="text-gray-400 text-xs mb-1">Erros</p>
                      <p className="text-white font-bold text-lg">{log.errorCount}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Lista de Usuários Afetados */}
              {log.affectedUsers && log.affectedUsers.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <p className="text-gray-400 text-sm mb-2">CPFs Afetados:</p>
                  <div className="flex flex-wrap gap-2">
                    {log.affectedUsers.slice(0, 10).map((cpf, index) => (
                      <span
                        key={index}
                        className="bg-gray-800 text-gray-300 text-xs px-3 py-1 rounded-full font-mono"
                      >
                        {cpf}
                      </span>
                    ))}
                    {log.affectedUsers.length > 10 && (
                      <span className="text-gray-500 text-xs px-3 py-1">
                        +{log.affectedUsers.length - 10} mais
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Sem logs */}
      {!loading && filteredLogs.length === 0 && (
        <div className="bg-gray-800 rounded-xl p-12 border border-gray-700 text-center">
          <FileText size={48} className="text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Nenhum log encontrado</p>
        </div>
      )}
    </div>
  )
}

export default LogsViewer
