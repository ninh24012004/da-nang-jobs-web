"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Calendar,
  FileText,
  Clock,
  X,
  ExternalLink,
  ChevronRight,
  Loader2,
  Trash2,
  AlertCircle,
  Building2,
  FileCheck2,
  ArrowLeft
} from "lucide-react";
import { toast } from "sonner";
import { applicationService } from "@/services/applicationService";
import { ApplicationResponse, ApplicationStatus } from "@/types/application";

export default function CandidateApplicationsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filteredApplications = applications.filter(app => {
    if (statusFilter === "ALL") return true;
    return app.status === statusFilter;
  });
  
  // Cancel modal states
  const [cancelModalAppId, setCancelModalAppId] = useState<number | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");

    if (!token || !userStr) {
      toast.error("Vui lòng đăng nhập để truy cập lịch sử ứng tuyển!");
      router.push("/candidate/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(userStr);
      if (parsedUser.roleName !== "CANDIDATE") {
        toast.error("Tài khoản của bạn không có quyền truy cập trang này!");
        router.push("/candidate/login");
        return;
      }
      setIsAuthenticated(true);
    } catch (e) {
      router.push("/candidate/login");
    }
  }, [router]);

  // Load applications
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const loadApplications = async () => {
      setLoading(true);
      try {
        const response = await applicationService.getMyApplications(0, 100);
        setApplications(response.content || []);
      } catch (err) {
        console.error("Lỗi khi tải lịch sử ứng tuyển:", err);
        toast.error("Không thể tải danh sách đơn ứng tuyển!");
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, [isAuthenticated]);

  // Handle Cancel application
  const handleCancelConfirm = async () => {
    if (!cancelModalAppId) return;
    setCancelling(true);
    try {
      await applicationService.cancelApplication(cancelModalAppId);
      toast.success("Hủy đơn ứng tuyển thành công!");
      
      // Update local state
      setApplications(prev =>
        prev.map(app =>
          app.id === cancelModalAppId ? { ...app, status: "CANCELED" as ApplicationStatus } : app
        )
      );
      setCancelModalAppId(null);
    } catch (err) {
      toast.error("Hủy đơn ứng tuyển thất bại. Vui lòng liên hệ nhà tuyển dụng!");
    } finally {
      setCancelling(false);
    }
  };

  // Status badge components
  const renderStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[4px] text-xs font-black bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wide">
            <Clock size={11} className="animate-spin duration-1000" />
            <span>Đang duyệt</span>
          </span>
        );
      case "ACCEPTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[4px] text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-250/30 uppercase tracking-wide">
            <FileCheck2 size={11} />
            <span>Được nhận</span>
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[4px] text-xs font-black bg-red-50 text-red-700 border border-red-250/30 uppercase tracking-wide">
            <X size={11} />
            <span>Từ chối</span>
          </span>
        );
      case "CANCELED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[4px] text-xs font-black bg-slate-100 text-slate-500 border border-slate-200 uppercase tracking-wide">
            <Trash2 size={11} />
            <span>Đã hủy</span>
          </span>
        );
      default:
        return null;
    }
  };

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3 bg-white p-8 rounded-[8px] border border-slate-200 shadow-sm">
          <Loader2 className="h-10 w-10 animate-spin text-[#00B14F]" />
          <p className="text-slate-500 font-bold text-xs tracking-wide">Đang tải lịch sử ứng tuyển của bạn...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-20 font-sans text-slate-800 antialiased">
      
      {/* 1. BREADCRUMBS BAR */}
      <div className="max-w-6xl mx-auto px-4 py-4 select-none">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          <Link href="/candidate" className="hover:text-[#00B14F] transition-colors flex items-center gap-0.5">
            <ArrowLeft size={11} /> Trang chủ
          </Link>
          <ChevronRight size={12} className="text-slate-350" />
          <span className="text-slate-550">Lịch sử ứng tuyển</span>
        </div>
      </div>

      {/* 2. HEADER INTRO */}
      <div className="max-w-6xl mx-auto px-4 mb-8 text-left select-none">
        <div className="bg-white rounded-[8px] border border-slate-200 p-6 md:p-8 relative overflow-hidden shadow-sm">
          <div className="absolute right-0 bottom-0 w-64 h-64 bg-[#00B14F]/5 rounded-full blur-3xl pointer-events-none -mr-10 -mb-10"></div>
          <div className="space-y-1.5 relative z-10">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#00B14F] bg-[#00B14F]/10 px-2.5 py-1 rounded-[4px] border border-[#00B14F]/20">
              Hồ sơ cá nhân
            </span>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-800 pt-1.5">
              Lịch Sử Ứng Tuyển Việc Làm
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Bạn đang quản lý <strong className="text-[#00B14F]">{applications.length}</strong> hồ sơ đã nộp tới các nhà tuyển dụng tại Đà Nẵng.
            </p>
          </div>
        </div>
      </div>

      {/* 3. MAIN APPLICATIONS LIST */}
      <div className="max-w-6xl mx-auto px-4">
        {applications.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-white border border-slate-200 p-4 rounded-[8px] shadow-sm select-none text-left">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                { label: "Tất cả", value: "ALL" },
                { label: "Đang duyệt", value: "PENDING" },
                { label: "Được nhận", value: "ACCEPTED" },
                { label: "Từ chối", value: "REJECTED" },
                { label: "Đã hủy", value: "CANCELED" }
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setStatusFilter(item.value)}
                  className={`px-4 py-2 rounded-[6px] text-xs font-bold border transition-all cursor-pointer ${
                    statusFilter === item.value
                      ? "bg-[#00B14F] border-[#00B14F] text-white shadow-sm"
                      : "bg-white border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-3.5 py-2 rounded-[6px] border border-slate-200">
              Hiển thị: <strong className="text-[#00B14F]">{filteredApplications.length} / {applications.length} hồ sơ</strong>
            </span>
          </div>
        )}

        {filteredApplications.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-[8px] p-10 text-center shadow-sm select-none max-w-xl mx-auto space-y-5">
            <div className="h-16 w-16 bg-[#00B14F]/5 text-[#00B14F] border border-[#00B14F]/10 rounded-[8px] flex items-center justify-center mx-auto shadow-sm">
              <Briefcase size={28} />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-bold text-slate-850 text-base md:text-lg">
                {applications.length === 0 ? "Chưa ứng tuyển công việc nào" : "Chưa tìm thấy đơn ứng tuyển"}
              </h3>
              <p className="text-slate-450 text-xs font-light leading-relaxed max-w-sm mx-auto">
                {applications.length === 0 
                  ? "Bạn chưa nộp hồ sơ CV ứng tuyển cho bất kỳ đơn vị nào. Hãy khám phá hàng nghìn cơ hội việc làm hấp dẫn ngay bây giờ!"
                  : "Không tìm thấy đơn ứng tuyển nào khớp với bộ lọc đã chọn."}
              </p>
            </div>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-1.5 px-6 py-3 bg-[#00B14F] hover:bg-[#00873D] text-white font-bold rounded-[6px] text-xs shadow-md transition-all active:scale-[0.98]"
            >
              <span>Tìm kiếm việc làm ngay</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-[8px] border border-slate-200 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-md hover:border-[#00B14F]/30 transition-all duration-300 text-left relative overflow-hidden shadow-xs"
              >
                {/* Left section: Job details */}
                <div className="space-y-3 flex-grow min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {renderStatusBadge(app.status)}
                    <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                      <Calendar size={12} className="text-slate-350" />
                      Nộp ngày: {new Date(app.appliedAt).toLocaleDateString("vi-VN")} lúc {new Date(app.appliedAt).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <Link
                      href={`/jobs/${app.jobId}`}
                      className="block text-base md:text-lg font-bold tracking-tight text-slate-800 hover:text-[#00B14F] transition-colors leading-snug cursor-pointer truncate"
                    >
                      {app.jobTitle}
                    </Link>
                    <div className="flex items-center gap-1.5 font-semibold text-slate-450 text-xs">
                      <Building2 size={13} className="text-slate-350" />
                      <span>Nhà tuyển dụng chuyên nghiệp</span>
                    </div>
                  </div>

                  {/* Resume used */}
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-[6px] text-xs text-slate-650 font-bold">
                    <span className="p-1 bg-red-50 border border-red-100 text-red-500 rounded-[4px]"><FileText size={12} /></span>
                    <span className="truncate max-w-[250px]">{app.resumeTitle}</span>
                    <a
                      href={app.resumeFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#00B14F] hover:underline flex items-center gap-0.5 ml-1"
                    >
                      <span>Xem file CV</span>
                      <ExternalLink size={10} />
                    </a>
                  </div>
                </div>

                {/* Right section: Action Buttons */}
                <div className="flex items-center gap-3 w-full md:w-auto justify-end border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                  <Link
                    href={`/jobs/${app.jobId}`}
                    className="flex-grow md:flex-none px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-350 text-slate-650 rounded-[6px] text-xs font-bold transition-all text-center flex items-center justify-center gap-1"
                  >
                    <span>Xem tin tuyển dụng</span>
                    <ChevronRight size={13} />
                  </Link>

                  {app.status === "PENDING" && (
                    <button
                      onClick={() => setCancelModalAppId(app.id)}
                      className="flex-grow md:flex-none px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-100 text-red-650 hover:text-red-750 font-bold rounded-[6px] text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Trash2 size={13} />
                      <span>Hủy ứng tuyển</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ==================== CANCEL CONFIRMATION MODAL ==================== */}
      {cancelModalAppId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 transition-all duration-300 select-none">
          <div className="fixed inset-0" onClick={() => !cancelling && setCancelModalAppId(null)}></div>
          
          <div className="bg-white w-full max-w-md rounded-[8px] shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200 p-6 text-center relative z-10 space-y-4">
            <div className="h-12 w-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle size={24} />
            </div>
            
            <div className="space-y-1 text-center">
              <h3 className="font-bold text-slate-800 text-base">Xác nhận hủy ứng tuyển?</h3>
              <p className="text-slate-400 text-xs font-semibold leading-relaxed max-w-xs mx-auto">
                Hành động này sẽ rút lại hồ sơ CV của bạn tại công ty này. Nhà tuyển dụng sẽ không thể xem xét hồ sơ này nữa. Bạn chắc chắn chứ?
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={cancelling}
                onClick={() => setCancelModalAppId(null)}
                className="flex-1 py-2.5 bg-white border border-slate-250 text-slate-600 hover:text-slate-850 hover:bg-slate-50 rounded-[6px] text-xs font-bold transition-all cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={handleCancelConfirm}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white rounded-[6px] text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer"
              >
                {cancelling ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Trash2 size={13} />
                )}
                <span>Rút hồ sơ</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
