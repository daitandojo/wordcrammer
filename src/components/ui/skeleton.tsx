export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`shimmer rounded-xl ${className}`} />
}

export function CardSkeleton() {
  return (
    <div className="glass rounded-xl overflow-hidden border border-white/5">
      <Skeleton className="w-full h-20 rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </div>
  )
}

export function ProgressSkeleton() {
  return (
    <div className="glass rounded-2xl p-5 border border-white/5 space-y-4">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-48 w-full" />
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  )
}
