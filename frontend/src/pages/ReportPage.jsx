import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchLead } from '../lib/api'

const GRADE_STYLES = {
  A: 'from-emerald-400 to-cyan-500 shadow-emerald-500/20',
  B: 'from-blue-400 to-indigo-500 shadow-blue-500/20',
  C: 'from-amber-400 to-orange-500 shadow-amber-500/20',
  D: 'from-orange-400 to-red-500 shadow-orange-500/20',
  F: 'from-red-400 to-rose-600 shadow-red-500/20',
  null: 'from-slate-400 to-slate-600 shadow-slate-500/20',
}

export default function ReportPage() {
  const { id } = useParams()
  const [lead, setLead] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchLead(id)
        setLead(data)
        if (data.status === 'pending') {
          setTimeout(load, 2000)
        } else {
          setLoading(false)
        }
      } catch (err) {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading || (lead && lead.status === 'pending')) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-6"></div>
        <h2 className="text-2xl font-bold mb-2">Analyzing Intelligence...</h2>
        <p className="text-slate-400 animate-pulse">Consulting Gemini 2.0 Flash for lead qualification</p>
      </div>
    )
  }

  if (!lead) return <div className="p-8 text-center">Report not found</div>

  const style = GRADE_STYLES[lead.grade] || GRADE_STYLES.null

  return (
    <div className="min-h-screen py-12 px-4 md:py-24">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <Link to="/" className="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center">
            ← Back to Intelligence Input
          </Link>
          <div className="text-xs font-mono text-slate-500 uppercase tracking-widest">
            Report ID: {lead.id.slice(0, 8)}
          </div>
        </div>

        <div className="premium-card p-8 md:p-16 relative overflow-hidden">
          {/* Decorative Grade Glow */}
          <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${style} opacity-10 blur-[80px] pointer-events-none`} />

          <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-12">
            <div className={`w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-gradient-to-br ${style} flex items-center justify-center text-4xl md:text-6xl font-black text-white shadow-2xl`}>
              {lead.grade || '?'}
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{lead.name}</h1>
              <p className="text-lg text-slate-400 font-medium">{lead.company_name} • {lead.industry || 'General Industry'}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {lead.signals?.map(s => (
                  <span key={s} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-300">
                    #{s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t border-white/5">
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">AI Analysis Reasoning</h3>
              <p className="text-lg text-slate-300 leading-relaxed italic">
                "{lead.reasoning || 'No analysis available.'}"
              </p>
            </div>
            <div className="space-y-8">
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Marketing Fit Score</h3>
                <div className="flex items-end gap-3">
                  <div className="text-5xl font-black text-white">{lead.marketing_relevance_score || 0}</div>
                  <div className="text-xl text-slate-500 pb-1">/ 100</div>
                </div>
                <div className="mt-4 w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${style} transition-all duration-1000 ease-out`} 
                    style={{ width: `${lead.marketing_relevance_score || 0}%` }}
                  />
                </div>
              </div>
              
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Contextual Signals</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <div className="text-[10px] uppercase text-slate-500 mb-1">Budget</div>
                    <div className="text-sm font-bold">{lead.marketing_budget || 'Unknown'}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <div className="text-[10px] uppercase text-slate-500 mb-1">Revenue</div>
                    <div className="text-sm font-bold">{lead.company_size || 'Unknown'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-slate-500 text-sm">
            Analysis completed at {new Date(lead.scored_at || lead.created_at).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  )
}
