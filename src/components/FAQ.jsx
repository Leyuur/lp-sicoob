import { useState } from 'react'
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react'

const faqData = [
  {
    id: 1,
    pergunta: 'Como faço para participar da campanha?',
    resposta: 'Para participar da campanha, basta ser cliente Sicoob e realizar as ações promocionais descritas no regulamento. Cada ação qualificada gera números da sorte automaticamente.'
  },
  {
    id: 2,
    pergunta: 'Como consulto meus números da sorte?',
    resposta: 'Você pode consultar seus números da sorte através da seção "Consultar Números" nesta página. Basta informar seu CPF/CNPJ e data de nascimento/abertura da empresa para ter acesso aos seus números.'
  },
  {
    id: 3,
    pergunta: 'Quantos números da sorte posso acumular?',
    resposta: 'Não há limite para a quantidade de números da sorte que você pode acumular. Quanto mais você participar das ações promocionais, mais chances de ganhar você terá!'
  },
  {
    id: 4,
    pergunta: 'Quando serão realizados os sorteios?',
    resposta: 'As datas dos sorteios estão especificadas no regulamento da campanha. Fique atento ao nosso site e redes sociais para não perder nenhuma informação importante.'
  },
  {
    id: 5,
    pergunta: 'Como saberei se fui sorteado?',
    resposta: 'Os ganhadores serão contatados através dos dados cadastrados na cooperativa e também divulgados na seção "Ganhadores" deste site. Além disso, a lista oficial será publicada conforme descrito no regulamento.'
  },
  {
    id: 6,
    pergunta: 'Quais são os prêmios da campanha?',
    resposta: 'Os prêmios disponíveis estão detalhados no regulamento oficial da campanha. Acesse a seção "Regulamento" para conferir todos os prêmios e condições.'
  },
  {
    id: 7,
    pergunta: 'Posso transferir meus números da sorte para outra pessoa?',
    resposta: 'Não, os números da sorte são pessoais e intransferíveis. Eles estão vinculados ao CPF/CNPJ do participante que realizou as ações promocionais.'
  },
  {
    id: 8,
    pergunta: 'Até quando posso participar da campanha?',
    resposta: 'O período de participação está especificado no regulamento da campanha. Certifique-se de realizar suas ações dentro do prazo para garantir seus números da sorte.'
  }
]

function FAQ() {
  const [expandedId, setExpandedId] = useState(null)

  const toggleFaq = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <section id="faq" className="py-16 sm:py-20 lg:py-24 px-4 bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-[#04c8b0] to-[#03a088] rounded-2xl mb-4 sm:mb-5 shadow-xl hover:scale-110 hover:rotate-12 transition-all duration-300">
            <HelpCircle size={24} className="sm:w-7 sm:h-7 text-white" strokeWidth={2} />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#03694e] mb-3 sm:mb-4">
            Perguntas Frequentes
          </h2>
          <div className="w-24 h-1.5 bg-gradient-to-r from-[#04c8b0] to-[#03a088] mx-auto rounded-full mb-4"></div>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
            Tire suas dúvidas sobre a campanha
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-3 sm:space-y-4">
          {faqData.map((faq) => (
            <div
              key={faq.id}
              className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-[#04c8b0]/30"
            >
              {/* Question Button */}
              <button
                onClick={() => toggleFaq(faq.id)}
                className="w-full px-5 sm:px-6 md:px-8 py-5 sm:py-6 flex items-start justify-between gap-3 sm:gap-4 text-left hover:bg-gray-50 transition-all duration-300 group"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#03694e] group-hover:text-[#04c8b0] transition-colors leading-relaxed">
                    {faq.pergunta}
                  </h3>
                </div>
                <div className="flex-shrink-0 mt-0.5 sm:mt-1">
                  {expandedId === faq.id ? (
                    <ChevronUp 
                      className="text-[#04c8b0] transition-transform" 
                      size={22} 
                      strokeWidth={2.5}
                    />
                  ) : (
                    <ChevronDown 
                      className="text-gray-400 group-hover:text-[#04c8b0] transition-colors" 
                      size={22} 
                      strokeWidth={2.5}
                    />
                  )}
                </div>
              </button>

              {/* Answer */}
              <div
                className={`overflow-hidden transition-all duration-500 ${
                  expandedId === faq.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-5 sm:px-6 md:px-8 pb-5 sm:pb-6 pt-1 sm:pt-2">
                  <div className="border-l-4 border-[#04c8b0] pl-4 sm:pl-5 bg-gradient-to-r from-[#04c8b0]/5 to-transparent py-3 rounded-r-lg">
                    <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                      {faq.resposta}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FAQ
