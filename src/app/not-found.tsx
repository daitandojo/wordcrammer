import Link from 'next/link'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-mesh">
      <div className="deco-blob deco-blob-1 animate-float" style={{ top: '20%', left: '-5%' }} />
      <div className="deco-blob deco-blob-2 animate-float-delayed" style={{ top: '60%', right: '-10%' }} />

      <div className="relative">
        <FileQuestion className="w-16 h-16 text-blue-400/50 mx-auto mb-6" />
        <h1 className="text-6xl font-bold text-white mb-4 gradient-text">404</h1>
        <p className="text-slate-400 text-lg mb-8 max-w-md">
          This page doesn&apos;t exist. Let&apos;s get you back to cramming.
        </p>
        <Link
          href="/"
          className="btn-primary px-6 py-3 text-base font-semibold"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}
