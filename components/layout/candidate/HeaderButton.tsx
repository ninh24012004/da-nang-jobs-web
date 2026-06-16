import React from "react";
import Link from "next/link";
import type { LinkProps } from "next/link";

type HeaderButtonProps = {
    variant?: "solid" | "outline" | "gray";
    href?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement> &
    Partial<LinkProps>;

export default function HeaderButton({
    children,
    variant = "solid",
    href,
    ...props
}: HeaderButtonProps) {
    const base =
        "px-4 py-2 rounded-md font-bold text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#00B14F]/50 cursor-pointer inline-flex items-center justify-center";

    const style =
        variant === "solid"
            ? "bg-[#00B14F] text-white hover:bg-[#00873D] shadow-sm"
            : variant === "outline"
                ? "border border-[#00B14F] text-[#00B14F] bg-white hover:bg-[#00B14F]/5"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200";

    if (href) {
        return (
            <Link href={href} className={`${base} ${style}`}>
                {children}
            </Link>
        );
    }

    return (
        <button className={`${base} ${style}`} {...props}>
            {children}
        </button>
    );
}