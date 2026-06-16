import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className }: CardProps) {
  return (
    <div className={cn("bg-white rounded-lg border border-slate-200 shadow-sm p-6", className)}>
      {children}
    </div>
  );
}
