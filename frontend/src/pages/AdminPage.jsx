import { useState, useEffect } from 'react'
import { listLeads } from '../lib/api'
import { Link } from 'react-router-dom'

const GRADE_COLORS = {
  A: 'bg-green-100 text-green-800',
  B: 'bg-blue-100 text-blue-800',
  C: 'bg-amber-100 text-amber-800',
  D: 'bg-orange-100 text-orange-800',
  F: 'bg-red-100 text-red-800',
  null: 'bg-gray-100 text-gray-800',
}

export default function AdminPage() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await listLeads()
        setLeads(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div className="p-8 text-center text-gray-500">Loading leads...</div>
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500">Total leads: {leads.length}</p>
        </div>
        <Link to="/" className="text-sm text-blue-600 hover:underline">Back to Form</Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 uppercase font-semibold text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4">Lead / Company</th>
                <th className="px-6 py-4 text-center">Grade</th>
                <th className="px-6 py-4">Budget / Needs</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leads.map(lead => (
                <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{lead.name}</div>
                    <div className="text-gray-500 text-xs">{lead.company_name}</div>
                    <div className="text-gray-400 text-xs">{lead.email}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-lg ${GRADE_COLORS[lead.grade] || GRADE_COLORS.null}`}>
                      {lead.grade || '?'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-700 truncate max-w-xs font-medium">{lead.marketing_budget || 'N/A'}</div>
                    <div className="text-gray-500 text-xs truncate max-w-xs italic">
                      "{lead.company_needs || 'No details provided'}"
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link to={`/report/${lead.id}`} className="text-blue-600 hover:text-blue-800 font-medium">View Report →</Link>
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500 italic">No leads found yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
