"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Bell, Loader2 } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { formatTime } from "@/lib/utils";

import ProfileDropdown from "./user-menu/ProfileDropdown";

interface Props {
  user?: {
    fullName: string;
    avatar?: string;
    email?: string;
  };
}

export default function UserMenu({ user }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notiOpen, setNotiOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notiRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    loading: notiLoading,
    fetched: notiFetched,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (profileRef.current && !profileRef.current.contains(target)) {
        setOpen(false);
      }
      if (notiRef.current && !notiRef.current.contains(target)) {
        setNotiOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lazy fetch: chỉ gọi API khi panel mở lần đầu
  useEffect(() => {
    if (notiOpen && !notiFetched) {
      fetchNotifications();
    }
  }, [notiOpen, notiFetched, fetchNotifications]);

  const getInitials = (name: string) => {
    if (!name) return "JD";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="flex items-center gap-3">
      {/* 1. Notification Bell Dropdown */}
      <div className="relative" ref={notiRef}>
        <button
          onClick={() => {
            setNotiOpen(!notiOpen);
            setOpen(false);
          }}
          className="relative flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 bg-white hover:border-[#006b7a] transition-all cursor-pointer text-gray-500 hover:text-[#006b7a]"
          aria-label="Thông báo việc làm"
        >
          <Bell className="w-5 h-5 transition-colors" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-[9px] border-2 border-white animate-pulse">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>

        {/* Notification Panel */}
        {notiOpen && (
          <div className="absolute right-0 top-full mt-3.5 w-80 rounded-xl bg-white border border-gray-200 shadow-2xl py-2 z-50 text-left animate-fadeIn">
            {/* Header */}
            <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-800">Thông báo</span>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead(notifications)}
                  className="text-[10px] text-[#006b7a] font-bold hover:underline"
                >
                  Đọc tất cả
                </button>
              )}
            </div>

            {/* Body */}
            <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
              {notiLoading ? (
                <div className="flex items-center justify-center py-8 gap-2 text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-xs">Đang tải thông báo...</span>
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400">
                  Chưa có thông báo nào
                </div>
              ) : (
                notifications.map((noti) => (
                  <div
                    key={noti.id}
                    onClick={() => !noti.isRead && markAsRead([noti.id])}
                    className={`p-3 text-xs transition-colors hover:bg-gray-50 flex items-start gap-2.5 cursor-pointer ${
                      !noti.isRead ? "bg-teal-50/30" : ""
                    }`}
                  >
                    {/* Unread dot */}
                    <span
                      className={`h-1.5 w-1.5 rounded-full bg-[#006b7a] mt-1.5 flex-shrink-0 transition-opacity ${
                        noti.isRead ? "opacity-0" : ""
                      }`}
                    />
                    <div className="flex-grow min-w-0">
                      <p className={`text-gray-800 leading-snug line-clamp-1 ${!noti.isRead ? "font-semibold" : ""}`}>
                        {noti.title}
                      </p>
                      <p className="text-gray-500 leading-normal mt-0.5 line-clamp-2">
                        {noti.content}
                      </p>
                      <span className="text-[10px] text-gray-400 mt-1 block">
                        {formatTime(noti.createdAt)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 text-center pt-2 pb-1">
              <Link
                href="/candidate/profile"
                onClick={() => setNotiOpen(false)}
                className="text-[10px] font-bold text-[#006b7a] hover:underline"
              >
                Xem tất cả thông báo
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* 2. User Profile Menu */}
      <div className="relative" ref={profileRef}>
        <div
          onClick={() => {
            setOpen(!open);
            setNotiOpen(false);
          }}
          className="relative cursor-pointer group flex items-center select-none"
        >
          <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 group-hover:border-[#006b7a] transition-all bg-[#006b7a] text-white flex items-center justify-center font-bold text-sm">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user?.fullName || "User"}
                className="object-cover w-full h-full"
              />
            ) : (
              getInitials(user?.fullName || "Ứng Viên")
            )}
          </div>

          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border border-gray-200 flex items-center justify-center group-hover:border-[#006b7a] transition-all">
            <ChevronDown className="w-3 h-3 text-gray-500 group-hover:text-[#006b7a] transition-all" />
          </div>
        </div>

        {open && (
          <div className="absolute right-0 top-full pt-3.5 z-50">
            <ProfileDropdown user={user} onClose={() => setOpen(false)} />
          </div>
        )}
      </div>

      {/* 3. B2B Employer Portal Switch */}
      <div className="hidden xl:flex flex-col items-start ml-4 border-l border-gray-200 pl-4 select-none">
        <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
          Doanh nghiệp
        </span>
        <button
          className="text-[#006b7a] hover:text-[#005a66] hover:underline text-xs font-bold cursor-pointer transition-colors"
          onClick={() => router.push("/employer/login")}
        >
          Đăng tin & Tìm hồ sơ
        </button>
      </div>
    </div>
  );
}