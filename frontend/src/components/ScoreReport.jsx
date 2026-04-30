import { Link } from 'react-router-dom'

const GRADE_CONFIG = {
  A: { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', label: 'Highly Qualified' },
  B: { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', label: 'Qualified' },
  C: { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', label: 'Moderate Fit' },
  D: { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', label: 'Weak Signals' },
  F: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', label: 'Disqualified' },
}

function RelevanceBar({ score }) {
  const pct = Math.min(100, Math.max(0, score))
  const color =
    pct >= 80 ? 'bg-green-500' :
    pct >= 60 ? 'bg-blue-500' :
    pct >= 40 ? 'bg-amber-500' :
    pct >= 20 ? 'bg-orange-500' : 'bg-red-500'

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-500">
        <span>Marketing Relevance</span>
        <span className="font-semibold text-gray-700">{pct}/100</span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function SignalChip({ signal }) {
  return (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
      {signal.replace(/_/g, ' ')}
    </span>
  )
}

export default function ScoreReport({ lead }) {
  const cfg = GRADE_CONFIG[lead.grade] ?? GRADE_CONFIG.F

  return (
    <div className="space-y-6">
      {/* Grade card */}
      <div className={`rounded-2xl border-2 ${cfg.border} ${cfg.bg} p-6 flex flex-col sm:flex-row items-center gap-6`}>
        <div className={`text-8xl font-black leading-none ${cfg.color}`}>{lead.grade}</div>
        <div className="flex-1 space-y-1 text-center sm:text-left">
          <p className={`text-xl font-bold ${cfg.color}`}>{cfg.label}</p>
          <p className="text-sm text-gray-600">{lead.reasoning}</p>
        </div>
      </div>

      {/* Relevance score */}
      <RelevanceBar score={lead.marketing_relevance_score} />

      {/* Signals */}
      {lead.signals?.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Detected Signals</p>
          <div className="flex flex-wrap gap-2">
            {lead.signals.map(s => <SignalChip key={s} signal={s} />)}
          </div>
        </div>
      )}

      {/* Meta */}
      <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-xs text-gray-500 space-y-1">
        <p>Lead ID: <span className="font-mono">{lead.id}</span></p>
        {lead.scored_at && (
          <p>Scored at: {new Date(lead.scored_at).toLocaleString()}</p>
        )}
      </div>

      <Link
        to="/"
        className="block text-center rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
      >
        ← Score another lead
      </Link>
    </div>
  )
}
