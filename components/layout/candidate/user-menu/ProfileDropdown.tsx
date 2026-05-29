"use client";

import Image from "next/image";
import Link from "next/link";
import { 
  User, Briefcase, Sparkles, FileText, ArrowLeftRight, LogOut, 
  CheckCircle2, ChevronRight, UserCircle, Settings 
} from "lucide-react";
import useAuth from "@/hooks/useAuth";

interface Props {
  user?: {
    fullName?: string;
    avatar?: string;
    email?: string;
  };
  onClose?: () => void;
}

export default function ProfileDropdown({ user, onClose }: Props) {
  const { logout } = useAuth();

  const getInitials = (name: string) => {
    if (!name) return "JD";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="w-[340px] bg-white rounded-2xl shadow-2xl border border-gray-150 py-2 z-50 text-left animate-fadeIn">
      {/* Profile Header - Clickable to navigate to Profile page */}
      <Link
        href="/candidate/profile?tab=profile"
        onClick={onClose}
        className="block px-5 py-4 border-b border-gray-100 bg-gray-50/50 hover:bg-gray-100/70 rounded-t-2xl transition-colors group/header cursor-pointer text-left"
      >
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-[#006b7a] text-white flex items-center justify-center font-bold text-sm shadow-sm overflow-hidden flex-shrink-0 border border-gray-200 transition-transform group-hover/header:scale-105">
            {user?.avatar ? (
              <img src={user.avatar} alt={user?.fullName || "Avatar"} className="h-full w-full object-cover" />
            ) : (
              getInitials(user?.fullName || "Ứng Viên")
            )}
          </div>
          <div className="min-w-0 flex-grow">
            <div className="flex items-center gap-1">
              <span className="text-[9px] bg-teal-50 text-[#006b7a] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                Ứng viên
              </span>
              <div className="flex items-center gap-0.5 text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                <CheckCircle2 size={9} />
                <span>Xác thực</span>
              </div>
            </div>
            <p className="text-sm font-bold text-gray-850 truncate mt-1 group-hover/header:text-[#006b7a] transition-colors">
              {user?.fullName || "Ứng viên DNJ"}
            </p>
            <p className="text-[10px] text-gray-400 truncate mt-0.5 font-light">
              {user?.email || "candidate@gmail.com"}
            </p>
          </div>
          <ChevronRight size={14} className="text-gray-300 group-hover/header:translate-x-0.5 group-hover/header:text-[#006b7a] transition-all" />
        </div>

        {/* Profile Completeness Bar */}
        <div className="mt-3.5 pt-2 border-t border-gray-100/50">
          <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 mb-1">
            <span>Độ hoàn thiện CV cá nhân:</span>
            <span className="text-[#006b7a]">85%</span>
          </div>
          <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-teal-500 to-[#006b7a] rounded-full" style={{ width: "85%" }} />
          </div>
        </div>
      </Link>

      {/* Dropdown Menu Items */}
      <div className="p-2 space-y-0.5">
        <div className="px-3 py-1 text-[9px] font-bold text-gray-400 uppercase tracking-wider">
          Quản lý tài khoản
        </div>

        <Link
          href="/candidate/profile?tab=profile"
          onClick={onClose}
          className="flex items-center justify-between px-3 py-2 text-xs text-gray-700 hover:text-[#006b7a] hover:bg-[#006b7a]/5 rounded-xl transition-colors font-semibold group cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <User size={14} className="text-gray-400 group-hover:text-[#006b7a] transition-colors" />
            <span>Thông tin cá nhân</span>
          </div>
          <ChevronRight size={12} className="text-gray-300 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        <Link
          href="/candidate/applications"
          onClick={onClose}
          className="flex items-center justify-between px-3 py-2 text-xs text-gray-700 hover:text-[#006b7a] hover:bg-[#006b7a]/5 rounded-xl transition-colors font-semibold group cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Briefcase size={14} className="text-gray-400 group-hover:text-[#006b7a] transition-colors" />
            <span>Việc làm đã ứng tuyển</span>
          </div>
          <ChevronRight size={12} className="text-gray-300 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        <Link
          href="/candidate/profile?tab=recommendations"
          onClick={onClose}
          className="flex items-center justify-between px-3 py-2 text-xs text-gray-700 hover:text-[#006b7a] hover:bg-[#006b7a]/5 rounded-xl transition-colors font-semibold group cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Sparkles size={14} className="text-amber-500 fill-amber-500/10 group-hover:animate-pulse" />
            <span>Việc làm phù hợp (AI)</span>
          </div>
          <ChevronRight size={12} className="text-gray-300 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        <Link
          href="/candidate/profile?tab=preferences"
          onClick={onClose}
          className="flex items-center justify-between px-3 py-2 text-xs text-gray-700 hover:text-[#006b7a] hover:bg-[#006b7a]/5 rounded-xl transition-colors font-semibold group cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Settings size={14} className="text-gray-400 group-hover:text-[#006b7a] transition-colors" />
            <span>Cài đặt gợi ý việc làm</span>
          </div>
          <ChevronRight size={12} className="text-gray-300 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        <div className="h-px bg-gray-50 my-1" />

        <div className="px-3 py-1 text-[9px] font-bold text-gray-400 uppercase tracking-wider">
          Hồ sơ & CV tuyển dụng
        </div>

        <Link
          href="/candidate/profile?tab=profile"
          onClick={onClose}
          className="flex items-center justify-between px-3 py-2 text-xs text-gray-700 hover:text-[#006b7a] hover:bg-[#006b7a]/5 rounded-xl transition-colors font-semibold group cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <FileText size={14} className="text-[#006b7a]" />
            <span>CV cá nhân của tôi</span>
          </div>
          <ChevronRight size={12} className="text-gray-300 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        <div className="h-px bg-gray-50 my-1" />

        <div className="px-3 py-1 text-[9px] font-bold text-gray-400 uppercase tracking-wider">
          Kênh tuyển dụng B2B
        </div>

        <Link
          href="/employer"
          onClick={onClose}
          className="flex items-center justify-between px-3 py-2 text-xs text-gray-700 hover:text-[#006b7a] hover:bg-[#006b7a]/5 rounded-xl transition-colors font-semibold group cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <ArrowLeftRight size={14} className="text-gray-400 group-hover:text-[#006b7a] transition-colors" />
            <span>Chuyển sang Nhà tuyển dụng</span>
          </div>
          <ChevronRight size={12} className="text-gray-300 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Dropdown Footer Logout */}
      <div className="border-t border-gray-100 p-1.5 mt-1 bg-gray-50/20 rounded-b-2xl">
        <button
          onClick={() => {
            if (onClose) onClose();
            logout("/candidate/login");
          }}
          className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-xs text-red-650 hover:bg-red-50 rounded-xl transition-colors font-bold cursor-pointer"
        >
          <LogOut size={14} />
          <span>Đăng xuất tài khoản</span>
        </button>
      </div>
    </div>
  );
}