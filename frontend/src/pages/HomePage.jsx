import LeadForm from '../components/LeadForm'

export default function HomePage() {
  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center px-4 py-20">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-6">
            ✨ AI-Powered Lead Intelligence
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
            Score Your Leads <br /> with Precision
          </h1>
          <p className="text-lg text-slate-400 max-w-lg mx-auto leading-relaxed">
            Upload lead details and our Gemini-powered engine will qualify them on a dynamic A–F scale based on market fit and intent.
          </p>
        </div>

        <div className="premium-card p-8 md:p-12 animate-glow">
          <LeadForm />
        </div>
        
        <p className="mt-8 text-center text-sm text-slate-500">
          Powered by Gemini 2.0 Flash Exp • Privacy Focused • Real-time Scoring
        </p>
      </div>
    </div>
  )
}
