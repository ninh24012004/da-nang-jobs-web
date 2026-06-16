import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  count?: number;
  className?: string;
}

export default function LoadingSkeleton({ count = 4, className }: LoadingSkeletonProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col md:flex-row justify-between gap-5 animate-pulse">
          <div className="flex gap-4 w-full">
            <div className="w-12 h-12 bg-slate-100 rounded-md flex-shrink-0"></div>
            <div className="space-y-2 flex-grow">
              <div className="h-3.5 bg-slate-100 rounded w-3/4"></div>
              <div className="h-2.5 bg-slate-100 rounded w-1/2"></div>
              <div className="h-2.5 bg-slate-100 rounded w-2/3"></div>
            </div>
          </div>
          <div className="w-24 h-8 bg-slate-100 rounded-md self-end md:self-center flex-shrink-0"></div>
        </div>
      ))}
    </div>
  );
}
