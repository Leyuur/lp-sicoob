import { useState, useEffect } from 'react'
import { Trophy, Calendar, User, Loader2, AlertCircle, Award } from 'lucide-react'
import { useScrollAnimation } from '../hooks/useScrollAnimation'

function Ganhadores() {
  const [ganhadores, setGanhadores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [headerRef, headerVisible] = useScrollAnimation({ threshold: 0.2 })
  const [contentRef, contentVisible] = useScrollAnimation({ threshold: 0.1 })

  useEffect(() => {
    fetchGanhadores()
  }, [])

  const fetchGanhadores = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/server/admin/getWinners.php')
      
      if (!response.ok) {
        throw new Error('Erro ao carregar ganhadores')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setGanhadores(data.winners || [])
      } else {
        setGanhadores([])
      }
    } catch (err) {
      console.error('Erro ao buscar ganhadores:', err)
      // Não seta erro, apenas deixa vazio para mostrar o empty state
      setGanhadores([])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('pt-BR')
    } catch {
      return dateString
    }
  }

  return (
    <section id="ganhadores" className="py-16 sm:py-20 lg:py-24 px-4 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div ref={headerRef} className={`text-center mb-12 sm:mb-16 scroll-animate ${headerVisible ? 'animate-in' : ''}`}>
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-[#d4a574] to-[#c4915e] rounded-2xl mb-4 sm:mb-5 shadow-xl hover:scale-110 hover:rotate-12 transition-all duration-300">
            <Trophy size={24} className="sm:w-7 sm:h-7 text-white" strokeWidth={2} />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0e5f5c] mb-3 sm:mb-4">
            Ganhadores
          </h2>
          <div className="w-24 h-1.5 bg-gradient-to-r from-[#d4a574] to-[#f0c987] mx-auto rounded-full mb-4"></div>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
            Confira os sortudos que já ganharam em nossa campanha
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div ref={contentRef} className={`flex flex-col items-center justify-center py-16 sm:py-20 scroll-animate-scale ${contentVisible ? 'animate-in' : ''}`}>
            <Loader2 className="text-[#0e5f5c] animate-spin mb-4" size={40} strokeWidth={2} />
            <p className="text-gray-600 font-medium text-sm sm:text-base">Carregando ganhadores...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div ref={contentRef} className={`bg-red-50 border-2 border-red-200 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center scroll-animate-scale ${contentVisible ? 'animate-in' : ''}`}>
            <AlertCircle className="text-red-500 mx-auto mb-4" size={40} />
            <h3 className="text-red-800 font-bold text-lg sm:text-xl mb-2">Erro ao carregar ganhadores</h3>
            <p className="text-red-600 mb-5 sm:mb-6 text-sm sm:text-base">{error}</p>
            <button
              onClick={fetchGanhadores}
              className="bg-red-500 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold hover:bg-red-600 transition-colors text-sm sm:text-base"
            >
              Tentar Novamente
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && ganhadores.length === 0 && (
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl sm:rounded-3xl p-8 sm:p-10 lg:p-12 text-center relative z-10">
            <p className="text-gray-700 text-lg sm:text-xl lg:text-2xl leading-relaxed font-medium">
              Os ganhadores da campanha serão divulgados aqui após a realização de cada sorteio.
              <br className="hidden sm:block" />
              <span className="text-[#0e5f5c] font-bold">Boa sorte a todos os participantes!</span> 🍀
            </p>
          </div>
        )}

        {/* Table */}
        {!loading && !error && ganhadores.length > 0 && (
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-[#04c8b0] to-[#03a088]">
                    <th className="px-4 lg:px-6 py-4 lg:py-5 text-left">
                      <div className="flex items-center gap-2 text-white font-bold text-xs lg:text-sm uppercase tracking-wide">
                        <User size={16} className="lg:w-[18px] lg:h-[18px]" />
                        Nome
                      </div>
                    </th>
                    <th className="px-4 lg:px-6 py-4 lg:py-5 text-left">
                      <div className="flex items-center gap-2 text-white font-bold text-xs lg:text-sm uppercase tracking-wide">
                        <Trophy size={16} className="lg:w-[18px] lg:h-[18px]" />
                        Número da Sorte
                      </div>
                    </th>
                    <th className="px-4 lg:px-6 py-4 lg:py-5 text-left">
                      <div className="flex items-center gap-2 text-white font-bold text-xs lg:text-sm uppercase tracking-wide">
                        <Award size={16} className="lg:w-[18px] lg:h-[18px]" />
                        Tipo de Sorteio
                      </div>
                    </th>
                    <th className="px-4 lg:px-6 py-4 lg:py-5 text-left">
                      <div className="flex items-center gap-2 text-white font-bold text-xs lg:text-sm uppercase tracking-wide">
                        <Calendar size={16} className="lg:w-[18px] lg:h-[18px]" />
                        Data do Sorteio
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ganhadores.map((ganhador, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-[#04c8b0]/5 hover:to-transparent transition-colors"
                    >
                      <td className="px-4 lg:px-6 py-4 lg:py-5">
                        <span className="text-gray-800 font-semibold text-sm lg:text-base">
                          {ganhador.nome || '-'}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 lg:py-5">
                        <span className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white font-bold px-3 lg:px-4 py-1.5 lg:py-2 rounded-xl shadow-md text-sm lg:text-base">
                          <Trophy size={14} className="lg:w-4 lg:h-4" />
                          {ganhador.numero_sorte || '-'}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 lg:py-5">
                        <div className="flex flex-col gap-1">
                          <span className="text-gray-800 font-semibold text-sm lg:text-base">
                            {ganhador.tipo_sorteio_formatado || '-'}
                          </span>
                          <span className="text-gray-600 text-xs lg:text-sm">
                            {ganhador.periodo_formatado} / {ganhador.periodo_ano}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 lg:py-5">
                        <span className="text-gray-700 font-medium text-sm lg:text-base">
                          {formatDate(ganhador.data_indicacao)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {ganhadores.map((ganhador, index) => (
                <div key={index} className="p-5 sm:p-6 hover:bg-gray-50 transition-colors">
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <div className="flex items-center gap-2 text-gray-500 text-xs sm:text-sm font-medium mb-1">
                        <User size={14} className="sm:w-4 sm:h-4" />
                        Nome
                      </div>
                      <div className="text-gray-800 font-semibold text-base sm:text-lg">
                        {ganhador.nome || '-'}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-gray-500 text-xs sm:text-sm font-medium mb-2">
                        <Trophy size={14} className="sm:w-4 sm:h-4" />
                        Número da Sorte
                      </div>
                      <span className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl shadow-md text-sm sm:text-base">
                        <Trophy size={14} className="sm:w-4 sm:h-4" />
                        {ganhador.numero_sorte || '-'}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-gray-500 text-xs sm:text-sm font-medium mb-1">
                        <Award size={14} className="sm:w-4 sm:h-4" />
                        Tipo de Sorteio
                      </div>
                      <div className="text-gray-800 font-semibold text-sm sm:text-base">
                        {ganhador.tipo_sorteio_formatado || '-'}
                      </div>
                      <div className="text-gray-600 text-xs sm:text-sm mt-1">
                        {ganhador.periodo_formatado} / {ganhador.periodo_ano}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-gray-500 text-xs sm:text-sm font-medium mb-1">
                        <Calendar size={14} className="sm:w-4 sm:h-4" />
                        Data do Sorteio
                      </div>
                      <div className="text-gray-700 font-medium text-sm sm:text-base">
                        {formatDate(ganhador.data_indicacao)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default Ganhadores
