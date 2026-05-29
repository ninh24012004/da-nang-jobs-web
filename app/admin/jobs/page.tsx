"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useJobs } from "@/hooks/useJobs";
import { JobResponse, ApproveJobStatus, VisibilityJobStatus } from "@/types/job";
import {
  Briefcase,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Eye,
  Search,
  MapPin,
  Users,
  X,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Calendar,
  DollarSign,
  TrendingUp,
  Award,
  Layers,
  Zap,
  Lock,
  Unlock,
  Check,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";

const QUICK_REJECTION_JOB_TEMPLATES = [
  "Nội dung tuyển dụng chứa thông tin sai sự thật hoặc lừa đảo.",
  "Mức lương cung cấp không phù hợp hoặc thiếu thực tế.",
  "Yêu cầu công việc vi phạm tiêu chuẩn cộng đồng hoặc phân biệt đối xử.",
  "Thông tin địa chỉ làm việc hoặc doanh nghiệp không tồn tại.",
  "Hạn nộp hồ sơ đã quá hạn hoặc không hợp lệ.",
];

export default function AdminJobsPage() {
  const router = useRouter();

  // Core Data States
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [statusFilter, setStatusFilter] = useState<"ALL" | ApproveJobStatus | "REAPPROVAL_NEEDED" | "HIDDEN">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const {
    jobs,
    totalPages,
    totalElements,
    isLoading: jobsLoading,
    actionLoading,
    counts,
    fetchCounts,
    fetchJobs,
    approveJobs,
    updateJobVisibility,
  } = useJobs();

  // Selection for Batch Actions
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Detailed Modals States
  const [selectedJob, setSelectedJob] = useState<JobResponse | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isBatchRejection, setIsBatchRejection] = useState(false);

  useEffect(() => {
    fetchJobs({ statusFilter, debouncedSearch, page, size });
    fetchCounts();
  }, [page, statusFilter, debouncedSearch, fetchJobs, fetchCounts]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // --- Handlers ---
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const pageIds = jobs.map((j) => j.id);
      setSelectedIds(pageIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  // 1. Phê duyệt (Dùng chung cho Đơn lẻ & Hàng loạt)
  const handleApproveAction = async (ids: number[]) => {
    const isMultiple = ids.length > 1;
    const confirmMsg = isMultiple 
      ? `Bạn có chắc chắn muốn phê duyệt ${ids.length} tin tuyển dụng đã chọn?` 
      : "Bạn có chắc chắn muốn phê duyệt tin tuyển dụng này?";
    
    if (!window.confirm(confirmMsg)) return;

    const res = await approveJobs(ids, "APPROVED");
    if (res.success) {
      await Promise.all([
        fetchJobs({ statusFilter, debouncedSearch, page, size }),
        fetchCounts()
      ]);
      setIsDetailsOpen(false);
      setSelectedJob(null);
      setSelectedIds([]);
    }
  };

  // 2. Từ chối (Dùng chung cho Đơn lẻ & Hàng loạt)
  const openRejectionModal = (isBatch: boolean) => {
    setIsBatchRejection(isBatch);
    setRejectionReason("");
    setIsRejectOpen(true);
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối!");
      return;
    }

    const idsToReject = isBatchRejection ? selectedIds : [selectedJob!.id];
    if (idsToReject.length === 0) return;

    const res = await approveJobs(idsToReject, "REJECTED", rejectionReason);
    if (res.success) {
      setIsRejectOpen(false);
      setIsDetailsOpen(false);
      setSelectedJob(null);
      setSelectedIds([]);
      await Promise.all([
        fetchJobs({ statusFilter, debouncedSearch, page, size }),
        fetchCounts()
      ]);
    }
  };

  // 3. Thay đổi hiển thị (Ẩn / Hiện - Dùng chung Đơn lẻ & Hàng loạt)
  const handleVisibilityAction = async (ids: number[], visibility: VisibilityJobStatus) => {
    const isMultiple = ids.length > 1;
    const actionText = visibility === "ACTIVE" ? "hiển thị lại" : "ẩn";
    const confirmMsg = isMultiple 
      ? `Bạn có chắc chắn muốn ${actionText} ${ids.length} tin tuyển dụng đã chọn?` 
      : `Bạn có chắc chắn muốn ${actionText} tin tuyển dụng này?`;

    if (!window.confirm(confirmMsg)) return;

    const res = await updateJobVisibility(ids, visibility);
    if (res.success) {
      await Promise.all([
        fetchJobs({ statusFilter, debouncedSearch, page, size }),
        fetchCounts()
      ]);
      setIsDetailsOpen(false);
      setSelectedJob(null);
      setSelectedIds([]);
    }
  };

  const getApproveStatusBadge = (status: ApproveJobStatus) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-[10px] font-bold border border-emerald-100 shadow-xs">
            <span className="h-1 w-1 rounded-full bg-emerald-500" />
            Đã Duyệt
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 px-2.5 py-1 rounded-full text-[10px] font-bold border border-rose-100 shadow-xs">
            <span className="h-1 w-1 rounded-full bg-rose-500" />
            Từ Chối
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full text-[10px] font-bold border border-amber-100 animate-pulse shadow-xs">
            <span className="h-1 w-1 rounded-full bg-amber-500" />
            Chờ Duyệt
          </span>
        );
      default:
        return <span className="text-gray-400">—</span>;
    }
  };

  const getVisibilityBadge = (status: VisibilityJobStatus) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1.5 bg-teal-50 text-[#006B7A] px-2.5 py-1 rounded-full text-[10px] font-bold border border-teal-100">
            Hiển thị (ACTIVE)
          </span>
        );
      case "HIDDEN":
        return (
          <span className="inline-flex items-center gap-1.5 bg-gray-50 text-gray-500 px-2.5 py-1 rounded-full text-[10px] font-bold border border-gray-150">
            Đã ẩn (HIDDEN)
          </span>
        );
      default:
        return <span className="text-gray-400">—</span>;
    }
  };



  return (
    <div className="space-y-6 select-none relative">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-gray-800 tracking-tight">Quản lý tin tuyển dụng</h1>
          <p className="text-gray-400 mt-1 text-xs font-medium">
            Duyệt, từ chối và kiểm soát hiển thị tất cả tin tuyển dụng trên hệ thống.
          </p>
        </div>
      </div>

      {/* 1. Quick Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: ALL */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between hover:shadow-md hover:scale-[1.01] transition-all duration-300">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tổng tin tuyển dụng</p>
            <h3 className="text-3xl font-extrabold text-gray-800 tracking-tight">{counts.ALL}</h3>
          </div>
          <div className="p-3 bg-gray-50 text-gray-500 rounded-2xl shadow-inner">
            <Briefcase size={22} className="stroke-[1.75]" />
          </div>
        </div>

        {/* Card 2: PENDING */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between hover:shadow-md hover:scale-[1.01] transition-all duration-300">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Chờ duyệt mới</p>
            <h3 className="text-3xl font-extrabold text-amber-600 tracking-tight animate-pulse">{counts.PENDING}</h3>
          </div>
          <div className="p-3 bg-amber-50 text-amber-500 rounded-2xl shadow-inner animate-pulse">
            <Clock size={22} className="stroke-[1.75]" />
          </div>
        </div>

        {/* Card 3: REAPPROVAL */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between hover:shadow-md hover:scale-[1.01] transition-all duration-300">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-sky-500 uppercase tracking-widest">Cần duyệt lại</p>
            <h3 className="text-3xl font-extrabold text-sky-600 tracking-tight">{counts.REAPPROVAL_NEEDED}</h3>
          </div>
          <div className="p-3 bg-sky-50 text-sky-600 rounded-2xl shadow-inner">
            <TrendingUp size={22} className="stroke-[1.75]" />
          </div>
        </div>

        {/* Card 4: APPROVED */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between hover:shadow-md hover:scale-[1.01] transition-all duration-300">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Tin đã duyệt</p>
            <h3 className="text-3xl font-extrabold text-emerald-600 tracking-tight">{counts.APPROVED}</h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shadow-inner">
            <ShieldCheck size={22} className="stroke-[1.75]" />
          </div>
        </div>

        {/* Card 5: HIDDEN */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between hover:shadow-md hover:scale-[1.01] transition-all duration-300">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Tin đang bị ẩn</p>
            <h3 className="text-3xl font-extrabold text-red-650 tracking-tight">{counts.HIDDEN}</h3>
          </div>
          <div className="p-3 bg-red-50 text-red-750 rounded-2xl shadow-inner">
            <ShieldAlert size={22} className="stroke-[1.75]" />
          </div>
        </div>
      </div>

      {/* 2. Tabs and Search controls */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col lg:flex-row gap-4 items-center justify-between">
        {/* Navigation Tabs with Count Badges */}
        <div className="flex bg-gray-50/80 p-1.5 rounded-2xl border border-gray-200/50 w-full lg:w-auto overflow-x-auto custom-scrollbar gap-1">
          {([
            { id: "ALL", label: "Tất cả", count: counts.ALL },
            { id: "PENDING", label: "Chờ duyệt", count: counts.PENDING },
            { id: "REAPPROVAL_NEEDED", label: "Cần duyệt lại", count: counts.REAPPROVAL_NEEDED },
            { id: "APPROVED", label: "Đã duyệt", count: counts.APPROVED },
            { id: "REJECTED", label: "Từ chối", count: counts.REJECTED },
            { id: "HIDDEN", label: "Đã ẩn", count: counts.HIDDEN }
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id);
                setPage(0);
              }}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 flex-shrink-0 cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-white text-[#006B7A] shadow-md scale-[1.02]"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-100/50"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-md text-[9px] font-extrabold ${
                  statusFilter === tab.id
                    ? "bg-[#006B7A]/10 text-[#006B7A]"
                    : "bg-gray-200/60 text-gray-500"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full lg:w-80 shadow-inner">
          <input
            type="text"
            placeholder="Tìm theo chức danh, nhà tuyển dụng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50/50 border border-gray-200 focus:border-[#006B7A] focus:ring-1 focus:ring-[#006B7A] rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-700 outline-none transition-all font-medium"
          />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* 3. Main Data Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-semibold text-gray-700">
            <thead className="bg-gray-50 border-b border-gray-100 text-[10px] text-gray-400 uppercase tracking-widest">
              <tr>
                <th className="p-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={jobs.length > 0 && selectedIds.length === jobs.length}
                    onChange={handleSelectAll}
                    className="rounded text-[#006B7A] focus:ring-[#006B7A] h-3.5 w-3.5 border-gray-300"
                  />
                </th>
                <th className="p-4">Vị trí tuyển dụng</th>
                <th className="p-4">Nhà tuyển dụng</th>
                <th className="p-4">Địa điểm</th>
                <th className="p-4">Mức lương</th>
                <th className="p-4">Trạng thái duyệt</th>
                <th className="p-4">Hiển thị</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {jobsLoading ? (
                <tr>
                  <td colSpan={8} className="p-16 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="h-8 w-8 animate-spin text-[#006B7A]" />
                      <span className="text-[11px] font-bold text-gray-400">Đang tải danh sách tin tuyển dụng...</span>
                    </div>
                  </td>
                </tr>
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-16 text-center text-gray-400 font-medium">
                    Không tìm thấy tin tuyển dụng nào phù hợp!
                  </td>
                </tr>
              ) : (
                jobs.map((j) => (
                  <tr key={j.id} className="hover:bg-[#F8FAFC]/80 transition-all duration-200 group border-b border-gray-100">
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(j.id)}
                        onChange={(e) => handleSelectOne(j.id, e.target.checked)}
                        className="rounded text-[#006B7A] focus:ring-[#006B7A] h-3.5 w-3.5 border-gray-300 cursor-pointer"
                      />
                    </td>

                    <td className="p-4">
                      <div>
                        <p className="font-extrabold text-gray-800 text-sm leading-snug group-hover:text-[#006B7A] transition-colors">{j.jobTitle}</p>
                        <p className="text-[9px] text-gray-400 font-bold uppercase mt-1 inline-flex items-center gap-1.5">
                          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md text-[8px] font-extrabold">
                            {j.positionName || "—"}
                          </span>
                          {j.needsReapproval && (
                            <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md text-[8px] font-extrabold animate-pulse">
                              Cần duyệt lại
                            </span>
                          )}
                        </p>
                      </div>
                    </td>

                    <td className="p-4 font-extrabold text-gray-700 text-xs">
                      {j.employerName || "—"}
                    </td>

                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 text-gray-500 font-bold text-xs">
                        <MapPin size={12} className="text-gray-400" />
                        {j.wardName ? `${j.wardName}, Đà Nẵng` : "Đà Nẵng"}
                      </span>
                    </td>

                    <td className="p-4 font-mono font-bold text-[#006B7A] text-xs">
                      {j.salaryType === "Lương thỏa thuận" || j.salaryType === "NEGOTIABLE" ? (
                        "Thỏa thuận"
                      ) : (
                        `${j.minimumSalary?.toLocaleString()} - ${j.maximumSalary?.toLocaleString()}đ`
                      )}
                    </td>

                    <td className="p-4">
                      {getApproveStatusBadge(j.approveStatus)}
                    </td>

                    <td className="p-4">
                      {getVisibilityBadge(j.visibilityStatus)}
                    </td>

                    <td className="p-4 text-right space-x-1">
                      <button
                        onClick={() => {
                          setSelectedJob(j);
                          setIsDetailsOpen(true);
                        }}
                        className="bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 text-gray-600 px-2.5 py-1.5 rounded-xl shadow-xs transition-all active:scale-[0.98] inline-flex items-center gap-1 cursor-pointer font-bold"
                      >
                        <Eye size={13} />
                        <span>Xem chi tiết</span>
                      </button>

                      {j.approveStatus === "PENDING" && (
                        <>
                          <button
                            onClick={() => handleApproveAction([j.id])}
                            disabled={actionLoading}
                            className="bg-[#006B7A] hover:bg-[#005a66] text-white px-2.5 py-1.5 rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer font-extrabold inline-flex items-center gap-1"
                          >
                            <Check size={12} />
                            Duyệt
                          </button>
                          <button
                            onClick={() => {
                              setSelectedJob(j);
                              openRejectionModal(false);
                            }}
                            disabled={actionLoading}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-650 px-2.5 py-1.5 rounded-xl border border-rose-100 transition-all active:scale-[0.98] cursor-pointer font-extrabold"
                          >
                            Từ chối
                          </button>
                        </>
                      )}

                      {j.approveStatus === "APPROVED" && (
                        j.visibilityStatus === "ACTIVE" ? (
                          <button
                            onClick={() => handleVisibilityAction([j.id], "HIDDEN")}
                            disabled={actionLoading}
                            className="bg-red-50 hover:bg-red-100 text-red-650 border border-red-200 px-2.5 py-1.5 rounded-xl transition-all active:scale-[0.98] cursor-pointer font-bold inline-flex items-center gap-1"
                          >
                            <Lock size={12} />
                            Ẩn tin
                          </button>
                        ) : (
                          <button
                            onClick={() => handleVisibilityAction([j.id], "ACTIVE")}
                            disabled={actionLoading}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-2.5 py-1.5 rounded-xl transition-all active:scale-[0.98] cursor-pointer font-bold inline-flex items-center gap-1"
                          >
                            <Unlock size={12} />
                            Hiển thị lại
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Pagination */}
      <div className="flex items-center justify-between px-2 text-xs font-semibold">
        <div className="text-gray-500">
          Hiển thị trang {page + 1} / {totalPages} (Tổng cộng: {totalElements} tin tuyển dụng)
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0 || jobsLoading}
            className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 text-gray-600 rounded-xl shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold"
          >
            Trang trước
          </button>

          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1 || jobsLoading}
            className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 text-gray-600 rounded-xl shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold"
          >
            Trang sau
          </button>
        </div>
      </div>

      {/* 5. FLOATING BATCH ACTIONS BAR */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#006B7A] text-white px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-5 animate-slideUp border border-teal-500/20 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs font-extrabold pr-2 border-r border-teal-600">
            <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
            <span>Đã chọn {selectedIds.length} tin tuyển dụng</span>
          </div>

          <div className="flex items-center gap-2">
            {statusFilter === "PENDING" || statusFilter === "REAPPROVAL_NEEDED" ? (
              <>
                <button
                  onClick={() => handleApproveAction(selectedIds)}
                  disabled={actionLoading}
                  className="bg-white hover:bg-teal-50 text-[#006B7A] px-4 py-2 rounded-xl text-xs font-extrabold transition-all active:scale-95 shadow-md flex items-center gap-1 cursor-pointer"
                >
                  <Check size={13} className="stroke-[2.5]" />
                  <span>Duyệt hàng loạt</span>
                </button>
                <button
                  onClick={() => openRejectionModal(true)}
                  disabled={actionLoading}
                  className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-xs font-extrabold transition-all active:scale-95 shadow-md flex items-center gap-1 cursor-pointer border border-rose-500/30"
                >
                  <span>Từ chối hàng loạt</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleVisibilityAction(selectedIds, "HIDDEN")}
                  disabled={actionLoading}
                  className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-xs font-extrabold transition-all active:scale-95 shadow-md flex items-center gap-1 cursor-pointer border border-rose-500/30"
                >
                  <Lock size={13} />
                  <span>Ẩn hiển thị hàng loạt</span>
                </button>
                <button
                  onClick={() => handleVisibilityAction(selectedIds, "ACTIVE")}
                  disabled={actionLoading}
                  className="bg-white hover:bg-teal-50 text-[#006B7A] px-4 py-2 rounded-xl text-xs font-extrabold transition-all active:scale-95 shadow-md flex items-center gap-1 cursor-pointer"
                >
                  <Unlock size={13} />
                  <span>Hiển thị hàng loạt</span>
                </button>
              </>
            )}
            
            <button
              onClick={() => setSelectedIds([])}
              className="text-teal-200 hover:text-white p-1 rounded-lg ml-1"
              title="Bỏ chọn tất cả"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* 6. PREMIUM DETAILS DRAWER (CENTER DIALOG OR DRAWER) */}
      {isDetailsOpen && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-3xl rounded-3xl border border-gray-100 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden transform scale-100 transition-all duration-300">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-[#006B7A]/5 to-cyan-50/20">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center shadow-xs text-xl text-[#006B7A] font-extrabold flex-shrink-0">
                  {selectedJob.employerName ? selectedJob.employerName.slice(0, 2).toUpperCase() : "DN"}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-gray-800 leading-tight">{selectedJob.jobTitle}</h3>
                  <p className="text-[9px] text-[#006B7A] font-extrabold uppercase mt-1 tracking-wider leading-none">
                    Doanh nghiệp: {selectedJob.employerName || "—"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsDetailsOpen(false);
                  setSelectedJob(null);
                }}
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all duration-200 cursor-pointer border border-transparent hover:border-gray-200"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-gray-600 font-semibold custom-scrollbar">
              {/* Quick Status pills banner */}
              <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 flex flex-wrap items-center justify-between gap-3 shadow-inner">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 font-bold">Duyệt hồ sơ:</span>
                  {getApproveStatusBadge(selectedJob.approveStatus)}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 font-bold">Hiển thị website:</span>
                  {getVisibilityBadge(selectedJob.visibilityStatus)}
                </div>
              </div>

              {/* Basic Fields grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mức lương tuyển dụng</p>
                  <p className="font-bold text-gray-800 text-sm bg-gray-50 px-3.5 py-2.5 rounded-xl border border-gray-100 inline-flex items-center gap-1.5">
                    <DollarSign size={14} className="text-[#006B7A]" />
                    <span>
                      {selectedJob.salaryType === "Lương thỏa thuận" || selectedJob.salaryType === "NEGOTIABLE" ? (
                        "Lương thỏa thuận"
                      ) : (
                        `${selectedJob.minimumSalary?.toLocaleString()} - ${selectedJob.maximumSalary?.toLocaleString()} VNĐ`
                      )}
                    </span>
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cấp bậc tuyển dụng</p>
                  <p className="font-bold text-gray-800 text-sm bg-gray-50 px-3.5 py-2.5 rounded-xl border border-gray-100 inline-flex items-center gap-1.5">
                    <Award size={14} className="text-[#006B7A]" />
                    <span>{selectedJob.positionName || "Chưa cập nhật"}</span>
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Kinh nghiệm yêu cầu</p>
                  <p className="font-bold text-gray-800 text-sm bg-gray-50 px-3.5 py-2.5 rounded-xl border border-gray-100 inline-flex items-center gap-1.5">
                    <TrendingUp size={14} className="text-[#006B7A]" />
                    <span>{selectedJob.experienceLevelName || "Không yêu cầu"}</span>
                  </p>
                </div>
              </div>

              {/* Deadline & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-gray-100">
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Hạn nộp hồ sơ</p>
                  <p className="font-bold text-gray-700 flex items-center gap-2 text-xs bg-gray-50 p-3 rounded-2xl border border-gray-100">
                    <Calendar size={14} className="text-[#006B7A]" />
                    <span>
                      {selectedJob.deadline 
                        ? new Date(selectedJob.deadline).toLocaleDateString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric"
                          })
                        : "—"
                      }
                    </span>
                  </p>
                </div>

                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Địa điểm làm việc</p>
                  <p className="font-bold text-gray-700 flex items-center gap-2 text-xs bg-gray-50 p-3 rounded-2xl border border-gray-100">
                    <MapPin size={14} className="text-red-500" />
                    <span>{selectedJob.address ? `${selectedJob.address}, ${selectedJob.wardName || ""}, Đà Nẵng` : "Đà Nẵng"}</span>
                  </p>
                </div>
              </div>

              {/* Categories, Skills, Tags section */}
              <div className="space-y-4 pt-2 border-t border-gray-100">
                {selectedJob.categoryNames && selectedJob.categoryNames.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ngành nghề (Categories)</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedJob.categoryNames.map((cat, idx) => (
                        <span key={idx} className="bg-teal-50 text-[#006B7A] px-2.5 py-1 rounded-lg border border-teal-100 text-[10px] font-extrabold">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedJob.skillNames && selectedJob.skillNames.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Yêu cầu kỹ năng (Skills)</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedJob.skillNames.map((s, idx) => (
                        <span key={idx} className="bg-sky-50 text-sky-700 px-2.5 py-1 rounded-lg border border-sky-100 text-[10px] font-extrabold">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedJob.tagNames && selectedJob.tagNames.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nhãn liên quan (Tags)</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedJob.tagNames.map((t, idx) => (
                        <span key={idx} className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg border border-gray-200 text-[10px] font-extrabold">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Mô tả công việc */}
              <div className="space-y-1.5 pt-2 border-t border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mô tả công việc</p>
                <div className="font-medium text-gray-600 leading-relaxed bg-[#F8FAFC] p-4.5 rounded-2xl border border-gray-200/50 text-xs whitespace-pre-wrap">
                  {selectedJob.jobDescription || "Chưa cập nhật nội dung mô tả công việc."}
                </div>
              </div>

              {/* Yêu cầu công việc */}
              <div className="space-y-1.5 pt-2 border-t border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Yêu cầu ứng viên</p>
                <div className="font-medium text-gray-600 leading-relaxed bg-[#F8FAFC] p-4.5 rounded-2xl border border-gray-200/50 text-xs whitespace-pre-wrap">
                  {selectedJob.jobRequirements || "Chưa cập nhật nội dung yêu cầu ứng viên."}
                </div>
              </div>

              {/* Quyền lợi */}
              <div className="space-y-1.5 pt-2 border-t border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Quyền lợi được hưởng</p>
                <div className="font-medium text-gray-600 leading-relaxed bg-[#F8FAFC] p-4.5 rounded-2xl border border-gray-200/50 text-xs whitespace-pre-wrap">
                  {selectedJob.jobBenefits || "Chưa cập nhật nội dung quyền lợi được hưởng."}
                </div>
              </div>

              {/* Lý do từ chối trước đó (nếu có) */}
              {selectedJob.rejectionReason && selectedJob.approveStatus === "REJECTED" && (
                <div className="space-y-1.5 pt-2 border-t border-gray-100">
                  <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Lý do từ chối phê duyệt trước đó</p>
                  <div className="font-bold text-rose-700 leading-relaxed bg-rose-50 p-4 rounded-2xl border border-rose-100 text-xs flex items-start gap-2">
                    <AlertTriangle size={15} className="mt-0.5 flex-shrink-0 text-rose-650" />
                    <span>{selectedJob.rejectionReason}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50 rounded-b-3xl">
              <button
                onClick={() => {
                  setIsDetailsOpen(false);
                  setSelectedJob(null);
                }}
                className="px-5 py-2.5 border border-gray-200 hover:bg-gray-100 text-gray-600 rounded-xl font-bold transition-all active:scale-[0.98] cursor-pointer animate-fadeIn"
              >
                Đóng
              </button>

              {selectedJob.approveStatus === "PENDING" && (
                <>
                  <button
                    onClick={() => openRejectionModal(false)}
                    disabled={actionLoading}
                    className="bg-rose-50 hover:bg-rose-100 text-rose-650 px-5 py-2.5 rounded-xl font-bold border border-rose-100 transition-all active:scale-[0.98] cursor-pointer"
                  >
                    Từ chối phê duyệt
                  </button>

                  <button
                    onClick={() => handleApproveAction([selectedJob.id])}
                    disabled={actionLoading}
                    className="bg-[#006B7A] hover:bg-[#005a66] text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98] flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check size={15} />
                    <span>Phê duyệt tin đăng</span>
                  </button>
                </>
              )}

              {selectedJob.approveStatus === "APPROVED" && (
                selectedJob.visibilityStatus === "ACTIVE" ? (
                  <button
                    onClick={() => handleVisibilityAction([selectedJob.id], "HIDDEN")}
                    disabled={actionLoading}
                    className="bg-red-50 hover:bg-red-100 text-red-650 border border-red-200 px-5 py-2.5 rounded-xl font-bold transition-all active:scale-[0.98] cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <Lock size={14} />
                    <span>Ẩn hiển thị tin đăng</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleVisibilityAction([selectedJob.id], "ACTIVE")}
                    disabled={actionLoading}
                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-5 py-2.5 rounded-xl font-bold transition-all active:scale-[0.98] cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <Unlock size={14} />
                    <span>Hiển thị lại tin đăng</span>
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* 7. REJECTION REASON MODAL (WITH QUICK OPTIONS) */}
      {isRejectOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-gray-100 shadow-2xl overflow-hidden animate-scaleIn">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-rose-50/50">
              <div className="flex items-center gap-2 text-rose-800">
                <AlertTriangle size={18} />
                <h4 className="font-extrabold text-sm uppercase tracking-widest">
                  {isBatchRejection ? `Từ chối duyệt ${selectedIds.length} tin tuyển dụng` : "Từ chối duyệt tin tuyển dụng"}
                </h4>
              </div>
              <button
                onClick={() => setIsRejectOpen(false)}
                className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form body */}
            <form onSubmit={handleRejectSubmit}>
              <div className="p-5 space-y-4 text-xs font-semibold">
                <p className="text-gray-500 leading-relaxed font-light text-[11px]">
                  Vui lòng nhập lý do từ chối cụ thể. Lý do từ chối này sẽ hiển thị trực tiếp cho nhà tuyển dụng để họ điều chỉnh và gửi duyệt lại.
                </p>

                {/* Quick Rejection templates */}
                <div className="space-y-2">
                  <label className="text-gray-400 uppercase tracking-widest block text-[10px] font-bold">Gợi ý nhanh lý do từ chối</label>
                  <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto p-1.5 rounded-2xl bg-gray-50 border border-gray-150 custom-scrollbar">
                    {QUICK_REJECTION_JOB_TEMPLATES.map((tmpl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setRejectionReason(tmpl)}
                        className="bg-white hover:bg-rose-50 hover:text-rose-700 text-gray-600 px-3 py-2 rounded-xl border border-gray-200 hover:border-rose-200 transition-all text-left text-[11px] font-medium leading-relaxed block w-full cursor-pointer shadow-xs"
                      >
                        {tmpl}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-gray-400 uppercase tracking-widest block text-[10px] font-bold">Chi tiết lý do từ chối <span className="text-red-500">*</span></label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Ví dụ: Mô tả công việc thiếu thông tin nhiệm vụ chi tiết, vui lòng bổ sung đầy đủ hơn..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full bg-white border border-gray-250 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-2xl px-4 py-3 text-gray-700 outline-none transition-all font-medium leading-relaxed"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="p-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50 rounded-b-3xl">
                <button
                  type="button"
                  onClick={() => setIsRejectOpen(false)}
                  className="px-4 py-2 border border-gray-200 hover:bg-gray-100 text-gray-600 rounded-xl font-bold transition-all active:scale-[0.98] cursor-pointer"
                >
                  Quay lại
                </button>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-red-650 hover:bg-red-700 disabled:bg-gray-300 text-white px-5 py-2 rounded-xl font-bold shadow-md transition-all active:scale-[0.98] flex items-center gap-1.5 cursor-pointer"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    <span>Xác nhận từ chối</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
