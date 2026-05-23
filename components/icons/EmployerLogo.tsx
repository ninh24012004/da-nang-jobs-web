import Link from "next/link";

export default function EmployerLogo() {
    return (
        <Link
            href="/employer"
            className="group inline-block select-none"
        >
            <h1 className="text-4xl font-bold tracking-tight">
                <span className="text-black dark:text-white">DN</span>{" "}
                <span className="text-[#006b7a]">JOS</span>
            </h1>
        </Link>
    );
}