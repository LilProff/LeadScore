import { useParams, Link } from 'react-router-dom'
import { usePollLead } from '../lib/usePollLead'
import LoadingScreen from '../components/LoadingScreen'
import ScoreReport from '../components/ScoreReport'

export default function ReportPage() {
  const { id } = useParams()
  const { data: lead, isLoading, isError, error } = usePollLead(id)

  return (
    <div className="min-h-screen flex items-start justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Lead Report</h1>
        </div>
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6 sm:p-8">
          {isLoading && !lead && <LoadingScreen />}

          {lead?.status === 'pending' && <LoadingScreen />}

          {lead?.status === 'scored' && <ScoreReport lead={lead} />}

          {lead?.status === 'error' && (
            <div className="space-y-4 text-center py-10">
              <p className="text-lg font-semibold text-red-600">Scoring failed</p>
              <p className="text-sm text-gray-500">{lead.error_message || 'An unexpected error occurred.'}</p>
              <Link to="/" className="inline-block text-sm text-blue-600 hover:underline">← Try again</Link>
            </div>
          )}

          {isError && (
            <div className="space-y-4 text-center py-10">
              <p className="text-lg font-semibold text-red-600">Could not load report</p>
              <p className="text-sm text-gray-500">{error?.message || 'Network error.'}</p>
              <Link to="/" className="inline-block text-sm text-blue-600 hover:underline">← Go back</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
