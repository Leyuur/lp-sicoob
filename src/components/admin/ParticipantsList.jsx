import { useState } from 'react'
import { Search, User, Calendar, X, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'react-toastify'

function ParticipantsList({ adminName }) {
  const [cpf, setCpf] = useState('')
  const [loading, setLoading] = useState(false)
  const [allUsers, setAllUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [expandedUser, setExpandedUser] = useState(null)
  const [showingAll, setShowingAll] = useState(false)

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

  const handleCpfChange = (e) => {
    const formatted = formatCpfCnpj(e.target.value)
    setCpf(formatted)
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

  const searchByCpf = async () => {
    if (!cpf || cpf.trim() === '') {
      toast.error('Digite um CPF ou CNPJ', {
        position: "top-right",
        autoClose: 5000,
      })
      return
    }

    setLoading(true)
    setShowingAll(false)
    
    try {
      const response = await fetch('/server/admin/searchByCpf.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf })
      })

      const data = await response.json()

      if (data.success) {
        setSelectedUser(data.content)
        setExpandedUser(null)
        toast.success('Participante encontrado!', {
          position: "top-right",
          autoClose: 3000,
        })
      } else {
        toast.error(data.message || 'Participante não encontrado', {
          position: "top-right",
          autoClose: 5000,
        })
        setSelectedUser(null)
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
        className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-[#04c8b0] transition-all duration-300 cursor-pointer"
        onClick={() => toggleExpand(user.cpf)}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#04c8b0] to-[#03a088] rounded-full flex items-center justify-center">
              <User size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">{user.cpf}</h3>
              <p className="text-gray-400 text-sm">{user.qtd_numeros} números</p>
            </div>
          </div>
          
          <div className="text-[#04c8b0]">
            {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </div>
        </div>

        {isExpanded && isDetailedView && (
          <div className="mt-6 pt-6 border-t border-gray-700 space-y-6">
            {/* Números da Sorte */}
            <div>
              <h4 className="text-[#04c8b0] font-bold text-sm mb-3">Números da Sorte ({selectedUser.numeros?.length || 0})</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {selectedUser.numeros?.map((numero, index) => (
                  <div key={index} className="bg-gray-900 rounded-lg px-4 py-2 text-center border border-gray-700">
                    <span className="text-white font-mono font-bold">{numero}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chaves de Acesso */}
            <div>
              <h4 className="text-[#04c8b0] font-bold text-sm mb-3">Chaves de Acesso Cadastradas</h4>
              <div className="space-y-2">
                {selectedUser.historico?.map((chave, index) => (
                  <div key={index} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-white font-mono text-xs break-all">{chave.chave_acesso}</p>
                      </div>
                      <div className="flex items-center gap-4 text-xs">
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
        <p className="text-gray-400">Busque por CPF/CNPJ ou visualize todos os participantes</p>
      </div>

      {/* Busca por CPF */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={cpf}
              onChange={handleCpfChange}
              placeholder="Digite o CPF ou CNPJ"
              maxLength={18}
              className="w-full px-5 py-4 rounded-xl bg-gray-900 text-white placeholder:text-gray-500 text-base font-medium outline-none border-2 border-gray-700 focus:border-[#04c8b0] transition-all duration-200"
            />
          </div>
          <button
            onClick={searchByCpf}
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
          <div className="mb-4 text-gray-400">
            <span className="text-[#04c8b0] font-bold">{filteredUsers.length}</span> participantes encontrados
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
