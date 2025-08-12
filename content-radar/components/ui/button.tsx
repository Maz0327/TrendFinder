import * as React from "react";
import clsx from "clsx";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "ghost" | "outline";
  size?: "sm" | "md";
  asChild?: boolean;
  className?: string;
};

export function Button({
  variant = "default",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  const base = "inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm transition focus:outline-none";
  const variants = {
    default: "bg-white/10 hover:bg-white/15 border border-white/10",
    ghost: "hover:bg-white/10",
    outline: "border border-white/15 hover:bg-white/10",
  };
  const sizes = { sm: "h-8", md: "h-10" };
  return <button className={clsx(base, variants[variant], sizes[size], className)} {...props} />;
}