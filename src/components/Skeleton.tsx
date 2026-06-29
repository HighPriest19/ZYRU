import React from 'react';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-editorial-text/5 rounded-none ${className}`} />
  );
}

export function ProductSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="aspect-[3/4] w-full" />
      <div className="space-y-2">
        <Skeleton className="h-2 w-1/4" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-1/6" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
    </div>
  );
}

export function OrderRowSkeleton() {
  return (
    <tr className="border-b border-editorial-text/5">
      <td className="p-6"><Skeleton className="h-3 w-20" /></td>
      <td className="p-6"><Skeleton className="h-3 w-32" /></td>
      <td className="p-6"><Skeleton className="h-3 w-12" /></td>
      <td className="p-6"><Skeleton className="h-3 w-16" /></td>
      <td className="p-6"><Skeleton className="h-5 w-20 rounded-full" /></td>
      <td className="p-6"><Skeleton className="h-6 w-24" /></td>
    </tr>
  );
}
