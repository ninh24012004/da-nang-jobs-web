"use client";

import { Bell, Menu } from "lucide-react";

interface AdminHeaderProps {
    onMenuClick: () => void;
}

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
    return (
        <header className="h-14 border-b border-slate-200 bg-white px-6 flex items-center justify-between sticky top-0 z-30 select-none">
            {/* Left side: Mobile menu toggle */}
            <div className="flex items-center">
                <button
                    onClick={onMenuClick}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md lg:hidden mr-3 cursor-pointer transition-colors"
                >
                    <Menu className="h-5 w-5" />
                </button>
            </div>

            {/* Right side: Header Controls */}
            <div className="flex items-center gap-3">
                {/* Notification Bell */}
                <button className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-50 rounded-md transition-colors relative cursor-pointer">
                    <Bell className="h-4 w-4" />
                    {/* Flat Red Notification Dot */}
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-650 rounded-full" />
                </button>

                {/* Vertical Divider */}
                <div className="h-4 w-[1px] bg-slate-200 mx-1"></div>

                {/* User Profile Info */}
                <div className="flex items-center gap-2.5">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-semibold text-slate-800 leading-tight">Administrator</p>
                        <p className="text-[9px] text-slate-500 font-bold uppercase mt-0.5 tracking-wider leading-none">Super Admin</p>
                    </div>
                    {/* Flat Slate Avatar */}
                    <div className="h-8 w-8 rounded-md bg-slate-900 text-white flex items-center justify-center font-bold text-xs relative select-none">
                        AD
                        <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-600 border border-white" />
                    </div>
                </div>
            </div>
        </header>
    );
}

