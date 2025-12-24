import { useState } from 'react'
import { Search, Calendar, User, Sparkles } from 'lucide-react'
import { toast } from 'react-toastify'

function ConsultaNumeros() {
  const [cpfCnpj, setCpfCnpj] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')
  const [loading, setLoading] = useState(false)
  const [numeros, setNumeros] = useState([])
  const [userName, setUserName] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [errors, setErrors] = useState({ cpfCnpj: false, dataNascimento: false })

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

  return (
    <div id="consultar-numeros" className="min-h-screen bg-gradient-to-br from-[#04c8b0] via-[#03a088] to-[#028570] flex items-center justify-center px-4 py-16 sm:py-20 lg:py-24 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-20 left-10 w-48 sm:w-72 h-48 sm:h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-64 sm:w-96 h-64 sm:h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 sm:w-[600px] h-96 sm:h-[600px] bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>
      
      <div className="w-full max-w-2xl relative z-10">
        {!showResults ? (
          /* Card de Consulta */
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 backdrop-blur-sm">
            <form onSubmit={handleConsulta} className="space-y-5 sm:space-y-6">
              <div className="text-center mb-5 sm:mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-[#04c8b0] to-[#03a088] rounded-2xl mb-3 sm:mb-4 shadow-lg hover:scale-110 transition-transform duration-300">
                  <Search size={24} className="sm:w-7 sm:h-7 text-white" strokeWidth={2} />
                </div>
                <h3 className="text-[#03694e] font-bold text-xl sm:text-2xl mb-2">
                  Consulte seus números
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm">
                  Digite seus dados para acessar seus números da sorte
                </p>
              </div>
              
              {/* Campo CPF/CNPJ */}
              <div className="relative group">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  CPF ou CNPJ
                </label>
                <input
                  type="text"
                  value={cpfCnpj}
                  onChange={(e) => {
                    handleCpfCnpjChange(e)
                    if (errors.cpfCnpj) setErrors(prev => ({ ...prev, cpfCnpj: false }))
                  }}
                  placeholder="000.000.000-00"
                  inputMode="numeric"
                  maxLength={18}
                  className={`w-full px-4 sm:px-5 py-3 sm:py-4 pr-11 sm:pr-12 rounded-xl bg-gray-50 text-gray-800 placeholder:text-gray-400 text-sm sm:text-base font-medium outline-none border-2 transition-all duration-200 ${errors.cpfCnpj ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#04c8b0] group-hover:border-gray-300'} focus:bg-white`}
                />
                <div className="absolute right-3 sm:right-4 top-9 sm:top-11 text-gray-400">
                  <User size={18} className="sm:w-5 sm:h-5" />
                </div>
              </div>

              {/* Campo Data */}
              <div className="relative group">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Data de Nascimento ou Abertura da Empresa
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
                  className={`w-full px-4 sm:px-5 py-3 sm:py-4 pr-11 sm:pr-12 rounded-xl bg-gray-50 text-gray-800 placeholder:text-gray-400 text-sm sm:text-base font-medium outline-none border-2 transition-all duration-200 ${errors.dataNascimento ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#04c8b0] group-hover:border-gray-300'} focus:bg-white`}
                />
                <div className="absolute right-3 sm:right-4 top-9 sm:top-11 text-gray-400">
                  <Calendar size={18} className="sm:w-5 sm:h-5" />
                </div>
              </div>

              {/* Botão de Consulta */}
              <button
                type="submit"
                disabled={loading}
                className="relative w-full bg-gradient-to-r from-[#04c8b0] to-[#03a088] hover:from-[#03a088] hover:to-[#04c8b0] text-white font-bold py-3 sm:py-4 px-6 rounded-xl uppercase tracking-wide transition-all duration-300 transform hover:scale-[1.02] active:scale-100 flex items-center justify-center gap-2 sm:gap-3 shadow-xl shadow-[#04c8b0]/30 hover:shadow-2xl hover:shadow-[#04c8b0]/40 overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm sm:text-base"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white relative z-10"></div>
                    <span className="relative z-10">CARREGANDO...</span>
                  </>
                ) : (
                  <>
                    <Search size={18} className="sm:w-5 sm:h-5 relative z-10" />
                    <span className="relative z-10">Consultar Agora</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-gray-200">
              <p className="text-gray-500 text-[10px] sm:text-xs text-center leading-relaxed">
                *Consulte o regulamento para mais informações sobre a promoção
              </p>
            </div>
          </div>
        ) : (
          /* Card de Resultados */
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 backdrop-blur-sm">
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mb-3 sm:mb-4 shadow-lg animate-bounce-slow">
                <Sparkles size={24} className="sm:w-7 sm:h-7 text-white" strokeWidth={2} />
              </div>
              <h3 className="text-[#03694e] font-bold text-2xl sm:text-3xl mb-2">
                Olá, {userName}!
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Aqui estão seus números da sorte
              </p>
            </div>

            {/* Tabela de Números */}
            <div className="mb-5 sm:mb-6">
              {numeros.length > 0 ? (
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 sm:p-6 max-h-80 sm:max-h-96 overflow-y-auto">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                    {numeros.map((numero, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-br from-[#04c8b0] to-[#03a088] text-white font-bold text-base sm:text-xl py-3 sm:py-4 px-3 sm:px-4 rounded-xl shadow-lg text-center hover:scale-105 active:scale-100 transition-transform"
                      >
                        {numero}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-5 sm:p-6 text-center">
                  <p className="text-yellow-800 font-semibold text-sm sm:text-base">
                    Você ainda não possui números da sorte
                  </p>
                </div>
              )}
            </div>

            {/* Informações Adicionais */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-3 sm:p-4 mb-5 sm:mb-6">
              <p className="text-blue-800 text-xs sm:text-sm text-center">
                <strong>Total de números:</strong> {numeros.length}
              </p>
            </div>

            {/* Botão Nova Consulta */}
            <button
              onClick={handleNewSearch}
              className="w-full bg-gray-100 hover:bg-gray-200 active:bg-gray-150 text-gray-800 font-bold py-3 sm:py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-100 text-sm sm:text-base"
            >
              Nova Consulta
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ConsultaNumeros
