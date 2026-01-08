import React from 'react';

// Base skeleton with shimmer animation
export function Skeleton({ className = '', rounded = 'rounded' }) {
  return (
    <div
      className={`bg-gray-200 animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] ${rounded} ${className}`}
    />
  );
}

// Card skeleton for experience/guide cards
export function CardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <Skeleton className="h-48 w-full" rounded="rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
    </div>
  );
}

// List skeleton for horizontal scrolling lists
export function ListSkeleton({ count = 4 }) {
  return (
    <div className="flex gap-6 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex-shrink-0 w-72">
          <CardSkeleton />
        </div>
      ))}
    </div>
  );
}

// Profile/Avatar skeleton
export function AvatarSkeleton({ size = 'md' }) {
  const sizes = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };
  return <Skeleton className={`${sizes[size]} rounded-full`} />;
}

// Text line skeleton
export function TextSkeleton({ lines = 3 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}
        />
      ))}
    </div>
  );
}

// Page section skeleton
export function SectionSkeleton({ title = true }) {
  return (
    <div className="space-y-4">
      {title && (
        <div className="flex justify-between items-center">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-5 w-16" />
        </div>
      )}
      <ListSkeleton />
    </div>
  );
}

// Traveler card skeleton (for nearby travelers)
export function TravelerSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4">
      <AvatarSkeleton size="md" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-10 w-24 rounded-xl" />
    </div>
  );
}

export default Skeleton;
