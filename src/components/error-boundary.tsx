'use client'

import { Component, type ReactNode, type ErrorInfo } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

type Props = { children: ReactNode; fallback?: ReactNode }
type State = { hasError: boolean; error?: Error }

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Error boundary caught:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-400 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
          <p className="text-sm text-slate-400 mb-6 max-w-md">
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary px-5 py-2 text-sm"
          >
            <RefreshCw className="w-4 h-4" /> Refresh Page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
