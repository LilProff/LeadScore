export default function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-6">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
        <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
      </div>
      <div className="text-center space-y-2">
        <p className="text-lg font-semibold text-gray-800">Scoring your lead…</p>
        <p className="text-sm text-gray-500 max-w-xs">
          Our AI is analysing the company's marketing fit and budget. This takes a few seconds.
        </p>
      </div>
      {/* skeleton */}
      <div className="w-full max-w-md space-y-3 mt-4">
        {[80, 60, 72, 50].map((w, i) => (
          <div
            key={i}
            className="h-3 rounded-full bg-gray-200 animate-pulse"
            style={{ width: `${w}%` }}
          />
        ))}
      </div>
    </div>
  )
}
