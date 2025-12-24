import { useState, useEffect } from 'react'
import { Award, User, Calendar, Hash, Trash2, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'react-toastify'

function PossibleWinners({ adminName }) {
  const [possibleWinners, setPossibleWinners] = useState([])
  const [loading, setLoading] = useState(false)
  const [showDisqualifyModal, setShowDisqualifyModal] = useState(false)
  const [selectedWinner, setSelectedWinner] = useState(null)
  const [disqualifyReason, setDisqualifyReason] = useState('')
  const [disqualifying, setDisqualifying] = useState(false)

  // Função para formatar número no formato 000/00000
  const formatNumero = (numero) => {
    if (!numero) return ''
    const parts = numero.split('/')
    if (parts.length !== 2) return numero
    const parte1 = parts[0].padStart(3, '0')
    const parte2 = parts[1].padStart(5, '0')
    return `${parte1}/${parte2}`
  }

  useEffect(() => {
    loadPossibleWinners()
  }, [])

  const loadPossibleWinners = async () => {
    setLoading(true)
    
    try {
      const response = await fetch('/server/admin/getPossibleWinners.php')
      const data = await response.json()

      if (data.success) {
        setPossibleWinners(data.content)
      } else {
        toast.error(data.message || 'Erro ao carregar possíveis contemplados', {
          position: "top-right",
          autoClose: 5000,
        })
      }
    } catch (error) {
      console.error('Erro ao buscar possíveis contemplados:', error)
      toast.error('Erro ao carregar dados', {
        position: "top-right",
        autoClose: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  const formatPeriodo = (tipo, periodo) => {
    if (tipo === 'mensal') {
      const meses = {
        'janeiro': 'Janeiro', 'fevereiro': 'Fevereiro', 'marco': 'Março',
        'abril': 'Abril', 'maio': 'Maio', 'junho': 'Junho',
        'julho': 'Julho', 'agosto': 'Agosto', 'setembro': 'Setembro',
        'outubro': 'Outubro', 'novembro': 'Novembro', 'dezembro': 'Dezembro'
      }
      return meses[periodo] || periodo
    } else {
      const periodicos = {
        'trimestre_1': '1º Trimestre', 'trimestre_2': '2º Trimestre',
        'trimestre_3': '3º Trimestre', 'trimestre_4': '4º Trimestre',
        'semestral': 'Semestral', 'anual': 'Anual'
      }
      return periodicos[periodo] || periodo
    }
  }

  const confirmWinner = async (id) => {
    if (!window.confirm('Tem certeza que deseja confirmar este contemplado? Ele aparecerá na página inicial.')) {
      return
    }

    try {
      const response = await fetch('/server/admin/markWinner.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          possibleWinnerId: id,
          premiadoPor: adminName
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message, {
          position: "top-right",
          autoClose: 3000,
        })
        loadPossibleWinners()
      } else {
        toast.error(data.message, {
          position: "top-right",
          autoClose: 5000,
        })
      }
    } catch (error) {
      console.error('Erro ao confirmar:', error)
      toast.error('Erro ao confirmar contemplado', {
        position: "top-right",
        autoClose: 5000,
      })
    }
  }

  const removePossibleWinner = async (id, numero) => {
    if (!window.confirm('Tem certeza que deseja remover este possível contemplado?')) {
      return
    }

    try {
      const response = await fetch('/server/admin/removePossibleWinner.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, numero })
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message, {
          position: "top-right",
          autoClose: 3000,
        })
        loadPossibleWinners()
      } else {
        toast.error(data.message, {
          position: "top-right",
          autoClose: 5000,
        })
      }
    } catch (error) {
      console.error('Erro ao remover:', error)
      toast.error('Erro ao remover possível contemplado', {
        position: "top-right",
        autoClose: 5000,
      })
    }
  }

  const openDisqualifyModal = (winner) => {
    setSelectedWinner(winner)
    setDisqualifyReason('')
    setShowDisqualifyModal(true)
  }

  const closeDisqualifyModal = () => {
    setShowDisqualifyModal(false)
    setSelectedWinner(null)
    setDisqualifyReason('')
  }

  const handleDisqualify = async () => {
    if (!disqualifyReason.trim()) {
      toast.error('Por favor, informe o motivo da desclassificação', {
        position: "top-right",
        autoClose: 5000,
      })
      return
    }

    setDisqualifying(true)

    try {
      const response = await fetch('/server/admin/disqualifyWinner.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          possibleWinnerId: selectedWinner.id,
          motivo: disqualifyReason,
          premiadoPor: adminName
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message, {
          position: "top-right",
          autoClose: 3000,
        })
        closeDisqualifyModal()
        loadPossibleWinners()
      } else {
        toast.error(data.message, {
          position: "top-right",
          autoClose: 5000,
        })
      }
    } catch (error) {
      console.error('Erro ao desclassificar:', error)
      toast.error('Erro ao desclassificar contemplado', {
        position: "top-right",
        autoClose: 5000,
      })
    } finally {
      setDisqualifying(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Título */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-2xl font-bold text-[#04c8b0] mb-2">Possíveis Contemplados</h2>
        <p className="text-gray-400">Gerencie os números marcados como possíveis contemplados</p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#04c8b0] mx-auto"></div>
          <p className="text-gray-400 mt-4">Carregando...</p>
        </div>
      )}

      {/* Lista de Possíveis Contemplados */}
      {!loading && possibleWinners.length > 0 && (
        <div className="space-y-4">
          <div className="text-gray-400 mb-4">
            <span className="text-[#04c8b0] font-bold">{possibleWinners.length}</span> possíveis contemplados
          </div>

          {possibleWinners.map((winner) => (
            <div key={winner.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Informações do Número */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Hash size={24} className="text-[#04c8b0]" />
                    <div>
                      <p className="text-gray-400 text-xs">Número da Sorte</p>
                      <p className="text-2xl font-mono font-bold text-white">{formatNumero(winner.numero)}</p>
                    </div>
                  </div>

                  <div className="bg-gray-900 rounded-lg p-4 space-y-3">
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Tipo de Sorteio</p>
                      <p className="text-white font-bold">
                        {formatPeriodo(winner.tipo_sorteio, winner.periodo_referencia)} {winner.periodo_ano}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Data do Sorteio</p>
                      <p className="text-white font-bold">
                        {new Date(winner.data_sorteio).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Informações do Participante */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User size={24} className="text-[#04c8b0]" />
                    <div>
                      <p className="text-gray-400 text-xs">Participante</p>
                      <p className="text-white font-bold">{winner.razao_social || 'Não informado'}</p>
                    </div>
                  </div>

                  <div className="bg-gray-900 rounded-lg p-4 space-y-3">
                    <div>
                      <p className="text-gray-400 text-xs mb-1">CPF/CNPJ</p>
                      <p className="text-white font-mono font-bold">{winner.cpf}</p>
                    </div>
                    
                    {winner.data_nascimento_abertura && (
                      <div>
                        <p className="text-gray-400 text-xs mb-1">Data Nascimento/Abertura</p>
                        <p className="text-white font-bold">
                          {new Date(winner.data_nascimento_abertura).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    )}

                    <div>
                      <p className="text-gray-400 text-xs mb-1">Indicado por</p>
                      <p className="text-white font-bold">{winner.indicado_por}</p>
                    </div>

                    <div>
                      <p className="text-gray-400 text-xs mb-1">Data da Indicação</p>
                      <p className="text-white font-bold">
                        {new Date(winner.data_indicacao).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-3 mt-6 pt-6 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => confirmWinner(winner.id)}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle size={20} />
                  <span>Confirmar Contemplado</span>
                </button>

                <button
                  type="button"
                  onClick={() => openDisqualifyModal(winner)}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <XCircle size={20} />
                  <span>Desclassificar</span>
                </button>

                <button
                  type="button"
                  onClick={() => removePossibleWinner(winner.id, winner.numero)}
                  className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 size={20} />
                  <span>Remover</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Desclassificação */}
      {showDisqualifyModal && selectedWinner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">Desclassificar Contemplado</h3>
            
            <div className="bg-gray-900 rounded-lg p-4 mb-4">
              <p className="text-gray-400 text-sm mb-1">Número da Sorte</p>
              <p className="text-white font-bold font-mono text-lg">{formatNumero(selectedWinner.numero)}</p>
              <p className="text-gray-400 text-sm mt-2 mb-1">Participante</p>
              <p className="text-white font-medium">{selectedWinner.razao_social}</p>
            </div>

            <div className="mb-6">
              <label className="block text-gray-300 font-semibold mb-2">
                Motivo da Desclassificação *
              </label>
              <textarea
                value={disqualifyReason}
                onChange={(e) => setDisqualifyReason(e.target.value)}
                placeholder="Descreva o motivo da desclassificação..."
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-yellow-500 focus:outline-none resize-none"
                rows="4"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDisqualify}
                disabled={disqualifying || !disqualifyReason.trim()}
                className="flex-1 px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {disqualifying ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Desclassificando...</span>
                  </>
                ) : (
                  <>
                    <XCircle size={20} />
                    <span>Confirmar Desclassificação</span>
                  </>
                )}
              </button>

              <button
                onClick={closeDisqualifyModal}
                disabled={disqualifying}
                className="px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition-all disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mensagem quando vazio */}
      {!loading && possibleWinners.length === 0 && (
        <div className="text-center py-12">
          <Award size={48} className="text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Nenhum possível contemplado no momento</p>
        </div>
      )}
    </div>
  )
}

export default PossibleWinners
