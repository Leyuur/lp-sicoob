import bgDesktop from '../assets/img/banners/bg-desktop.png'
import bgMobile from '../assets/img/banners/bg-mobile.png'
import contentDesktop from '../assets/img/banners/content-desktop.png'
import contentMobile from '../assets/img/banners/content-mobile.png'
import { useEffect, useState } from 'react'

function Inicio({ loadingComplete = false }) {
  const [showAnimations, setShowAnimations] = useState(false)

  useEffect(() => {
    if (loadingComplete) {
      const timer = setTimeout(() => {
        setShowAnimations(true)
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [loadingComplete])

  return (
    <section id="inicio" className="relative w-full h-screen overflow-hidden">
      {/* Desktop Version */}
      <div className="hidden md:block relative w-full h-full">
        {/* Background fixo */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${bgDesktop})` }}
        />
        {/* Content em cima - contain */}
        <div 
          className={`absolute inset-0 bg-contain bg-center bg-no-repeat ${showAnimations ? 'scale-in' : 'opacity-0'}`}
          style={{ backgroundImage: `url(${contentDesktop})` }}
        />
      </div>
      
      {/* Mobile Version */}
      <div className="block md:hidden relative w-full h-full">
        {/* Background fixo */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${bgMobile})` }}
        />
        {/* Content em cima - contain */}
        <div 
          className={`absolute inset-0 bg-contain bg-center bg-no-repeat ${showAnimations ? 'scale-in' : 'opacity-0'}`}
          style={{ backgroundImage: `url(${contentMobile})` }}
        />
      </div>
    </section>
  )
}

export default Inicio
