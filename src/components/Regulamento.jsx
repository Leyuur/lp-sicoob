import { useState, useEffect } from 'react'
import { FileText, Download, Calendar, Gift } from 'lucide-react'
import { useScrollAnimation } from '../hooks/useScrollAnimation'

function Regulamento() {
  const [isMobile, setIsMobile] = useState(false)
  const [headerRef, headerVisible] = useScrollAnimation({ threshold: 0.2 })
  const [cardsRef, cardsVisible] = useScrollAnimation({ threshold: 0.1 })

  const regulamentos = [
    {
      id: 'mensais',
      title: 'Sorteios Mensais',
      description: 'Regulamento dos sorteios realizados mensalmente',
      icon: Calendar,
      pdfUrl: './regulamento/regulamento_sorteios_mensais.pdf',
      downloadName: 'regulamento-sorteios-mensais-sicoob.pdf',
      color: 'from-[#0e5f5c] to-[#117a76]',
      bgGradient: 'from-emerald-50 to-teal-50',
      borderColor: 'border-emerald-200'
    },
    {
      id: 'periodicos',
      title: 'Sorteios Periódicos',
      description: 'Regulamento dos sorteios periódicos especiais',
      icon: Gift,
      pdfUrl: './regulamento/regulamento_sorteios_periodicos.pdf',
      downloadName: 'regulamento-sorteios-periodicos-sicoob.pdf',
      color: 'from-[#d4a574] to-[#f0c987]',
      bgGradient: 'from-amber-50 to-yellow-50',
      borderColor: 'border-amber-200'
    }
  ]

  useEffect(() => {
    // Detecta se é mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleDownloadPdf = (pdfUrl, downloadName) => {
    const link = document.createElement('a')
    link.href = pdfUrl
    link.download = downloadName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <section id="regulamento" className="py-16 sm:py-20 lg:py-24 px-4 bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div ref={headerRef} className={`text-center mb-12 sm:mb-16 scroll-animate ${headerVisible ? 'animate-in' : ''}`}>
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-[#0e5f5c] to-[#117a76] rounded-2xl mb-4 sm:mb-5 shadow-xl hover:scale-110 hover:rotate-12 transition-all duration-300">
            <FileText size={24} className="sm:w-7 sm:h-7 text-white" strokeWidth={2} />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0e5f5c] mb-3 sm:mb-4">
            Regulamentos
          </h2>
          <div className="w-24 h-1.5 bg-gradient-to-r from-[#d4a574] to-[#f0c987] mx-auto rounded-full mb-4"></div>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
            Confira todas as regras e condições da campanha
          </p>
        </div>

        {/* Regulamentos Cards */}
        <div ref={cardsRef} className={`grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12 scroll-animate ${cardsVisible ? 'animate-in' : ''}`}>
          {regulamentos.map((reg, index) => {
            const Icon = reg.icon
            
            return (
              <div key={reg.id} className={`bg-gradient-to-br ${reg.bgGradient} rounded-2xl sm:rounded-3xl shadow-xl border-2 ${reg.borderColor} overflow-hidden transform hover:scale-[1.02] transition-all duration-300`}>
                <div className="p-6 sm:p-8">
                  <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${reg.color} rounded-2xl mb-4 shadow-lg`}>
                    <Icon size={24} className="sm:w-7 sm:h-7 text-white" strokeWidth={2} />
                  </div>
                  
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
                    {reg.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm sm:text-base mb-5 sm:mb-6">
                    {reg.description}
                  </p>

                  <button
                    onClick={() => handleDownloadPdf(reg.pdfUrl, reg.downloadName)}
                    className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r ${reg.color} text-white px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl font-bold text-sm sm:text-base shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-100 transition-all duration-300`}
                  >
                    <Download size={18} className="sm:w-5 sm:h-5" />
                    <span>Baixar Regulamento</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Info Card */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-4 sm:p-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <FileText className="text-white w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-blue-900 text-base sm:text-lg mb-1 sm:mb-2">
                Importante
              </h4>
              <p className="text-blue-800 leading-relaxed text-xs sm:text-sm">
                Leia atentamente os regulamentos antes de participar. Ao participar da campanha, você concorda com todos os termos e condições descritos nos regulamentos oficiais.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Regulamento
