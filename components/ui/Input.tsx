"use client";

import { InputHTMLAttributes, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    error?: string;
    variant?: "primary" | "secondary";
};

export default function Input({
    label,
    id,
    className,
    type,
    error,
    variant = "primary",
    ...props
}: InputProps) {
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === "password";

    return (
        <div className="w-full">
            <label
                htmlFor={id}
                className="mb-1.5 block text-sm font-medium text-slate-700"
            >
                {label}
            </label>

            <div className="relative">
                <input
                    id={id}
                    type={isPassword ? (showPassword ? "text" : "password") : type}
                    className={cn(
                        "block w-full rounded-[6px] border px-3.5 py-2 text-sm outline-none transition-colors duration-150 focus:ring-1",

                        error
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                            : variant === "primary"
                            ? "border-slate-200 focus:border-[#00B14F] focus:ring-[#00B14F]"
                            : "border-slate-200 focus:border-[#0F172A] focus:ring-[#0F172A]",

                        isPassword && "pr-12",

                        className
                    )}
                    {...props}
                />

                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute p-2 right-0 top-1/2 -translate-y-1/2 flex items-center justify-center text-slate-400 border-none bg-transparent"
                    >
                        {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </button>
                )}
            </div>
            {error && (
                <p className="mt-1.5 text-xs font-medium text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}