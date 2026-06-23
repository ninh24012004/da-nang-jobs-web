"use client";

import React, { useState } from "react";
import { Mail, Phone, FileText, ExternalLink, Loader2, Briefcase, Search, ArrowLeft, Calendar, UserCheck, AlertCircle, DollarSign, MapPin } from "lucide-react";
import { JobResponse } from "@/types/job";

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
  jobId?: number;
}

interface EmployerApplicantTableProps {
  jobs: JobResponse[];
  applicants: Applicant[];
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  onExportExcel: () => void;
  exportLoading: boolean;
  onUpdateStatus: (id: number, newStatus: string) => void;
  actionLoading: boolean;
}

export default function EmployerApplicantTable({
  jobs = [],
  applicants = [],
  statusFilter,
  onStatusFilterChange,
  onExportExcel,
  exportLoading,
  onUpdateStatus,
  actionLoading,
}: EmployerApplicantTableProps) {
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [jobSearch, setJobSearch] = useState("");

  // Filter jobs based on search term
  const filteredJobs = jobs.filter((job) =>
    job.jobTitle.toLowerCase().includes(jobSearch.toLowerCase())
  );

  // Get selected job details
  const selectedJob = jobs.find((job) => job.id === selectedJobId);

  // Filter applicants based on selected job and statusFilter
  const filteredApplicants = applicants.filter((app) => {
    if (selectedJobId !== null) {
      if (app.jobId !== undefined) {
        if (app.jobId !== selectedJobId) return false;
      } else {
        // Fallback matching by role name if jobId is missing
        if (selectedJob && app.role !== selectedJob.jobTitle) return false;
      }
    } else {
      return false;
    }

    if (statusFilter === "ALL") return true;
    if (statusFilter === "PENDING") return app.status === "Mới tiếp nhận";
    if (statusFilter === "ACCEPTED") return app.status === "Đã duyệt";
    if (statusFilter === "REJECTED") return app.status === "Từ chối";
    if (statusFilter === "CANCELED") return app.status === "Đã hủy";
    return true;
  });

  // Calculate applicant counts for each job
  const getJobStats = (jobId: number) => {
    const jobApps = applicants.filter((a) => a.jobId === jobId);
    const total = jobApps.length;
    const pending = jobApps.filter((a) => a.status === "Mới tiếp nhận").length;
    return { total, pending };
  };

  const getApproveStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-[4px] text-[10px] font-bold border border-emerald-100">
            Đang hoạt động
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center bg-amber-50 text-amber-700 px-2 py-0.5 rounded-[4px] text-[10px] font-bold border border-amber-100">
            Chờ duyệt tin
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center bg-rose-50 text-rose-700 px-2 py-0.5 rounded-[4px] text-[10px] font-bold border border-rose-100">
            Đã ẩn / Từ chối
          </span>
        );
    }
  };

  return (
    <div className="w-full font-sans select-none">
      {selectedJobId === null ? (
        /* JOB GRID VIEW */
        <div className="space-y-6">
          {/* Header Panel */}
          <div className="bg-white rounded-[8px] border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                <Briefcase size={20} className="text-[#00B14F]" />
                <span>Xem đơn ứng tuyển theo vị trí công việc</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">Chọn tin tuyển dụng dưới đây để quản lý và duyệt hồ sơ ứng viên</p>
            </div>
            
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold" />
              <input
                type="text"
                placeholder="Tìm tin tuyển dụng..."
                value={jobSearch}
                onChange={(e) => setJobSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-[#00B14F] focus:ring-1 focus:ring-[#00B14F] rounded-[6px] pl-9 pr-4 py-2.5 text-xs text-slate-700 outline-none transition-all font-semibold"
              />
            </div>
          </div>

          {/* Grid of Job Cards */}
          {filteredJobs.length === 0 ? (
            <div className="bg-white rounded-[8px] border border-slate-200 shadow-sm p-12 text-center flex flex-col items-center justify-center space-y-3">
              <AlertCircle size={36} className="text-slate-300" />
              <p className="text-xs text-slate-400 font-bold">Không tìm thấy vị trí tuyển dụng nào.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredJobs.map((job) => {
                const { total, pending } = getJobStats(job.id);
                return (
                  <div
                    key={job.id}
                    onClick={() => setSelectedJobId(job.id)}
                    className="bg-white border border-slate-200 rounded-[8px] p-5 shadow-xs hover:border-[#00B14F]/40 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between h-48 group text-left"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        {getApproveStatusBadge(job.approveStatus)}
                        <span className="text-[10px] text-slate-400 font-mono">DNJ-{job.id}</span>
                      </div>
                      
                      <h4 className="font-extrabold text-slate-800 text-sm leading-snug group-hover:text-[#00B14F] transition-colors truncate">
                        {job.jobTitle}
                      </h4>

                      <div className="space-y-1 pt-1 text-[11px] text-slate-500 font-medium">
                        <p className="flex items-center gap-1.5">
                          <Calendar size={12} className="text-slate-400" />
                          <span>Hạn nộp: {new Date(job.deadline).toLocaleDateString("vi-VN")}</span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <MapPin size={12} className="text-slate-400" />
                          <span className="truncate">{job.address}</span>
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                      <div className="flex gap-2">
                        <span className="text-[10px] font-bold bg-[#00B14F]/10 border border-[#00B14F]/20 text-[#00B14F] px-2 py-0.5 rounded-[4px]">
                          {total} CV đã nộp
                        </span>
                        {pending > 0 && (
                          <span className="text-[10px] font-extrabold bg-amber-500 text-white px-2 py-0.5 rounded-[4px] animate-pulse">
                            {pending} mới
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] font-bold text-[#00B14F] group-hover:underline flex items-center gap-0.5">
                        Xem hồ sơ &rarr;
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* APPLICANT LIST VIEW FOR SELECTED JOB */
        <div className="bg-white rounded-[8px] border border-slate-200 shadow-sm p-6 flex flex-col space-y-4">
          {/* Header Panel */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              {/* Back Button */}
              <button
                type="button"
                onClick={() => setSelectedJobId(null)}
                className="p-2.5 rounded-[6px] border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-800 transition-colors cursor-pointer bg-white"
                title="Quay lại danh sách công việc"
              >
                <ArrowLeft size={16} />
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="bg-[#00B14F]/10 text-[#00B14F] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[4px]">
                    Vị trí tuyển dụng
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium font-mono">
                    Mã tin: DNJ-{selectedJob?.id}
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-slate-800 mt-1 truncate leading-snug">
                  {selectedJob?.jobTitle}
                </h3>
              </div>
            </div>

            {/* Actions & Excel */}
            <div className="flex items-center gap-2.5 shrink-0 select-none">
              <span className="text-xs font-semibold text-slate-500 flex items-center bg-slate-50 px-3.5 py-2 rounded-[6px] border border-slate-200">
                Tổng số: <strong className="text-slate-800 ml-1">{applicants.filter(a => a.jobId === selectedJob?.id).length} CV</strong>
              </span>
              <button
                type="button"
                onClick={onExportExcel}
                disabled={exportLoading || filteredApplicants.length === 0}
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
              Hiển thị: <strong className="text-[#00B14F]">{filteredApplicants.length} / {applicants.filter(a => a.jobId === selectedJob?.id).length} CV</strong>
            </span>
          </div>

          {/* Full-width Applicant Table */}
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-150 font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="p-4">Ứng viên</th>
                  <th className="p-4">Thông tin liên lạc</th>
                  <th className="p-4">Hồ sơ ứng tuyển</th>
                  <th className="p-4">Ngày nộp CV</th>
                  <th className="p-4 text-center">Trạng thái</th>
                  <th className="p-4 text-right">Cập nhật trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredApplicants.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-400 font-bold">
                      Không nhận được hồ sơ CV nào thuộc danh mục này!
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
                          <span className="flex items-center gap-1 text-slate-650">
                            <Mail size={11} className="text-slate-400" />
                            {candidate.email}
                          </span>
                          <span className="flex items-center gap-1 text-slate-655">
                            <Phone size={11} className="text-slate-400" />
                            {candidate.phone}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-700 font-semibold">
                        {candidate.resumeFileUrl ? (
                          <a
                            href={candidate.resumeFileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#00B14F] hover:underline"
                          >
                            <FileText size={12} />
                            <span>Xem CV đính kèm</span>
                            <ExternalLink size={10} />
                          </a>
                        ) : (
                          <span className="text-slate-450 font-medium italic text-[11px]">Không có tệp đính kèm</span>
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
        )}
      </div>
    );
  }
  
