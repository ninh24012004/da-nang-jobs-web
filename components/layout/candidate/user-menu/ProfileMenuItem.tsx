import Link from "next/link";

interface ProfileMenuItemProps {
    label: string;
    href?: string;
}

export default function ProfileMenuItem({
    label,
    href = "#",
}: ProfileMenuItemProps) {
    return (
        <Link
            href={href}
            className="block text-sm text-gray-600 hover:text-green-600 transition-colors"
        >
            {label}
        </Link>
    );
}