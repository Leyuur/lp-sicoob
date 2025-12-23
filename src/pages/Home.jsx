import Header from '../components/Header'
import Inicio from '../components/Inicio'
import ComoParticipar from '../components/ComoParticipar'
import FAQ from '../components/FAQ'
import Ganhadores from '../components/Ganhadores'
import Regulamento from '../components/Regulamento'
import Footer from '../components/Footer'

function Home() {
  return (
    <>
      <Header />
      <main>
        <Inicio />
        {/* <ComoParticipar /> */}
        <FAQ />
        <Ganhadores />
        <Regulamento />
      </main>
      <Footer />
    </>
  )
}

export default Home
