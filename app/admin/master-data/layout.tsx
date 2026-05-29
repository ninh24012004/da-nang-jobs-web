"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Layers,
    Zap,
    Briefcase,
    MapPin,
    TrendingUp
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
        href: "/admin/master-data/tags",
        icon: Briefcase
    },
    {
        name: "Cấp bậc",
        href: "/admin/master-data/positions",
        icon: TrendingUp
    },
    {
        name: "Kinh nghiệm",
        href: "/admin/master-data/experience-levels",
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
    const activeTab = masterDataTabs.find(t => t.href === pathname);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-xl font-extrabold text-gray-800 tracking-tight">Dữ liệu danh mục</h1>
                <p className="text-gray-400 mt-1 text-xs font-medium">
                    {activeTab?.name || "Quản lý dữ liệu nền"} · Thêm, sửa và xóa mục theo danh mục
                </p>
            </div>

            {/* Master Data Navigation Bar */}
            <div className="bg-white p-1.5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-1 overflow-x-auto no-scrollbar">
                {masterDataTabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = pathname === tab.href;

                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200",
                                isActive
                                    ? "bg-[#006B7A] text-white shadow-sm"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            <Icon className={cn("w-3.5 h-3.5", isActive ? "text-white" : "text-gray-400")} />
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
