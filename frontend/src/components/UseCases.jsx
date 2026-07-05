import { motion } from 'framer-motion'
import { CreditCard, ShieldAlert, AlertTriangle, KeyRound, ArrowLeftRight, Smartphone, FileX } from 'lucide-react'

const cases = [
  {
    icon: CreditCard,
    title: 'Lost / Stolen Card',
    urgency: 'CRITICAL',
    urgencyColor: 'bg-red-500/20 text-red-400 border-red-500/30',
    borderColor: 'border-red-500/20',
    iconBg: 'bg-red-500/10',
    iconColor: 'text-red-400',
    time: '~35 sec',
    phrases: ['"Mera card kho gaya"', '"My card was stolen"'],
    description: 'Instant card block across all SBI channels. New card dispatch initiated automatically.',
  },
  {
    icon: ShieldAlert,
    title: 'Account Hacked',
    urgency: 'CRITICAL',
    urgencyColor: 'bg-red-500/20 text-red-400 border-red-500/30',
    borderColor: 'border-red-500/20',
    iconBg: 'bg-red-500/10',
    iconColor: 'text-red-400',
    time: '~45 sec',
    phrases: ['"Mera account hack ho gaya"', '"Someone accessed my account"'],
    description: 'Full account freeze, all linked cards blocked, fraud team escalation triggered.',
  },
  {
    icon: AlertTriangle,
    title: 'Suspicious Transaction',
    urgency: 'HIGH',
    urgencyColor: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    borderColor: 'border-orange-500/20',
    iconBg: 'bg-orange-500/10',
    iconColor: 'text-orange-400',
    time: '~50 sec',
    phrases: ['"Maine ye transaction nahi kiya"', '"Unauthorized debit on my account"'],
    description: 'Transaction dispute raised, fraud team notified, provisional credit initiated within 7 days.',
  },
  {
    icon: KeyRound,
    title: 'Forgot ATM PIN',
    urgency: 'MEDIUM',
    urgencyColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    borderColor: 'border-yellow-500/20',
    iconBg: 'bg-yellow-500/10',
    iconColor: 'text-yellow-400',
    time: '~40 sec',
    phrases: ['"ATM PIN bhool gaya hoon"', '"My card is blocked after wrong PIN"'],
    description: 'OTP sent to registered mobile. PIN reset at any SBI ATM — no branch visit needed.',
  },
  {
    icon: ArrowLeftRight,
    title: 'Wrong Transfer',
    urgency: 'HIGH',
    urgencyColor: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    borderColor: 'border-orange-500/20',
    iconBg: 'bg-orange-500/10',
    iconColor: 'text-orange-400',
    time: '~55 sec',
    phrases: ['"Galat account mein paisa gaya"', '"Wrong UPI transfer, need reversal"'],
    description: 'Reversal request raised with beneficiary bank. Amount returned within 24 hours if bank cooperates.',
  },
  {
    icon: Smartphone,
    title: 'YONO App Locked',
    urgency: 'MEDIUM',
    urgencyColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    borderColor: 'border-blue-500/20',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-400',
    time: '~30 sec',
    phrases: ['"YONO app band ho gaya"', '"Cannot login to SBI YONO"'],
    description: 'App unlocked remotely, MPIN reset link sent. Back online within minutes.',
  },
  {
    icon: FileX,
    title: 'Cheque Bounce',
    urgency: 'LOW',
    urgencyColor: 'bg-blue-400/20 text-blue-300 border-blue-400/30',
    borderColor: 'border-blue-400/20',
    iconBg: 'bg-blue-400/10',
    iconColor: 'text-blue-300',
    time: '~25 sec',
    phrases: ['"Mera cheque bounce hua kya?"', '"Check cheque bounce status"'],
    description: 'Real-time cheque status, bounce reason explained, re-presentation guidance provided.',
  },
]

export default function UseCases() {
  return (
    <section id="use-cases" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-1.5 mb-4">
            <span className="text-red-400 text-sm font-semibold">7 Emergency Scenarios</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black mb-4">
            Every Banking Emergency,<br /><span className="text-gradient">Resolved Instantly</span>
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            BankGuard AI handles all critical banking emergencies that SBI customers face — in their own language, without waiting.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {cases.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className={`glass rounded-2xl p-5 border ${item.borderColor} hover:scale-[1.02] transition-all duration-200 group cursor-default`}
            >
              {/* Icon + urgency */}
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${item.iconBg}`}>
                  <item.icon className={`w-6 h-6 ${item.iconColor}`} />
                </div>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${item.urgencyColor}`}>
                  {item.urgency}
                </span>
              </div>

              <h3 className="font-bold text-white mb-1.5">{item.title}</h3>
              <p className="text-white/50 text-xs leading-relaxed mb-3">{item.description}</p>

              {/* Example phrases */}
              <div className="space-y-1 mb-3">
                {item.phrases.map((p) => (
                  <div key={p} className="text-[11px] text-white/30 italic">{p}</div>
                ))}
              </div>

              {/* Resolution time */}
              <div className="flex items-center gap-1.5 pt-3 border-t border-white/5">
                <div className="w-1.5 h-1.5 bg-sbi-green rounded-full" />
                <span className="text-xs text-sbi-green font-semibold">Resolved in {item.time}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
