import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, User, LogIn, Shield } from 'lucide-react'
import { toast } from 'react-toastify'
import { useScrollAnimation } from '../hooks/useScrollAnimation'

function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({ username: false, password: false })
  const navigate = useNavigate()

  // Verificar se já está logado
  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuth')
    if (adminAuth) {
      try {
        JSON.parse(adminAuth)
        navigate('/admin/panel')
      } catch (error) {
        localStorage.removeItem('adminAuth')
      }
    }
  }, [navigate])

  const handleLogin = async (e) => {
    e.preventDefault()
    
    // Reset errors
    setErrors({ username: false, password: false })
    
    // Validate fields
    const newErrors = {
      username: !username || username.trim() === '',
      password: !password || password.trim() === ''
    }
    
    if (newErrors.username || newErrors.password) {
      setErrors(newErrors)
      toast.error('Preencha todos os campos!', {
        position: "top-right",
        autoClose: 5000,
      })
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch('/server/auth/adminLogin.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      })

      const data = await response.json()

      if (data.success) {
        // Salvar dados do admin no localStorage
        localStorage.setItem('adminAuth', JSON.stringify(data.content))
        toast.success(`Bem-vindo, ${data.content.name}! 🎉`, {
          position: "top-right",
          autoClose: 3000,
        })
        navigate('/admin/panel')
      } else {
        toast.error(data.message || 'Credenciais inválidas', {
          position: "top-right",
          autoClose: 5000,
        })
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error)
      toast.error('Erro ao fazer login. Tente novamente.', {
        position: "top-right",
        autoClose: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  const [cardRef, cardVisible] = useScrollAnimation({ threshold: 0.2 })

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0e5f5c] via-[#117a76] to-[#0a4946] flex items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Card de Login */}
        <div ref={cardRef} className={`bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 backdrop-blur-sm scroll-animate-scale ${cardVisible ? 'animate-in' : ''}`}>
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#0e5f5c] to-[#117a76] rounded-2xl mb-4 shadow-lg hover:scale-110 transition-transform duration-300">
                <Shield size={32} className="text-white" strokeWidth={2} />
              </div>
              <h3 className="text-[#0e5f5c] font-bold text-2xl mb-2">
                Painel Administrativo
              </h3>
              <p className="text-gray-600 text-sm">
                Gestão da Promoção Sicoob
              </p>
            </div>
            
            {/* Campo Username */}
            <div className="relative group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Usuário
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value)
                  if (errors.username) setErrors(prev => ({ ...prev, username: false }))
                }}
                placeholder="Digite seu usuário"
                className={`w-full px-5 py-4 pr-12 rounded-xl bg-gray-50 text-gray-800 placeholder:text-gray-400 text-base font-medium outline-none border-2 transition-all duration-200 ${errors.username ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#0e5f5c] group-hover:border-gray-300'} focus:bg-white`}
              />
              <div className="absolute right-4 top-11 text-gray-400">
                <User size={20} />
              </div>
            </div>

            {/* Campo Password */}
            <div className="relative group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (errors.password) setErrors(prev => ({ ...prev, password: false }))
                }}
                placeholder="Digite sua senha"
                className={`w-full px-5 py-4 pr-12 rounded-xl bg-gray-50 text-gray-800 placeholder:text-gray-400 text-base font-medium outline-none border-2 transition-all duration-200 ${errors.password ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#0e5f5c] group-hover:border-gray-300'} focus:bg-white`}
              />
              <div className="absolute right-4 top-11 text-gray-400">
                <Lock size={20} />
              </div>
            </div>

            {/* Botão de Login */}
            <button
              type="submit"
              disabled={loading}
              className="relative w-full bg-gradient-to-r from-[#0e5f5c] to-[#117a76] hover:from-[#117a76] hover:to-[#0e5f5c] text-white font-bold py-4 px-6 rounded-xl uppercase tracking-wide transition-all duration-300 transform hover:scale-[1.02] active:scale-100 flex items-center justify-center gap-3 shadow-xl shadow-[#0e5f5c]/30 hover:shadow-2xl hover:shadow-[#0e5f5c]/40 overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white relative z-10"></div>
                  <span className="relative z-10">CARREGANDO...</span>
                </>
              ) : (
                <>
                  <LogIn size={20} className="relative z-10" />
                  <span className="relative z-10">Entrar no Painel</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-gray-500 text-xs text-center leading-relaxed">
              🔒 Acesso restrito apenas para administradores autorizados
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
