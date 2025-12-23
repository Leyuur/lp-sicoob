import { Gift, Users, TrendingUp } from 'lucide-react'

function ComoParticipar() {
  const steps = [
    {
      icon: Users,
      title: "Passo 1",
      description: "Informações em breve",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: TrendingUp,
      title: "Passo 2",
      description: "Informações em breve",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Gift,
      title: "Passo 3",
      description: "Informações em breve",
      color: "from-pink-500 to-pink-600"
    }
  ];

  return (
    <section id="como-participar" className="py-16 sm:py-20 lg:py-24 px-4 bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-[#04c8b0] to-[#03a088] rounded-2xl mb-4 sm:mb-5 shadow-xl hover:scale-110 transition-transform duration-300">
            <Gift size={24} className="sm:w-7 sm:h-7 text-white" strokeWidth={2} />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#03694e] mb-3 sm:mb-4">
            Como Participar
          </h2>
          <div className="w-24 h-1.5 bg-gradient-to-r from-[#04c8b0] to-[#03a088] mx-auto rounded-full mb-4"></div>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
            Em breve, informações detalhadas sobre como participar da nossa campanha
          </p>
        </div>

        {/* Placeholder Content */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div 
                key={index}
                className="group bg-white rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-[#04c8b0] transform hover:-translate-y-3 relative overflow-hidden"
              >
                {/* Background decoration */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${step.color} opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity duration-500`}></div>
                
                <div className="relative">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mb-5 sm:mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}>
                    <Icon className="text-white" size={22} />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#03694e] mb-3 group-hover:text-[#04c8b0] transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                    {step.description}
                  </p>
                </div>

                {/* Step number watermark */}
                <div className="absolute bottom-4 right-4 text-7xl font-black text-gray-100 group-hover:text-[#04c8b0]/10 transition-colors duration-500">
                  {index + 1}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  )
}

export default ComoParticipar
