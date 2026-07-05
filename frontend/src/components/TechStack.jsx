import { motion } from 'framer-motion'
import { Mic, Brain, Zap, Bell, Activity } from 'lucide-react'

const layers = [
  {
    icon: Mic,
    label: 'Voice Layer',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10 border-blue-400/20',
    headerBg: 'bg-blue-400/5',
    items: [
      { name: 'Twilio ConversationRelay', desc: 'Real-time voice streaming & call management' },
      { name: 'Sarvam AI Saaras', desc: 'Indian language STT — Hindi, Tamil, Telugu, Bengali' },
      { name: 'Sarvam AI Bulbul', desc: 'Natural Indian language TTS with emotion' },
    ],
  },
  {
    icon: Brain,
    label: 'Intelligence Layer',
    color: 'text-purple-400',
    bg: 'bg-purple-400/10 border-purple-400/20',
    headerBg: 'bg-purple-400/5',
    items: [
      { name: 'Claude Sonnet 4.6', desc: 'Agentic reasoning, multi-turn conversation, tool use' },
      { name: 'Anthropic Agent SDK', desc: 'Orchestration of tool loops, context management' },
    ],
  },
  {
    icon: Zap,
    label: 'Action Layer',
    color: 'text-sbi-green',
    bg: 'bg-sbi-green/10 border-sbi-green/20',
    headerBg: 'bg-sbi-green/5',
    items: [
      { name: 'FastAPI Backend', desc: 'High-performance async Python API server' },
      { name: 'Simulated SBI APIs', desc: 'Card management, account ops, transaction APIs' },
    ],
  },
  {
    icon: Bell,
    label: 'Notification Layer',
    color: 'text-orange-400',
    bg: 'bg-orange-400/10 border-orange-400/20',
    headerBg: 'bg-orange-400/5',
    items: [
      { name: 'Twilio SMS', desc: 'Global SMS delivery with delivery receipts' },
      { name: 'MSG91', desc: 'India-optimized SMS with high deliverability' },
    ],
  },
  {
    icon: Activity,
    label: 'Observability',
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10 border-cyan-400/20',
    headerBg: 'bg-cyan-400/5',
    items: [
      { name: 'Langfuse', desc: 'LLM tracing, prompt versioning, cost tracking' },
      { name: 'OpenTelemetry', desc: 'Distributed tracing across all services' },
    ],
  },
]

const techBadges = [
  'Python 3.12', 'FastAPI', 'React 19', 'Vite', 'Tailwind CSS',
  'Framer Motion', 'Anthropic SDK', 'Twilio', 'WebSockets', 'Pydantic',
]

export default function TechStack() {
  return (
    <section id="tech-stack" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-1.5 mb-4">
            <span className="text-purple-400 text-sm font-semibold">Architecture</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black mb-4">
            Built on <span className="text-gradient">World-Class Tech</span>
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            A production-grade stack purpose-built for Indian voice banking at scale.
          </p>
        </motion.div>

        {/* Architecture diagram */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
          {layers.map((layer, i) => (
            <motion.div
              key={layer.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-2xl border overflow-hidden ${layer.bg}`}
            >
              {/* Layer header */}
              <div className={`px-4 py-3 ${layer.headerBg} border-b border-white/5`}>
                <div className="flex items-center gap-2">
                  <layer.icon className={`w-4 h-4 ${layer.color}`} />
                  <span className={`text-xs font-bold ${layer.color}`}>{layer.label}</span>
                </div>
              </div>

              {/* Items */}
              <div className="p-3 space-y-2">
                {layer.items.map((item) => (
                  <div key={item.name} className="glass rounded-xl p-3">
                    <div className="font-semibold text-white text-xs mb-0.5">{item.name}</div>
                    <div className="text-white/40 text-[10px] leading-relaxed">{item.desc}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Data flow arrows illustration */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="glass rounded-2xl p-6 border border-white/10 mb-8"
        >
          <div className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-4 text-center">Data Flow</div>
          <div className="flex items-center justify-between flex-wrap gap-3 text-center">
            {[
              { label: 'Customer Call', color: 'text-blue-400' },
              { label: '→', color: 'text-white/20' },
              { label: 'Twilio Relay', color: 'text-blue-300' },
              { label: '→', color: 'text-white/20' },
              { label: 'Sarvam STT', color: 'text-purple-400' },
              { label: '→', color: 'text-white/20' },
              { label: 'Claude Agent', color: 'text-purple-300' },
              { label: '→', color: 'text-white/20' },
              { label: 'Banking Tools', color: 'text-sbi-green' },
              { label: '→', color: 'text-white/20' },
              { label: 'SBI APIs', color: 'text-sbi-green' },
              { label: '→', color: 'text-white/20' },
              { label: 'SMS + Voice', color: 'text-orange-400' },
            ].map((item, i) => (
              <span key={i} className={`text-sm font-semibold ${item.color}`}>{item.label}</span>
            ))}
          </div>
        </motion.div>

        {/* Tech badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap gap-2 justify-center"
        >
          {techBadges.map((badge) => (
            <span key={badge} className="glass px-3 py-1.5 rounded-full text-xs text-white/60 border border-white/10 font-medium">
              {badge}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
