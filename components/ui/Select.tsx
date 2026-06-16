import { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export default function Select({ label, id, className, children, error, ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <select
        id={id}
        className={cn(
          "block w-full rounded-md border border-slate-200 bg-white px-3.5 py-2 text-sm outline-none transition-colors duration-150 focus:border-[#00B14F] focus:ring-1 focus:ring-[#00B14F] cursor-pointer",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500",
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1.5 text-xs font-medium text-red-650">{error}</p>}
    </div>
  );
}
