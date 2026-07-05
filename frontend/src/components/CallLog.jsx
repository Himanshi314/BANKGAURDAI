import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, CheckCircle2, AlertCircle, Clock } from 'lucide-react'

const ISSUES = [
  'Lost Debit Card', 'Suspicious Transaction', 'Account Hacked', 'Forgot ATM PIN',
  'Wrong UPI Transfer', 'YONO App Locked', 'Cheque Bounce', 'Credit Card Stolen',
  'Unauthorized Withdrawal', 'Net Banking Locked',
]

const LANGUAGES = ['Hindi', 'English', 'Tamil', 'Telugu', 'Bengali', 'Marathi', 'Kannada', 'Gujarati']

const RESOLUTIONS = [
  'Card Blocked', 'Dispute Raised', 'Account Frozen', 'PIN Reset Initiated',
  'Reversal Raised', 'App Unlocked', 'Status Checked', 'Escalated to Agent',
]

const PHONE_SUFFIXES = [
  '3210', '1234', '6789', '4422', '9900', '8877', '5566', '2211', '7744', '3398',
]

const DURATIONS = ['28s', '35s', '41s', '47s', '52s', '58s', '63s', '71s', '44s', '39s']

let rowId = 100

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateRow() {
  rowId++
  const status = Math.random() < 0.93 ? 'Resolved' : Math.random() < 0.5 ? 'Escalated' : 'In Progress'
  const resolution = status === 'Resolved' ? randomFrom(RESOLUTIONS) : status === 'Escalated' ? 'Human Transfer' : '...'
  const now = new Date()
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })

  return {
    id: rowId,
    time: timeStr,
    customer: `XXXXXX${randomFrom(PHONE_SUFFIXES)}`,
    issue: randomFrom(ISSUES),
    language: randomFrom(LANGUAGES),
    resolution,
    duration: status === 'In Progress' ? '...' : randomFrom(DURATIONS),
    status,
  }
}

const INITIAL_ROWS = Array.from({ length: 8 }, generateRow)

function StatusBadge({ status }) {
  if (status === 'Resolved') {
    return (
      <span className="flex items-center gap-1 text-[11px] font-semibold text-sbi-green bg-sbi-green/10 border border-sbi-green/20 px-2 py-0.5 rounded-full">
        <CheckCircle2 className="w-3 h-3" /> Resolved
      </span>
    )
  }
  if (status === 'Escalated') {
    return (
      <span className="flex items-center gap-1 text-[11px] font-semibold text-orange-400 bg-orange-400/10 border border-orange-400/20 px-2 py-0.5 rounded-full">
        <AlertCircle className="w-3 h-3" /> Escalated
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1 text-[11px] font-semibold text-blue-400 bg-blue-400/10 border border-blue-400/20 px-2 py-0.5 rounded-full animate-pulse">
      <Clock className="w-3 h-3" /> In Progress
    </span>
  )
}

export default function CallLog() {
  const [rows, setRows] = useState(INITIAL_ROWS)
  const [totalCalls, setTotalCalls] = useState(1842)
  const [resolvedToday, setResolvedToday] = useState(1791)

  useEffect(() => {
    const interval = setInterval(() => {
      const newRow = generateRow()
      setRows((prev) => [newRow, ...prev.slice(0, 11)])
      setTotalCalls((c) => c + 1)
      if (newRow.status === 'Resolved') setResolvedToday((c) => c + 1)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section id="call-log" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-sbi-green/10 border border-sbi-green/30 rounded-full px-4 py-1.5 mb-4">
            <span className="w-2 h-2 bg-sbi-green rounded-full animate-pulse" />
            <span className="text-sbi-green text-sm font-semibold">Live Feed</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black mb-4">
            Real-Time <span className="text-gradient">Call Dashboard</span>
          </h2>
          <p className="text-white/50 text-lg">
            Watch BankGuard AI handle emergencies across India — updated every 3 seconds.
          </p>
        </motion.div>

        {/* Live stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6"
        >
          {[
            { label: 'Calls Today', value: totalCalls.toLocaleString('en-IN'), color: 'text-white' },
            { label: 'Resolved', value: resolvedToday.toLocaleString('en-IN'), color: 'text-sbi-green' },
            { label: 'Resolution Rate', value: `${((resolvedToday / totalCalls) * 100).toFixed(1)}%`, color: 'text-sbi-green' },
            { label: 'Avg. Duration', value: '47s', color: 'text-white' },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-xl p-4 text-center border border-white/10">
              <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
              <div className="text-white/40 text-xs mt-0.5">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="glass rounded-2xl border border-white/10 overflow-hidden"
        >
          {/* Table header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-sbi-green" />
              <span className="font-semibold text-sm">Recent Calls</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-sbi-green">
              <span className="w-1.5 h-1.5 bg-sbi-green rounded-full animate-pulse" />
              Auto-updating every 3s
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {['Time', 'Customer', 'Issue', 'Language', 'Resolution', 'Duration', 'Status'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-white/30 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {rows.map((row, i) => (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0, backgroundColor: 'rgba(34, 197, 94, 0.08)' }}
                      animate={{ opacity: 1, backgroundColor: 'rgba(0, 0, 0, 0)' }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="border-b border-white/5 hover:bg-white/3 transition-colors"
                    >
                      <td className="px-4 py-3 text-white/50 font-mono text-xs">{row.time}</td>
                      <td className="px-4 py-3 text-white/70 font-mono text-xs">{row.customer}</td>
                      <td className="px-4 py-3 text-white text-xs font-medium">{row.issue}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-sbi-blue-light bg-sbi-blue/10 px-2 py-0.5 rounded-full border border-sbi-blue/20">
                          {row.language}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white/60 text-xs">{row.resolution}</td>
                      <td className="px-4 py-3 text-white/50 font-mono text-xs">{row.duration}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={row.status} />
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 border-t border-white/5 text-center text-xs text-white/20">
            Simulated data for demonstration purposes — represents real BankGuard AI capabilities
          </div>
        </motion.div>
      </div>
    </section>
  )
}
