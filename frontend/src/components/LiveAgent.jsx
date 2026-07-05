import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, Radio, Terminal, CheckCircle2, XCircle, ChevronDown, Activity, Settings } from 'lucide-react'

const AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

const TOOL_COLORS = {
  verify_customer: 'border-blue-500/40 bg-blue-500/10 text-blue-300',
  block_card: 'border-red-500/40 bg-red-500/10 text-red-300',
  freeze_account: 'border-orange-500/40 bg-orange-500/10 text-orange-300',
  flag_transaction: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-300',
  raise_reversal: 'border-purple-500/40 bg-purple-500/10 text-purple-300',
  reset_pin: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300',
  send_sms_confirmation: 'border-sbi-green/40 bg-sbi-green/10 text-sbi-green',
  unlock_yono: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300',
  escalate_to_human: 'border-pink-500/40 bg-pink-500/10 text-pink-300',
}

const TOOL_LABELS = {
  verify_customer: 'Identity Verification',
  block_card: 'Card Block',
  freeze_account: 'Account Freeze',
  flag_transaction: 'Fraud Dispute',
  raise_reversal: 'Transfer Reversal',
  reset_pin: 'PIN Reset',
  send_sms_confirmation: 'SMS Confirmation',
  unlock_yono: 'YONO Unlock',
  escalate_to_human: 'Human Escalation',
}

function ActionCard({ action }) {
  const [expanded, setExpanded] = useState(false)
  const colorClass = TOOL_COLORS[action.tool] || 'border-white/20 bg-white/5 text-white/70'
  const success = action.result?.success !== false && action.result?.verified !== false

  return (
    <motion.div
      initial={{ opacity: 0, x: 20, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      className={`rounded-lg border p-3 text-xs font-mono cursor-pointer ${colorClass}`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center gap-2">
        <Terminal className="w-3.5 h-3.5 opacity-70 flex-shrink-0" />
        <div className="min-w-0">
          <div className="font-semibold truncate">{TOOL_LABELS[action.tool] || action.tool}</div>
          <div className="text-white/40 text-[10px]">
            {action.tool}() · {new Date(action.timestamp).toLocaleTimeString()}
            {action.source === 'voice_call' && ' · via voice call'}
          </div>
        </div>
        {success
          ? <CheckCircle2 className="w-4 h-4 text-sbi-green ml-auto flex-shrink-0" />
          : <XCircle className="w-4 h-4 text-red-400 ml-auto flex-shrink-0" />}
        <ChevronDown className={`w-3.5 h-3.5 text-white/40 flex-shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-2 pt-2 border-t border-white/10 space-y-1">
              <div className="text-white/40">Input:</div>
              <pre className="text-white/70 whitespace-pre-wrap break-all">{JSON.stringify(action.input, null, 2)}</pre>
              <div className="text-white/40 mt-1">Result:</div>
              <pre className="text-sbi-green/80 whitespace-pre-wrap break-all">{JSON.stringify(action.result, null, 2)}</pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function LiveAgent() {
  const [actions, setActions] = useState([])
  const [backendUp, setBackendUp] = useState(false)
  const lastId = useRef(0)
  const feedRef = useRef(null)

  // Load the ElevenLabs ConvAI widget script once
  useEffect(() => {
    if (!AGENT_ID) return
    if (document.querySelector('script[data-elevenlabs-convai]')) return
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed'
    script.async = true
    script.setAttribute('data-elevenlabs-convai', 'true')
    document.body.appendChild(script)
  }, [])

  // Poll the backend live-actions feed
  useEffect(() => {
    let stop = false
    const poll = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/actions?since=${lastId.current}`)
        if (!res.ok) throw new Error()
        const data = await res.json()
        if (stop) return
        setBackendUp(true)
        if (data.actions.length > 0) {
          lastId.current = data.latest_id
          setActions((prev) => [...prev, ...data.actions].slice(-50))
          setTimeout(() => {
            if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight
          }, 50)
        }
      } catch {
        if (!stop) setBackendUp(false)
      }
    }
    poll()
    const interval = setInterval(poll, 2000)
    return () => { stop = true; clearInterval(interval) }
  }, [])

  return (
    <section id="live" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-full px-4 py-1.5 mb-4">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-400 text-sm font-semibold">Live Voice Agent</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black mb-4">
            Talk to BankGuard AI <span className="text-gradient">Right Now</span>
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            A real voice call, powered by ElevenLabs Conversational AI. Speak in Hindi or English —
            watch the banking actions execute in our backend, live.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: voice call */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass rounded-2xl border border-white/10 p-6 flex flex-col"
          >
            <div className="flex items-center gap-3 mb-5">
              <Mic className="w-4 h-4 text-sbi-green" />
              <span className="font-semibold text-sm">Voice Call</span>
              <span className="ml-auto text-[11px] text-white/30">ElevenLabs Conversational AI</span>
            </div>

            {AGENT_ID ? (
              <div className="flex-1 flex flex-col items-center justify-center min-h-[320px]">
                <elevenlabs-convai agent-id={AGENT_ID}></elevenlabs-convai>
                <div className="mt-6 text-center space-y-1">
                  <p className="text-white/60 text-sm">Try saying:</p>
                  <p className="text-white/40 text-sm italic">"Maine apna ATM card kho diya hai!"</p>
                  <p className="text-white/30 text-xs mt-2">Demo accounts: 4521 · 7832 · 3301</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center min-h-[320px] text-center">
                <Settings className="w-10 h-10 text-white/15 mb-4" />
                <p className="text-white/50 text-sm font-semibold mb-2">Voice agent not configured yet</p>
                <p className="text-white/30 text-xs max-w-sm leading-relaxed">
                  Create the agent on ElevenLabs (see <span className="font-mono text-sbi-green/70">ELEVENLABS_SETUP.md</span>),
                  then add <span className="font-mono">VITE_ELEVENLABS_AGENT_ID</span> to{' '}
                  <span className="font-mono">frontend/.env</span> and restart the dev server.
                </p>
              </div>
            )}
          </motion.div>

          {/* Right: live backend actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass rounded-2xl border border-white/10 flex flex-col"
          >
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
              <Activity className="w-4 h-4 text-sbi-green" />
              <span className="font-semibold text-sm">Backend Actions</span>
              <div className={`ml-auto flex items-center gap-1.5 text-xs ${backendUp ? 'text-sbi-green' : 'text-white/30'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${backendUp ? 'bg-sbi-green animate-pulse' : 'bg-red-400'}`} />
                {backendUp ? 'CONNECTED' : 'BACKEND OFFLINE'}
              </div>
            </div>

            <div ref={feedRef} className="flex-1 overflow-y-auto p-5 space-y-3" style={{ maxHeight: '420px', minHeight: '320px' }}>
              {actions.length === 0 && (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <Radio className="w-12 h-12 text-white/10 mb-3" />
                  <p className="text-white/20 text-sm max-w-xs">
                    {backendUp
                      ? 'Waiting for the agent to act — start a call and report an emergency.'
                      : 'Start the backend to see live actions: python backend/main.py'}
                  </p>
                </div>
              )}
              {actions.map((action) => (
                <ActionCard key={action.id} action={action} />
              ))}
            </div>

            <div className="px-5 py-3 border-t border-white/5 flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-white/20" />
              <span className="text-[11px] text-white/20">
                Every card here is a real tool execution in the FastAPI backend — click to expand
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
