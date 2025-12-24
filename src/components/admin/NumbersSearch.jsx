import { useState, useEffect } from 'react'
import { Search, User, Calendar, Hash, Key, Award, X } from 'lucide-react'
import { toast } from 'react-toastify'

function NumbersSearch({ adminName, initialNumero = '' }) {
  const [numero, setNumero] = useState(initialNumero)
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState(null)
  const [showMarkModal, setShowMarkModal] = useState(false)
  const [dataSorteio, setDataSorteio] = useState('')
  const [marking, setMarking] = useState(false)

  // Buscar automaticamente se initialNumero foi fornecido
  useEffect(() => {
    if (initialNumero) {
      setNumero(initialNumero)
      // Aguardar um momento para garantir que o estado foi atualizado
      setTimeout(() => {
        searchByNumber()
      }, 100)
    }
  }, [initialNumero])

  const handleNumeroChange = (e) => {
    // Permitir apenas números e barra
    const value = e.target.value.replace(/[^\d\/]/g, '')
    
    // Aplicar máscara 000/00000
    const numbers = value.replace(/\D/g, '')
    
    if (numbers.length === 0) {
      setNumero('')
    } else if (numbers.length <= 3) {
      setNumero(numbers)
    } else {
      setNumero(`${numbers.slice(0, 3)}/${numbers.slice(3, 8)}`)
    }
  }

  // Função para formatar número no formato 000/00000
  const formatNumero = (numero) => {
    if (!numero) return ''
    const numbers = numero.replace(/\D/g, '')
    if (numbers.length <= 3) {
      return numbers.padStart(3, '0')
    }
    const parte1 = numbers.slice(0, 3).padStart(3, '0')
    const parte2 = numbers.slice(3, 8).padStart(5, '0')
    return `${parte1}/${parte2}`
  }

  const searchByNumber = async () => {
    if (!numero || numero.trim() === '') {
      toast.error('Digite um número da sorte', {
        position: "top-right",
        autoClose: 5000,
      })
      return
    }

    // Formatar número para 000/00000 antes de enviar
    const numeroFormatado = formatNumero(numero)

    setLoading(true)
    
    try {
      const response = await fetch('/server/admin/searchByNumber.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numero: numeroFormatado })
      })

      const data = await response.json()

      if (data.success) {
        setResultado(data.content)
        toast.success('Número encontrado!', {
          position: "top-right",
          autoClose: 3000,
        })
      } else {
        toast.error(data.message || 'Número não encontrado', {
          position: "top-right",
          autoClose: 5000,
        })
        setResultado(null)
      }
    } catch (error) {
      console.error('Erro ao buscar número:', error)
      toast.error('Erro ao buscar número', {
        position: "top-right",
        autoClose: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchByNumber()
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

  const handleMarkAsPossibleWinner = () => {
    setShowMarkModal(true)
    setDataSorteio('')
  }

  const confirmMarkAsPossibleWinner = async () => {
    if (!dataSorteio) {
      toast.error('Data do sorteio é obrigatória', {
        position: "top-right",
        autoClose: 5000,
      })
      return
    }

    setMarking(true)

    try {
      const response = await fetch('/server/admin/markPossibleWinner.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numero: resultado.numero,
          dataSorteio: dataSorteio,
          indicadoPor: adminName
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message, {
          position: "top-right",
          autoClose: 3000,
        })
        setShowMarkModal(false)
        setDataSorteio('')
      } else {
        toast.error(data.message, {
          position: "top-right",
          autoClose: 5000,
        })
      }
    } catch (error) {
      console.error('Erro ao marcar:', error)
      toast.error('Erro ao marcar como possível contemplado', {
        position: "top-right",
        autoClose: 5000,
      })
    } finally {
      setMarking(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Título */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-2xl font-bold text-[#04c8b0] mb-2">Consulta de Números da Sorte</h2>
        <p className="text-gray-400">Busque um número e veja as informações do participante e chave de acesso</p>
      </div>

      {/* Busca por Número */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={numero}
              onChange={handleNumeroChange}
              onKeyPress={handleKeyPress}
              placeholder="Digite o número da sorte (ex: 001/12345)"
              maxLength={9}
              className="w-full px-5 py-4 rounded-xl bg-gray-900 text-white placeholder:text-gray-500 text-base font-medium outline-none border-2 border-gray-700 focus:border-[#04c8b0] transition-all duration-200"
            />
          </div>
          <button
            onClick={searchByNumber}
            disabled={loading}
            className="px-6 py-4 bg-gradient-to-r from-[#04c8b0] to-[#03a088] hover:from-[#03a088] hover:to-[#04c8b0] text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Search size={20} />
            <span>Buscar</span>
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#04c8b0] mx-auto"></div>
          <p className="text-gray-400 mt-4">Buscando...</p>
        </div>
      )}

      {/* Resultado da busca */}
      {!loading && resultado && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 space-y-6">
          {/* Número da Sorte */}
          <div className="bg-gradient-to-br from-[#04c8b0]/20 to-[#03a088]/20 rounded-xl p-6 border-2 border-[#04c8b0]">
            <div className="flex items-center gap-3 mb-2">
              <Hash size={24} className="text-[#04c8b0]" />
              <h3 className="text-xl font-bold text-white">Número da Sorte</h3>
            </div>
            <p className="text-4xl font-mono font-bold text-[#04c8b0] text-center py-4">{formatNumero(resultado.numero)}</p>
          </div>

          {/* Informações do Participante */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <User size={24} className="text-[#04c8b0]" />
              <h3 className="text-xl font-bold text-white">Informações do Participante</h3>
            </div>
            <div className="bg-gray-900 rounded-xl p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm mb-1">CPF/CNPJ</p>
                  <p className="text-white font-mono font-bold">{resultado.usuario.cpf}</p>
                </div>
                
                {resultado.usuario.razao_social && (
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Nome/Razão Social</p>
                    <p className="text-white font-bold">{resultado.usuario.razao_social}</p>
                  </div>
                )}

                {resultado.usuario.data_nascimento_abertura && (
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Data de Nascimento/Abertura</p>
                    <p className="text-white font-bold">
                      {new Date(resultado.usuario.data_nascimento_abertura).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-gray-400 text-sm mb-1">Total de Números</p>
                  <p className="text-[#04c8b0] font-bold text-2xl">{resultado.usuario.total_numeros}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Informação da Chave de Acesso */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Key size={24} className="text-[#04c8b0]" />
              <h3 className="text-xl font-bold text-white">Chave de Acesso que Gerou este Número</h3>
            </div>
            <div className="bg-gray-900 rounded-xl p-6 space-y-4">
              <div>
                <p className="text-gray-400 text-sm mb-2">Chave de Acesso</p>
                <p className="text-white font-mono text-sm break-all bg-gray-800 p-3 rounded-lg">
                  {resultado.chave.chave_acesso}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Quantidade de Números</p>
                  <p className="text-[#04c8b0] font-bold text-xl">{resultado.chave.quantidade_numeros}</p>
                </div>

                {resultado.chave.tipo_sorteio && (
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Tipo de Sorteio</p>
                    <p className="text-white font-bold capitalize">{resultado.chave.tipo_sorteio}</p>
                  </div>
                )}

                {resultado.chave.periodo_referencia && (
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Período</p>
                    <p className="text-white font-bold capitalize">
                      {resultado.chave.periodo_referencia.replace('_', ' ')} 
                      {resultado.chave.periodo_ano && ` / ${resultado.chave.periodo_ano}`}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-700">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Cadastrado por</p>
                  <p className="text-white font-bold">{resultado.chave.uploaded_by}</p>
                </div>

                <div>
                  <p className="text-gray-400 text-sm mb-1">Data de Cadastro</p>
                  <p className="text-white font-bold">
                    {new Date(resultado.chave.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Botão Marcar como Possível Contemplado */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleMarkAsPossibleWinner}
              className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Award size={20} />
              <span>Marcar como Possível Contemplado</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal de Confirmação */}
      {showMarkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Marcar como Possível Contemplado</h3>
              <button
                type="button"
                onClick={() => setShowMarkModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-900 rounded-lg p-4 space-y-2">
                <p className="text-gray-400 text-sm">Número da Sorte:</p>
                <p className="text-[#04c8b0] font-mono font-bold text-2xl">{resultado?.numero}</p>
                
                <p className="text-gray-400 text-sm mt-3">Tipo de Sorteio:</p>
                <p className="text-white font-bold">
                  {formatPeriodo(resultado?.tipo_sorteio, resultado?.periodo)} {resultado?.ano}
                </p>

                <p className="text-gray-400 text-sm mt-3">Participante:</p>
                <p className="text-white font-bold">{resultado?.usuario.razao_social || resultado?.usuario.cpf}</p>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-2">Data do Sorteio *</label>
                <input
                  type="date"
                  value={dataSorteio}
                  onChange={(e) => setDataSorteio(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg border border-gray-700 focus:border-[#04c8b0] focus:outline-none"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={confirmMarkAsPossibleWinner}
                  disabled={marking}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold rounded-lg transition-all disabled:opacity-50"
                >
                  {marking ? 'Marcando...' : 'Confirmar'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowMarkModal(false)}
                  className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mensagem quando não há resultado */}
      {!loading && resultado === null && numero === '' && (
        <div className="text-center py-12">
          <Hash size={48} className="text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Digite um número da sorte para pesquisar</p>
        </div>
      )}
    </div>
  )
}

export default NumbersSearch
