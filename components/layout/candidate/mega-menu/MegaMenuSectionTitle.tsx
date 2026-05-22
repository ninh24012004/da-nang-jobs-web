interface Props {
    title: string;
    className?: string;
}

export default function MegaMenuSectionTitle({
    title,
    className,
}: Props) {
    return (
        <h3
            className={`text-sm font-bold tracking-wide text-gray-400 ${className || ""}`}
        >
            {title}
        </h3>
    );
}