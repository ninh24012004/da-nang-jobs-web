"use client";

import React from "react";
import { MapPin, Calendar, Edit2, Trash2, Loader2, Plus, ArrowLeftRight } from "lucide-react";
import { JobResponse, ApproveJobStatus } from "@/types/job";

interface EmployerJobTableProps {
  jobs: JobResponse[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (page: number) => void;
  onEditJobClick: (job: JobResponse) => void;
  onDeleteJob: (id: number) => void;
  onPostJobClick: () => void;
  actionLoading: boolean;
}

export default function EmployerJobTable({
  jobs,
  loading,
  currentPage,
  totalPages,
  totalElements,
  onPageChange,
  onEditJobClick,
  onDeleteJob,
  onPostJobClick,
  actionLoading,
}: EmployerJobTableProps) {
  const getApproveStatusBadge = (status: ApproveJobStatus) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-[4px] text-[10px] font-bold border border-emerald-100">
            Đã Duyệt
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 px-2 py-0.5 rounded-[4px] text-[10px] font-bold border border-rose-100">
            Từ Chối
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-[4px] text-[10px] font-bold border border-amber-100">
            Chờ Duyệt
          </span>
        );
      default:
        return <span className="text-slate-400">—</span>;
    }
  };

  return (
    <div className="bg-white rounded-[8px] border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-800">Quản lý danh sách tin tuyển dụng</h3>
          <p className="text-xs text-slate-400">Xem, chỉnh sửa hoặc xóa chiến dịch tuyển dụng thực tế của doanh nghiệp</p>
        </div>
        <button
          onClick={onPostJobClick}
          className="flex items-center gap-1.5 bg-[#00B14F] hover:bg-[#00873D] text-white px-4 py-2.5 rounded-[6px] text-xs font-bold transition-colors cursor-pointer border-none"
        >
          <Plus size={16} />
          <span>Đăng tuyển tin mới</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-150 font-semibold text-slate-500 uppercase tracking-wider">
              <th className="p-4">Tiêu đề tin tuyển</th>
              <th className="p-4">Địa điểm</th>
              <th className="p-4">Mức lương</th>
              <th className="p-4">Hạn nộp</th>
              <th className="p-4 text-center">Trạng thái duyệt</th>
              <th className="p-4 text-center">Hiển thị</th>
              <th className="p-4 text-center">Lượt xem</th>
              <th className="p-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {loading ? (
              <tr>
                <td colSpan={8} className="p-12 text-center text-slate-400">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-[#00B14F]" />
                    <span className="text-[10px] font-bold">Đang tải danh sách tin...</span>
                  </div>
                </td>
              </tr>
            ) : jobs.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-12 text-center text-slate-400 font-semibold">
                  Bạn chưa đăng tuyển tin tuyển dụng nào! Hãy tạo tin đăng đầu tiên ngay.
                </td>
              </tr>
            ) : (
              jobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <p
                      className="font-bold text-slate-800 hover:text-[#00B14F] cursor-pointer transition-colors"
                      onClick={() => onEditJobClick(job)}
                    >
                      {job.jobTitle}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono mt-1">Mã tin: DNJ-{job.id}</p>
                  </td>
                  <td className="p-4 text-slate-650">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} className="text-[#00B14F]" />
                      {job.wardName ? `${job.wardName}, Đà Nẵng` : "Đà Nẵng"}
                    </span>
                  </td>
                  <td className="p-4 text-slate-800 font-bold">
                    {job.salaryType === "Lương thỏa thuận" || job.salaryType === "NEGOTIABLE" ? (
                      "Thỏa thuận"
                    ) : (
                      `${job.minimumSalary?.toLocaleString("vi-VN")} - ${job.maximumSalary?.toLocaleString("vi-VN")}đ`
                    )}
                  </td>
                  <td className="p-4 text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {job.deadline ? new Date(job.deadline).toLocaleDateString("vi-VN") : "—"}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    {getApproveStatusBadge(job.approveStatus)}
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold ${
                        job.visibilityStatus === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-650 border border-emerald-100"
                          : "bg-slate-100 text-slate-500 border border-slate-200"
                      }`}
                    >
                      {job.visibilityStatus === "ACTIVE" ? "Hiển thị" : "Đang ẩn"}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="font-bold text-slate-700">{job.viewCount ?? 0} views</span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => onEditJobClick(job)}
                        className="p-1.5 rounded-[6px] border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer bg-white"
                        title="Chỉnh sửa tin đăng"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => onDeleteJob(job.id)}
                        disabled={actionLoading}
                        className="p-1.5 rounded-[6px] border border-rose-100 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer disabled:opacity-50"
                        title="Xóa vĩnh viễn"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-4 px-2 text-xs font-semibold border-t border-slate-100">
        <div className="text-slate-500">
          Hiển thị trang {currentPage + 1} / {totalPages} (Tổng cộng: {totalElements} tin tuyển dụng)
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onPageChange(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0 || loading}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-[6px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Trang trước
          </button>

          <button
            onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage >= totalPages - 1 || loading}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-[6px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Trang sau
          </button>
        </div>
      </div>
    </div>
  );
}
