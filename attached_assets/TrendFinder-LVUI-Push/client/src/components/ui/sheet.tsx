// Simple sheet component implementation using existing Radix components
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

interface SheetContentProps {
  side?: "left" | "right";
  className?: string;
  children: ReactNode;
}

interface SheetTriggerProps {
  asChild?: boolean;
  children: ReactNode;
}

export function Sheet({ open, onOpenChange, children }: SheetProps) {
  return <>{children}</>;
}

export function SheetTrigger({ children }: SheetTriggerProps) {
  return <>{children}</>;
}

export function SheetContent({ side = "left", className, children }: SheetContentProps) {
  return (
    <div className={cn("sheet-content", className)}>
      {children}
    </div>
  );
}