import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, Home, Settings, HelpCircle, Trophy, FileText, Search, Sparkles } from 'lucide-react'
import logoSicoob from '../assets/img/logos/logo-sicoob.png'

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()

  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      const headerOffset = 80
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset
      const startPosition = window.pageYOffset
      const distance = offsetPosition - startPosition
      const duration = 800 // duração em ms
      let start = null

      const animation = (currentTime) => {
        if (start === null) start = currentTime
        const timeElapsed = currentTime - start
        const run = ease(timeElapsed, startPosition, distance, duration)
        window.scrollTo(0, run)
        if (timeElapsed < duration) requestAnimationFrame(animation)
      }

      const ease = (t, b, c, d) => {
        t /= d / 2
        if (t < 1) return c / 2 * t * t + b
        t--
        return -c / 2 * (t * (t - 2) - 1) + b
      }

      requestAnimationFrame(animation)
      setIsMenuOpen(false)
    }
  }

  return (
    <header className="bg-gradient-to-r from-[#03694e] via-[#028570] to-[#03694e] backdrop-blur-lg text-white sticky top-0 z-50 shadow-xl border-b border-white/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-5">
        <div className="flex items-center justify-between relative z-[51]">
          <div className="flex items-center gap-4">
            <img 
              src={logoSicoob} 
              alt="Sicoob" 
              className="h-10 lg:h-12 transition-transform duration-300 hover:scale-110 cursor-pointer drop-shadow-lg" 
              onClick={() => scrollToSection('inicio')}
            />
          </div>

          <nav className="hidden lg:flex items-center gap-8 xl:gap-10">
            <button onClick={() => scrollToSection('inicio')} className="flex items-center gap-2 transition-all duration-300 font-semibold text-sm xl:text-base relative group text-white/90 hover:text-white">
              <Home size={18} className="group-hover:scale-110 transition-transform" /> 
              <span>Início</span>
              <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-gradient-to-r from-[#04c8b0] to-yellow-300 transition-transform duration-300 scale-x-0 group-hover:scale-x-100 rounded-full"></span>
            </button>
            {/* <button onClick={() => scrollToSection('como-participar')} className="flex items-center gap-2 transition-all duration-300 font-semibold text-sm xl:text-base relative group text-white/90 hover:text-white">
              <Settings size={18} className="group-hover:scale-110 transition-transform" /> 
              <span>Como Participar</span>
              <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-gradient-to-r from-[#04c8b0] to-yellow-300 transition-transform duration-300 scale-x-0 group-hover:scale-x-100 rounded-full"></span>
            </button> */}
            <button onClick={() => scrollToSection('faq')} className="flex items-center gap-2 transition-all duration-300 font-semibold text-sm xl:text-base relative group text-white/90 hover:text-white">
              <HelpCircle size={18} className="group-hover:scale-110 transition-transform" /> 
              <span>FAQ</span>
              <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-gradient-to-r from-[#04c8b0] to-yellow-300 transition-transform duration-300 scale-x-0 group-hover:scale-x-100 rounded-full"></span>
            </button>
            <button onClick={() => scrollToSection('ganhadores')} className="flex items-center gap-2 transition-all duration-300 font-semibold text-sm xl:text-base relative group text-white/90 hover:text-white">
              <Trophy size={18} className="group-hover:scale-110 transition-transform" /> 
              <span>Ganhadores</span>
              <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-gradient-to-r from-[#04c8b0] to-yellow-300 transition-transform duration-300 scale-x-0 group-hover:scale-x-100 rounded-full"></span>
            </button>
            <button onClick={() => scrollToSection('regulamento')} className="flex items-center gap-2 transition-all duration-300 font-semibold text-sm xl:text-base relative group text-white/90 hover:text-white">
              <FileText size={18} className="group-hover:scale-110 transition-transform" /> 
              <span>Regulamento</span>
              <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-gradient-to-r from-[#04c8b0] to-yellow-300 transition-transform duration-300 scale-x-0 group-hover:scale-x-100 rounded-full"></span>
            </button>
            <div className="ml-2">
              <Link
                to="/consultar"
                className="flex items-center gap-2 px-5 xl:px-6 py-2.5 xl:py-3 rounded-xl transition-all duration-300 font-bold text-sm xl:text-base bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 hover:from-yellow-300 hover:via-yellow-200 hover:to-yellow-300 text-[#03694e] shadow-lg shadow-yellow-400/30 hover:shadow-xl hover:shadow-yellow-400/50 transform hover:scale-105 border-2 border-yellow-500/30"
              >
                <Sparkles size={18} className="animate-pulse" /> 
                <span className="hidden xl:inline">Consulte seus Números</span>
                <span className="xl:hidden">Consultar</span>
              </Link>
            </div>
          </nav>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden text-white p-2.5 hover:bg-white/20 rounded-xl transition-all duration-300 active:scale-95 backdrop-blur-sm border border-white/10"
            aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden fixed h-fit inset-0 top-[80px] bg-gradient-to-br from-[#03694e] via-[#028570] to-[#026a58] z-[100] animate-fadeIn overflow-y-auto">
            <nav className="flex flex-col p-4 sm:p-6 space-y-2 max-w-md mx-auto">
              <button onClick={() => scrollToSection('inicio')} className="text-left text-white bg-white/10 hover:bg-white/20 active:bg-white/15 backdrop-blur-sm transition-all duration-300 py-4 px-5 rounded-2xl flex items-center gap-3 font-semibold border border-white/10 hover:border-white/20 hover:scale-[1.02] active:scale-100">
                <div className="bg-gradient-to-br from-[#04c8b0] to-[#03a088] p-2.5 rounded-xl shadow-lg">
                  <Home size={18} />
                </div>
                <span>Início</span>
              </button>
              <button onClick={() => scrollToSection('como-participar')} className="text-left text-white bg-white/10 hover:bg-white/20 active:bg-white/15 backdrop-blur-sm transition-all duration-300 py-4 px-5 rounded-2xl flex items-center gap-3 font-semibold border border-white/10 hover:border-white/20 hover:scale-[1.02] active:scale-100">
                <div className="bg-gradient-to-br from-[#04c8b0] to-[#03a088] p-2.5 rounded-xl shadow-lg">
                  <Settings size={18} />
                </div>
                <span>Como Participar</span>
              </button>
              <button onClick={() => scrollToSection('faq')} className="text-left text-white bg-white/10 hover:bg-white/20 active:bg-white/15 backdrop-blur-sm transition-all duration-300 py-4 px-5 rounded-2xl flex items-center gap-3 font-semibold border border-white/10 hover:border-white/20 hover:scale-[1.02] active:scale-100">
                <div className="bg-gradient-to-br from-[#04c8b0] to-[#03a088] p-2.5 rounded-xl shadow-lg">
                  <HelpCircle size={18} />
                </div>
                <span>FAQ</span>
              </button>
              <button onClick={() => scrollToSection('ganhadores')} className="text-left text-white bg-white/10 hover:bg-white/20 active:bg-white/15 backdrop-blur-sm transition-all duration-300 py-4 px-5 rounded-2xl flex items-center gap-3 font-semibold border border-white/10 hover:border-white/20 hover:scale-[1.02] active:scale-100">
                <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-2.5 rounded-xl shadow-lg">
                  <Trophy size={18} />
                </div>
                <span>Ganhadores</span>
              </button>
              <button onClick={() => scrollToSection('regulamento')} className="text-left text-white bg-white/10 hover:bg-white/20 active:bg-white/15 backdrop-blur-sm transition-all duration-300 py-4 px-5 rounded-2xl flex items-center gap-3 font-semibold border border-white/10 hover:border-white/20 hover:scale-[1.02] active:scale-100">
                <div className="bg-gradient-to-br from-[#04c8b0] to-[#03a088] p-2.5 rounded-xl shadow-lg">
                  <FileText size={18} />
                </div>
                <span>Regulamento</span>
              </button>
              <Link
                to="/consultar"
                className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 text-[#03694e] px-6 py-4 rounded-2xl hover:from-yellow-300 hover:via-yellow-200 hover:to-yellow-300 transition-all duration-300 font-bold mt-4 flex items-center justify-center gap-2 shadow-2xl shadow-yellow-400/50 hover:scale-[1.02] active:scale-100 border-2 border-yellow-500/30"
              >
                <Sparkles size={20} strokeWidth={2.5} className="animate-pulse" /> 
                <span>Consulte seus Números</span>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
