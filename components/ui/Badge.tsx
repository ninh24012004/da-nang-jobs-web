import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "success" | "warning" | "danger" | "info" | "gray";
  className?: string;
}

export default function Badge({ children, variant = "gray", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border leading-none select-none",
        variant === "primary" && "bg-[#00B14F]/10 text-[#00B14F] border-[#00B14F]/20",
        variant === "secondary" && "bg-[#0F172A]/10 text-[#0F172A] border-[#0F172A]/20",
        variant === "success" && "bg-emerald-50 text-[#16A34A] border-emerald-100",
        variant === "warning" && "bg-amber-50 text-[#D97706] border-amber-100",
        variant === "danger" && "bg-rose-50 text-[#DC2626] border-rose-100",
        variant === "info" && "bg-blue-50 text-[#2563EB] border-blue-100",
        variant === "gray" && "bg-slate-50 text-slate-600 border-slate-200",
        className
      )}
    >
      {children}
    </span>
  );
}
