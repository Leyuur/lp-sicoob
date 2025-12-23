import { Sparkles, ArrowDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { smoothScrollTo } from '../utils/smoothScroll'

function Inicio() {
  const scrollToNext = () => {
    smoothScrollTo('como-participar')
  }

  return (
    <section id="inicio" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#04c8b0] via-[#03a088] to-[#028570]">
      {/* Background Gradient */}
      <div className="absolute inset-0">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 md:w-96 md:h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 md:w-[500px] md:h-[500px] bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] md:w-[700px] md:h-[700px] bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        </div>
        
        {/* Geometric Patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-40 left-20 w-24 h-24 md:w-32 md:h-32 border-4 border-white rotate-45 animate-spin-slow"></div>
          <div className="absolute bottom-40 right-32 w-20 h-20 md:w-24 md:h-24 border-4 border-white rounded-full animate-bounce-slow"></div>
          <div className="absolute top-1/3 right-20 w-32 h-32 md:w-40 md:h-40 border-4 border-white rotate-12 animate-pulse"></div>
          <div className="absolute bottom-1/3 left-32 w-28 h-28 border-4 border-yellow-300 rounded-full animate-float"></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 max-w-5xl mx-auto py-20">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 sm:px-6 py-2.5 sm:py-3 rounded-full mb-6 sm:mb-8 border border-white/30 shadow-xl hover:bg-white/30 transition-all duration-300 hover:scale-105">
          <Sparkles className="text-yellow-300 animate-pulse" size={18} />
          <span className="text-white font-semibold text-xs sm:text-sm tracking-wide">Campanha de Prêmios 2025</span>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white mb-4 sm:mb-6 leading-tight tracking-tight animate-fadeIn">
          Bem-vindo à
          <br />
          <span className="bg-gradient-to-r from-yellow-300 via-yellow-200 to-yellow-300 text-transparent bg-clip-text animate-shimmer inline-block bg-[length:200%_auto]">
            Campanha Sicoob
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl md:text-2xl text-white/95 mb-8 sm:mb-12 max-w-2xl mx-auto font-medium leading-relaxed animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          Participe e concorra a prêmios incríveis! 
          <br />
          Sua sorte começa aqui.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 sm:mb-16 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
          <Link
            to="/consultar"
            className="group bg-white text-[#03694e] px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg shadow-2xl hover:shadow-3xl transform hover:scale-105 active:scale-100 transition-all duration-300 hover:bg-gradient-to-r hover:from-yellow-300 hover:to-yellow-400 flex items-center gap-2 w-full sm:w-auto justify-center border-2 border-transparent hover:border-yellow-500"
          >
            <span>Consultar Números</span>
            <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
          </Link>
          <button 
            onClick={() => smoothScrollTo('regulamento')}
            className="bg-white/10 backdrop-blur-md text-white border-2 border-white/40 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg hover:bg-white/20 hover:border-white/60 transform hover:scale-105 active:scale-100 transition-all duration-300 shadow-xl w-full sm:w-auto"
          >
            Ver Regulamento
          </button>
        </div>

        {/* Scroll Indicator */}
        <button 
          onClick={scrollToNext}
          className="animate-bounce text-white/80 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 rounded-full p-2"
          aria-label="Rolar para baixo"
        >
          <ArrowDown size={28} strokeWidth={2.5} />
        </button>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg 
          viewBox="0 0 1440 120" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
        >
          <path 
            d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" 
            fill="white"
            fillOpacity="0.1"
          />
        </svg>
      </div>
    </section>
  )
}

export default Inicio
