"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Props {
    label: string;
    href: string;
    hasDropdown?: boolean;
    children?: React.ReactNode;
}

export default function NavigationItem({
    label,
    href,
    hasDropdown,
    children,
}: Props) {
    const pathname = usePathname();

    // Check if the current route matches this item's path
    const isActive =
        (href === "/jobs" && pathname.startsWith("/jobs")) ||
        (href.startsWith("/candidate/profile") && pathname.startsWith("/candidate/profile")) ||
        (href === "/candidate/companies" && pathname.startsWith("/candidate/companies"));

    return (
        <div className="relative group">
            <Link
                href={href}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    isActive
                        ? "text-[#006b7a] bg-[#006b7a]/5 font-black"
                        : "text-gray-650 hover:text-[#006b7a] hover:bg-gray-50"
                }`}
            >
                <span>{label}</span>

                {hasDropdown && (
                    <>
                        <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:hidden transition-transform" />
                        <ChevronUp className="w-3.5 h-3.5 text-[#006b7a] hidden group-hover:block transition-transform" />
                    </>
                )}
            </Link>

            {children}
        </div>
    );
}