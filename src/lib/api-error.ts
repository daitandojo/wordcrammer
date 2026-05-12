const PREFIX = '[WordCrammer]'

export function logError(context: string, error: unknown, meta?: Record<string, unknown>) {
  const message = error instanceof Error ? error.message : String(error)
  const stack = error instanceof Error ? error.stack : undefined
  console.error(`${PREFIX} ${context}: ${message}`, meta ?? '', stack ?? '')
}

export function apiError(context: string, error: unknown) {
  logError(context, error)
  const message = error instanceof Error ? error.message : 'An unexpected error occurred'
  return { error: message }
}
