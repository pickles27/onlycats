"use client";

export const LoadingDots = () => {
  return (
    <div className="flex space-x-2" role="status">
      <div className="w-3 h-3 bg-sky-400 rounded-full animate-pulse"></div>
      <div className="w-3 h-3 bg-sky-500 rounded-full animate-pulse animation-delay-200"></div>
      <div className="w-3 h-3 bg-sky-600 rounded-full animate-pulse animation-delay-400"></div>
    </div>
  );
};
