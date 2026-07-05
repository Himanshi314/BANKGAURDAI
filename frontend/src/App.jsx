import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import LiveAgent from './components/LiveAgent.jsx'
import HowItWorks from './components/HowItWorks.jsx'
import UseCases from './components/UseCases.jsx'
import TechStack from './components/TechStack.jsx'
import Metrics from './components/Metrics.jsx'
import Footer from './components/Footer.jsx'

export default function App() {
  return (
    <div className="min-h-screen bg-navy text-white">
      <Navbar />
      <main>
        <Hero />
        <LiveAgent />
        <HowItWorks />
        <UseCases />
        <TechStack />
        <Metrics />
      </main>
      <Footer />
    </div>
  )
}
