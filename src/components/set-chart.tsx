'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

type TopicStats = { topiccode: string; topictitle: string; total: number; mastered: number; pct: number }

export default function SetChart({ data }: { data: TopicStats[] }) {
  return (
    <div className="glass rounded-2xl p-4 sm:p-5 border border-white/5 animate-slide-up">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
        Set Completion
      </h3>
      <div className="h-48 sm:h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: 40, bottom: 0 }}>
            <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="topiccode"
              tick={{ fill: '#64748b', fontSize: 9 }}
              axisLine={false}
              tickLine={false}
              width={50}
              tickFormatter={(v: string) => v.replace('SET', '')}
            />
            <Tooltip
              contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
              cursor={{ fill: 'rgba(255,255,255,0.03)' }}
            />
            <Bar dataKey="pct" radius={[0, 4, 4, 0]} barSize={10}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.pct >= 100 ? '#22c55e' : entry.pct > 0 ? '#3b82f6' : 'rgba(255,255,255,0.08)'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
