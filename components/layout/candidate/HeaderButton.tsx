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
        "px-5 py-2.5 rounded-lg font-bold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#006b7a]/50 active:scale-[0.98] cursor-pointer inline-flex items-center justify-center";

    const style =
        variant === "solid"
            ? "bg-[#006b7a] text-white hover:bg-[#005a66] shadow-sm hover:shadow"
            : variant === "outline"
                ? "border border-[#006b7a] text-[#006b7a] bg-white hover:bg-[#006b7a]/5"
                : "bg-gray-100 text-gray-700 hover:bg-gray-250";

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