'use client'

import { useEffect } from 'react'

export default function SidebarCssVar({ width, visible }: { width: number; visible: boolean }) {
  useEffect(() => {
    const html = document.documentElement
    if (visible) {
      html.style.setProperty('--sidebar-width', `${width}px`)
      html.setAttribute('data-sidebar', 'open')
    } else {
      html.style.setProperty('--sidebar-width', '0px')
      html.setAttribute('data-sidebar', 'closed')
    }
  }, [width, visible])
  return null
}