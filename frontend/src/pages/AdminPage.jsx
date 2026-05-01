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
    console.log('AdminPage: useEffect triggered')
    async function load() {
      try {
        console.log('AdminPage: calling listLeads...')
        const data = await listLeads()
        console.log('AdminPage: data received', data)
        setLeads(data)
      } catch (err) {
        console.error('AdminPage: error', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (error) {
    return (
      <div className="p-20 text-center">
        <h1 className="text-red-500 text-2xl font-bold mb-4">Connection Error</h1>
        <p className="text-slate-400">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-8 px-6 py-2 bg-white/10 rounded-lg">Retry</button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
        <div className="text-white font-mono tracking-widest uppercase">Initializing Intelligence...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-12 md:py-20">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-black mb-2 tracking-tight text-white">Intelligence Dashboard</h1>
            <p className="text-slate-400 font-medium">Monitoring {leads.length} active lead qualifications</p>
          </div>
          <Link to="/" className="text-indigo-400 hover:underline">Back to Form</Link>
        </header>

        <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 border-b border-white/5 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                  <th className="px-8 py-6">Contact Intelligence</th>
                  <th className="px-8 py-6 text-center">AI Grade</th>
                  <th className="px-8 py-6">Requirement Profile</th>
                  <th className="px-8 py-6">Created At</th>
                  <th className="px-8 py-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {leads.map(lead => (
                  <tr key={lead.id} className="hover:bg-white/[0.02]">
                    <td className="px-8 py-6">
                      <div className="font-bold text-white">{lead.name}</div>
                      <div className="text-slate-400 text-xs">{lead.company_name}</div>
                      <div className="text-slate-500 text-[10px] mt-1 font-mono">{lead.email}</div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl border ${GRADE_COLORS[lead.grade] || GRADE_COLORS.null} text-lg font-black`}>
                        {lead.grade || '?'}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-white text-sm font-semibold">{lead.marketing_budget || 'N/A'}</div>
                      <div className="text-slate-500 text-xs truncate max-w-xs italic">
                        "{lead.company_needs || 'No details'}"
                      </div>
                    </td>
                    <td className="px-8 py-6 text-slate-500 text-[10px] font-mono">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <Link to={`/report/${lead.id}`} className="text-indigo-400 text-xs font-bold uppercase hover:text-white transition-colors">View →</Link>
                    </td>
                  </tr>
                ))}
                {leads.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-8 py-24 text-center text-slate-500 font-medium italic">
                      No lead intelligence captured yet.
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
