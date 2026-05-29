"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Building,
    ShieldAlert,
    Briefcase,
    Layers,
    LifeBuoy,
    LogOut
} from "lucide-react";
import useAuth from "@/hooks/useAuth";
import LogoIcon from "@/components/icons/LogoIcon";

const navItems = [
    { name: "Tổng quan", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Quản lý người dùng", href: "/admin/users", icon: Users },
    { name: "Danh sách nhà tuyển dụng", href: "/admin/employer", icon: Building },
    { name: "Duyệt hồ sơ doanh nghiệp", href: "/admin/employer/pending", icon: ShieldAlert },
    { name: "Quản lý tin tuyển dụng", href: "/admin/jobs", icon: Briefcase },
    { name: "Quản lý dữ liệu nền", href: "/admin/master-data/job-categories", icon: Layers }
];

const bottomItems = [
    { name: "Hỗ trợ kỹ thuật", href: "/admin/support", icon: LifeBuoy },
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const { logout } = useAuth();

    // Check if the link is active (match strictly or matches subpages)
    const isLinkActive = (href: string) => {
        if (href === "/admin/dashboard") {
            return pathname === href;
        }
        if (href === "/admin/employer") {
            // Do NOT match /admin/employer/pending when we are on /admin/employer
            return pathname === href;
        }
        if (href === "/admin/master-data/job-categories") {
            return pathname.startsWith("/admin/master-data");
        }
        return pathname.startsWith(href);
    };

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200/50 bg-gradient-to-b from-[#F8FAFC] to-[#F1F5F9] flex flex-col shadow-xs select-none">
            {/* Header / Brand Logo */}
            <div className="p-6 mb-4 flex flex-col justify-center border-b border-gray-200/40 bg-white/40 backdrop-blur-xs">
                <Link href="/admin/dashboard" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
                    <LogoIcon />
                    <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse shadow-[0_0_8px_rgba(20,184,166,0.8)]" />
                </Link>
                <p className="text-[9px] font-extrabold uppercase tracking-widest text-gray-400 mt-2.5 leading-none">
                    ENTERPRISE CONSOLE
                </p>
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 px-3.5 space-y-1 overflow-y-auto custom-scrollbar">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = isLinkActive(item.href);

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`group relative flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-extrabold transition-all duration-300 ${isActive
                                ? "text-[#006B7A] bg-white shadow-sm shadow-[#006B7A]/5 scale-[1.02]"
                                : "text-gray-500 hover:text-gray-900 hover:bg-gray-100/50 hover:translate-x-1"
                                }`}
                        >
                            <Icon className={`h-4.5 w-4.5 transition-transform duration-300 ${isActive ? "text-[#006B7A]" : "text-gray-400 group-hover:text-gray-600"}`} />
                            <span>{item.name}</span>

                            {/* Active Indicator */}
                            {isActive && (
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-[#006B7A] rounded-l-full shadow-[0_0_8px_rgba(0,107,122,0.8)] animate-fadeIn" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Section */}
            <div className="p-4 border-t border-gray-200/40 bg-white/30 backdrop-blur-xs space-y-1">
                {bottomItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-extrabold transition-all duration-300 ${isActive
                                ? "text-[#006B7A] bg-white shadow-xs"
                                : "text-gray-500 hover:text-gray-900 hover:bg-gray-100/50 hover:translate-x-1"
                                }`}
                        >
                            <Icon className="h-4.5 w-4.5 text-gray-400" />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}

                <button
                    onClick={() => logout("/candidate/login")}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-extrabold text-gray-500 hover:text-rose-600 hover:bg-rose-50/70 transition-all duration-300 text-left cursor-pointer hover:translate-x-1"
                >
                    <LogOut className="h-4.5 w-4.5 text-gray-400 transition-colors group-hover:text-rose-500" />
                    <span>Đăng xuất</span>
                </button>
            </div>
        </aside>
    );
}
