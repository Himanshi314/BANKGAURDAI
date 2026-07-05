import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import LiveDemo from './components/LiveDemo.jsx'
import LiveAgent from './components/LiveAgent.jsx'
import HowItWorks from './components/HowItWorks.jsx'
import UseCases from './components/UseCases.jsx'
import TechStack from './components/TechStack.jsx'
import Metrics from './components/Metrics.jsx'
import CallLog from './components/CallLog.jsx'
import Footer from './components/Footer.jsx'

export default function App() {
  return (
    <div className="min-h-screen bg-navy text-white">
      <Navbar />
      <main>
        <Hero />
        <LiveAgent />
        <LiveDemo />
        <HowItWorks />
        <UseCases />
        <TechStack />
        <Metrics />
        <CallLog />
      </main>
      <Footer />
    </div>
  )
}
