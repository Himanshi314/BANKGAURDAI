import { Shield, Github, Phone } from 'lucide-react'

export default function Footer() {
  const techBadges = [
    'Claude Sonnet 4.6',
    'Sarvam AI Saaras',
    'Sarvam AI Bulbul',
    'Twilio ConversationRelay',
    'FastAPI',
    'React 19',
    'Langfuse',
  ]

  return (
    <footer className="border-t border-white/10 bg-navy-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start gap-3">
            <div className="flex items-center gap-2">
              <Shield className="w-7 h-7 text-sbi-green" fill="currentColor" fillOpacity={0.2} />
              <span className="font-black text-white text-lg">
                BankGuard <span className="text-sbi-green">AI</span>
              </span>
            </div>
            <p className="text-white/50 text-sm text-center md:text-left max-w-sm">
              One Call. Every Emergency. Resolved. — Agentic banking emergency
              voice agent for 500 Million+ SBI customers.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-3">
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <Phone className="w-4 h-4 text-sbi-green" />
              <span>Built for SBI Hackathon @ Global Fintech Fest 2026</span>
            </div>
            <p className="text-white/40 text-xs">
              Sarthak Routray &amp; Himanshi Pal · Manipal University Jaipur
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap justify-center gap-2">
          {techBadges.map((badge) => (
            <span
              key={badge}
              className="text-[11px] font-medium text-white/50 bg-white/5 border border-white/10 rounded-full px-3 py-1"
            >
              {badge}
            </span>
          ))}
        </div>

        <p className="mt-6 text-center text-white/30 text-xs">
          Prototype uses simulated SBI banking APIs. Zero PII stored beyond the
          call — DPDP Act &amp; RBI compliant by design.
        </p>
      </div>
    </footer>
  )
}
