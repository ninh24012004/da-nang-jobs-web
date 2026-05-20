"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    FileText,
    LifeBuoy,
    LogOut
} from "lucide-react";
import useAuth from "@/hooks/useAuth";

const navItems = [
    { name: "Tổng quan", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Quản lý người dùng", href: "/admin/users", icon: Users },
    { name: "Quản lý tin tuyển dụng", href: "/admin/jobs", icon: FileText },
    { name: "Quản lý hồ sơ ứng viên", href: "/admin/resumes", icon: FileText },
    { name: "Quản lý ứng tuyển", href: "/admin/applications", icon: FileText },
    { name: "Quản lý dữ liệu nền", href: "/admin/master-data", icon: FileText }
];

const bottomItems = [
    { name: "Hỗ trợ", href: "/admin/support", icon: LifeBuoy },
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const { logout } = useAuth();

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-100 bg-[#F8FAFC] flex flex-col shadow-sm">
            {/* Header */}
            <div className="p-6 mb-2">
                <h1 className="text-xl font-bold text-gray-900">Đà Nẵng Admin</h1>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">
                    ENTERPRISE CONSOLE
                </p>
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 px-3 space-y-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`group relative flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${isActive
                                ? "text-[#006B7A] bg-white shadow-sm"
                                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                }`}
                        >
                            <Icon className={`h-5 w-5 ${isActive ? "text-[#006B7A]" : "text-gray-400 group-hover:text-gray-600"}`} />
                            <span>{item.name}</span>

                            {/* Active Indicator */}
                            {isActive && (
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-[#006B7A] rounded-l-full" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Section */}
            <div className="p-3 border-t border-gray-100 space-y-1">
                {bottomItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all"
                        >
                            <Icon className="h-5 w-5 text-gray-400" />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}

                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all text-left cursor-pointer"
                >
                    <LogOut className="h-5 w-5 text-gray-400" />
                    <span>Đăng xuất</span>
                </button>
            </div>
        </aside>
    );
}
