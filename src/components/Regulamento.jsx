import { useState, useEffect } from 'react'
import { FileText, Download, Eye, Smartphone } from 'lucide-react'
import { useScrollAnimation } from '../hooks/useScrollAnimation'

function Regulamento() {
  const [isMobile, setIsMobile] = useState(false)
  const [headerRef, headerVisible] = useScrollAnimation({ threshold: 0.2 })
  const [buttonsRef, buttonsVisible] = useScrollAnimation({ threshold: 0.2 })
  const [contentRef, contentVisible] = useScrollAnimation({ threshold: 0.1 })
  const pdfUrl = './regulamento/Regulamento.pdf' // Ajuste o caminho conforme necessário

  useEffect(() => {
    // Detecta se é mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleOpenPdf = () => {
    if (isMobile) {
      // No mobile, abre em nova aba
      window.open(pdfUrl, '_blank')
    }
  }

  const handleDownloadPdf = () => {
    const link = document.createElement('a')
    link.href = pdfUrl
    link.download = 'regulamento-campanha-sicoob.pdf'
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
            Regulamento
          </h2>
          <div className="w-24 h-1.5 bg-gradient-to-r from-[#d4a574] to-[#f0c987] mx-auto rounded-full mb-4"></div>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
            Confira todas as regras e condições da campanha
          </p>
        </div>

        {/* Action Buttons */}
        <div ref={buttonsRef} className={`flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-6 sm:mb-8 max-w-2xl mx-auto scroll-animate ${buttonsVisible ? 'animate-in' : ''}`}>
          {!isMobile && (
            <button
              onClick={handleDownloadPdf}
              className="flex items-center justify-center gap-2 bg-white text-[#0e5f5c] border-2 border-[#0e5f5c] px-5 sm:px-6 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base shadow-lg hover:bg-[#0e5f5c] hover:text-white transform hover:scale-105 active:scale-100 transition-all duration-300"
            >
              <Download size={18} className="sm:w-5 sm:h-5" />
              Baixar PDF
            </button>
          )}
        </div>

        {/* PDF Viewer Container */}
        <div ref={contentRef} className={`bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 overflow-hidden scroll-animate-scale ${contentVisible ? 'animate-in' : ''}`}>
          {isMobile ? (
            // Mobile: Card com instrução
            <div className="p-6 sm:p-8 md:p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#0e5f5c] to-[#117a76] rounded-3xl mb-5 sm:mb-6">
                <Smartphone size={28} className="sm:w-9 sm:h-9 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#0e5f5c] mb-3 sm:mb-4">
                Visualização em Dispositivo Móvel
              </h3>
              <p className="text-gray-600 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 leading-relaxed">
                Para melhor visualização no celular, clique no botão abaixo para abrir o regulamento em uma nova aba ou faça o download do PDF.
              </p>
              <div className="grid gap-3 sm:gap-4 max-w-md mx-auto">
                <button
                  onClick={handleOpenPdf}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#0e5f5c] to-[#117a76] text-white px-5 sm:px-6 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-100 transition-all duration-300"
                >
                  <Eye size={18} className="sm:w-5 sm:h-5" />
                  Abrir em Nova Aba
                </button>
                <button
                  onClick={handleDownloadPdf}
                  className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-5 sm:px-6 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base hover:bg-gray-200 transition-all duration-300"
                >
                  <Download size={18} className="sm:w-5 sm:h-5" />
                  Baixar PDF
                </button>
              </div>
            </div>
          ) : (
            // Desktop: Embedded PDF Viewer
            <div className="relative">
              <div className="aspect-[8.5/11] min-h-[600px] lg:min-h-[800px]">
                <iframe
                  src={pdfUrl}
                  className="w-full h-full"
                  title="Regulamento da Campanha"
                  style={{ border: 'none' }}
                >
                  {/* Fallback se iframe não funcionar */}
                  <div className="p-8 sm:p-12 text-center">
                    <FileText className="text-gray-400 mx-auto mb-4 w-12 h-12 sm:w-16 sm:h-16" />
                    <h3 className="text-lg sm:text-xl font-bold text-gray-700 mb-3 sm:mb-4">
                      Não foi possível visualizar o PDF
                    </h3>
                    <p className="text-gray-600 mb-5 sm:mb-6 text-sm sm:text-base">
                      Seu navegador não suporta visualização de PDF. Por favor, faça o download do arquivo.
                    </p>
                    <button
                      onClick={handleDownloadPdf}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0e5f5c] to-[#117a76] text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-100 transition-all duration-300"
                    >
                      <Download size={18} className="sm:w-5 sm:h-5" />
                      Baixar Regulamento
                    </button>
                  </div>
                </iframe>
              </div>
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="mt-6 sm:mt-8 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-4 sm:p-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <FileText className="text-white w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-blue-900 text-base sm:text-lg mb-1 sm:mb-2">
                Importante
              </h4>
              <p className="text-blue-800 leading-relaxed text-xs sm:text-sm">
                Leia atentamente o regulamento antes de participar. Ao participar da campanha, você concorda com todos os termos e condições descritos no regulamento oficial.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Regulamento
