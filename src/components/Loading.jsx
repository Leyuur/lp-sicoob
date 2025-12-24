import { useEffect, useState } from 'react'
let icone = './icone.png'

if(location.pathname.includes('/admin')) icone = '../icone.png'

function Loading({ onComplete }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => onComplete(), 300)
          return 100
        }
        return prev + 2
      })
    }, 30)

    return () => clearInterval(interval)
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-[#04c8b0] via-[#03a088] to-[#028570] flex items-center justify-center">
      {/* Background animated circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>

      <div className="relative z-10 text-center">
        {/* Logo container */}
        <div className="mb-8 relative">
          <div className="w-24 h-24 mx-auto flex items-center justify-center">
            <img 
              src={icone} 
              alt="Sicoob" 
              className="w-16 h-16 object-contain"
            />
          </div>
        </div>

        {/* Loading text */}
        <h2 className="text-white text-2xl sm:text-3xl font-bold mb-6 animate-pulse">
          Carregando...
        </h2>

        {/* Progress bar */}
        <div className="w-64 sm:w-80 mx-auto">
          <div className="h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
            <div 
              className="h-full bg-gradient-to-r from-yellow-300 via-yellow-200 to-yellow-300 rounded-full transition-all duration-300 ease-out shadow-lg shadow-yellow-300/50"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-white/80 text-sm mt-3 font-medium">{progress}%</p>
        </div>
      </div>
    </div>
  )
}

export default Loading
