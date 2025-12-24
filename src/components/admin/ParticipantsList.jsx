import { useState, useEffect } from 'react'
import { Search, User, Calendar, X, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'react-toastify'

function ParticipantsList({ adminName, onNumeroClick }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [allUsers, setAllUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [expandedUser, setExpandedUser] = useState(null)
  const [showingAll, setShowingAll] = useState(true)
  const [sortOrder, setSortOrder] = useState('desc') // 'asc' ou 'desc'

  // Função para formatar número no formato 000/00000
  const formatNumero = (numero) => {
    if (!numero) return ''
    const parts = numero.split('/')
    if (parts.length !== 2) return numero
    const parte1 = parts[0].padStart(3, '0')
    const parte2 = parts[1].padStart(5, '0')
    return `${parte1}/${parte2}`
  }

  // Máscara para CPF/CNPJ
  const formatCpfCnpj = (value) => {
    const numbers = value.replace(/\D/g, '')
    
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    } else {
      return numbers
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
    }
  }

  // Formatar tipo de sorteio para exibição
  const formatTipoSorteio = (tipo) => {
    const tipos = {
      'janeiro': 'Mensal - Janeiro',
      'fevereiro': 'Mensal - Fevereiro',
      'marco': 'Mensal - Março',
      'abril': 'Mensal - Abril',
      'maio': 'Mensal - Maio',
      'junho': 'Mensal - Junho',
      'julho': 'Mensal - Julho',
      'agosto': 'Mensal - Agosto',
      'setembro': 'Mensal - Setembro',
      'outubro': 'Mensal - Outubro',
      'novembro': 'Mensal - Novembro',
      'dezembro': 'Mensal - Dezembro',
      'trimestre_1': '1º Trimestre',
      'trimestre_2': '2º Trimestre',
      'trimestre_3': '3º Trimestre',
      'trimestre_4': '4º Trimestre',
      'semestral': 'Semestral',
      'anual': 'Anual'
    }
    return tipos[tipo] || tipo
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleSortChange = (order) => {
    setSortOrder(order)
    const sorted = [...filteredUsers].sort((a, b) => {
      if (order === 'asc') {
        return a.qtd_numeros - b.qtd_numeros
      } else {
        return b.qtd_numeros - a.qtd_numeros
      }
    })
    setFilteredUsers(sorted)
  }

  const loadAllUsers = async () => {
    setLoading(true)
    setShowingAll(true)
    setSelectedUser(null)
    
    try {
      const response = await fetch('/server/admin/getAllUsers.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await response.json()

      if (data.success) {
        setAllUsers(data.content)
        setFilteredUsers(data.content)
        toast.success(`${data.content.length} participantes carregados`, {
          position: "top-right",
          autoClose: 3000,
        })
      } else {
        toast.error(data.message || 'Erro ao carregar participantes', {
          position: "top-right",
          autoClose: 5000,
        })
      }
    } catch (error) {
      console.error('Erro ao buscar participantes:', error)
      toast.error('Erro ao carregar participantes', {
        position: "top-right",
        autoClose: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  // Carregar todos os usuários ao montar o componente
  useEffect(() => {
    loadAllUsers()
  }, [])

  const searchUser = async () => {
    if (!searchTerm || searchTerm.trim() === '') {
      // Se não há termo de busca, mostrar todos
      loadAllUsers()
      return
    }

    setLoading(true)
    setShowingAll(false)
    
    try {
      const response = await fetch('/server/admin/searchUser.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchTerm })
      })

      const data = await response.json()

      if (data.success) {
        if (data.content) {
          setSelectedUser(data.content)
          setExpandedUser(null)
          toast.success('Participante encontrado!', {
            position: "top-right",
            autoClose: 3000,
          })
        }
      } else {
        toast.error(data.message || 'Participante não encontrado', {
          position: "top-right",
          autoClose: 5000,
        })
        setSelectedUser(null)
        // Recarregar todos os usuários
        loadAllUsers()
      }
    } catch (error) {
      console.error('Erro ao buscar participante:', error)
      toast.error('Erro ao buscar participante', {
        position: "top-right",
        autoClose: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleExpand = (cpfValue) => {
    if (expandedUser === cpfValue) {
      setExpandedUser(null)
    } else {
      setExpandedUser(cpfValue)
      // Buscar detalhes do usuário se ainda não foram carregados
      if (!selectedUser || selectedUser.cpf !== cpfValue) {
        fetchUserDetails(cpfValue)
      }
    }
  }

  const fetchUserDetails = async (cpfValue) => {
    try {
      const response = await fetch('/server/admin/searchByCpf.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf: cpfValue })
      })

      const data = await response.json()
      if (data.success) {
        setSelectedUser(data.content)
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes:', error)
    }
  }

  const ParticipantCard = ({ user, isExpanded }) => {
    const isDetailedView = selectedUser && selectedUser.cpf === user.cpf

    return (
      <div 
        className="bg-gray-800 rounded-xl p-8 border border-gray-700 hover:border-[#04c8b0] transition-all duration-300 cursor-pointer"
        onClick={() => toggleExpand(user.cpf)}
      >
        <div className="flex items-start justify-between mb-6 gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="w-16 h-16 bg-gradient-to-br from-[#04c8b0] to-[#03a088] rounded-full flex items-center justify-center flex-shrink-0">
              <User size={28} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-bold text-xl mb-2 break-words leading-tight">{user.razao_social || 'Não informado'}</h3>
              <p className="text-gray-400 text-base font-mono mb-2">{formatCpfCnpj(user.cpf)}</p>
              <div className="inline-flex items-center gap-2 bg-[#04c8b0]/20 px-4 py-2 rounded-lg">
                <span className="text-[#04c8b0] text-lg font-bold">{user.qtd_numeros}</span>
                <span className="text-[#04c8b0] text-sm font-semibold">números da sorte</span>
              </div>
            </div>
          </div>
          
          <div className="text-[#04c8b0] flex-shrink-0">
            {isExpanded ? <ChevronUp size={28} /> : <ChevronDown size={28} />}
          </div>
        </div>

        {isExpanded && isDetailedView && (
          <div className="mt-6 pt-6 border-t border-gray-700 space-y-6">
            {/* Números da Sorte */}
            <div>
              <h4 className="text-[#04c8b0] font-bold text-base mb-4">Números da Sorte ({selectedUser.numeros?.length || 0})</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {selectedUser.numeros?.map((item, index) => (
                  <div 
                    key={index} 
                    className="bg-gray-900 rounded-lg px-4 py-4 border border-gray-700 hover:border-[#04c8b0] transition-all cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (onNumeroClick) {
                        onNumeroClick(formatNumero(item.numero))
                      }
                    }}
                  >
                    <div className="text-center">
                      <span className="text-white font-mono font-bold text-lg block mb-1">{formatNumero(item.numero)}</span>
                      <span className="text-gray-400 text-xs block">{formatTipoSorteio(item.tipo)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chaves de Acesso */}
            <div>
              <h4 className="text-[#04c8b0] font-bold text-base mb-4">Chaves de Acesso Cadastradas</h4>
              <div className="space-y-3">
                {selectedUser.historico?.map((chave, index) => (
                  <div key={index} className="bg-gray-900 rounded-lg p-5 border border-gray-700">
                    <div className="flex flex-col gap-3">
                      <div className="flex-1">
                        <p className="text-white font-mono text-sm break-all">{chave.chave_acesso}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <span className="text-gray-400">Qtd: <span className="text-[#04c8b0] font-bold">{chave.quantidade_numeros}</span></span>
                        <span className="text-gray-400">Por: <span className="text-white">{chave.uploaded_by}</span></span>
                        <span className="text-gray-400">{new Date(chave.created_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Título */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-2xl font-bold text-[#04c8b0] mb-2">Consulta de Participantes</h2>
        <p className="text-gray-400">Busque por CPF/CNPJ ou Nome, ou visualize todos os participantes</p>
      </div>

      {/* Busca */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Digite o CPF, CNPJ ou Nome"
              className="w-full px-5 py-4 rounded-xl bg-gray-900 text-white placeholder:text-gray-500 text-base font-medium outline-none border-2 border-gray-700 focus:border-[#04c8b0] transition-all duration-200"
            />
          </div>
          <button
            onClick={searchUser}
            disabled={loading}
            className="px-6 py-4 bg-gradient-to-r from-[#04c8b0] to-[#03a088] hover:from-[#03a088] hover:to-[#04c8b0] text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Search size={20} />
            <span>Buscar</span>
          </button>
          <button
            onClick={loadAllUsers}
            disabled={loading}
            className="px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <User size={20} />
            <span>Todos</span>
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="text-gray-400 mt-4">Carregando...</p>
        </div>
      )}

      {/* Resultado da busca individual */}
      {!loading && !showingAll && selectedUser && (
        <ParticipantCard user={{ cpf: selectedUser.cpf, qtd_numeros: selectedUser.numeros?.length || 0 }} isExpanded={true} />
      )}

      {/* Lista de todos os participantes */}
      {!loading && showingAll && filteredUsers.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="text-gray-400">
              <span className="text-[#04c8b0] font-bold">{filteredUsers.length}</span> participantes encontrados
            </div>
            <div className="flex items-center gap-2">
              <label className="text-gray-400 text-sm">Ordenar por quantidade:</label>
              <select
                value={sortOrder}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-[#04c8b0] focus:outline-none"
              >
                <option value="desc">Maior para Menor</option>
                <option value="asc">Menor para Maior</option>
              </select>
            </div>
          </div>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <ParticipantCard 
                key={user.id} 
                user={user}
                isExpanded={expandedUser === user.cpf}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ParticipantsList
