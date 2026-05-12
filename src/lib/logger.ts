const LEVELS = ['error', 'warn', 'info', 'http', 'debug'] as const

type Level = (typeof LEVELS)[number]

const COLORS: Record<Level, string> = {
  error: '\x1b[31m',
  warn: '\x1b[33m',
  info: '\x1b[32m',
  http: '\x1b[35m',
  debug: '\x1b[37m',
}

const RESET = '\x1b[0m'

function timestamp() {
  return new Date().toISOString()
}

function format(level: Level, message: string) {
  const color = COLORS[level] || ''
  return `${color}${timestamp()} ${level.toUpperCase()}: ${message}${RESET}`
}

const logger: Record<Level, (...args: unknown[]) => void> = {} as Record<Level, (...args: unknown[]) => void>

for (const level of LEVELS) {
  logger[level] = (...args: unknown[]) => {
    const msg = args
      .map((arg) => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg)))
      .join(' ')
    const output = format(level, msg)
    if (level === 'error') console.error(output)
    else if (level === 'warn') console.warn(output)
    else if (level === 'info' || level === 'http') console.info(output)
    else console.log(output)
  }
}

export default logger
