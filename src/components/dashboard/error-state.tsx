import React from "react";
import { AlertCircle, RotateCw } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  description = "We encountered an error while loading your content. Please try again.",
  onRetry,
  className = "",
}: ErrorStateProps) {
  return (
    <div
      className={`flex h-[400px] w-full flex-col items-center justify-center rounded-lg border border-destructive/20 bg-destructive/5 p-8 text-center animate-in fade-in duration-300 ${className}`}
    >
      <div className='flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mb-4'>
        <AlertCircle className='h-8 w-8 text-destructive' />
      </div>

      <h3 className='mb-2 text-lg font-semibold text-foreground tracking-tight'>{title}</h3>
      <p className='mb-6 max-w-sm text-sm text-muted-foreground'>{description}</p>

      {onRetry && (
        <button
          onClick={onRetry}
          className='inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground'
        >
          <RotateCw className='h-4 w-4' />
          <span>Try again</span>
        </button>
      )}
    </div>
  );
}
