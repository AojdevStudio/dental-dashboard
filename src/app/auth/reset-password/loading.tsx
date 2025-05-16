import { Skeleton } from "@/components/ui/skeleton"

export default function ResetPasswordLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#121212] relative overflow-hidden w-full rounded-xl">
      <div className="relative z-10 w-full max-w-sm rounded-3xl bg-gradient-to-r from-[#ffffff10] to-[#121212] backdrop-blur-sm shadow-2xl p-8 flex flex-col items-center">
        {/* Logo skeleton */}
        <Skeleton className="w-24 h-24 rounded-full bg-white/10 mb-6" />
        
        {/* Title skeleton */}
        <Skeleton className="h-8 w-48 bg-white/10 mb-6 rounded-lg" />
        
        {/* Form skeleton */}
        <div className="flex flex-col w-full gap-4">
          <div className="w-full flex flex-col gap-3">
            <Skeleton className="w-full h-12 rounded-xl bg-white/10" />
          </div>
          <Skeleton className="w-full h-px bg-white/10 my-2" />
          <Skeleton className="w-full h-12 rounded-full bg-white/10" />
          <Skeleton className="w-32 h-4 rounded-md bg-white/10 mx-auto mt-2" />
        </div>
      </div>
    </div>
  )
}
