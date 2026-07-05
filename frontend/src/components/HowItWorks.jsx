import { motion } from 'framer-motion'
import { Phone, Brain, ShieldCheck, Zap, MessageCircle } from 'lucide-react'

const steps = [
  {
    icon: Phone,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10 border-blue-400/20',
    number: '01',
    title: 'Customer Calls',
    desc: 'Customer dials SBI emergency line. BankGuard AI answers instantly — zero hold time, any language, 24/7.',
  },
  {
    icon: Brain,
    color: 'text-purple-400',
    bg: 'bg-purple-400/10 border-purple-400/20',
    number: '02',
    title: 'AI Understands',
    desc: 'Sarvam AI transcribes the call in real time. Claude Sonnet 4.6 understands the issue, intent, and urgency.',
  },
  {
    icon: ShieldCheck,
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10 border-yellow-400/20',
    number: '03',
    title: 'Identity Verified',
    desc: 'Customer identity confirmed via account digits or OTP on registered mobile. Secure, instant, no branch visit needed.',
  },
  {
    icon: Zap,
    color: 'text-sbi-green',
    bg: 'bg-sbi-green/10 border-sbi-green/20',
    number: '04',
    title: 'Action Taken',
    desc: 'AI calls banking tools — blocks card, freezes account, raises dispute, initiates reversal. Done in seconds.',
  },
  {
    icon: MessageCircle,
    color: 'text-orange-400',
    bg: 'bg-orange-400/10 border-orange-400/20',
    number: '05',
    title: 'Confirmed via SMS',
    desc: 'Customer receives SMS with action taken, reference number, and next steps. Issue resolved, customer reassured.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-sbi-blue/5 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-sbi-blue/10 border border-sbi-blue/30 rounded-full px-4 py-1.5 mb-4">
            <span className="text-sbi-blue-light text-sm font-semibold">How It Works</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black mb-4">
            Five Steps to <span className="text-gradient">Resolution</span>
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            From distress call to confirmed resolution — the entire journey takes under 60 seconds.
          </p>
        </motion.div>

        {/* Steps — horizontal flow on desktop */}
        <div className="relative">
          {/* Connector line */}
          <div className="hidden lg:block absolute top-[72px] left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-blue-400/20 via-sbi-green/40 to-orange-400/20" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-4">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="relative"
              >
                {/* Connector dot */}
                <div className="hidden lg:flex justify-center mb-6">
                  <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${step.bg}`}>
                    <step.icon className={`w-5 h-5 ${step.color}`} />
                  </div>
                </div>

                <div className="glass rounded-2xl p-5 border border-white/10 hover:border-white/20 transition-all group">
                  {/* Mobile icon */}
                  <div className={`lg:hidden w-10 h-10 rounded-full border flex items-center justify-center mb-3 ${step.bg}`}>
                    <step.icon className={`w-5 h-5 ${step.color}`} />
                  </div>

                  <div className={`text-4xl font-black mb-2 ${step.color} opacity-30 group-hover:opacity-60 transition-opacity`}>
                    {step.number}
                  </div>
                  <h3 className="font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom stat */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-4 glass rounded-2xl px-8 py-4 border border-sbi-green/20">
            <div className="text-center">
              <div className="text-3xl font-black text-sbi-green">97.2%</div>
              <div className="text-white/40 text-xs">Resolution Rate</div>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-center">
              <div className="text-3xl font-black text-white">47s</div>
              <div className="text-white/40 text-xs">Avg. Resolution</div>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-center">
              <div className="text-3xl font-black text-sbi-green">0</div>
              <div className="text-white/40 text-xs">Hold Time</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
