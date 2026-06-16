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
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dữ liệu danh mục</h1>
                <p className="text-slate-500 mt-1 text-xs font-medium">
                    {activeTab?.name || "Quản lý dữ liệu nền"} · Thêm, sửa và xóa mục theo danh mục
                </p>
            </div>

            {/* Master Data Navigation Bar */}
            <div className="bg-white p-1 rounded-md border border-slate-200 shadow-sm flex items-center gap-1 overflow-x-auto no-scrollbar">
                {masterDataTabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = pathname === tab.href;

                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold whitespace-nowrap transition-colors duration-150",
                                isActive
                                    ? "bg-slate-900 text-white"
                                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            )}
                        >
                            <Icon className={cn("w-3.5 h-3.5", isActive ? "text-white" : "text-slate-405")} />
                            {tab.name}
                        </Link>
                    );
                })}
            </div>

            {/* Page Content */}
            <div className="transition-opacity duration-150">
                {children}
            </div>
        </div>
    );
}
