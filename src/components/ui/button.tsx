import React, { ButtonHTMLAttributes } from "react";
import { useUIStore } from "@/hooks/useUIStore";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const theme = useUIStore((state) => state.theme);
  const baseStyles = "inline-flex items-center justify-center font-semibold rounded-lg transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

  const variants = {
    primary: "bg-brand-accent hover:bg-red-600 text-white shadow-lg shadow-brand-accent/20",
    secondary: theme === "dark"
      ? "bg-brand-surface hover:bg-slate-700 text-white border border-gray-700"
      : "bg-slate-200 hover:bg-slate-300 text-slate-800 border border-slate-300",
    outline: theme === "dark"
      ? "bg-transparent hover:bg-white/5 text-white border border-gray-600"
      : "bg-transparent hover:bg-black/5 text-slate-800 border border-slate-300",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Cargando...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
