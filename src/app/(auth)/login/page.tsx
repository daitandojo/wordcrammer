'use client'

import { signIn, useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Shield, Zap } from 'lucide-react'

export default function LoginPage() {
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) {
      router.push('/onboarding')
      router.refresh()
    }
  }, [session, router])

  return (
    <div
      className="min-h-dvh flex items-center justify-center relative overflow-hidden"
      style={{ background: '#050a14' }}
    >
      {/* SVG grid */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.015 }}>
        <defs>
          <pattern id="login-grid" width="56" height="56" patternUnits="userSpaceOnUse">
            <path d="M 56 0 L 0 0 0 56" fill="none" stroke="#4ade80" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#login-grid)" />
      </svg>

      {/* Ambient glow */}
      <div
        className="absolute top-[35%] left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full animate-drift pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(31,200,90,0.06) 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-[20%] right-[-10%] w-[400px] h-[400px] rounded-full animate-drift-delayed pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.04) 0%, transparent 70%)' }}
      />

      {/* Decorative rings */}
      <svg className="absolute top-[10%] right-[15%] pointer-events-none animate-drift" width="300" height="300" viewBox="0 0 300 300">
        <circle cx="150" cy="150" r="140" className="deco-ring" strokeWidth="0.5" />
        <circle cx="150" cy="150" r="100" className="deco-ring" strokeWidth="0.3" opacity="0.5" />
      </svg>
      <svg className="absolute bottom-[15%] left-[10%] pointer-events-none animate-drift-delayed" width="200" height="200" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="90" className="deco-ring-accent" strokeWidth="0.5" />
      </svg>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-[340px] mx-6"
      >
        <div
          className="rounded-3xl"
          style={{
            background: 'rgba(5,10,20,0.9)',
            backdropFilter: 'blur(28px)',
            border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: '0 40px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
            padding: '48px 40px',
          }}
        >
          {/* Logo mark */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #1fc85a, #16b84a)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(31,200,90,0.25)',
              }}
            >
              <span style={{ color: 'white', fontWeight: 700, fontSize: '20px' }}>W</span>
            </div>
          </div>

          {/* Heading */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'white', marginBottom: '8px', fontFamily: 'inherit', letterSpacing: '-0.01em' }}>
              WordCrammer
            </h1>
            <p style={{ fontSize: '14px', color: 'rgba(148,163,184,0.6)' }}>
              Your vocabulary companion
            </p>
          </div>

          {/* Google button — understated ghost style */}
          <button
            onClick={() => signIn('google', { callbackUrl: '/cram' })}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '13px 20px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.75)',
              fontSize: '13px',
              fontWeight: 500,
              border: '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>
        </div>

        {/* Trust line */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
            marginTop: '24px',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'rgba(148,163,184,0.6)' }}>
            <Shield style={{ width: '13px', height: '13px', color: 'rgba(74,222,128,0.55)' }} />
            No credit card
          </span>
          <div style={{ width: '1px', height: '10px', background: 'rgba(255,255,255,0.08)' }} />
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'rgba(148,163,184,0.6)' }}>
            <Zap style={{ width: '13px', height: '13px', color: 'rgba(74,222,128,0.55)' }} />
            Free forever
          </span>
        </div>

        <p
          style={{
            textAlign: 'center',
            fontSize: '12px',
            color: 'rgba(148,163,184,0.45)',
            marginTop: '18px',
            lineHeight: 1.5,
          }}
        >
          By continuing, you agree to our terms of service.
        </p>
      </motion.div>
    </div>
  )
}
