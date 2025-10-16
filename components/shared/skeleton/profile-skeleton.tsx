import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileSkeleton() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Cover + avatar */}
      <div className="relative">
        <Skeleton className="h-40 w-full" />
        <div className="absolute -bottom-10 left-6 flex items-end gap-4">
          <Skeleton className="h-24 w-24 rounded-2xl" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
        </div>
      </div>

      {/* Form card */}
      <div className="pt-16 px-4">
        <div className="mx-auto w-full max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          {/* Full name */}
          <div className="mb-4">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>

          {/* Bio */}
          <div className="mb-4">
            <Skeleton className="h-4 w-12 mb-2" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>

          {/* Address */}
          <div className="mb-4">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>

          {/* Images */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <Skeleton className="h-4 w-28 mb-2" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <Skeleton className="h-10 w-36 rounded-xl" />
          </div>
        </div>

        {/* Delete button placeholder */}
        <div className="mx-auto w-full max-w-2xl">
          <Skeleton className="h-10 w-full mt-4 rounded-xl" />
        </div>
      </div>
    </main>
  );
}
