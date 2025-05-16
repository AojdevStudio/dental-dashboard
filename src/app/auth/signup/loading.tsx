import { Skeleton } from '@/components/ui/skeleton'

export default function SignupLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212]">
      <div className="w-full max-w-sm p-8">
        <Skeleton className="h-24 w-24 rounded-full mb-6 mx-auto" />
        <Skeleton className="h-8 w-2/3 mx-auto mb-6" />
        <Skeleton className="h-12 w-full mb-3" />
        <Skeleton className="h-12 w-full mb-3" />
        <Skeleton className="h-12 w-full mb-3" />
        <Skeleton className="h-12 w-full mb-3" />
        <Skeleton className="h-6 w-1/2 mx-auto" />
      </div>
    </div>
  )
} 