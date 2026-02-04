import { useState } from 'react'
import { Search, Calendar, User, Sparkles } from 'lucide-react'
import { toast } from 'react-toastify'
import { useScrollAnimation } from '../hooks/useScrollAnimation'

function ConsultaNumeros() {
  const [cpfCnpj, setCpfCnpj] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')
  const [loading, setLoading] = useState(false)
  const [numeros, setNumeros] = useState([])
  const [userName, setUserName] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [errors, setErrors] = useState({ cpfCnpj: false, dataNascimento: false })
  const [cardRef, cardVisible] = useScrollAnimation({ threshold: 0.2 })
  const [filtroSelecionado, setFiltroSelecionado] = useState('todos')

  // Máscara para CPF/CNPJ
  const formatCpfCnpj = (value) => {
    const numbers = value.replace(/\D/g, '')

    if (numbers.length <= 11) {
      // CPF: 000.000.000-00
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    } else {
      // CNPJ: 00.000.000/0000-00
      return numbers
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
    }
  }

  // Máscara para Data
  const formatDate = (value) => {
    const numbers = value.replace(/\D/g, '')
    return numbers
      .replace(/(\d{2})(\d)/, '$1/$2')
      .replace(/(\d{2})(\d)/, '$1/$2')
      .replace(/(\d{4}).*/, '$1')
  }

  const handleCpfCnpjChange = (e) => {
    const formatted = formatCpfCnpj(e.target.value)
    setCpfCnpj(formatted)
  }

  const handleDateChange = (e) => {
    const formatted = formatDate(e.target.value)
    setDataNascimento(formatted)
  }

  const handleConsulta = async (e) => {
    e.preventDefault()

    // Reset errors
    setErrors({ cpfCnpj: false, dataNascimento: false })

    // Validate fields
    const newErrors = {
      cpfCnpj: !cpfCnpj || cpfCnpj.trim() === '',
      dataNascimento: !dataNascimento || dataNascimento.trim() === ''
    }

    if (newErrors.cpfCnpj || newErrors.dataNascimento) {
      setErrors(newErrors)
      toast.error('Preencha todos os campos!', {
        position: "top-right",
        autoClose: 5000,
      })
      return
    }
    setLoading(true)

    try {
      // Remover máscara do CPF/CNPJ antes de enviar
      const cpfCnpjSemMascara = cpfCnpj.replace(/\D/g, '')

      const response = await fetch('/server/auth/login.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cpf: cpfCnpjSemMascara,
          data_nascimento: dataNascimento
        })
      })

      const data = await response.json()

      if (data.success) {
        const name = data.user?.name || 'Participante'
        setUserName(name)
        setNumeros(data.numbers || [])
        setShowResults(true)
        toast.success(`Bem-vindo, ${name}! 👋`, {
          position: "top-right",
          autoClose: 3000,
        })
      } else {
        toast.error(data.message || 'Dados incorretos', {
          position: "top-right",
          autoClose: 5000,
        })
        setShowResults(false)
      }
    } catch (error) {
      console.error('Erro ao consultar números:', error)
      toast.error('Erro ao consultar números. Tente novamente.', {
        position: "top-right",
        autoClose: 5000,
      })
      setShowResults(false)
    } finally {
      setLoading(false)
    }
  }

  const handleNewSearch = () => {
    setShowResults(false)
    setCpfCnpj('')
    setDataNascimento('')
    setNumeros([])
    setUserName('')
    setErrors({ cpfCnpj: false, dataNascimento: false })
  }

  const getNumeroColor = (tipo) => {
    switch (tipo) {
      case 'geral':
        return 'from-[#0e5f5c] to-[#117a76]' // Verde-azulado
      case 'periodico':
        return 'from-[#d4a574] to-[#c4915e]' // Dourado
      case 'mensal':
        return 'from-[#0a4946] to-[#0e5f5c]' // Verde escuro
      default:
        return 'from-[#0e5f5c] to-[#117a76]'
    }
  }

  return (
    <div id="consultar-numeros" className="min-h-screen bg-gradient-to-br from-[#0e5f5c] via-[#117a76] to-[#0a4946] flex items-center justify-center px-4 py-16 sm:py-20 lg:py-24 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-[#d4a574] rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-[#d4a574] rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>

      <div className="w-full max-w-2xl relative z-10">
        {!showResults ? (
          /* Card de Consulta */
          <div ref={cardRef} className={`bg-white/95 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl border-2 border-white/50 scroll-animate-scale ${cardVisible ? 'animate-in' : ''}`}>
            <form onSubmit={handleConsulta} className="space-y-5">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#0e5f5c] to-[#117a76] rounded-2xl mb-4 shadow-2xl hover:scale-110 transition-transform duration-300">
                  <Search size={28} className="text-white" strokeWidth={2.5} />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#0e5f5c] mb-2">
                  Consultar Números
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-[#d4a574] to-[#f0c987] mx-auto rounded-full mb-3"></div>
                <p className="text-gray-600 text-sm sm:text-base max-w-md mx-auto">
                  Digite seus dados para visualizar seus números da sorte
                </p>
              </div>

              {/* Campo CPF/CNPJ */}
              <div className="relative group">
                <label className="block text-sm font-bold text-[#0e5f5c] mb-2 flex items-center gap-2">
                  <User size={16} />
                  CPF ou CNPJ
                </label>
                <input
                  type="text"
                  value={cpfCnpj}
                  onChange={(e) => {
                    handleCpfCnpjChange(e)
                    if (errors.cpfCnpj) setErrors(prev => ({ ...prev, cpfCnpj: false }))
                  }}
                  placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  inputMode="numeric"
                  maxLength={18}
                  className={`w-full px-4 py-3 rounded-xl bg-white text-gray-800 placeholder:text-gray-400 text-sm font-medium outline-none border-2 transition-all duration-200 ${errors.cpfCnpj ? 'border-red-500 focus:border-red-500 shadow-lg shadow-red-500/20' : 'border-gray-200 focus:border-[#0e5f5c] hover:border-gray-300 focus:shadow-xl focus:shadow-[#0e5f5c]/20'}`}
                />
              </div>

              {/* Campo Data */}
              <div className="relative group">
                <label className="block text-sm font-bold text-[#0e5f5c] mb-2 flex items-center gap-2">
                  <Calendar size={16} />
                  Data de Nascimento ou Abertura
                </label>
                <input
                  type="text"
                  value={dataNascimento}
                  onChange={(e) => {
                    handleDateChange(e)
                    if (errors.dataNascimento) setErrors(prev => ({ ...prev, dataNascimento: false }))
                  }}
                  placeholder="DD/MM/AAAA"
                  inputMode="numeric"
                  maxLength={10}
                  className={`w-full px-4 py-3 rounded-xl bg-white text-gray-800 placeholder:text-gray-400 text-sm font-medium outline-none border-2 transition-all duration-200 ${errors.dataNascimento ? 'border-red-500 focus:border-red-500 shadow-lg shadow-red-500/20' : 'border-gray-200 focus:border-[#0e5f5c] hover:border-gray-300 focus:shadow-xl focus:shadow-[#0e5f5c]/20'}`}
                />
              </div>

              {/* Botão de Consulta */}
              <button
                type="submit"
                disabled={loading}
                className="relative w-full bg-gradient-to-r from-[#0e5f5c] to-[#117a76] hover:from-[#117a76] hover:to-[#0e5f5c] text-white font-black py-3.5 px-6 rounded-xl uppercase tracking-wide transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-2xl shadow-[#0e5f5c]/40 hover:shadow-[#0e5f5c]/60 overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm sm:text-base"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#d4a574] to-[#f0c987] translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white relative z-10"></div>
                    <span className="relative z-10">Carregando...</span>
                  </>
                ) : (
                  <>
                    <Search size={18} className="relative z-10" />
                    <span className="relative z-10">Consultar Meus Números</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t-2 border-gray-200">
              <p className="text-gray-500 text-xs text-center leading-relaxed">
                🔒 Seus dados são protegidos e usados apenas para consulta
              </p>
            </div>
          </div>
        ) : (
          /* Card de Resultados */
          <div ref={cardRef} className={`bg-white/95 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl border-2 border-white/50 scroll-animate-scale ${cardVisible ? 'animate-in' : ''}`}>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#d4a574] to-[#c4915e] rounded-full mb-4 shadow-2xl animate-pulse">
                <Sparkles size={28} className="text-white" strokeWidth={2.5} />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0e5f5c] mb-2">
                Olá, {userName}!
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-[#d4a574] to-[#f0c987] mx-auto rounded-full mb-3"></div>
              <p className="text-gray-600 text-sm sm:text-base">
                Aqui estão seus números da sorte 🍀
              </p>
            </div>

            {/* Filtro de Período */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-[#0e5f5c] mb-2">Filtrar por Período:</label>
              <select
                value={filtroSelecionado}
                onChange={(e) => setFiltroSelecionado(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white text-gray-800 text-sm font-medium outline-none border-2 border-gray-200 focus:border-[#0e5f5c] hover:border-gray-300 focus:shadow-xl focus:shadow-[#0e5f5c]/20 transition-all duration-200 cursor-pointer"
              >
                <option value="todos">Todos os Números</option>
                <option value="periodico">Apenas Periódicos</option>
                <option value="mensal">Apenas Mensais</option>
                <option disabled className="text-gray-400">_______________</option>
                <option value="Janeiro">Janeiro</option>
                <option value="Fevereiro">Fevereiro</option>
                <option value="Março">Março</option>
                <option value="Abril">Abril</option>
                <option value="Maio">Maio</option>
                <option value="Junho">Junho</option>
                <option value="Julho">Julho</option>
                <option value="Agosto">Agosto</option>
                <option value="Setembro">Setembro</option>
                <option value="Outubro">Outubro</option>
                <option value="Novembro">Novembro</option>
                <option value="Dezembro">Dezembro</option>
                <option disabled className="text-gray-400">_______________</option>
                <option value="1° Trimestre">1° Trimestre</option>
                <option value="2° Trimestre">2° Trimestre</option>
                <option value="3° Trimestre">3° Trimestre</option>
                <option value="4° Trimestre">4° Trimestre</option>
                <option disabled className="text-gray-400">_______________</option>
                <option value="Semestral">Semestral</option>
                <option value="Anual">Anual</option>
              </select>
            </div>

            {/* Legenda */}
            <div className="my-5 flex flex-wrap justify-center gap-3 sm:gap-4">
              {numeros.filter(n => n.tipo === 'periodico' && (filtroSelecionado === 'todos' || filtroSelecionado === 'periodico' || n.periodo === filtroSelecionado)).length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gradient-to-br from-[#d4a574] to-[#c4915e] rounded"></div>
                  <span className="text-gray-600 text-sm font-medium">Periódicos ({numeros.filter(n => n.tipo === 'periodico' && (filtroSelecionado === 'todos' || filtroSelecionado === 'periodico' || n.periodo === filtroSelecionado)).length})</span>
                </div>
              )}
              {numeros.filter(n => n.tipo === 'mensal' && (filtroSelecionado === 'todos' || filtroSelecionado === 'mensal' || n.periodo === filtroSelecionado)).length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gradient-to-br from-[#0a4946] to-[#0e5f5c] rounded"></div>
                  <span className="text-gray-600 text-sm font-medium">Mensais ({numeros.filter(n => n.tipo === 'mensal' && (filtroSelecionado === 'todos' || filtroSelecionado === 'mensal' || n.periodo === filtroSelecionado)).length})</span>
                </div>
              )}
            </div>

            {/* Grid de Números */}
            {numeros.length > 0 ? (
              <div className="mb-6">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
                  {numeros
                    .filter(item => {
                      if (filtroSelecionado === 'todos') return true;
                      if (filtroSelecionado === 'periodico') return item.tipo === 'periodico';
                      if (filtroSelecionado === 'mensal') return item.tipo === 'mensal';
                      return item.periodo === filtroSelecionado;
                    })
                    .map((item, index) => (
                    <div
                      key={index}
                      className="relative group"
                    >
                      {/* Número */}
                      <div className={`bg-gradient-to-br ${getNumeroColor(item.tipo)} text-white font-black text-xs sm:text-sm py-3 sm:py-4 px-1 rounded-xl shadow-lg text-center hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col gap-1`}>
                        <span className="relative z-10 whitespace-nowrap">{item.numero}</span>
                        {item.periodo && (
                          <span className="relative z-10 text-[9px] sm:text-[10px] font-medium opacity-90 whitespace-nowrap">
                            {item.periodo}/{item.ano}
                          </span>
                        )}
                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-3 border-yellow-300 rounded-3xl p-8 mb-8 text-center">
                <p className="text-yellow-800 font-bold text-lg">
                  Você ainda não possui números da sorte
                </p>
                <p className="text-yellow-700 text-sm mt-2">
                  Participe da campanha para concorrer a prêmios incríveis!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ConsultaNumeros