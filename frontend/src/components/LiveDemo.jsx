import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PhoneCall, PhoneOff, ChevronDown, Loader2, CheckCircle2, Terminal, MessageSquare } from 'lucide-react'

const SCENARIOS = {
  lost_card_hindi: {
    label: 'Lost Debit Card (Hindi)',
    language: 'Hindi',
    steps: [
      { role: 'customer', text: 'Mera ATM card kho gaya hai, please help karo!' },
      { role: 'ai', text: 'Namaste! Main BankGuard AI hoon — SBI ki 24/7 emergency banking service. Ghabraiye mat, main abhi aapki madad karunga. Kripya apne account number ke aakhri 4 digit batayein.' },
      { role: 'customer', text: '4521' },
      { role: 'tool', tool: 'verify_customer', input: { account_last4: '4521' }, result: { verified: true, customer_name: 'Rajesh Kumar', account_id: 'SBI-ACC-004521' } },
      { role: 'ai', text: 'Rajesh Kumar ji, aapki identity verify ho gayi. Main abhi aapka debit card block kar raha hoon — ek second...' },
      { role: 'tool', tool: 'block_card', input: { account_id: 'SBI-ACC-004521', card_type: 'debit' }, result: { success: true, reference_no: 'BG-2026-847291', blocked_at: '2026-06-29 21:40:15' } },
      { role: 'tool', tool: 'send_sms_confirmation', input: { phone: '9876543210', message: 'SBI BankGuard AI: Aapka debit card block ho gaya. Ref: BG-2026-847291' }, result: { success: true } },
      { role: 'ai', text: 'Ho gaya! Aapka debit card successfully block kar diya gaya hai.\n\n📋 Reference Number: BG-2026-847291\n⏰ Block Time: 29-Jun-2026, 9:40 PM\n📱 SMS aapke registered mobile par bhej diya gaya hai.\n\nNaya card order karne ke liye nearest SBI branch ya YONO app use karein. Koi aur madad chahiye?' },
    ],
  },
  suspicious_txn_english: {
    label: 'Suspicious Transaction (English)',
    language: 'English',
    steps: [
      { role: 'customer', text: "I just saw a transaction of Rs 15,000 that I didn't make — it happened at 2 AM!" },
      { role: 'ai', text: "I understand this is very alarming and I'm taking this seriously. I'm BankGuard AI and I'll resolve this immediately. Please share the last 4 digits of your SBI account number so I can verify your identity." },
      { role: 'customer', text: '4521' },
      { role: 'tool', tool: 'verify_customer', input: { account_last4: '4521' }, result: { verified: true, customer_name: 'Rajesh Kumar', account_id: 'SBI-ACC-004521' } },
      { role: 'ai', text: "Identity verified, Rajesh. I can see the suspicious transaction. I'm flagging it as unauthorized right now and also blocking your card to prevent further misuse." },
      { role: 'tool', tool: 'flag_transaction', input: { account_id: 'SBI-ACC-004521', amount: 15000 }, result: { success: true, dispute_id: 'DSP-2026-334421' } },
      { role: 'tool', tool: 'block_card', input: { account_id: 'SBI-ACC-004521', card_type: 'debit' }, result: { success: true, reference_no: 'BG-2026-993812' } },
      { role: 'tool', tool: 'send_sms_confirmation', input: { phone: '9876543210', message: 'SBI BankGuard AI: Dispute raised for Rs 15,000 unauthorized transaction. Dispute ID: DSP-2026-334421. Resolution within 7 working days.' }, result: { success: true } },
      { role: 'ai', text: "Done! Here's what I've done for you:\n\n✅ Flagged the ₹15,000 unauthorized transaction\n📋 Dispute ID: DSP-2026-334421\n🔒 Your debit card has been blocked (Ref: BG-2026-993812)\n📱 SMS confirmation sent to your registered mobile\n\nOur fraud team will review and refund within 7 working days. You're protected now." },
    ],
  },
  hacked_account: {
    label: 'Hacked Account (English)',
    language: 'English',
    steps: [
      { role: 'customer', text: "I think someone hacked my account! Multiple transactions I don't recognize — please freeze everything!" },
      { role: 'ai', text: "This is a security emergency and I'm acting immediately. Stay calm — I'm BankGuard AI. To protect your account, I need to verify your identity first. Please tell me the last 4 digits of your account." },
      { role: 'customer', text: '7832' },
      { role: 'tool', tool: 'verify_customer', input: { account_last4: '7832' }, result: { verified: true, customer_name: 'Priya Sharma', account_id: 'SBI-ACC-007832' } },
      { role: 'ai', text: "Priya, identity confirmed. I'm freezing your account right now to stop all unauthorized access. This will block all incoming and outgoing transactions immediately." },
      { role: 'tool', tool: 'freeze_account', input: { account_id: 'SBI-ACC-007832', reason: 'Customer reported unauthorized access and multiple suspicious transactions' }, result: { success: true, reference_no: 'BG-2026-771002' } },
      { role: 'tool', tool: 'send_sms_confirmation', input: { phone: '9845671234', message: 'SBI BankGuard AI: Your account has been FROZEN for security. Ref: BG-2026-771002. Visit branch to unfreeze.' }, result: { success: true } },
      { role: 'ai', text: "Your account is now FROZEN. No one can make any transactions.\n\n🔐 Freeze Reference: BG-2026-771002\n⏰ Frozen at: 29-Jun-2026, 9:40 PM\n📱 SMS sent to your registered number\n\nNext steps: Visit your nearest SBI branch with your ID proof to unfreeze and investigate. Would you like me to escalate this to a senior fraud officer?" },
    ],
  },
  wrong_transfer: {
    label: 'Wrong UPI Transfer (Telugu)',
    language: 'Telugu',
    steps: [
      { role: 'customer', text: 'Nenu tappu ga 25000 rupayalu wrong UPI ki transfer chesanu, please help cheyandi!' },
      { role: 'ai', text: 'Namaskaram! Nenu BankGuard AI — SBI emergency banking service. Meeru ghabrakaandi, nenu ventane help chestanu. Mee account number last 4 digits cheppagalara?' },
      { role: 'customer', text: '3301' },
      { role: 'tool', tool: 'verify_customer', input: { account_last4: '3301' }, result: { verified: true, customer_name: 'Amit Patel', account_id: 'SBI-ACC-003301' } },
      { role: 'ai', text: "Amit Patel gaaru, meeru verify ayinaru. Nenu ippude ₹25,000 reversal request raise chestanu..." },
      { role: 'tool', tool: 'raise_reversal', input: { account_id: 'SBI-ACC-003301', amount: 25000, beneficiary_upi: 'wrong@paytm' }, result: { success: true, reversal_id: 'REV-2026-558834' } },
      { role: 'tool', tool: 'send_sms_confirmation', input: { phone: '9123456789', message: 'SBI BankGuard AI: Rs 25,000 reversal request raised. Reversal ID: REV-2026-558834. Expected: 24 hours.' }, result: { success: true } },
      { role: 'ai', text: "Reversal request raise chesamu!\n\n📋 Reversal ID: REV-2026-558834\n💰 Amount: ₹25,000\n⏱️ Expected Reversal: 24 hours lo\n📱 SMS mee mobile ki vellindi\n\nBeneficiary bank cooperate chesthe, 24 gantallo meeru money return avutundi. Inka emi help kavali?" },
    ],
  },
  forgot_pin: {
    label: 'Forgot ATM PIN (Hindi)',
    language: 'Hindi',
    steps: [
      { role: 'customer', text: 'Mera ATM PIN bhool gaya hoon, koi 3 baar galat PIN daala aur card band ho gaya' },
      { role: 'ai', text: 'Koi baat nahi! Main BankGuard AI hoon. Main abhi aapka PIN reset karwata hoon. Pehle aapki identity verify karni hogi — account ke aakhri 4 digit batayein.' },
      { role: 'customer', text: '4521' },
      { role: 'tool', tool: 'verify_customer', input: { account_last4: '4521' }, result: { verified: true, customer_name: 'Rajesh Kumar', account_id: 'SBI-ACC-004521' } },
      { role: 'ai', text: 'Rajesh Kumar ji, identity verify ho gayi. Aapke card ke aakhri 4 digits batayein PIN reset ke liye.' },
      { role: 'customer', text: '6702' },
      { role: 'tool', tool: 'reset_pin', input: { account_id: 'SBI-ACC-004521', card_last4: '6702' }, result: { success: true, otp_sent: true, phone_masked: 'XXXXXX3210' } },
      { role: 'tool', tool: 'send_sms_confirmation', input: { phone: '9876543210', message: 'SBI BankGuard AI: PIN reset OTP aapke mobile par bheja gaya hai. OTP 10 minute mein expire hoga.' }, result: { success: true } },
      { role: 'ai', text: "PIN reset OTP aapke registered mobile XXXXXX3210 par bhej diya gaya hai.\n\n✅ OTP validity: 10 minutes\n📍 Kisi bhi SBI ATM par jaayein\n🔢 'Forgot PIN' option choose karein\n📱 OTP enter karein aur naya PIN set karein\n\nSMS bhi bhej diya gaya hai. Koi dikkat ho toh main hoon!" },
    ],
  },
}

