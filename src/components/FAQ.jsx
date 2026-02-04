import { useState } from 'react'
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { useScrollAnimation } from '../hooks/useScrollAnimation'

const faqData = [
  {
    id: 1,
    pergunta: 'Quem pode participar da promoção?',
    resposta: 'Podem participar os cooperados do Sicoob Unique Br, pessoas físicas ou jurídicas, que realizarem integralizações de capital social durante o período da promoção, conforme as regras do regulamento. Pessoas físicas devem ser maiores de 18 anos e possuir CPF válido; Pessoas jurídicas devem possuir CNPJ ativo.'
  },
  {
    id: 2,
    pergunta: 'Qual período de participação da promoção?',
    resposta: 'A promoção acontece entre janeiro e dezembro de 2026, com diferentes períodos de participação, conforme cada sorteio (mensal, trimestral, semestral ou anual). Importante: somente as integralizações feitas dentro do período válido de cada sorteio são consideradas.'
  },
  {
    id: 3,
    pergunta: 'Onde a promoção é válida?',
    resposta: 'A promoção é válida em todo o território nacional, exclusivamente para a cooperativa Sicoob Unique Br (cód. 4620), e as integralizações devem ser feitas por meio do gerente de relacionamento.'
  },
  {
    id: 4,
    pergunta: 'É necessário comprar algum produto para participar?',
    resposta: 'Não. Para participar, o cooperado deve realizar integralizações de capital social, conforme os valores mínimos definidos no regulamento.'
  },
  {
    id: 5,
    pergunta: 'Como faço para participar da promoção?',
    resposta: 'É simples! Pessoa Física: A cada R$ 100,00 integralizados em capital social dentro do período válido do sorteio, você recebe 1 número da sorte. Pessoa Jurídica: A cada R$ 300,00 integralizados, você recebe 1 número da sorte. Os números da sorte são gerados automaticamente conforme o valor integralizado.'
  },
  {
    id: 6,
    pergunta: 'Os valores integralizados são cumulativos?',
    resposta: 'Sim, desde que estejam dentro do mesmo período de participação do sorteio. Valores que não atingirem o mínimo dentro de um período podem ser considerados para outras modalidades (como semestral ou anual), desde que ainda estejam dentro do período válido.'
  },
  {
    id: 7,
    pergunta: 'Posso participar de mais de um sorteio?',
    resposta: 'Sim. O cooperado pode participar de mais de uma modalidade (mensal, trimestral, semestral ou anual), desde que cumpra os critérios de cada período. Porém, cada participante só pode ser ganhador uma vez na modalidade mensal e uma vez por modalidade periódica.'
  },
  {
    id: 8,
    pergunta: 'Onde posso consultar meus números da sorte?',
    resposta: 'Os números da sorte podem ser consultados no site oficial da promoção: https://capitalpremiadouniquebr.com.br. Basta informar CPF ou CNPJ e data de nascimento ou fundação.'
  },
  {
    id: 9,
    pergunta: 'O que acontece se eu resgatar o capital integralizado antes do sorteio?',
    resposta: 'Se o cooperado resgatar os valores integralizados antes da entrega do prêmio, ele perde o direito de participar dos sorteios.'
  },
  {
    id: 10,
    pergunta: 'Quais são os prêmios da promoção?',
    resposta: 'A promoção conta com diferentes prêmios, conforme cada sorteio, incluindo, por exemplo: Pontos Coopera, Motocicletas e Carros. Os prêmios variam de acordo com a data da apuração. Todas as informações detalhadas estão descritas nos regulamentos oficiais da promoção.'
  },
  {
    id: 11,
    pergunta: 'O que são Pontos Coopera e como resgatar?',
    resposta: 'Os Pontos Coopera são créditos digitais utilizados como forma de premiação na modalidade mensal da promoção. Os pontos podem ser trocados por produtos Sicoob, viagens, eletrônicos, produtos de beleza, produtos para sua casa, entre outros. Os pontos ficam disponíveis na plataforma www.shopcoopera.com.br. Os Pontos Coopera possuem validade de 180 dias e não podem ser convertidos em dinheiro.'
  },
  {
    id: 12,
    pergunta: 'Como acontecem os sorteios?',
    resposta: 'Os sorteios são realizados com base nos resultados da Loteria Federal, seguindo critérios técnicos definidos no regulamento. Caso a Loteria Federal não realize extração na data prevista, será considerada a extração subsequente.'
  },
  {
    id: 13,
    pergunta: 'Como saberei se fui ganhador?',
    resposta: 'Os ganhadores serão divulgados no site: https://capitalpremiadouniquebr.com.br. Além disso, os ganhadores poderão ser comunicados por e-mail, telefone ou WhatsApp, em até 10 dias úteis após a apuração.'
  },
  {
    id: 14,
    pergunta: 'Como faço para receber meu prêmio?',
    resposta: 'Após o contato da promotora, o ganhador deverá enviar, dentro do prazo informado: Documento de identificação (RG e CPF) e Comprovante de endereço. A entrega do prêmio ocorre sem qualquer custo, no prazo máximo de 30 dias após a apuração, conforme a modalidade do prêmio.'
  },
  {
    id: 15,
    pergunta: 'Os prêmios podem ser trocados por dinheiro?',
    resposta: 'Não. A legislação brasileira não permite que prêmios de sorteios sejam convertidos em dinheiro.'
  },
  {
    id: 16,
    pergunta: 'E se eu não responder ou não enviar os documentos?',
    resposta: 'Se o ganhador não atender aos prazos ou não enviar a documentação solicitada, perderá o direito ao prêmio, que será repassado ao suplente, conforme o regulamento.'
  },
  {
    id: 17,
    pergunta: 'Meus dados pessoais estão protegidos?',
    resposta: 'Sim. Os dados são tratados exclusivamente para a realização da promoção, em conformidade com a Lei Geral de Proteção de Dados (LGPD).'
  },
  {
    id: 18,
    pergunta: 'Onde posso consultar os Regulamentos?',
    resposta: 'No site: https://capitalpremiadouniquebr.com.br'
  },
  {
    id: 19,
    pergunta: 'Como posso cancelar a minha participação?',
    resposta: 'A participação na promoção está vinculada à manutenção dos valores integralizados na Promoção Capital Premiado do Sicoob Unique Br. Para informações sobre cancelamento, entre em contato com seu gerente.'
  },
  {
    id: 20,
    pergunta: 'Tenho outras dúvidas sobre a promoção. O que devo fazer?',
    resposta: 'Você pode entrar em contato pelos canais oficiais: 0800 777 4620 ou 4620capitalpremiado@sicoob.com.br. Atendimento de segunda a sexta-feira, das 8h às 17h.'
  }
]

