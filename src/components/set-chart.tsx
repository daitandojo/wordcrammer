'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

type TopicStats = {
  topiccode: string
  topictitle: string
  total: number
  mastered: number
  pct: number
  bestAttempts?: number
  completions?: number
}

function getBarColor(pct: number) {
  if (pct >= 100) return '#22c55e'
  if (pct > 0) return '#3b82f6'
  return 'rgba(255,255,255,0.08)'
}

export default function SetChart({ data }: { data: TopicStats[] }) {
  const chartData = data.map((d) => ({
    ...d,
    shortName: d.topictitle.length > 12 ? d.topictitle.substring(0, 12) + '…' : d.topictitle,
  }))

  return (
    <div className="glass rounded-2xl p-5 border border-white/5 animate-slide-up flex flex-col min-h-0">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 shrink-0">
        Set Completion
      </h3>
      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
            <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="shortName"
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={80}
            />
            <Tooltip
              contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
              cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              formatter={(value, _name, props) => {
                const d = props.payload as TopicStats
                const lines = [`${d.mastered}/${d.total} mastered (${d.pct}%)`]
                if (d.bestAttempts) lines.push(`${d.bestAttempts} attempts (best)`)
                if (d.completions) lines.push(`${d.completions} users completed`)
                return [lines.join('\n'), '']
              }}
            />
            <Bar dataKey="pct" radius={[0, 4, 4, 0]} barSize={12}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={getBarColor(entry.pct)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
