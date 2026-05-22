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
        "px-5 py-2 rounded-full font-semibold text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-green-500";

    const style =
        variant === "solid"
            ? "bg-green-600 text-white hover:bg-green-700"
            : variant === "outline"
                ? "border border-green-600 text-green-600 bg-white hover:bg-green-50"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200";

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