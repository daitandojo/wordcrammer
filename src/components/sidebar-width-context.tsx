'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type SidebarWidthCtx = {
  width: number
  mounted: boolean
}

const ctx = createContext<SidebarWidthCtx>({ width: 240, mounted: false })

export function useSidebarWidth() {
  return useContext(ctx)
}

export function SidebarWidthSetter({ width, children }: { width: number; children: ReactNode }) {
  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', `${width}px`)
  }, [width])

  return <ctx.Provider value={{ width, mounted: true }}>{children}</ctx.Provider>
}