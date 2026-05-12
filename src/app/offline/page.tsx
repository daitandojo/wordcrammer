import Link from 'next/link'

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-mesh">
      <div className="max-w-sm">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
          W
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">You&apos;re offline</h1>
        <p className="text-slate-400 text-sm mb-8">
          Your progress is saved. Connect to the internet and come back to continue cramming.
        </p>
        <Link
          href="/"
          className="btn-primary px-6 py-3 text-sm font-semibold"
        >
          Try Again
        </Link>
      </div>
    </div>
  )
}
