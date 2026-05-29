"use client";

import { Bell } from "lucide-react";

export default function AdminHeader() {
    return (
        <header className="h-16 border-b border-gray-200/40 bg-white/70 backdrop-blur-md px-8 flex items-center justify-end sticky top-0 z-30 select-none">
            {/* Header Controls */}
            <div className="flex items-center gap-4 bg-gray-50/50 p-1.5 rounded-2xl border border-gray-200/30 shadow-inner">
                {/* Notification Bell */}
                <button className="p-2 text-gray-400 hover:text-[#006B7A] hover:bg-white hover:shadow-xs rounded-xl transition-all duration-300 relative group cursor-pointer">
                    <Bell className="h-4.5 w-4.5 transition-transform duration-300 group-hover:scale-105" />
                    {/* Glowing Notification Dot */}
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" />
                </button>

                {/* Vertical Divider */}
                <div className="h-6 w-[1px] bg-gray-200 mx-1"></div>

                {/* User Profile Info */}
                <div className="flex items-center gap-3 pl-1 pr-2.5 py-0.5">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-extrabold text-gray-900 leading-none">Administrator</p>
                        <p className="text-[9px] text-[#006B7A] font-extrabold uppercase mt-1 tracking-wider leading-none">Super Admin</p>
                    </div>
                    {/* Glowing Avatar */}
                    <div className="h-9.5 w-9.5 rounded-xl bg-gradient-to-br from-[#006B7A] to-[#009fb2] text-white flex items-center justify-center font-bold text-xs shadow-md shadow-[#006B7A]/10 border border-[#006b7a]/10 relative select-none">
                        AD
                        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                    </div>
                </div>
            </div>
        </header>
    );
}
