interface Props {
    children: React.ReactNode;
    bordered?: boolean;
}

export default function MegaMenuColumn({
    children,
    bordered,
}: Props) {
    return (
        <div
            className={`px-5 py-6 ${bordered
                ? "border-r border-gray-100"
                : ""
                }`}
        >
            {children}
        </div>
    );
}