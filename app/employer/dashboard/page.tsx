"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Plus, Sparkles, UserCheck, ChevronRight, Check, X } from "lucide-react";
import EmployerStatsCards from "@/components/employer/dashboard/EmployerStatsCards";
import EmployerTrendsChart from "@/components/employer/dashboard/EmployerTrendsChart";
import EmployerStatsDistribution from "@/components/employer/dashboard/EmployerStatsDistribution";
import { useEmployerDashboard } from "./EmployerDashboardContext";

export default function EmployerDashboardOverview() {
  const router = useRouter();
  const {
    employerSummary,
    employerTrends,
    summaryLoading,
    realJobs,
    handleUpdateStatus,
    resetForm
  } = useEmployerDashboard();

  const metrics = employerSummary?.metrics || null;
  const recentJobs = employerSummary?.recentJobs || [];
  const recentApplications = employerSummary?.recentApplications || [];
  const jobsByCategory = employerSummary?.jobsByCategory || [];
  const applicationsByStatus = employerSummary?.applicationsByStatus || [];

  // Calculate approved/pending jobs from realJobs list
  const approvedJobsCount = realJobs.filter(j => j.approveStatus === "APPROVED").length;
  const pendingJobsCount = realJobs.filter(j => j.approveStatus === "PENDING").length;

  return (
    <div className="space-y-6 select-none font-sans text-xs text-slate-650 font-semibold">
      {/* 1. Metrics Cards */}
      <EmployerStatsCards 
        metrics={metrics} 
        approvedJobsCount={approvedJobsCount}
        pendingJobsCount={pendingJobsCount}
        loading={summaryLoading} 
      />

      {/* 2. Middle Row: Trends Chart & Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EmployerTrendsChart trends={employerTrends} loading={summaryLoading} />
        </div>
        <div>
          <EmployerStatsDistribution
            categories={jobsByCategory}
            statuses={applicationsByStatus}
            loading={summaryLoading}
          />
        </div>
      </div>

      {/* 3. Quick Shortcuts */}
      <div className="bg-white p-6 rounded-[8px] border border-slate-200 shadow-sm space-y-4">
        <h4 className="text-sm font-bold text-slate-800">Phím tắt thao tác nhanh</h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 select-none">
          <button
            onClick={() => {
              resetForm();
              router.push("/employer/dashboard/post-job");
            }}
            className="flex items-center justify-between p-4 rounded-[8px] border border-slate-100 hover:border-[#00B14F]/30 hover:bg-[#00B14F]/5 text-left transition-colors group cursor-pointer bg-white"
          >
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-[6px] bg-[#00B14F]/10 text-[#00B14F]">
                <Plus size={16} />
              </span>
              <div>
                <span className="text-xs font-bold text-slate-700 block">Tạo tin đăng mới</span>
                <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">Bắt đầu tuyển vị trí mới</span>
              </div>
            </div>
            <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={() => router.push("/employer/dashboard/ai-search")}
            className="flex items-center justify-between p-4 rounded-[8px] border border-slate-100 hover:border-[#00B14F]/30 hover:bg-[#00B14F]/5 text-left transition-colors group cursor-pointer bg-white"
          >
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-[6px] bg-amber-50 text-amber-600">
                <Sparkles size={16} />
              </span>
              <div>
                <span className="text-xs font-bold text-slate-700 block">Dò hồ sơ AI thông minh</span>
                <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">Quét tìm ứng viên tiềm năng</span>
              </div>
            </div>
            <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={() => router.push("/employer/dashboard/cvs")}
            className="flex items-center justify-between p-4 rounded-[8px] border border-slate-100 hover:border-slate-350 hover:bg-slate-50/50 text-left transition-colors group cursor-pointer bg-white"
          >
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-[6px] bg-slate-100 text-slate-600">
                <UserCheck size={16} />
              </span>
              <div>
                <span className="text-xs font-bold text-slate-700 block">Duyệt hồ sơ chờ tiếp nhận</span>
                <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">Quản lý và cập nhật CV</span>
              </div>
            </div>
            <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* 4. Bottom Grid: Recent Jobs & Recent Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Jobs Column */}
        <div className="bg-white rounded-[8px] border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Tin tuyển dụng gần đây</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Các chiến dịch đăng tuyển mới được cập nhật</p>
              </div>
              <button
                onClick={() => router.push("/employer/dashboard/jobs")}
                className="text-xs font-bold text-[#00B14F] hover:underline flex items-center gap-0.5 cursor-pointer bg-transparent border-0"
              >
                Tất cả tin
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-150 font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="p-4">Tiêu đề tin</th>
                    <th className="p-4 text-center">Ngày tạo</th>
                    <th className="p-4 text-center">Ứng tuyển</th>
                    <th className="p-4 text-right">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {summaryLoading ? (
                    [1, 2, 3].map((n) => (
                      <tr key={n} className="animate-pulse">
                        <td className="p-4"><div className="h-3 bg-slate-200 rounded w-2/3"></div></td>
                        <td className="p-4"><div className="h-3 bg-slate-200 rounded w-16 mx-auto"></div></td>
                        <td className="p-4"><div className="h-3 bg-slate-200 rounded w-10 mx-auto"></div></td>
                        <td className="p-4 text-right"><div className="h-5 bg-slate-200 rounded w-14 ml-auto"></div></td>
                      </tr>
                    ))
                  ) : recentJobs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-400 font-bold italic">
                        Chưa có tin tuyển dụng nào được tạo.
                      </td>
                    </tr>
                  ) : (
                    recentJobs.slice(0, 4).map((job, idx) => (
                      <tr key={job.jobId || `job-${idx}`} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4">
                          <span className="font-bold text-slate-800 block truncate max-w-[200px]" title={job.jobTitle}>
                            {job.jobTitle}
                          </span>
                          <span className="text-[9px] text-slate-400 font-light mt-0.5">Mã tin: #{job.jobId}</span>
                        </td>
                        <td className="p-4 text-center text-slate-500 font-semibold">
                          {job.createdAt ? new Date(job.createdAt).toLocaleDateString("vi-VN") : "—"}
                        </td>
                        <td className="p-4 text-center text-slate-650 font-bold">
                          {job.applicationCount ?? 0}
                        </td>
                        <td className="p-4 text-right">
                          <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold border inline-block ${
                            job.approveStatus === "APPROVED" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                            job.approveStatus === "PENDING" ? "bg-amber-50 text-amber-600 border-amber-100" :
                            "bg-rose-50 text-rose-700 border-rose-100"
                          }`}>
                            {job.approveStatus === "APPROVED" ? "Đang tuyển" :
                             job.approveStatus === "PENDING" ? "Chờ duyệt" : "Từ chối"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Applications Column */}
        <div className="bg-white rounded-[8px] border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Ứng viên nộp hồ sơ gần đây</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Hồ sơ ứng tuyển mới nhất chờ tiếp nhận</p>
              </div>
              <button
                onClick={() => router.push("/employer/dashboard/cvs")}
                className="text-xs font-bold text-[#00B14F] hover:underline flex items-center gap-0.5 cursor-pointer bg-transparent border-0"
              >
                Tất cả hồ sơ
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-150 font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="p-4">Ứng viên</th>
                    <th className="p-4">Công việc</th>
                    <th className="p-4 text-center">Trạng thái</th>
                    <th className="p-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {summaryLoading ? (
                    [1, 2, 3].map((n) => (
                      <tr key={n} className="animate-pulse">
                        <td className="p-4">
                          <div className="h-3 bg-slate-200 rounded w-1/2 mb-1.5"></div>
                          <div className="h-2 bg-slate-200 rounded w-2/3"></div>
                        </td>
                        <td className="p-4"><div className="h-3 bg-slate-200 rounded w-2/3"></div></td>
                        <td className="p-4"><div className="h-3 bg-slate-200 rounded w-12 mx-auto"></div></td>
                        <td className="p-4 text-right"><div className="h-6 bg-slate-200 rounded w-16 ml-auto"></div></td>
                      </tr>
                    ))
                  ) : recentApplications.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-400 font-bold italic">
                        Chưa có ứng viên nào nộp hồ sơ gần đây.
                      </td>
                    </tr>
                  ) : (
                    recentApplications.slice(0, 4).map((candidate, idx) => (
                      <tr key={candidate.applicationId || `candidate-${idx}`} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4">
                          <div>
                            <p className="font-bold text-slate-800">{candidate.candidateName}</p>
                            <p className="text-[10px] text-slate-400 font-light mt-0.5">
                              Ngày nộp: {candidate.appliedAt ? new Date(candidate.appliedAt).toLocaleDateString("vi-VN") : "—"}
                            </p>
                          </div>
                        </td>
                        <td className="p-4 text-slate-650 truncate max-w-[150px]" title={candidate.jobTitle}>
                          {candidate.jobTitle}
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold border inline-block ${
                            candidate.status === "PENDING" ? "bg-blue-50 text-blue-700 border-blue-100" :
                            candidate.status === "ACCEPTED" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                            "bg-rose-50 text-rose-700 border-rose-100"
                          }`}>
                            {candidate.status === "PENDING" ? "Mới nộp" :
                             candidate.status === "ACCEPTED" ? "Đã duyệt" : "Từ chối"}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {candidate.status === "PENDING" ? (
                            <div className="flex justify-end gap-1.5 select-none">
                              <button
                                onClick={() => handleUpdateStatus(candidate.applicationId, "Đã duyệt")}
                                className="p-1.5 rounded-[6px] border border-slate-200 hover:border-emerald-200 hover:bg-emerald-50 text-slate-550 hover:text-emerald-700 transition-colors cursor-pointer bg-white"
                                title="Duyệt hồ sơ"
                              >
                                <Check size={12} />
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(candidate.applicationId, "Từ chối")}
                                className="p-1.5 rounded-[6px] border border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-slate-550 hover:text-rose-700 transition-colors cursor-pointer bg-white"
                                title="Từ chối"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-400 font-medium italic text-[11px] block pr-1">Đã xử lý</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