function ToolCallBadge({ tool, input, result }) {
  const [expanded, setExpanded] = useState(false)

  const toolColors = {
    verify_customer: 'border-blue-500/40 bg-blue-500/10',
    block_card: 'border-red-500/40 bg-red-500/10',
    freeze_account: 'border-orange-500/40 bg-orange-500/10',
    flag_transaction: 'border-yellow-500/40 bg-yellow-500/10',
    raise_reversal: 'border-purple-500/40 bg-purple-500/10',
    reset_pin: 'border-cyan-500/40 bg-cyan-500/10',
    send_sms_confirmation: 'border-sbi-green/40 bg-sbi-green/10',
    unlock_yono: 'border-indigo-500/40 bg-indigo-500/10',
  }

  const colorClass = toolColors[tool] || 'border-white/20 bg-white/5'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-lg border p-3 text-xs font-mono ${colorClass} cursor-pointer`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center gap-2">
        <Terminal className="w-3.5 h-3.5 text-white/60 flex-shrink-0" />
        <span className="text-white/80 font-semibold">{tool}()</span>
        {result?.success !== false && <CheckCircle2 className="w-3.5 h-3.5 text-sbi-green ml-auto flex-shrink-0" />}
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
              <pre className="text-white/70 whitespace-pre-wrap break-all">{JSON.stringify(input, null, 2)}</pre>
              <div className="text-white/40 mt-1">Result:</div>
              <pre className="text-sbi-green/80 whitespace-pre-wrap break-all">{JSON.stringify(result, null, 2)}</pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function TypewriterText({ text, onDone, speed = 18 }) {
  const [displayed, setDisplayed] = useState('')
  const idx = useRef(0)

  useEffect(() => {
    idx.current = 0
    setDisplayed('')
    const interval = setInterval(() => {
      if (idx.current < text.length) {
        setDisplayed(text.slice(0, idx.current + 1))
        idx.current++
      } else {
        clearInterval(interval)
        if (onDone) onDone()
      }
    }, speed)
    return () => clearInterval(interval)
  }, [text, speed, onDone])

  return (
    <span className="whitespace-pre-wrap">
      {displayed}
      {displayed.length < text.length && <span className="cursor-blink text-sbi-green">|</span>}
    </span>
  )
}

function ChatBubble({ step, animate, onDone }) {
  if (step.role === 'tool') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="pl-4"
        onAnimationComplete={onDone}
      >
        <ToolCallBadge tool={step.tool} input={step.input} result={step.result} />
      </motion.div>
    )
  }

  const isAI = step.role === 'ai'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isAI
            ? 'bg-navy-800/80 border border-white/10 text-white/90 rounded-tl-sm'
            : 'bg-sbi-green/20 border border-sbi-green/30 text-white rounded-tr-sm'
        }`}
      >
        {isAI && (
          <div className="text-[10px] text-sbi-green font-bold mb-1 flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-sbi-green rounded-full" />
            BankGuard AI
          </div>
        )}
        {!isAI && (
          <div className="text-[10px] text-white/40 font-bold mb-1 text-right">You</div>
        )}
        {animate && isAI ? (
          <TypewriterText text={step.text} onDone={onDone} />
        ) : (
          <span className="whitespace-pre-wrap">{step.text}</span>
        )}
        {(!animate || !isAI) && onDone && (
          <span className="hidden" ref={(el) => el && setTimeout(onDone, 100)} />
        )}
      </div>
    </motion.div>
  )
}

