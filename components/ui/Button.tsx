import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "outline";
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
                "flex w-full items-center justify-center rounded-md py-3.5 text-lg font-bold transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70",

                variant === "primary" &&
                "bg-[#006b7a] text-white hover:bg-[#005a66]",

                variant === "outline" &&
                "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50",

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
                            variant === "primary"
                                ? "border-white"
                                : "border-gray-600"
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