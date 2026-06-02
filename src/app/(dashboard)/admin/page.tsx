import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'WordCrammer - Admin',
}

export default async function AdminPage() {
  const session = await auth()
  if (session?.user?.email !== 'reconozco@gmail.com') {
    redirect('/dashboard')
  }

  return (
    <div className="app-main min-h-dvh flex flex-col max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">Admin Panel</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Manage vocabulary sets, users, and system settings.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AdminCard
          href="/sets"
          title="Curriculum Manager"
          description="Edit standard vocabulary sets, manage modules, bulk import content."
          color="#22c55e"
        />
        <AdminCard
          href="/admin/users"
          title="User Management"
          description="View user stats, manage accounts, review activity logs."
          color="#3b82f6"
        />
        <AdminCard
          href="/admin/content"
          title="Content Library"
          description="Browse all vocabulary items, manage tags and grammar categories."
          color="#a855f7"
        />
      </div>

      <div className="glass rounded-2xl p-5 border border-white/5">
        <h2 className="text-sm font-semibold text-slate-300 mb-4">System Stats</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Stat label="Total Users" value="—" />
          <Stat label="Total Sessions" value="—" />
          <Stat label="Vocab Items" value="—" />
          <Stat label="Avg. Accuracy" value="—" />
        </div>
      </div>

      <div className="glass rounded-2xl p-5 border border-white/5">
        <h2 className="text-sm font-semibold text-slate-300 mb-4">Recent Activity</h2>
        <p className="text-slate-500 text-sm">No recent activity to display.</p>
      </div>
    </div>
  )
}

function AdminCard({
  href,
  title,
  description,
  color,
}: {
  href: string
  title: string
  description: string
  color: string
}) {
  return (
    <a
      href={href}
      className="glass rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-all group"
    >
      <div
        className="w-2 h-8 rounded-full mb-3"
        style={{ background: color }}
      />
      <h3 className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
        {title}
      </h3>
      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{description}</p>
    </a>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-xl font-bold text-white">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  )
}