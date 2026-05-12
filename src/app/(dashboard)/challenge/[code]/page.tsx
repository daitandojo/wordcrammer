'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Trophy, Loader2, ArrowRight } from 'lucide-react'

export default function ChallengePage({ params }: { params: Promise<{ code: string }> }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    params.then((p) => setCode(p.code))
  }, [params])

  useEffect(() => {
    if (!code) return
    if (!session) { router.push('/login'); return }
    setLoading(false)
  }, [code, session, router])

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 text-blue-400 animate-spin" /></div>

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-mesh">
      <div className="glass rounded-2xl p-8 max-w-md w-full text-center border border-white/10 animate-scale-in">
        <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Challenge Accepted!</h1>
        <p className="text-slate-400 text-sm mb-6">
          You've been challenged to complete a set. Ready to beat their score?
        </p>
        <button
          onClick={() => router.push('/sets')}
          className="btn-primary w-full justify-center py-2.5 text-sm"
        >
          Accept Challenge
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
