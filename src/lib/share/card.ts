export async function generateShareCard(params: {
  username: string
  setTitle: string
  mastered: number
  total: number
  absorption: number
  streak?: number
  level?: number
}): Promise<string> {
  // Returns an SVG string that can be shared as an image
  const pct = Math.round((params.mastered / params.total) * 100)
  const streakText = params.streak ? ` · ${params.streak}-day streak 🔥` : ''

  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0b1120"/>
        <stop offset="100%" stop-color="#1a1a3e"/>
      </linearGradient>
    </defs>
    <rect width="600" height="400" fill="url(#bg)" rx="24"/>
    <rect x="16" y="16" width="568" height="368" rx="16" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
    <text x="300" y="80" font-family="system-ui,sans-serif" font-size="36" font-weight="700" fill="white" text-anchor="middle">WordCrammer</text>
    <text x="300" y="120" font-family="system-ui,sans-serif" font-size="18" fill="#60a5fa" text-anchor="middle">I just completed a set!</text>
    <text x="300" y="170" font-family="system-ui,sans-serif" font-size="22" font-weight="600" fill="white" text-anchor="middle">${escapeXml(params.setTitle)}</text>
    <text x="300" y="210" font-family="system-ui,sans-serif" font-size="48" font-weight="700" fill="#22c55e" text-anchor="middle">${params.mastered}/${params.total}</text>
    <text x="300" y="240" font-family="system-ui,sans-serif" font-size="16" fill="#94a3b8" text-anchor="middle">phrases mastered (${pct}%)</text>
    <text x="300" y="280" font-family="system-ui,sans-serif" font-size="16" fill="#eab308" text-anchor="middle">Absorption: ${params.absorption}/10${streakText}</text>
    <text x="300" y="340" font-family="system-ui,sans-serif" font-size="14" fill="#64748b" text-anchor="middle">wordcrammer.app · Join 1,000+ crammers</text>
  </svg>`
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
