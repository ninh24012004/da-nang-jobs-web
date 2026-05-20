"use client";

import { InputHTMLAttributes, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    error?: string;
};

export default function Input({
    label,
    id,
    className,
    type,
    error,
    ...props
}: InputProps) {
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === "password";

    return (
        <div className="w-full">
            <label
                htmlFor={id}
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400"
            >
                {label}
            </label>

            <div className="relative">
                <input
                    id={id}
                    type={isPassword ? (showPassword ? "text" : "password") : type}
                    className={cn(
                        "block w-full rounded-md border px-4 py-3 outline-none transition-all focus:ring-1",

                        error
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                            : "border-gray-200 focus:border-[#006b7a] focus:ring-[#006b7a]",

                        isPassword && "pr-12",

                        className
                    )}
                    {...props}
                />

                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute p-2 right-0 top-1/2 -translate-y-1/2 flex items-center justify-center text-gray-400"
                    >
                        {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                        ) : (
                            <Eye className="h-5 w-5" />
                        )}
                    </button>
                )}
            </div>
            {error && (
                <p className="mt-2 text-sm font-medium text-red-500">
                    {error}
                </p>
            )}
        </div>
    );
}