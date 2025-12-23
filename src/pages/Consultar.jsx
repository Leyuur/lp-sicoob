import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import ConsultaNumeros from '../components/ConsultaNumeros'

function Consultar() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#04c8b0] via-[#03a088] to-[#028570]">
      {/* Botão Voltar */}
      <div className="absolute top-6 left-6 z-50">
        <Link
          to="/teste"
          className="flex items-center gap-2 bg-white/20 backdrop-blur-md text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold hover:bg-white/30 border-2 border-white/30 hover:border-white/50 transition-all duration-300 shadow-xl hover:scale-105"
        >
          <ArrowLeft size={20} />
          <span className="hidden sm:inline">Voltar</span>
        </Link>
      </div>

      <ConsultaNumeros />
    </div>
  )
}

export default Consultar
