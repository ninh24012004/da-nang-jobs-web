import Link from "next/link";
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
    return (
        <div className="relative group">
            <Link
                href={href}
                className="flex items-center gap-1 px-3 py-2 text-gray-700 font-medium hover:text-green-600 transition-colors"
            >
                <span>{label}</span>

                {hasDropdown && (
                    <>
                        <ChevronDown className="w-4 h-4 text-gray-400 group-hover:hidden" />
                        <ChevronUp className="w-4 h-4 text-green-600 hidden group-hover:block" />
                    </>
                )}
            </Link>

            {children}
        </div>
    );
}