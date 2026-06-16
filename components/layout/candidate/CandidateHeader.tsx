"use client";
 
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
    Menu, 
    X, 
    Briefcase, 
    Building2, 
    FileText, 
    User, 
    Sparkles, 
    Settings, 
    LogOut, 
    ArrowLeftRight, 
    ChevronDown, 
    ChevronUp 
} from "lucide-react";
 
import LogoIcon from "@/components/icons/LogoIcon";
import NavigationMenu from "./NavigationMenu";
import HeaderButton from "./HeaderButton";
import UserMenu from "./UserMenu";
import useAuth from "@/hooks/useAuth";
 
interface HeaderProps {
    isAuthenticated: boolean;
    user?: {
        fullName: string;
        avatar?: string;
        email?: string;
    };
}
 
export const CandidateHeader: React.FC<HeaderProps> = ({
    isAuthenticated,
    user,
}) => {
    const pathname = usePathname();
    const { logout } = useAuth();
    
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isJobsCollapsed, setIsJobsCollapsed] = useState(true);
 
    // Auto-close mobile drawer on route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);
 
    // Disable scrolling when mobile menu drawer is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isMobileMenuOpen]);
 
    const getInitials = (name: string) => {
        if (!name) return "JD";
        const parts = name.trim().split(" ");
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };
 
    return (
        <>
            <header className="sticky top-0 z-40 w-full h-[72px] bg-white/95 backdrop-blur-sm border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shadow-sm transition-opacity duration-150">
                <div className="flex items-center min-w-0 gap-3">
                    {/* Hamburger Button on Mobile */}
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="md:hidden flex items-center justify-center w-10 h-10 rounded-[6px] border border-gray-200 bg-white hover:border-[#00B14F] transition-colors duration-150 cursor-pointer text-gray-500 hover:text-[#00B14F]"
                        aria-label="Mở menu"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
 
                    {/* Logo */}
                    <Link href="/candidate" className="flex items-center">
                        <LogoIcon />
                    </Link>
 
                    {/* Desktop Navigation links */}
                    <NavigationMenu />
                </div>
 
                <div className="flex items-center gap-2 md:gap-4">
                    {/* Unauthenticated Buttons */}
                    {!isAuthenticated ? (
                        <>
                            {/* Desktop Unauthenticated Flow */}
                            <div className="hidden md:flex items-center gap-2 md:gap-3">
                                <HeaderButton variant="outline" href="/candidate/register">
                                    Đăng ký
                                </HeaderButton>
 
                                <HeaderButton variant="solid" href="/candidate/login">
                                    Đăng nhập
                                </HeaderButton>
 
                                <HeaderButton variant="gray" href="/employer/login">
                                    Đăng tuyển & tìm hồ sơ
                                </HeaderButton>
                            </div>
 
                            {/* Mobile Unauthenticated Login Fast Link */}
                            <Link
                                href="/candidate/login"
                                className="md:hidden px-3.5 py-2 bg-[#00B14F]/5 text-[#00B14F] rounded-[6px] font-extrabold text-xs hover:bg-[#00B14F]/10 transition-colors duration-150 cursor-pointer"
                            >
                                Đăng nhập
                            </Link>
                        </>
                    ) : (
                        // Standard UserMenu (including notifications & bell) on both Mobile & Desktop
                        <UserMenu user={user} />
                    )}
                </div>
            </header>
 
            {/* Mobile Navigation Drawer Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden flex">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-150"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
 
                    {/* Drawer Content */}
                    <div className="relative w-[300px] max-w-[85vw] bg-white h-full shadow-md flex flex-col z-50 transform transition-transform duration-150 translate-x-0">
                        
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 flex-shrink-0">
                            <Link href="/candidate" onClick={() => setIsMobileMenuOpen(false)}>
                                <LogoIcon />
                            </Link>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-1.5 rounded-[6px] text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-150 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
 
                        {/* Scrollable Container */}
                        <div className="flex-1 overflow-y-auto py-4 px-4 space-y-6">
                            {/* Profile Info if Authenticated */}
                            {isAuthenticated && user && (
                                <div className="bg-gray-50/70 border border-slate-200 rounded-[8px] p-4">
                                    <Link
                                        href="/candidate/profile?tab=profile"
                                        className="flex items-center gap-3 hover:opacity-90 transition-opacity duration-150"
                                    >
                                        <div className="h-12 w-12 rounded-full bg-[#00B14F] text-white flex items-center justify-center font-bold text-base shadow-sm overflow-hidden flex-shrink-0 border border-white">
                                            {user.avatar ? (
                                                <img src={user.avatar} alt={user.fullName} className="h-full w-full object-cover" />
                                            ) : (
                                                getInitials(user.fullName)
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-grow">
                                            <span className="text-[9px] bg-emerald-50 text-[#00B14F] px-1.5 py-0.5 rounded-[4px] font-bold uppercase tracking-wider">
                                                Ứng viên
                                            </span>
                                            <p className="text-sm font-bold text-slate-800 truncate mt-1">
                                                {user.fullName}
                                            </p>
                                            <p className="text-[10px] text-slate-500 truncate font-light mt-0.5">
                                                {user.email || "candidate@gmail.com"}
                                            </p>
                                        </div>
                                    </Link>
                                </div>
                            )}
 
                            {/* Main Navigation Links */}
                            <div className="space-y-3">
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">
                                    Danh mục
                                </div>
                                <div className="space-y-1">
                                    {/* Collapsible Jobs Menu */}
                                    <div className="rounded-[6px] overflow-hidden">
                                        <button
                                            onClick={() => setIsJobsCollapsed(!isJobsCollapsed)}
                                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[6px] text-sm font-bold transition-colors duration-150 cursor-pointer ${
                                                pathname.startsWith("/jobs")
                                                    ? "text-[#00B14F] bg-[#00B14F]/5"
                                                    : "text-gray-700 hover:bg-gray-50"
                                            }`}
                                        >
                                            <span className="flex items-center gap-2.5">
                                                <Briefcase className="w-4 h-4 text-gray-400" />
                                                <span>Việc làm</span>
                                            </span>
                                            {isJobsCollapsed ? (
                                                <ChevronDown className="w-4 h-4 text-gray-400" />
                                            ) : (
                                                <ChevronUp className="w-4 h-4 text-[#00B14F]" />
                                            )}
                                        </button>
 
                                        {!isJobsCollapsed && (
                                            <div className="pl-9 pr-2 py-1.5 space-y-1.5 bg-gray-50/50 rounded-b-[6px] border-l border-[#00B14F]/25 ml-5 mt-1">
                                                <Link
                                                    href="/jobs"
                                                    className="block py-1.5 text-xs font-semibold text-gray-650 hover:text-[#00B14F]"
                                                >
                                                    Tìm việc làm
                                                </Link>
                                                <Link
                                                    href="/candidate/profile?tab=recommendations"
                                                    className="block py-1.5 text-xs font-semibold text-gray-655 hover:text-[#00B14F]"
                                                >
                                                    Việc làm đã lưu
                                                </Link>
                                                <Link
                                                    href="/candidate/profile?tab=recommendations"
                                                    className="block py-1.5 text-xs font-semibold text-gray-655 hover:text-[#00B14F]"
                                                >
                                                    Việc làm đã ứng tuyển
                                                </Link>
                                                <Link
                                                    href="/candidate/profile?tab=recommendations"
                                                    className="block py-1.5 text-xs font-semibold text-gray-655 hover:text-[#00B14F]"
                                                >
                                                    Việc làm phù hợp (AI)
                                                </Link>
                                            </div>
                                        )}
                                    </div>
 
                                    {/* Company Link */}
                                    <Link
                                        href="/candidate/companies"
                                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[6px] text-sm font-bold transition-colors duration-150 cursor-pointer ${
                                            pathname.startsWith("/candidate/companies")
                                                ? "text-[#00B14F] bg-[#00B14F]/5"
                                                : "text-gray-700 hover:bg-gray-50"
                                        }`}
                                    >
                                        <Building2 className="w-4 h-4 text-gray-400" />
                                        <span>Công ty</span>
                                    </Link>
 
                                    {/* Profile & CV Link */}
                                    <Link
                                        href="/candidate/profile?tab=profile"
                                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[6px] text-sm font-bold transition-colors duration-150 cursor-pointer ${
                                            pathname.startsWith("/candidate/profile")
                                                ? "text-[#00B14F] bg-[#00B14F]/5"
                                                : "text-gray-700 hover:bg-gray-50"
                                        }`}
                                    >
                                        <FileText className="w-4 h-4 text-gray-400" />
                                        <span>Hồ sơ & CV</span>
                                    </Link>
                                </div>
                            </div>
 
                            {/* Candidate Panel options when logged in */}
                            {isAuthenticated && (
                                <div className="space-y-3">
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">
                                        Quản lý hồ sơ
                                    </div>
                                    <div className="space-y-1">
                                        <Link
                                            href="/candidate/profile?tab=profile"
                                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-[6px] text-sm font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
                                        >
                                            <User className="w-4 h-4 text-gray-400" />
                                            <span>Thông tin cá nhân</span>
                                        </Link>
                                        <Link
                                            href="/candidate/profile?tab=recommendations"
                                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-[6px] text-sm font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
                                        >
                                            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500/10" />
                                            <span>Gợi ý việc làm từ AI</span>
                                        </Link>
                                        <Link
                                            href="/candidate/profile?tab=preferences"
                                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-[6px] text-sm font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
                                        >
                                            <Settings className="w-4 h-4 text-gray-400" />
                                            <span>Cài đặt gợi ý</span>
                                        </Link>
                                    </div>
                                </div>
                            )}
 
                            {/* Employer switch banner */}
                            <div className="pt-4 border-t border-slate-200">
                                <Link
                                    href="/employer"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center justify-between p-3.5 bg-emerald-50/40 border border-emerald-100/50 hover:bg-emerald-50/70 rounded-[8px] transition-colors duration-150 group cursor-pointer"
                                >
                                    <div className="min-w-0">
                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                            Nhà tuyển dụng B2B
                                        </div>
                                        <div className="text-xs font-bold text-[#00B14F] mt-0.5">
                                            Đăng tin & Tìm hồ sơ
                                        </div>
                                    </div>
                                    <ArrowLeftRight className="w-4 h-4 text-gray-400 group-hover:text-[#00B14F] transition-colors duration-150" />
                                </Link>
                            </div>
                        </div>
 
                        {/* Footer (Logout or Sign in/out flows) */}
                        <div className="p-4 border-t border-slate-200 bg-gray-50/50 flex-shrink-0">
                            {isAuthenticated ? (
                                <button
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        logout("/candidate/login");
                                    }}
                                    className="w-full flex items-center justify-center gap-2.5 px-4 py-3 bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-sm rounded-[6px] transition-colors duration-150 cursor-pointer"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Đăng xuất tài khoản</span>
                                </button>
                            ) : (
                                <div className="grid grid-cols-2 gap-2.5">
                                    <Link
                                        href="/candidate/login"
                                        className="flex items-center justify-center py-2.5 border border-[#00B14F] text-[#00B14F] hover:bg-[#00B14F]/5 font-bold text-sm rounded-[6px] transition-colors duration-150 text-center cursor-pointer"
                                    >
                                        Đăng nhập
                                    </Link>
                                    <Link
                                        href="/candidate/register"
                                        className="flex items-center justify-center py-2.5 bg-[#00B14F] hover:bg-[#00873D] text-white font-bold text-sm rounded-[6px] transition-colors duration-150 text-center shadow-sm cursor-pointer"
                                    >
                                        Đăng ký
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
 
export default CandidateHeader;