import Link from "next/link";

interface Props {
    href: string;
    label: string;
    icon?: React.ReactNode;
    active?: boolean;
    badge?: string;
}

export default function MegaMenuItem({
    href,
    label,
    icon,
    active,
    badge,
}: Props) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-150
            ${active
                    ? "text-[#006b7a] bg-[#006b7a]/5 font-bold"
                    : "text-gray-800 hover:text-[#006b7a] hover:bg-gray-50"
                }`}
        >
            <span className="w-5 h-5 text-gray-400">
                {icon}
            </span>

            <span className="text-sm font-medium">
                {label}
            </span>

            {badge && (
                <span className="ml-auto text-xs font-semibold bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                    {badge}
                </span>
            )}
        </Link>
    );
}