"use client";

import { useState, useEffect, useRef } from "react";
import EmployerLogo from "@/components/icons/EmployerLogo";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import {
  PhoneCall, Menu, X, User, PlusCircle, LayoutDashboard, LogOut,
  ArrowLeftRight, ChevronDown, Bell, Loader2,
  FileText, Building
} from "lucide-react";
import { toast } from "sonner";
import employerService from "@/services/employerService";
import { useNotifications } from "@/hooks/useNotifications";
import { formatTime } from "@/lib/utils";

export default function EmployerHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ fullName: string; email?: string; avatar?: string; companyName?: string } | null>(null);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notiOpen, setNotiOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    // 1. Scroll listener
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);

    const localToken = localStorage.getItem("accessToken");
    const sessionToken = sessionStorage.getItem("accessToken");
    const localUser = localStorage.getItem("user");
    const sessionUser = sessionStorage.getItem("user");
    const localEmployer = localStorage.getItem("employer");
    const sessionEmployer = sessionStorage.getItem("employer");

    const token = localToken || sessionToken;
    const userDataStr = localUser || sessionUser;
    const employerDataStr = localEmployer || sessionEmployer;

    if (token && userDataStr) {
      try {
        const parsedUser = JSON.parse(userDataStr);
        if (parsedUser.roleName === "EMPLOYER") {
          setIsAuthenticated(true);

          let compName = "Công ty Công nghệ DaNangTech";
          let compLogo = "";

          if (employerDataStr) {
            try {
              const parsedEmployer = JSON.parse(employerDataStr);
              if (parsedEmployer.companyName) compName = parsedEmployer.companyName;
              if (parsedEmployer.logoUrl) compLogo = parsedEmployer.logoUrl;
            } catch (err) {
              console.error("Error parsing employer cache:", err);
            }
          }

          setUser({
            fullName: parsedUser.fullName || "Nhà Tuyển Dụng",
            email: parsedUser.email || "",
            avatar: compLogo || parsedUser.avatarUrl || parsedUser.avatar || "",
            companyName: compName,
          });

          // Fetch active profile live from the backend to refresh cache
          employerService.getEmployerProfile()
            .then((data: any) => {
              if (data) {
                setUser(prev => prev ? {
                  ...prev,
                  companyName: data.companyName || prev.companyName,
                  avatar: data.logoUrl || prev.avatar
                } : null);

                // Refresh storage cache
                const storage = localToken ? localStorage : sessionStorage;
                storage.setItem("employer", JSON.stringify(data));
              }
            })
            .catch((err: any) => {
              console.warn("Could not load dynamic employer profile in header (using fallback):", err);
            });
        }
      } catch (err) {
        console.error("Error parsing employer user:", err);
      }
    }

    const handleNameChange = (e: Event) => {
      const customEvent = e as CustomEvent<any>;
      if (customEvent.detail) {
        const updatedEmployer = customEvent.detail;
        setUser(prev => prev ? {
          ...prev,
          companyName: updatedEmployer.companyName || prev.companyName,
          avatar: updatedEmployer.logoUrl || prev.avatar
        } : null);
      }
    };
    window.addEventListener("companyNameUpdated", handleNameChange);

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setDropdownOpen(false);
      }
      if (notiRef.current && !notiRef.current.contains(target)) {
        setNotiOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("companyNameUpdated", handleNameChange);
    };
  }, []);

  // Lazy fetch: chỉ gọi API khi panel mở lần đầu
  useEffect(() => {
    if (notiOpen && !notiFetched) {
      fetchNotifications();
    }
  }, [notiOpen, notiFetched, fetchNotifications]);

  const guestLinks = [
    { label: "Giới thiệu", href: "#introduction-hero" },
    { label: "Dịch vụ", href: "#service" },
    { label: "Liên hệ", href: "#contact" },
  ];

  const employerLinks = [
    { label: "Bảng tin", href: "/employer/dashboard" },
    { label: "Quản lý tin", href: "/employer/dashboard?tab=jobs" },
    { label: "Hồ sơ ứng tuyển", href: "/employer/dashboard?tab=cvs" }
  ];

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (pathname.startsWith("/employer") || pathname.includes("dashboard")) {
      e.preventDefault();
      router.push(href);
      return;
    }

    if (href.startsWith("#")) {
      e.preventDefault();
      setIsOpen(false);
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    sessionStorage.removeItem("user");

    setIsAuthenticated(false);
    setUser(null);
    setDropdownOpen(false);
    setNotiOpen(false);
    setIsOpen(false);

    toast.success("Đăng xuất tài khoản nhà tuyển dụng thành công!");
    router.push("/employer");
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? "bg-white/95 backdrop-blur-md shadow-md py-2.5"
        : "bg-white py-3.5 border-b border-gray-100"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <div className="flex items-center gap-2">
              <Link href="/employer">
                <EmployerLogo />
              </Link>
              <Link href="/employer" className="hidden lg:flex flex-col border-l border-gray-200 pl-3 group">
                <span className="text-xs font-semibold tracking-wider text-[#006b7a] uppercase">
                  ĐÀ NẴNG JOB
                </span>
                <span className="text-[10px] text-gray-500 font-medium leading-none">
                  Nhà Tuyển Dụng
                </span>
              </Link>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex space-x-5 lg:space-x-7">
            {isAuthenticated ? (
              employerLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`text-sm font-semibold transition-colors ${isActive
                      ? "text-[#006b7a] border-b-2 border-[#006b7a] pb-1"
                      : "text-gray-600 hover:text-[#006b7a]"
                      }`}
                  >
                    {link.label}
                  </Link>
                );
              })
            ) : (
              guestLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleScrollTo(e, link.href)}
                  className="text-sm font-semibold text-gray-600 hover:text-[#006b7a] transition-colors"
                >
                  {link.label}
                </a>
              ))
            )}
          </nav>

          {/* Right side actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Authenticated / Guest Actions */}
            {isAuthenticated && user ? (
              <>
                {/* 2. Notification Bell */}
                <div className="relative" ref={notiRef}>
                  <button
                    onClick={() => {
                      setNotiOpen(!notiOpen);
                      setDropdownOpen(false);
                    }}
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-all relative border border-gray-100"
                    aria-label="Thông báo tuyển dụng"
                  >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-[9px] border-2 border-white animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown Panel */}
                  {notiOpen && (
                    <div className="absolute right-0 top-full mt-2 w-80 rounded-xl bg-white border border-gray-150 shadow-2xl py-2 z-50 text-left animate-fadeIn">
                      <div className="px-4 py-2 border-b border-gray-50 flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-800">Thông báo</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={() => markAllAsRead(notifications)}
                            className="text-[10px] text-[#006b7a] font-semibold hover:underline"
                          >
                            Đọc tất cả
                          </button>
                        )}
                      </div>

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
                                !noti.isRead ? "bg-teal-50/20" : ""
                              }`}
                            >
                              <span className={`h-2 w-2 rounded-full bg-[#006b7a] mt-1.5 flex-shrink-0 transition-opacity ${
                                noti.isRead ? "opacity-0" : ""
                              }`} />
                              <div className="flex-grow min-w-0">
                                <p className={`text-gray-700 leading-snug ${
                                  !noti.isRead ? "font-semibold" : ""
                                }`}>
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

                      <div className="border-t border-gray-50 text-center pt-2 pb-1">
                        <Link
                          href="/employer/dashboard"
                          onClick={() => setNotiOpen(false)}
                          className="text-xs font-semibold text-[#006b7a] hover:underline"
                        >
                          Xem tất cả thông báo
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Quick Recruitment action: + Đăng tin mới */}
                <Link
                  href="/employer/dashboard?tab=post-job"
                  className="flex items-center gap-1 bg-[#006b7a] hover:bg-[#005a66] text-white px-3 py-2 rounded-lg text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
                >
                  <PlusCircle size={14} />
                  <span>Đăng tin tuyển dụng</span>
                </Link>

                {/* 4. Logged In User Dropdown Menu */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => {
                      setDropdownOpen(!dropdownOpen);
                      setNotiOpen(false);
                    }}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:border-[#006b7a]/50 hover:bg-gray-50 transition-all select-none"
                  >
                    <div className="h-8 w-8 rounded-full bg-[#006b7a] text-white flex items-center justify-center font-bold text-xs shadow-sm overflow-hidden flex-shrink-0">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.fullName} className="h-full w-full object-cover" />
                      ) : (
                        getInitials(user.fullName)
                      )}
                    </div>
                    <div className="text-left hidden lg:block max-w-[130px]">
                      <p className="text-xs font-bold text-gray-800 truncate leading-none">{user.fullName}</p>
                      <p className="text-[9px] text-[#006b7a] font-bold leading-none mt-1 truncate">
                        {user.companyName || "DNJ Partner"}
                      </p>
                    </div>
                    <ChevronDown size={14} className={`text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {/* Dropdown Card */}
                  {dropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 rounded-xl bg-white border border-gray-150 shadow-2xl py-2 z-50 text-left animate-fadeIn">
                      <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50 rounded-t-xl">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] bg-teal-150 text-[#006b7a] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                            PRO Recruiter
                          </span>
                          <span className="text-[10px] text-gray-400">ID: DNJ-9851</span>
                        </div>
                        <p className="text-sm font-bold text-gray-800 truncate mt-1.5">{user.fullName}</p>
                        <p className="text-xs text-gray-400 truncate mt-0.5 font-light">{user.email}</p>
                      </div>

                      <div className="p-1.5 space-y-0.5">
                        <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          Điều khiển
                        </div>

                        <div
                          onClick={() => {
                            setDropdownOpen(false);
                            router.push("/employer/dashboard");
                          }}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs text-gray-700 hover:text-[#006b7a] hover:bg-[#006b7a]/5 rounded-lg transition-colors font-medium cursor-pointer"
                        >
                          <LayoutDashboard size={15} />
                          <span>Bảng điều khiển tuyển dụng</span>
                        </div>

                        <div
                          onClick={() => {
                            setDropdownOpen(false);
                            router.push("/employer/dashboard?tab=post-job");
                          }}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs text-gray-700 hover:text-[#006b7a] hover:bg-[#006b7a]/5 rounded-lg transition-colors font-medium cursor-pointer"
                        >
                          <FileText size={15} />
                          <span>Đăng tin tuyển dụng mới</span>
                        </div>

                        <div
                          onClick={() => {
                            setDropdownOpen(false);
                            router.push("/employer/dashboard?tab=company");
                          }}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs text-gray-700 hover:text-[#006b7a] hover:bg-[#006b7a]/5 rounded-lg transition-colors font-medium cursor-pointer"
                        >
                          <Building size={15} />
                          <span>Hồ sơ doanh nghiệp</span>
                        </div>

                        <div className="h-px bg-gray-50 my-1" />
                        <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          Chuyển đổi
                        </div>

                        <div
                          onClick={() => {
                            setDropdownOpen(false);
                            router.push("/candidate");
                          }}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs text-gray-700 hover:text-[#006b7a] hover:bg-[#006b7a]/5 rounded-lg transition-colors font-medium cursor-pointer"
                        >
                          <ArrowLeftRight size={15} />
                          <span>Chuyển sang trang Ứng viên</span>
                        </div>
                      </div>

                      <div className="border-t border-gray-100 p-1.5 mt-1 bg-gray-50/20">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-xs text-red-650 hover:bg-red-50 rounded-lg transition-colors font-bold cursor-pointer"
                        >
                          <LogOut size={15} />
                          <span>Đăng xuất tài khoản</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Guest Options: Login & Job Posting */
              <>
                <Link
                  href="/employer/login"
                  className="text-sm font-semibold text-gray-700 hover:text-[#006b7a] transition-colors px-3 py-2 rounded-md hover:bg-gray-50"
                >
                  Đăng nhập
                </Link>

                <a
                  href="#banner-form"
                  onClick={(e) => handleScrollTo(e, "#banner-form")}
                  className="flex items-center gap-1.5 bg-[#006b7a] hover:bg-[#005a66] text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
                >
                  <PlusCircle size={16} />
                  <span>Đăng tuyển ngay</span>
                </a>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-3">
            <a
              href="#banner-form"
              onClick={(e) => handleScrollTo(e, "#banner-form")}
              className="p-2 rounded-full bg-[#006b7a]/10 text-[#006b7a] hover:bg-[#006b7a]/20 transition-colors"
              aria-label="Tư vấn tuyển dụng"
            >
              <PhoneCall size={18} />
            </a>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-[#006b7a] hover:bg-gray-50 focus:outline-none transition-colors"
              aria-expanded={isOpen}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 top-[69px] z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden ${isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
          }`}
        onClick={() => setIsOpen(false)}
      >
        <div
          className={`absolute right-0 top-0 bottom-0 w-4/5 max-w-sm bg-white shadow-xl p-6 transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"
            }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col h-full justify-between">
            <div className="space-y-6">
              {/* User block in mobile view */}
              {isAuthenticated && user ? (
                <div className="flex flex-col gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100 text-left">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#006b7a] text-white flex items-center justify-center font-bold text-sm shadow-sm overflow-hidden flex-shrink-0">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.fullName} className="h-full w-full object-cover" />
                      ) : (
                        getInitials(user.fullName)
                      )}
                    </div>
                    <div className="max-w-[160px]">
                      <p className="text-sm font-bold text-gray-800 truncate leading-tight">{user.fullName}</p>
                      <p className="text-[10px] text-[#006b7a] font-bold mt-1 truncate">{user.companyName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100 text-[10px] text-gray-500 font-medium">
                    <span>Số dư: <strong className="text-[#006b7a]">1,500,000đ</strong></span>
                    <span>•</span>
                    <span>VIP: <strong className="text-amber-600">3 tin</strong></span>
                  </div>
                </div>
              ) : (
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Menu tuyển dụng
                </span>
              )}

              <nav className="flex flex-col space-y-4">
                {isAuthenticated ? (
                  employerLinks.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="text-base font-semibold text-gray-800 hover:text-[#006b7a] transition-colors py-2 border-b border-gray-50"
                    >
                      {link.label}
                    </Link>
                  ))
                ) : (
                  guestLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      onClick={(e) => handleScrollTo(e, link.href)}
                      className="text-base font-semibold text-gray-800 hover:text-[#006b7a] transition-colors py-2 border-b border-gray-50"
                    >
                      {link.label}
                    </a>
                  ))
                )}
              </nav>
            </div>

            {/* Mobile CTAs */}
            <div className="space-y-4 pt-6 border-t border-gray-100">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/employer/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 w-full border border-gray-200 py-3 rounded-lg text-gray-700 font-bold hover:bg-gray-50 transition-all active:scale-[0.98]"
                  >
                    <LayoutDashboard size={18} />
                    <span>Quản lý tuyển dụng</span>
                  </Link>

                  <Link
                    href="/candidate"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 w-full border border-gray-200 py-3 rounded-lg text-gray-700 font-bold hover:bg-gray-50 transition-all active:scale-[0.98]"
                  >
                    <ArrowLeftRight size={18} />
                    <span>Chuyển sang trang ứng viên</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 w-full bg-red-50 text-red-650 py-3 rounded-lg font-bold hover:bg-red-100 transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <LogOut size={18} />
                    <span>Đăng xuất tài khoản</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/employer/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 w-full border border-gray-200 py-3 rounded-lg text-gray-700 font-bold hover:bg-gray-50 transition-all active:scale-[0.98]"
                  >
                    <User size={18} />
                    <span>Đăng nhập hệ thống</span>
                  </Link>

                  <a
                    href="#banner-form"
                    onClick={(e) => handleScrollTo(e, "#banner-form")}
                    className="flex items-center justify-center gap-2 w-full bg-[#006b7a] hover:bg-[#005a66] text-white py-3 rounded-lg font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
                  >
                    <PlusCircle size={18} />
                    <span>Đăng tin miễn phí ngay</span>
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header >
  );
}
