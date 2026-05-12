import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/sidebar'
import Navbar from '@/components/navbar'

export const metadata: Metadata = {
  title: 'WordCrammer - Dashboard',
  description:
    'Track your language learning progress, start a new cram session, or review your stats.',
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-[#050a14]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
