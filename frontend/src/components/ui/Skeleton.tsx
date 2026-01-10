interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-slate-200 dark:bg-slate-700/50 rounded ${className}`}
    />
  )
}

export function ProjectCardSkeleton() {
  return (
    <div className="glass rounded-xl p-6 space-y-4">
      <div className="flex items-start justify-between">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex items-center gap-4 pt-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  )
}

export function TaskCardSkeleton() {
  return (
    <div className="glass rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-4 w-full" />
      <div className="flex items-center gap-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  )
}

export function ProjectDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass rounded-xl p-4">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <TaskCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
