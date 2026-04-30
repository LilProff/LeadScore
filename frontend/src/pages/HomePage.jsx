import LeadForm from '../components/LeadForm'

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-start justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Lead Scoring</h1>
          <p className="mt-2 text-sm text-gray-500">
            Fill in the form and our AI will qualify the lead on an A–F scale based on marketing fit and budget.
          </p>
        </div>
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6 sm:p-8">
          <LeadForm />
        </div>
      </div>
    </div>
  )
}
