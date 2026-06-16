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
    X
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

interface AdminSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
    const pathname = usePathname();
    const { logout } = useAuth();

    const isLinkActive = (href: string) => {
        if (href === "/admin/dashboard") return pathname === href;
        if (href === "/admin/employer") return pathname.startsWith("/admin/employer");
        if (href === "/admin/master-data/job-categories") return pathname.startsWith("/admin/master-data");
        return pathname.startsWith(href);
    };

    return (
        <aside className={`fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-slate-200 flex flex-col select-none transition-transform duration-150 ease-in-out lg:translate-x-0 ${
            isOpen ? "translate-x-0" : "-translate-x-full"
        }`}>
            {/* Brand Logo */}
            <div className="px-4 py-4 border-b border-slate-200 flex items-center gap-3">
                <Link href="/admin/dashboard" className="flex items-center gap-2 hover:opacity-90 transition-opacity" onClick={onClose}>
                    <LogoIcon />
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-900" />
                </Link>
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-450 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    ADMIN
                </span>
                
                {/* Mobile Close Button */}
                <button
                    onClick={onClose}
                    className="lg:hidden p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-md transition-colors ml-auto cursor-pointer"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            {/* Navigation Groups */}
            <nav className="flex-1 px-3 py-4 overflow-y-auto custom-scrollbar space-y-4">
                {navGroups.map((group) => (
                    <div key={group.label}>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-3 mb-1.5">
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
                                        onClick={onClose}
                                        className={`group relative flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors duration-150 ${
                                            isActive
                                                ? "text-slate-900 bg-slate-100"
                                                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                        }`}
                                    >
                                        <Icon
                                            className={`h-4 w-4 flex-shrink-0 transition-colors ${
                                                isActive ? "text-slate-900" : "text-slate-400 group-hover:text-slate-600"
                                            }`}
                                        />
                                        <span className="flex-1 min-w-0 truncate">{item.name}</span>

                                        {/* Active indicator bar */}
                                        {isActive && (
                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-1 bg-slate-900 rounded-l" />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Bottom: Logout */}
            <div className="px-3 py-3 border-t border-slate-200">
                <button
                    onClick={() => logout("/candidate/login")}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium text-slate-500 hover:text-red-700 hover:bg-red-50 transition-colors duration-150 text-left cursor-pointer"
                >
                    <LogOut className="h-4 w-4 text-slate-400 transition-colors group-hover:text-red-650 flex-shrink-0" />
                    <span>Đăng xuất</span>
                </button>
            </div>
        </aside>
    );
}

