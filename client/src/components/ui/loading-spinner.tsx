import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8"
  };

  return (
    <Loader2 
      className={cn(
        "animate-spin text-primary",
        sizeClasses[size],
        className
      )} 
    />
  );
}

interface LoadingStateProps {
  title?: string;
  subtitle?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingState({ 
  title = "Loading...", 
  subtitle,
  size = "md",
  className 
}: LoadingStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-8", className)}>
      <LoadingSpinner size={size} />
      <p className="mt-3 text-sm font-medium text-muted-foreground">{title}</p>
      {subtitle && (
        <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}