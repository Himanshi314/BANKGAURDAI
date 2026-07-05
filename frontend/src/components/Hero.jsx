import { motion } from 'framer-motion'
import { PhoneCall, ArrowRight, PlayCircle, Shield, Users, Clock, Globe } from 'lucide-react'

const stats = [
  { icon: Users, value: '500M+', label: 'Customers Protected' },
  { icon: Clock, value: '< 60s', label: 'Resolution Time' },
  { icon: Globe, value: '20+', label: 'Indian Languages' },
  { icon: Shield, value: '24/7', label: 'Always Available' },
]

function VoiceWave({ active = true }) {
  return (
    <div className="voice-wave flex items-center gap-1 h-6">
      {[4, 12, 20, 16, 8, 20, 12, 6, 18, 10].map((h, i) => (
        <span
          key={i}
          style={{
            height: active ? `${h}px` : '4px',
            animationDelay: `${i * 0.08}s`,
            transition: 'height 0.3s ease',
          }}
        />
      ))}
    </div>
  )
}

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center pt-16 overflow-hidden grid-bg">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-sbi-green/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-sbi-blue/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-sbi-green/10 border border-sbi-green/30 rounded-full px-4 py-1.5 mb-6"
            >
              <span className="w-2 h-2 bg-sbi-green rounded-full animate-pulse" />
              <span className="text-sbi-green text-sm font-semibold">SBI Hackathon 2026 — Live Demo Ready</span>
            </motion.div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] mb-6">
              Banking Emergency?{' '}
              <span className="text-gradient">Just Call.</span>
            </h1>

            <p className="text-lg sm:text-xl text-white/60 leading-relaxed mb-8 max-w-xl">
              BankGuard AI resolves any SBI banking crisis in under 60 seconds —
              no hold music, no menus, no waiting. Just speak, and it's done.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 mb-12">
              <a
                href="#live"
                className="flex items-center gap-2 bg-sbi-green hover:bg-sbi-green-dark text-white font-bold px-7 py-3.5 rounded-full transition-all duration-200 glow-green text-base group"
              >
                Try Live Demo
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#how-it-works"
                className="flex items-center gap-2 border border-white/20 hover:border-white/40 text-white font-semibold px-7 py-3.5 rounded-full transition-all duration-200 text-base group"
              >
                <PlayCircle className="w-5 h-5 text-sbi-green" />
                Watch It Work
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {stats.map(({ icon: Icon, value, label }) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="glass rounded-xl p-4 text-center"
                >
                  <Icon className="w-5 h-5 text-sbi-green mx-auto mb-1" />
                  <div className="text-xl font-black text-white">{value}</div>
                  <div className="text-xs text-white/50 mt-0.5">{label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Phone illustration */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            className="flex justify-center lg:justify-end"
          >
            <div className="relative">
              {/* Outer pulse rings */}
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="absolute inset-0 rounded-full border border-sbi-green/20"
                  style={{
                    transform: `scale(${1 + i * 0.3})`,
                    animation: `pulse-ring ${1.5 + i * 0.5}s ease-out infinite`,
                    animationDelay: `${i * 0.4}s`,
                  }}
                />
              ))}

              {/* Phone card */}
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="relative w-72 glass rounded-3xl p-6 border border-sbi-green/20"
                style={{ boxShadow: '0 0 60px rgba(34, 197, 94, 0.15)' }}
              >
                {/* Call status bar */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-sbi-green rounded-full animate-pulse" />
                    <span className="text-sbi-green text-sm font-bold">LIVE CALL</span>
                  </div>
                  <span className="text-white/40 text-xs font-mono">00:32</span>
                </div>

                {/* Phone icon */}
                <div className="flex justify-center mb-4">
                  <div className="relative w-20 h-20 bg-sbi-green/10 rounded-full flex items-center justify-center border border-sbi-green/30">
                    <PhoneCall className="w-9 h-9 text-sbi-green" />
                    <div className="absolute inset-0 rounded-full border border-sbi-green/40 animate-ping" style={{ animationDuration: '2s' }} />
                  </div>
                </div>

                <div className="text-center mb-4">
                  <div className="font-bold text-white">BankGuard AI</div>
                  <div className="text-white/50 text-sm">SBI Emergency Line</div>
                </div>

                {/* Voice wave */}
                <div className="flex justify-center mb-4">
                  <VoiceWave />
                </div>

                {/* Current action */}
                <div className="bg-sbi-green/10 rounded-xl p-3 border border-sbi-green/20">
                  <div className="text-xs text-white/50 mb-1">AI Action</div>
                  <div className="text-sbi-green text-sm font-semibold flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-sbi-green rounded-full animate-pulse" />
                    Blocking debit card...
                  </div>
                </div>

                {/* Tool indicators */}
                <div className="mt-3 flex gap-2 flex-wrap">
                  {['Verified', 'Card Blocked', 'SMS Sent'].map((step, i) => (
                    <span key={i} className="text-[10px] bg-sbi-green/20 text-sbi-green px-2 py-0.5 rounded-full border border-sbi-green/30">
                      ✓ {step}
                    </span>
                  ))}
                </div>
              </motion.div>

              {/* Floating label */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute -bottom-6 -right-4 glass rounded-xl px-4 py-2.5 border border-sbi-green/20"
              >
                <div className="text-xs text-white/50">Resolution Time</div>
                <div className="text-sbi-green font-black text-lg">48 sec</div>
              </motion.div>

              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute -top-4 -left-6 glass rounded-xl px-4 py-2.5 border border-white/10"
              >
                <div className="text-xs text-white/50">Language</div>
                <div className="text-white font-bold">हिन्दी</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-navy to-transparent pointer-events-none" />
    </section>
  )
}
