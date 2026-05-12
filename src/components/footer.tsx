import Link from 'next/link'
import { Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5 py-10 mt-16">
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 text-center">
        <div className="flex items-center justify-center gap-1.5 text-sm text-slate-500 mb-4">
          Made with <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400/30" /> for language learners everywhere
        </div>
        <p className="text-xs text-slate-600">
          &copy; {new Date().getFullYear()} WordCrammer. Free language learning for everyone.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-md mx-auto mt-4">
          <Link href="/" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
            Home
          </Link>
          <Link href="/sets" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
            Topics
          </Link>
          <Link href="/login" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
            Sign in
          </Link>
          <Link href="/login" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
            Start Learning
          </Link>
        </div>
      </div>
    </footer>
  )
}
