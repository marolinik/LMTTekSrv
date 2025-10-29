import { Loader2 } from 'lucide-react';

interface LoaderProps {
  variant?: 'spinner' | 'dots';
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export const Loader = ({ variant = 'spinner', size = 'md', text }: LoaderProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  if (variant === 'spinner') {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-8">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
        {text && <p className="text-sm text-muted-foreground">{text}</p>}
      </div>
    );
  }

  // Bouncing dots variant
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div className="flex space-x-2">
        <div className="h-3 w-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="h-3 w-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="h-3 w-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
};