export default function LiveDemo() {
  const [scenarioKey, setScenarioKey] = useState('lost_card_hindi')
  const [isRunning, setIsRunning] = useState(false)
  const [isEnded, setIsEnded] = useState(false)
  const [visibleSteps, setVisibleSteps] = useState([])
  const [currentStepIdx, setCurrentStepIdx] = useState(-1)
  const [callDuration, setCallDuration] = useState(0)
  const chatRef = useRef(null)
  const timerRef = useRef(null)

  const scenario = SCENARIOS[scenarioKey]

  const scrollToBottom = () => {
    setTimeout(() => {
      if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
    }, 50)
  }

  const startDemo = () => {
    setVisibleSteps([])
    setCurrentStepIdx(0)
    setIsRunning(true)
    setIsEnded(false)
    setCallDuration(0)
    timerRef.current = setInterval(() => setCallDuration((d) => d + 1), 1000)
  }

  const resetDemo = () => {
    setIsRunning(false)
    setIsEnded(false)
    setVisibleSteps([])
    setCurrentStepIdx(-1)
    setCallDuration(0)
    clearInterval(timerRef.current)
  }

  useEffect(() => {
    return () => clearInterval(timerRef.current)
  }, [])

  useEffect(() => {
    if (!isRunning || currentStepIdx < 0) return
    const steps = scenario.steps
    if (currentStepIdx >= steps.length) {
      setIsEnded(true)
      setIsRunning(false)
      clearInterval(timerRef.current)
      return
    }

    const step = steps[currentStepIdx]
    const delay = step.role === 'customer' ? 600 : step.role === 'tool' ? 300 : 0

    const timeout = setTimeout(() => {
      setVisibleSteps((prev) => [...prev, { ...step, key: currentStepIdx }])
      scrollToBottom()
      // For tool and customer steps, advance immediately after short wait
      if (step.role !== 'ai') {
        setTimeout(() => setCurrentStepIdx((i) => i + 1), step.role === 'tool' ? 700 : 1200)
      }
    }, delay)

    return () => clearTimeout(timeout)
  }, [currentStepIdx, isRunning, scenarioKey])

  const handleStepDone = (idx) => {
    if (idx === currentStepIdx && scenario.steps[idx]?.role === 'ai') {
      setTimeout(() => setCurrentStepIdx((i) => i + 1), 800)
    }
  }

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const toolCallsMade = visibleSteps.filter((s) => s.role === 'tool')

  return (
    <section id="demo" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 bg-sbi-green/10 border border-sbi-green/30 rounded-full px-4 py-1.5 mb-4">
            <span className="text-sbi-green text-sm font-semibold">Interactive Demo</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black mb-4">
            Watch BankGuard AI <span className="text-gradient">In Action</span>
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            Select a scenario and press Start to see a real-time simulation of how BankGuard AI handles banking emergencies.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left: Phone panel */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass rounded-2xl p-6 border border-white/10 sticky top-20"
            >
              {/* Scenario selector */}
              <div className="mb-4">
                <label className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-2 block">Select Scenario</label>
                <div className="relative">
                  <select
                    value={scenarioKey}
                    onChange={(e) => { resetDemo(); setScenarioKey(e.target.value) }}
                    disabled={isRunning}
                    className="w-full bg-navy-900/80 border border-white/15 rounded-xl px-3 py-2.5 text-white text-sm appearance-none pr-8 focus:outline-none focus:border-sbi-green/50 disabled:opacity-50"
                    style={{ backgroundColor: '#0d2240' }}
                  >
                    {Object.entries(SCENARIOS).map(([key, s]) => (
                      <option key={key} value={key}>{s.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                </div>
              </div>

              {/* Language badge */}
              <div className="flex items-center gap-2 mb-5">
                <span className="text-xs text-white/40">Language:</span>
                <span className="text-xs bg-sbi-blue/20 border border-sbi-blue/30 text-sbi-blue-light px-2 py-0.5 rounded-full font-semibold">
                  {scenario.language}
                </span>
              </div>

              {/* Phone UI */}
              <div className="bg-navy-900 rounded-2xl p-5 border border-white/5 mb-5" style={{ backgroundColor: '#071628' }}>
                <div className="text-center mb-4">
                  <div className="text-xs text-white/30 mb-1">SBI Helpline</div>
                  <div className="text-2xl font-black text-white">1800-11-2211</div>
                </div>

                <div className="flex justify-center mb-4">
                  <div className="relative w-20 h-20">
                    {isRunning && !isEnded && (
                      <>
                        <div className="absolute inset-0 rounded-full border-2 border-sbi-green/30 animate-ping" style={{ animationDuration: '2s' }} />
                        <div className="absolute inset-[-8px] rounded-full border border-sbi-green/15 animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
                      </>
                    )}
                    <div className={`w-full h-full rounded-full flex items-center justify-center border-2 ${isRunning && !isEnded ? 'border-sbi-green bg-sbi-green/10' : isEnded ? 'border-white/20 bg-white/5' : 'border-white/20 bg-white/5'}`}>
                      {isEnded ? <PhoneOff className="w-8 h-8 text-white/40" /> : <PhoneCall className={`w-8 h-8 ${isRunning ? 'text-sbi-green' : 'text-white/40'}`} />}
                    </div>
                  </div>
                </div>

                {/* Timer */}
                <div className="text-center mb-3">
                  <div className={`text-3xl font-mono font-black ${isRunning ? 'text-sbi-green' : 'text-white/30'}`}>
                    {formatTime(callDuration)}
                  </div>
                  <div className="text-xs text-white/30 mt-0.5">
                    {isEnded ? 'Call ended' : isRunning ? 'Call in progress...' : 'Ready to call'}
                  </div>
                </div>

                {/* Voice wave */}
                {isRunning && !isEnded && (
                  <div className="flex justify-center">
                    <div className="voice-wave flex items-center gap-1">
                      {[8, 16, 22, 14, 20, 10, 18, 12].map((h, i) => (
                        <span key={i} style={{ height: `${h}px`, animationDelay: `${i * 0.1}s` }} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                <div className="glass rounded-xl p-2.5 text-center">
                  <div className="text-lg font-black text-sbi-green">{toolCallsMade.length}</div>
                  <div className="text-[10px] text-white/40">Tool Calls</div>
                </div>
                <div className="glass rounded-xl p-2.5 text-center">
                  <div className="text-lg font-black text-white">{visibleSteps.filter(s => s.role === 'customer').length}</div>
                  <div className="text-[10px] text-white/40">Customer</div>
                </div>
                <div className="glass rounded-xl p-2.5 text-center">
                  <div className={`text-lg font-black ${isEnded ? 'text-sbi-green' : 'text-white/40'}`}>{isEnded ? '✓' : '—'}</div>
                  <div className="text-[10px] text-white/40">Resolved</div>
                </div>
              </div>

              {/* CTA Buttons */}
              {!isRunning && !isEnded && (
                <button
                  onClick={startDemo}
                  className="w-full bg-sbi-green hover:bg-sbi-green-dark text-white font-bold py-3 rounded-xl transition-all glow-green flex items-center justify-center gap-2"
                >
                  <PhoneCall className="w-4 h-4" />
                  Start Demo Call
                </button>
              )}
              {isRunning && (
                <button
                  onClick={resetDemo}
                  className="w-full bg-white/10 hover:bg-white/15 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Running... (Click to Reset)
                </button>
              )}
              {isEnded && (
                <div className="space-y-2">
                  <div className="bg-sbi-green/10 border border-sbi-green/30 rounded-xl p-3 text-center">
                    <CheckCircle2 className="w-6 h-6 text-sbi-green mx-auto mb-1" />
                    <div className="text-sbi-green font-bold text-sm">Issue Resolved!</div>
                    <div className="text-white/40 text-xs">in {formatTime(callDuration)}</div>
                  </div>
                  <button
                    onClick={resetDemo}
                    className="w-full bg-white/10 hover:bg-white/15 text-white font-semibold py-2.5 rounded-xl transition-all text-sm"
                  >
                    Try Another Scenario
                  </button>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right: Transcript */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-3"
          >
            <div className="glass rounded-2xl border border-white/10 flex flex-col h-full" style={{ minHeight: '560px' }}>
              {/* Header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
                <MessageSquare className="w-4 h-4 text-sbi-green" />
                <span className="font-semibold text-sm">Live Transcript</span>
                <div className={`ml-auto flex items-center gap-1.5 text-xs ${isRunning ? 'text-sbi-green' : 'text-white/30'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-sbi-green animate-pulse' : 'bg-white/20'}`} />
                  {isRunning ? 'LIVE' : isEnded ? 'ENDED' : 'IDLE'}
                </div>
              </div>

              {/* Chat area */}
              <div ref={chatRef} className="flex-1 overflow-y-auto p-5 space-y-4" style={{ maxHeight: '480px' }}>
                {visibleSteps.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <PhoneCall className="w-12 h-12 text-white/10 mb-3" />
                    <p className="text-white/20 text-sm">Select a scenario and press "Start Demo Call" to begin</p>
                  </div>
                )}
                {visibleSteps.map((step, i) => (
                  <ChatBubble
                    key={step.key}
                    step={step}
                    animate={i === visibleSteps.length - 1 && step.role === 'ai'}
                    onDone={() => handleStepDone(step.key)}
                  />
                ))}
                {isRunning && currentStepIdx < scenario.steps.length && visibleSteps.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 text-white/30 text-xs pl-1"
                  >
                    <Loader2 className="w-3 h-3 animate-spin" />
                    BankGuard AI is processing...
                  </motion.div>
                )}
              </div>

              {/* Footer hint */}
              <div className="px-5 py-3 border-t border-white/5 flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-white/20" />
                <span className="text-[11px] text-white/20">Click any tool call badge to expand details</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
