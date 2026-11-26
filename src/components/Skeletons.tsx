import React from "react";

export function StorefrontSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 space-y-10 animate-pulse">
      {/* Hero Bento Skeleton */}
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="h-[360px] rounded-3xl bg-gray-200/80 lg:col-span-8" />
        <div className="grid gap-4 lg:col-span-4">
          <div className="h-[172px] rounded-3xl bg-gray-200/70" />
          <div className="h-[172px] rounded-3xl bg-gray-200/70" />
        </div>
      </div>

      {/* Category Tiles Skeleton */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-gray-100 bg-white p-2 space-y-2">
            <div className="aspect-[4/3] rounded-xl bg-gray-200/80" />
            <div className="mx-auto h-3 w-3/4 rounded bg-gray-200/80" />
          </div>
        ))}
      </div>

      {/* Product Grid Skeleton */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
            <div className="aspect-[4/3] bg-gray-200/80" />
            <div className="p-4 space-y-2.5">
              <div className="h-3 w-1/3 rounded bg-gray-200/70" />
              <div className="h-4 w-4/5 rounded bg-gray-200/80" />
              <div className="h-3 w-1/2 rounded bg-gray-200/60" />
              <div className="flex justify-between pt-2">
                <div className="h-6 w-14 rounded bg-gray-200/80" />
                <div className="h-8 w-20 rounded-xl bg-gray-200/80" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 animate-pulse">
      <div className="h-4 w-32 rounded bg-gray-200/80 mb-6" />
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="aspect-square rounded-3xl bg-gray-200/80 lg:col-span-5" />
        <div className="space-y-5 lg:col-span-7">
          <div className="flex gap-2">
            <div className="h-6 w-28 rounded-full bg-gray-200/70" />
            <div className="h-6 w-24 rounded-full bg-gray-200/70" />
          </div>
          <div className="h-9 w-2/3 rounded-xl bg-gray-200/80" />
          <div className="h-4 w-1/2 rounded bg-gray-200/70" />
          <div className="h-20 w-full rounded-xl bg-gray-200/60" />
          <div className="flex gap-3">
            <div className="h-14 w-24 rounded-2xl bg-gray-200/80" />
            <div className="h-14 w-24 rounded-2xl bg-gray-200/80" />
            <div className="h-14 w-24 rounded-2xl bg-gray-200/80" />
          </div>
          <div className="h-20 w-full rounded-3xl bg-gray-200/80" />
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 space-y-6 animate-pulse">
      <div className="h-20 rounded-2xl bg-gray-200/80" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-gray-200/75" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="h-72 rounded-2xl bg-gray-200/75 lg:col-span-7" />
        <div className="h-72 rounded-2xl bg-gray-200/75 lg:col-span-5" />
      </div>
    </div>
  );
}

export function CardRowSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-24 rounded-2xl bg-gray-200/75" />
      ))}
    </div>
  );
}
