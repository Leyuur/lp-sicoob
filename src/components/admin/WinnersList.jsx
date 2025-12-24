import { useState, useEffect } from 'react'
import { Trophy, Trash2, AlertCircle, Calendar, User, Award, Loader2, RefreshCw, CheckCircle, XCircle, FileText } from 'lucide-react'
import { toast } from 'react-toastify'

function WinnersList() {
  const [winners, setWinners] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all') // 'all', 'contemplado', 'desclassificado'
  const [selectedDisqualification, setSelectedDisqualification] = useState(null)

  useEffect(() => {
    fetchWinners()
  }, [])

  const fetchWinners = async () => {
    try {
      setLoading(true)
      const response = await fetch('/server/admin/getAllWinners.php')
      const data = await response.json()

      if (data.success) {
        setWinners(data.winners || [])
      } else {
        toast.error('Erro ao carregar ganhadores')
      }
    } catch (error) {
      console.error('Erro ao buscar ganhadores:', error)
      toast.error('Erro ao carregar ganhadores')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveWinner = async (winnerId, numero) => {
    if (!confirm(`Tem certeza que deseja remover o ganhador com o número ${numero}?`)) {
      return
    }

    try {
      setDeletingId(winnerId)
      const response = await fetch('/server/admin/removeWinner.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ winnerId })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Ganhador removido com sucesso!')
        fetchWinners()
      } else {
        toast.error(data.message || 'Erro ao remover ganhador')
      }
    } catch (error) {
      console.error('Erro ao remover ganhador:', error)
      toast.error('Erro ao remover ganhador')
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('pt-BR')
    } catch {
      return dateString
    }
  }

  const formatNumero = (numero) => {
    if (!numero) return ''
    const parts = numero.split('/')
    if (parts.length !== 2) return numero
    const parte1 = parts[0].padStart(3, '0')
    const parte2 = parts[1].padStart(5, '0')
    return `${parte1}/${parte2}`
  }

  const filteredWinners = winners.filter(winner => {
    if (statusFilter === 'all') return true
    return winner.status === statusFilter
  })

  const contempladosCount = winners.filter(w => w.status === 'contemplado').length
  const desclassificadosCount = winners.filter(w => w.status === 'desclassificado').length

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="text-[#04c8b0] animate-spin mb-4" size={48} />
        <p className="text-gray-400 text-lg">Carregando ganhadores...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Ganhadores</h2>
          <p className="text-gray-400">Visualize e gerencie os ganhadores contemplados e desclassificados</p>
        </div>
        <button
          onClick={fetchWinners}
          className="flex items-center gap-2 px-4 py-2 bg-[#04c8b0] hover:bg-[#03a088] text-white rounded-lg font-medium transition-colors"
        >
          <RefreshCw size={18} />
          Atualizar
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 bg-gray-800 p-2 rounded-xl border border-gray-700">
        <button
          onClick={() => setStatusFilter('all')}
          className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
            statusFilter === 'all'
              ? 'bg-[#04c8b0] text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          Todos ({winners.length})
        </button>
        <button
          onClick={() => setStatusFilter('contemplado')}
          className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
            statusFilter === 'contemplado'
              ? 'bg-green-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          <CheckCircle size={18} />
          Contemplados ({contempladosCount})
        </button>
        <button
          onClick={() => setStatusFilter('desclassificado')}
          className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
            statusFilter === 'desclassificado'
              ? 'bg-yellow-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          <XCircle size={18} />
          Desclassificados ({desclassificadosCount})
        </button>
      </div>

      {/* Empty State */}
      {filteredWinners.length === 0 && !loading && (
        <div className="bg-gray-800 rounded-xl p-12 text-center border border-gray-700">
          <AlertCircle className="text-gray-500 mx-auto mb-4" size={48} />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">Nenhum ganhador encontrado</h3>
          <p className="text-gray-500">
            {statusFilter === 'all' && 'Os ganhadores confirmados aparecerão aqui'}
            {statusFilter === 'contemplado' && 'Nenhum ganhador contemplado no momento'}
            {statusFilter === 'desclassificado' && 'Nenhum ganhador desclassificado no momento'}
          </p>
        </div>
      )}

      {/* Winners List */}
      {filteredWinners.length > 0 && (
        <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <User size={16} />
                      Nome
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Trophy size={16} />
                      Número
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Award size={16} />
                      Tipo/Período
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      Data
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredWinners.map((winner) => (
                  <tr key={winner.id} className="hover:bg-gray-750 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-white font-medium">{winner.nome}</span>
                        <span className="text-gray-500 text-sm">{winner.participantCpf}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-bold px-3 py-1.5 rounded-lg text-sm">
                        <Trophy size={14} />
                        {winner.numero_sorte}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-white font-medium text-sm">
                          {winner.tipo_sorteio_formatado}
                        </span>
                        <span className="text-gray-400 text-xs">
                          {winner.periodo_formatado} / {winner.periodo_ano}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {winner.status === 'contemplado' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold">
                          <CheckCircle size={14} />
                          Contemplado
                        </span>
                      ) : (
                        <button
                          onClick={() => setSelectedDisqualification(winner)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-xs font-semibold transition-colors"
                        >
                          <XCircle size={14} />
                          Desclassificado
                          <FileText size={12} />
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {formatDate(winner.data_indicacao)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleRemoveWinner(winner.id, winner.numero_sorte)}
                        disabled={deletingId === winner.id}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingId === winner.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                        Remover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary */}
      {winners.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#04c8b0]/10 rounded-lg">
                <Trophy className="text-[#04c8b0]" size={24} />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total de Ganhadores</p>
                <p className="text-white text-2xl font-bold">{winners.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <CheckCircle className="text-green-500" size={24} />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Contemplados</p>
                <p className="text-white text-2xl font-bold">{contempladosCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-500/10 rounded-lg">
                <XCircle className="text-yellow-500" size={24} />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Desclassificados</p>
                <p className="text-white text-2xl font-bold">{desclassificadosCount}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Motivo de Desclassificação */}
      {selectedDisqualification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-lg w-full border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Motivo da Desclassificação</h3>
              <button
                onClick={() => setSelectedDisqualification(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="bg-gray-900 rounded-lg p-4 mb-4">
              <p className="text-gray-400 text-sm mb-1">Número da Sorte</p>
              <p className="text-white font-bold font-mono text-lg">{selectedDisqualification.numero}</p>
              <p className="text-gray-400 text-sm mt-3 mb-1">Participante</p>
              <p className="text-white font-medium">{selectedDisqualification.nome}</p>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <FileText className="text-yellow-500 flex-shrink-0 mt-1" size={20} />
                <div>
                  <p className="text-yellow-500 font-semibold mb-2">Motivo:</p>
                  <p className="text-gray-300 whitespace-pre-wrap">
                    {selectedDisqualification.motivo_desclassificacao || 'Não informado'}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedDisqualification(null)}
              className="w-full mt-4 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition-all"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default WinnersList
