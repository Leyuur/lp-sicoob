function Footer() {

  return (
    <footer className="bg-gradient-to-br from-[#03694e] via-[#028570] to-[#03694e] text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-6 sm:pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4">
            <p className="text-white/70 text-xs sm:text-sm text-center md:text-left">
              &copy; {new Date().getFullYear()} Sicoob. Todos os direitos reservados.
            </p>
            <p className="text-white/70 text-xs sm:text-sm text-center md:text-right">
              Campanha promocional válida conforme regulamento
            </p>
          </div>
          
          {/* DRTechs Credit */}
          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-white/60 text-xs sm:text-sm flex items-center justify-center gap-2 hover:text-white/80 transition-colors duration-300">
              Desenvolvido por
              <span className="font-bold text-yellow-300 hover:text-yellow-200 transition-colors duration-300 cursor-default">
                DRTechs
              </span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
