"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Building,
    Briefcase,
    Layers,
    LogOut,
    ShieldAlert
} from "lucide-react";
import useAuth from "@/hooks/useAuth";
import LogoIcon from "@/components/icons/LogoIcon";

const navGroups = [
    {
        label: "Tổng quan",
        items: [
            { name: "Bảng điều khiển", href: "/admin/dashboard", icon: LayoutDashboard },
        ]
    },
    {
        label: "Quản lý người dùng",
        items: [
            { name: "Ứng viên & Tài khoản", href: "/admin/users", icon: Users },
            { name: "Nhà tuyển dụng", href: "/admin/employer", icon: Building },
        ]
    },
    {
        label: "Nội dung & Dữ liệu",
        items: [
            { name: "Tin tuyển dụng", href: "/admin/jobs", icon: Briefcase },
            { name: "Dữ liệu danh mục", href: "/admin/master-data/job-categories", icon: Layers },
        ]
    }
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const { logout } = useAuth();

    const isLinkActive = (href: string) => {
        if (href === "/admin/dashboard") return pathname === href;
        if (href === "/admin/employer") return pathname.startsWith("/admin/employer");
        if (href === "/admin/master-data/job-categories") return pathname.startsWith("/admin/master-data");
        return pathname.startsWith(href);
    };

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-gray-100 flex flex-col shadow-sm select-none">
            {/* Brand Logo */}
            <div className="px-5 py-5 border-b border-gray-100 flex items-center gap-3">
                <Link href="/admin/dashboard" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
                    <LogoIcon />
                    <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse shadow-[0_0_8px_rgba(20,184,166,0.8)]" />
                </Link>
                <span className="ml-auto text-[9px] font-extrabold uppercase tracking-widest text-gray-350 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                    ADMIN
                </span>
            </div>

            {/* Navigation Groups */}
            <nav className="flex-1 px-3 py-4 overflow-y-auto custom-scrollbar space-y-5">
                {navGroups.map((group) => (
                    <div key={group.label}>
                        <p className="text-[9px] font-extrabold uppercase tracking-widest text-gray-350 px-3 mb-1.5">
                            {group.label}
                        </p>
                        <div className="space-y-0.5">
                            {group.items.map((item) => {
                                const Icon = item.icon;
                                const isActive = isLinkActive(item.href);
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                                            isActive
                                                ? "text-[#006B7A] bg-[#006B7A]/8 shadow-xs"
                                                : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                                        }`}
                                    >
                                        <Icon
                                            className={`h-4 w-4 flex-shrink-0 transition-colors ${
                                                isActive ? "text-[#006B7A]" : "text-gray-400 group-hover:text-gray-600"
                                            }`}
                                        />
                                        <span className="flex-1 min-w-0 truncate">{item.name}</span>

                                        {/* Active indicator bar */}
                                        {isActive && (
                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-[#006B7A] rounded-l-full" />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Bottom: Logout */}
            <div className="px-3 py-4 border-t border-gray-100">
                <button
                    onClick={() => logout("/candidate/login")}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition-all duration-200 text-left cursor-pointer"
                >
                    <LogOut className="h-4 w-4 text-gray-400 transition-colors group-hover:text-rose-500 flex-shrink-0" />
                    <span>Đăng xuất</span>
                </button>
            </div>
        </aside>
    );
}
