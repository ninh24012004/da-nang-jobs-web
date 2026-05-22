import Link from "next/link";

export default function LogoIcon() {
    return (
        <Link
            href="/candidate"
            className="group inline-block select-none"
        >
            <h1 className="text-4xl font-bold tracking-tight">
                <span className="text-black dark:text-white">DN</span>{" "}
                <span className="text-[#006b7a]">CAREER</span>
            </h1>
        </Link>
    );
}