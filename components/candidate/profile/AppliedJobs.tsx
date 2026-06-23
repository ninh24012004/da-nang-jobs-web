"use client";

import React from "react";
import Link from "next/link";
import {
  Briefcase,
  Calendar,
  FileText,
  Clock,
  X,
  Trash2,
  ExternalLink,
  ChevronRight,
  Loader2,
  Building2,
  AlertCircle,
  FileCheck2,
} from "lucide-react";
import { useCandidateProfile } from "@/app/candidate/profile/CandidateProfileContext";
import { ApplicationStatus } from "@/types/application";

export default function AppliedJobs() {
  const {
    applications,
    loadingApplications,
    statusFilter,
    setStatusFilter,
    filteredApplications,
    cancelModalAppId,
    setCancelModalAppId,
    cancelling,
    handleCancelConfirm,
  } = useCandidateProfile();

  // Status badge helper
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

  return (
    <div className="space-y-5 text-left animate-fadeIn">
      {/* Header Info */}
      <div className="bg-white p-5 rounded-[8px] border border-slate-200 shadow-sm select-none">
        <h3 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-1.5">
          <Briefcase className="text-[#00B14F]" size={16} />
          <span>Việc làm đã ứng tuyển</span>
        </h3>
        <p className="text-[10px] text-slate-455 mt-0.5 leading-normal">
          Quản lý lịch sử nộp hồ sơ của bạn tới các đơn vị nhà tuyển dụng tại Đà Nẵng.
        </p>
      </div>

      {/* Filter Row */}
      {applications.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 p-4 rounded-[8px] shadow-sm select-none">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { label: "Tất cả", value: "ALL" },
              { label: "Đang duyệt", value: "PENDING" },
              { label: "Được nhận", value: "ACCEPTED" },
              { label: "Từ chối", value: "REJECTED" },
              { label: "Đã hủy", value: "CANCELED" },
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
          <span className="text-xs font-semibold text-slate-500 bg-slate-55 px-3.5 py-2 rounded-[6px] border border-slate-200">
            Hiển thị: <strong className="text-[#00B14F]">{filteredApplications.length} / {applications.length} hồ sơ</strong>
          </span>
        </div>
      )}

      {/* Content Area */}
      {loadingApplications ? (
        <div className="py-20 flex flex-col items-center justify-center gap-2 bg-white border border-slate-200 rounded-[8px]">
          <Loader2 className="h-8 w-8 animate-spin text-[#00B14F]" />
          <p className="text-xs text-slate-400 font-semibold">Đang tải danh sách việc làm đã ứng tuyển...</p>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-[8px] p-10 text-center shadow-sm select-none max-w-xl mx-auto space-y-5">
          <div className="h-16 w-16 bg-[#00B14F]/5 text-[#00B14F] border border-[#00B14F]/10 rounded-[8px] flex items-center justify-center mx-auto shadow-sm">
            <Briefcase size={28} />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-850 text-base md:text-lg">
              {applications.length === 0 ? "Chưa ứng tuyển công việc nào" : "Chưa tìm thấy đơn ứng tuyển"}
            </h3>
            <p className="text-slate-455 text-xs font-light leading-relaxed max-w-sm mx-auto">
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
        <div className="space-y-4 animate-fadeIn">
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
                  <div className="flex items-center gap-1.5 font-semibold text-slate-455 text-xs">
                    <Building2 size={13} className="text-slate-350" />
                    <span>Nhà tuyển dụng chuyên nghiệp</span>
                  </div>
                </div>

                {/* Resume used */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-55 border border-slate-200 rounded-[6px] text-xs text-slate-655 font-bold">
                  <span className="p-1 bg-red-50 border border-red-100 text-red-500 rounded-[4px]">
                    <FileText size={12} />
                  </span>
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
                  className="flex-grow md:flex-none px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-355 text-slate-655 rounded-[6px] text-xs font-bold transition-all text-center flex items-center justify-center gap-1"
                >
                  <span>Xem tin tuyển dụng</span>
                  <ChevronRight size={13} />
                </Link>

                {app.status === "PENDING" && (
                  <button
                    onClick={() => setCancelModalAppId(app.id)}
                    className="flex-grow md:flex-none px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-100 text-red-655 hover:text-red-750 font-bold rounded-[6px] text-xs transition-all flex items-center justify-center gap-1 cursor-pointer bg-white"
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
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white rounded-[6px] text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer border-none"
              >
                {cancelling ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                <span>Rút hồ sơ</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
