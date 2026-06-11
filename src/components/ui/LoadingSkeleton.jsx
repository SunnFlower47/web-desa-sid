import React from 'react';

export default function LoadingSkeleton({ 
  type = 'card', // 'card', 'text', 'avatar', 'list'
  count = 1,
  className = '' 
}) {
  const Skeletons = Array(count).fill(0).map((_, i) => {
    switch (type) {
      case 'text':
        return (
          <div key={i} className={`flex flex-col gap-2 ${className}`}>
            <div className="h-4 bg-slate-200 rounded-full w-3/4 animate-pulse" />
            <div className="h-4 bg-slate-200 rounded-full w-full animate-pulse" />
            <div className="h-4 bg-slate-200 rounded-full w-5/6 animate-pulse" />
          </div>
        );
      case 'avatar':
        return (
          <div key={i} className={`h-12 w-12 rounded-full bg-slate-200 animate-pulse ${className}`} />
        );
      case 'list':
        return (
          <div key={i} className={`flex items-center gap-4 py-3 border-b border-slate-100 ${className}`}>
            <div className="h-10 w-10 rounded-xl bg-slate-200 animate-pulse" />
            <div className="flex-1 flex flex-col gap-2">
              <div className="h-3 bg-slate-200 rounded-full w-1/3 animate-pulse" />
              <div className="h-3 bg-slate-200 rounded-full w-2/3 animate-pulse" />
            </div>
          </div>
        );
      case 'card':
      default:
        return (
          <div key={i} className={`bg-white/50 border border-slate-100 rounded-3xl p-6 overflow-hidden relative ${className}`}>
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            <div className="h-40 bg-slate-100 rounded-2xl animate-pulse mb-6" />
            <div className="h-5 bg-slate-200 rounded-full w-2/3 animate-pulse mb-3" />
            <div className="h-4 bg-slate-100 rounded-full w-full animate-pulse mb-2" />
            <div className="h-4 bg-slate-100 rounded-full w-4/5 animate-pulse" />
          </div>
        );
    }
  });

  return <>{Skeletons}</>;
}
