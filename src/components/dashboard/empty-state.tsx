import React from "react";
import { LucideIcon, Plus, FileQuestion } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  customIcon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon = FileQuestion,
  customIcon,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex h-[400px] w-full flex-col items-center justify-center rounded-lg border border-dashed border-border bg-background/50 p-8 text-center animate-in fade-in zoom-in-95 duration-500 ${className}`}
    >
      {customIcon ? (
        <div className='mb-6'>{customIcon}</div>
      ) : (
        <div className='flex h-20 w-20 items-center justify-center rounded-full bg-accent/20 mb-6'>
          <Icon className='h-10 w-10 text-muted-foreground/50' />
        </div>
      )}

      <h3 className='mb-2 text-xl font-semibold tracking-tight'>{title}</h3>
      <p className='mb-6 max-w-sm text-sm text-muted-foreground'>{description}</p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className='inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
        >
          <Plus className='h-4 w-4' />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}
