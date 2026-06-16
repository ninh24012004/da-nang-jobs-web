import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "outline";
    isLoading?: boolean;
};

export default function Button({
    className,
    variant = "primary",
    isLoading = false,
    children,
    ...props
}: ButtonProps) {
    return (
        <button
            className={cn(
                "flex w-full items-center justify-center rounded-[6px] px-4 py-2 text-sm font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-70",

                variant === "primary" &&
                "bg-[#00B14F] text-white hover:bg-[#00873D]",

                variant === "secondary" &&
                "bg-[#0F172A] text-white hover:bg-[#1E293B]",

                variant === "outline" &&
                "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",

                className
            )}
            disabled={isLoading}
            {...props}
        >
            {isLoading ? (
                <div className="flex items-center gap-2">
                    <div
                        className={cn(
                            "h-4 w-4 animate-spin rounded-full border-2 border-t-transparent",
                            variant === "primary" || variant === "secondary"
                                ? "border-white"
                                : "border-slate-600"
                        )}
                    />

                    <span>Đang tải...</span>
                </div>
            ) : (
                children
            )}
        </button>
    );
}