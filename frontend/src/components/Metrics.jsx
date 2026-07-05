import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { TrendingDown, TrendingUp, IndianRupee, BarChart3 } from 'lucide-react'

function useCounter(target, duration = 2000, start = false) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!start) return
    let startTime = null
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setValue(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, start])
  return value
}

function AnimatedCounter({ value, prefix = '', suffix = '', duration = 2000, started }) {
  const count = useCounter(value, duration, started)
  return <span>{prefix}{count.toLocaleString('en-IN')}{suffix}</span>
}

const metrics = [
  {
    icon: IndianRupee,
    color: 'text-sbi-green',
    bg: 'bg-sbi-green/10 border-sbi-green/20',
    label: 'Cost per AI Call',
    value: 9,
    display: '₹6–12',
    subtext: 'per automated call',
    counter: false,
  },
  {
    icon: TrendingDown,
    color: 'text-red-400',
    bg: 'bg-red-400/10 border-red-400/20',
    label: 'Cost per Human Agent',
    value: 100,
    display: '₹80–120',
    subtext: 'per human-handled call',
    counter: false,
  },
  {
    icon: TrendingUp,
    color: 'text-sbi-green',
    bg: 'bg-sbi-green/10 border-sbi-green/20',
    label: 'Savings per Call',
    value: 90,
    display: '~₹90',
    subtext: '85–95% cost reduction',
    counter: false,
  },
  {
    icon: BarChart3,
    color: 'text-purple-400',
    bg: 'bg-purple-400/10 border-purple-400/20',
    label: 'Monthly Savings (1M calls)',
    value: 825,
    display: null,
    prefix: '₹',
    suffix: ' Cr',
    subtext: '(₹8.25 Crore / month)',
    counter: true,
  },
]

const bars = [
  { label: 'Human Agent', value: 100, color: 'bg-red-400', display: '₹100' },
  { label: 'IVR System', value: 35, color: 'bg-yellow-400', display: '₹35' },
  { label: 'Chatbot', value: 20, color: 'bg-blue-400', display: '₹20' },
  { label: 'BankGuard AI', value: 9, color: 'bg-sbi-green', display: '₹9' },
]

export default function Metrics() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="metrics" className="py-24 relative" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-sbi-green/3 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 bg-sbi-green/10 border border-sbi-green/30 rounded-full px-4 py-1.5 mb-4">
            <span className="text-sbi-green text-sm font-semibold">ROI Calculator</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black mb-4">
            Massive Cost Savings <span className="text-gradient">at Scale</span>
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            SBI handles millions of calls monthly. BankGuard AI cuts cost per call by 85–95%.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Metric cards */}
          <div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {metrics.map((m, i) => (
                <motion.div
                  key={m.label}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`glass rounded-2xl p-5 border ${m.bg}`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${m.bg}`}>
                    <m.icon className={`w-5 h-5 ${m.color}`} />
                  </div>
                  <div className={`text-2xl font-black mb-1 ${m.color}`}>
                    {m.counter && inView ? (
                      <AnimatedCounter value={m.value} prefix={m.prefix} suffix={m.suffix} started={inView} />
                    ) : (
                      m.display
                    )}
                  </div>
                  <div className="text-white/60 text-xs font-semibold mb-0.5">{m.label}</div>
                  <div className="text-white/30 text-[11px]">{m.subtext}</div>
                </motion.div>
              ))}
            </div>

            {/* Annual savings highlight */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="glass rounded-2xl p-6 border border-sbi-green/30 glow-green"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white/50 text-sm mb-1">Annual Savings Potential</div>
                  <div className="text-4xl font-black text-sbi-green">
                    {inView ? <AnimatedCounter value={99} prefix="₹" suffix=" Crore" started={inView} duration={2500} /> : '₹99 Crore'}
                  </div>
                  <div className="text-white/30 text-xs mt-1">at 1 million calls/month</div>
                </div>
                <div className="text-right">
                  <div className="text-white/30 text-sm mb-1">ROI</div>
                  <div className="text-3xl font-black text-white">
                    {inView ? <AnimatedCounter value={2100} suffix="%" started={inView} duration={2000} /> : '2100%'}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right: Bar chart comparison */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass rounded-2xl p-6 border border-white/10"
          >
            <h3 className="font-bold text-white mb-1">Cost per Call Comparison</h3>
            <p className="text-white/40 text-sm mb-6">Average cost in Indian Rupees (₹)</p>

            <div className="space-y-5">
              {bars.map((bar, i) => (
                <motion.div
                  key={bar.label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12 }}
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span className={`text-sm font-semibold ${bar.label === 'BankGuard AI' ? 'text-sbi-green' : 'text-white/70'}`}>
                      {bar.label}
                      {bar.label === 'BankGuard AI' && <span className="ml-2 text-[10px] bg-sbi-green/20 text-sbi-green px-1.5 py-0.5 rounded-full">WINNER</span>}
                    </span>
                    <span className={`text-sm font-bold ${bar.label === 'BankGuard AI' ? 'text-sbi-green' : 'text-white/50'}`}>
                      {bar.display}
                    </span>
                  </div>
                  <div className="h-8 bg-white/5 rounded-lg overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${bar.value}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.12, duration: 0.8, ease: 'easeOut' }}
                      className={`h-full rounded-lg ${bar.color} flex items-center px-3`}
                    >
                      {bar.value > 25 && (
                        <span className="text-white text-xs font-bold">{bar.display}</span>
                      )}
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-white/5">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-lg font-black text-sbi-green">91%</div>
                  <div className="text-[11px] text-white/40">vs Human Agent</div>
                </div>
                <div>
                  <div className="text-lg font-black text-sbi-green">74%</div>
                  <div className="text-[11px] text-white/40">vs IVR System</div>
                </div>
                <div>
                  <div className="text-lg font-black text-sbi-green">55%</div>
                  <div className="text-[11px] text-white/40">vs Chatbot</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
