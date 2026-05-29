import Link from "next/link";

interface Props {
    href: string;
    label: string;
}

export default function MegaMenuTextLink({
    href,
    label,
}: Props) {
    return (
        <Link
            href={href}
            className="block py-1.5 text-sm font-medium text-gray-800 hover:text-[#006b7a] transition-colors"
        >
            {label}
        </Link>
    );
}