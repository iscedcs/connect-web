import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileSkeleton() {
  return (
    <main className="min-h-screen bg-black text-white animate-in fade-in duration-300">
      {/* Cover */}
      <div className="relative w-full h-44 overflow-hidden">
        <Skeleton className="absolute inset-0 w-full h-full rounded-none" />

        {/* Avatar + Name */}
        <div className="absolute -bottom-12 left-6 flex items-end gap-4">
          <Skeleton className="h-24 w-24 rounded-2xl ring-4 ring-black" />

          <div className="flex flex-col gap-3">
            <Skeleton className="h-5 w-40 rounded-md" />
            <Skeleton className="h-4 w-28 rounded-md" />
          </div>
        </div>
      </div>

      {/* Form area */}
      <div className="pt-20 pb-12 px-4">
        <div className="mx-auto w-full max-w-screen-sm space-y-6">
          {/* Title */}
          <Skeleton className="h-7 w-64 rounded-md" />

          {/* Full name */}
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>

          {/* Position */}
          <div className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>

          {/* Google Address Autocomplete */}
          <div className="space-y-2">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>

          {/* Profile Image */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-28 w-full rounded-xl" />
          </div>

          {/* Cover Image */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>

          {/* Submit Button */}
          <Skeleton className="h-12 w-full rounded-xl" />

          {/* Delete row placeholder */}
          <Skeleton className="h-10 w-full rounded-xl opacity-60" />
        </div>
      </div>
    </main>
  );
}
