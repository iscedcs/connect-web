import { Skeleton } from "@/components/ui/skeleton";

export function DevicesListSkeleton() {
  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-9 w-24 rounded-full" />
      </div>

      <div className="space-y-6">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="border border-white/10 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="w-9 h-9 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
              <Skeleton className="h-3 w-16" />
            </div>

            {/* collapsed actions hint */}
            <div className="grid grid-cols-3 gap-3 text-center">
              {[0, 1, 2].map((k) => (
                <div key={k} className="flex flex-col items-center gap-2">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <Skeleton className="h-3 w-14" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
