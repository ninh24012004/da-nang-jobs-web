"use client";

import React from "react";
import { Mail, Phone, FileText, ExternalLink, Loader2 } from "lucide-react";

interface Applicant {
  id: number;
  name: string;
  role: string;
  date: string;
  score: number;
  status: string;
  email: string;
  phone: string;
  location: string;
  resumeFileUrl?: string;
}

interface EmployerApplicantTableProps {
  applicants: Applicant[];
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  onExportExcel: () => void;
  exportLoading: boolean;
  onUpdateStatus: (id: number, newStatus: string) => void;
  actionLoading: boolean;
}

export default function EmployerApplicantTable({
  applicants,
  statusFilter,
  onStatusFilterChange,
  onExportExcel,
  exportLoading,
  onUpdateStatus,
  actionLoading,
}: EmployerApplicantTableProps) {
  // Filter applicants locally for display based on selected tab
  const filteredApplicants = applicants.filter((app) => {
    if (statusFilter === "ALL") return true;
    if (statusFilter === "PENDING") return app.status === "Mới tiếp nhận";
    if (statusFilter === "ACCEPTED") return app.status === "Đã duyệt";
    if (statusFilter === "REJECTED") return app.status === "Từ chối";
    if (statusFilter === "CANCELED") return app.status === "Đã hủy";
    return true;
  });

  return (
    <div className="bg-white rounded-[8px] border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-800">Quản lý hồ sơ ứng viên ứng tuyển</h3>
          <p className="text-xs text-slate-400">Xem chi tiết thông tin và tải hồ sơ CV trực tuyến của ứng viên tại Đà Nẵng</p>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-semibold text-slate-500 flex items-center bg-slate-50 px-3.5 py-2 rounded-[6px] border border-slate-200">
            Tổng số: <strong className="text-slate-800 ml-1">{applicants.length} CV</strong>
          </span>
          <button
            type="button"
            onClick={onExportExcel}
            disabled={exportLoading || applicants.length === 0}
            className="flex items-center gap-1.5 bg-[#00B14F] hover:bg-[#00873D] disabled:bg-slate-200 disabled:text-slate-400 text-white px-4 py-2.5 rounded-[6px] text-xs font-bold transition-colors cursor-pointer border-none"
          >
            {exportLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Đang xuất...</span>
              </>
            ) : (
              <>
                <FileText size={14} />
                <span>Xuất File Excel</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Segment Filters for CVs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-100 text-left">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { label: "Tất cả", value: "ALL" },
            { label: "Mới tiếp nhận", value: "PENDING" },
            { label: "Đã duyệt", value: "ACCEPTED" },
            { label: "Từ chối", value: "REJECTED" },
            { label: "Đã hủy", value: "CANCELED" },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => onStatusFilterChange(item.value)}
              className={`px-3 py-1.5 rounded-[6px] text-xs font-bold border transition-colors cursor-pointer ${
                statusFilter === item.value
                  ? "bg-[#00B14F] border-[#00B14F] text-white"
                  : "bg-white border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-[6px] border border-slate-200">
          Hiển thị: <strong className="text-[#00B14F]">{filteredApplicants.length} / {applicants.length} CV</strong>
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-150 font-semibold text-slate-500 uppercase tracking-wider">
              <th className="p-4">Ứng viên</th>
              <th className="p-4">Thông tin liên lạc</th>
              <th className="p-4">Vị trí ứng tuyển</th>
              <th className="p-4">Ngày nộp CV</th>
              <th className="p-4 text-center">Trạng thái</th>
              <th className="p-4 text-right">Cập nhật trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filteredApplicants.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-slate-400 font-bold">
                  Chưa nhận được hồ sơ CV nào thuộc danh mục này!
                </td>
              </tr>
            ) : (
              filteredApplicants.map((candidate) => (
                <tr key={candidate.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-slate-800">{candidate.name}</p>
                    <p className="text-[10px] text-slate-400 font-light mt-0.5">{candidate.location}</p>
                  </td>
                  <td className="p-4">
                    <div className="space-y-0.5">
                      <span className="flex items-center gap-1 text-slate-600">
                        <Mail size={11} className="text-slate-400" />
                        {candidate.email}
                      </span>
                      <span className="flex items-center gap-1 text-slate-600">
                        <Phone size={11} className="text-slate-400" />
                        {candidate.phone}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-700 font-semibold">
                    <p>{candidate.role}</p>
                    {candidate.resumeFileUrl && (
                      <a
                        href={candidate.resumeFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#00B14F] hover:underline mt-1"
                      >
                        <FileText size={10} />
                        <span>Xem CV đính kèm</span>
                        <ExternalLink size={8} />
                      </a>
                    )}
                  </td>
                  <td className="p-4 text-slate-500">{candidate.date}</td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold ${
                        candidate.status === "Mới tiếp nhận"
                          ? "bg-blue-50 text-blue-700 border border-blue-100"
                          : candidate.status === "Đã duyệt"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : "bg-rose-50 text-rose-700 border border-rose-100"
                      }`}
                    >
                      {candidate.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {candidate.status === "Mới tiếp nhận" ? (
                      <div className="flex justify-end gap-1.5 select-none">
                        <button
                          onClick={() => onUpdateStatus(candidate.id, "Đã duyệt")}
                          disabled={actionLoading}
                          className="px-3 py-1.5 rounded-[6px] border border-emerald-100 hover:bg-emerald-50 text-[10px] font-bold text-emerald-700 transition-colors cursor-pointer bg-white disabled:opacity-50"
                        >
                          Duyệt
                        </button>
                        <button
                          onClick={() => onUpdateStatus(candidate.id, "Từ chối")}
                          disabled={actionLoading}
                          className="px-3 py-1.5 rounded-[6px] border border-rose-100 hover:bg-rose-50 text-[10px] font-bold text-rose-700 transition-colors cursor-pointer bg-white disabled:opacity-50"
                        >
                          Từ chối
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-400 font-medium italic text-[11px] block pr-4">Không thể chỉnh sửa</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
