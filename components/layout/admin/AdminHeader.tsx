"use client";

import { Bell, Search, User } from "lucide-react";

export default function AdminHeader() {
    return (
        <header className="h-16 border-b border-gray-100 bg-white/80 backdrop-blur-md px-8 flex items-center justify-end sticky top-0 z-30">

            <div className="bg-gray-50 px-4 py-2 rounded-xl flex items-center gap-4">
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                <div className="h-8 w-[1px] bg-gray-100 mx-2"></div>

                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900 leading-none">Admin</p>
                        <p className="text-[10px] text-gray-500 mt-1">Super Admin</p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-[#006B7A] flex items-center justify-center text-white font-bold">
                        AD
                    </div>
                </div>
            </div>
        </header>
    );
}
