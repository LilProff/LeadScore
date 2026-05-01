import { useState, useEffect } from 'react'
import { listLeads } from '../lib/api'
import { Link } from 'react-router-dom'

const GRADE_COLORS = {
  A: 'border-emerald-500/50 text-emerald-400 bg-emerald-500/5',
  B: 'border-blue-500/50 text-blue-400 bg-blue-500/5',
  C: 'border-amber-500/50 text-amber-400 bg-amber-500/5',
  D: 'border-orange-500/50 text-orange-400 bg-orange-500/5',
  F: 'border-red-500/50 text-red-400 bg-red-500/5',
  null: 'border-slate-500/50 text-slate-400 bg-slate-500/5',
}

export default function AdminPage() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        console.log('Fetching leads...')
        const data = await listLeads()
        console.log('Leads received:', data)
        setLeads(data)
      } catch (err) {
        console.error('Fetch error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-slate-400 animate-pulse font-mono tracking-widest">INITIALIZING SECURE LINK...</div>
    </div>
  )

  return (
    <div className="min-h-screen px-4 py-12 md:py-20">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black mb-2 tracking-tight">Intelligence Dashboard</h1>
            <p className="text-slate-400 font-medium">Monitoring {leads.length} active lead qualifications</p>
          </div>
          <div className="flex gap-4">
            <Link to="/" className="px-5 py-2 rounded-xl border border-white/10 text-sm font-medium hover:bg-white/5 transition-colors">
              Public Form
            </Link>
            <button 
              onClick={() => window.location.reload()}
              className="btn-primary py-2 text-sm"
            >
              Refresh Data
            </button>
          </div>
        </header>

        <div className="premium-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/5">
                  <th className="px-8 py-6 text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Contact Intelligence</th>
                  <th className="px-8 py-6 text-xs font-bold text-slate-500 uppercase tracking-[0.2em] text-center">AI Grade</th>
                  <th className="px-8 py-6 text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Requirement Profile</th>
                  <th className="px-8 py-6 text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Created At</th>
                  <th className="px-8 py-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {leads.map(lead => (
                  <tr key={lead.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-8 py-6">
                      <div className="font-bold text-white text-base group-hover:text-indigo-400 transition-colors">{lead.name}</div>
                      <div className="text-slate-400 text-sm font-medium">{lead.company_name}</div>
                      <div className="text-slate-500 text-xs mt-1 font-mono">{lead.email}</div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl border ${GRADE_COLORS[lead.grade] || GRADE_COLORS.null} text-xl font-black shadow-lg`}>
                        {lead.grade || '?'}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-white text-sm font-semibold mb-1">{lead.marketing_budget || 'Budget: Undisclosed'}</div>
                      <div className="text-slate-400 text-xs truncate max-w-xs leading-relaxed italic">
                        "{lead.company_needs || 'No specific needs documented.'}"
                      </div>
                    </td>
                    <td className="px-8 py-6 text-slate-500 text-xs font-mono">
                      {new Date(lead.created_at).toLocaleDateString()} <br />
                      {new Date(lead.created_at).toLocaleTimeString([], { hour: '2-numeric', minute: '2-numeric' })}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <Link 
                        to={`/report/${lead.id}`} 
                        className="text-xs font-bold uppercase tracking-widest text-indigo-400 hover:text-white transition-colors"
                      >
                        Details →
                      </Link>
                    </td>
                  </tr>
                ))}
                {leads.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-8 py-24 text-center text-slate-500 font-medium italic">
                      SYSTEM STANDBY: No lead intelligence captured yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