function FAQ() {
  const [expandedId, setExpandedId] = useState(null)
  const [headerRef, headerVisible] = useScrollAnimation({ threshold: 0.2 })
  const [listRef, listVisible] = useScrollAnimation({ threshold: 0.1 })

  const toggleFaq = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <section id="faq" className="py-16 sm:py-20 lg:py-24 px-4 bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div ref={headerRef} className={`text-center mb-12 sm:mb-16 scroll-animate ${headerVisible ? 'animate-in' : ''}`}>
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-[#0e5f5c] to-[#117a76] rounded-2xl mb-4 sm:mb-5 shadow-xl hover:scale-110 hover:rotate-12 transition-all duration-300">
            <HelpCircle size={24} className="sm:w-7 sm:h-7 text-white" strokeWidth={2} />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0e5f5c] mb-3 sm:mb-4">
            Perguntas Frequentes
          </h2>
          <div className="w-24 h-1.5 bg-gradient-to-r from-[#d4a574] to-[#f0c987] mx-auto rounded-full mb-4"></div>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
            Tire suas dúvidas sobre a campanha
          </p>
        </div>

        {/* FAQ Accordion */}
        <div ref={listRef} className={`space-y-3 sm:space-y-4 scroll-animate ${listVisible ? 'animate-in' : ''}`}>
          {faqData.map((faq, index) => (
            <div
              key={faq.id}
              className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-[#d4a574]/40"              style={{ transitionDelay: listVisible ? `${index * 0.1}s` : '0s' }}            >
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
