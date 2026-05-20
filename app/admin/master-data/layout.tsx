"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Layers,
    Zap,
    Briefcase,
    MapPin,
    TrendingUp,
    Settings2
} from "lucide-react";
import { cn } from "@/lib/utils";

const masterDataTabs = [
    {
        name: "Danh mục ngành nghề",
        href: "/admin/master-data/job-categories",
        icon: Layers
    },
    {
        name: "Kỹ năng",
        href: "/admin/master-data/skills",
        icon: Zap
    },
    {
        name: "Loại công việc",
        href: "/admin/master-data/job-types",
        icon: Briefcase
    },
    {
        name: "Cấp bậc",
        href: "/admin/master-data/levels",
        icon: TrendingUp
    },
    {
        name: "Địa điểm",
        href: "/admin/master-data/locations",
        icon: MapPin
    },
];

export default function MasterDataLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <div className="space-y-6">
            {/* Master Data Navigation Bar */}
            <div className="bg-white p-1 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-1 overflow-x-auto no-scrollbar">
                {masterDataTabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = pathname === tab.href;

                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={cn(
                                "flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all duration-200",
                                isActive
                                    ? "bg-[#006B7A] text-white shadow-lg shadow-[#006B7A]/20"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            <Icon className={cn("w-4 h-4", isActive ? "text-white" : "text-gray-400")} />
                            {tab.name}
                        </Link>
                    );
                })}
            </div>

            {/* Page Content */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {children}
            </div>
        </div>
    );
}
