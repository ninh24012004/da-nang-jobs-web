"use client";

import React from "react";
import { EmployerJobStatsResponse, EmployerApplicationStatsResponse } from "@/types/dashboard";

interface EmployerStatsDistributionProps {
  categories: EmployerJobStatsResponse[];
  statuses: EmployerApplicationStatsResponse[];
  loading?: boolean;
}

export default function EmployerStatsDistribution({
  categories = [],
  statuses = [],
  loading = false,
}: EmployerStatsDistributionProps) {
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-[8px] border border-slate-200 shadow-sm animate-pulse space-y-6 h-[350px]">
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
          <div className="h-3 bg-slate-200 rounded w-1/3"></div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="space-y-1">
              <div className="flex justify-between">
                <div className="h-3 bg-slate-200 rounded w-1/3"></div>
                <div className="h-3 bg-slate-200 rounded w-8"></div>
              </div>
              <div className="h-2 bg-slate-100 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Calculate totals
  const totalJobs = categories.reduce((sum, item) => sum + item.jobCount, 0);
  const totalApps = statuses.reduce((sum, item) => sum + item.count, 0);

  // Status mapping to label & color
  const mapStatus = (statusName: string) => {
    switch (statusName.toUpperCase()) {
      case "PENDING":
        return { label: "Mới tiếp nhận", colorClass: "bg-blue-500", textColor: "text-blue-600" };
      case "ACCEPTED":
        return { label: "Đã tuyển / Duyệt", colorClass: "bg-emerald-500", textColor: "text-emerald-600" };
      case "REJECTED":
        return { label: "Từ chối", colorClass: "bg-rose-500", textColor: "text-rose-600" };
      default:
        return { label: statusName, colorClass: "bg-slate-500", textColor: "text-slate-600" };
    }
  };

  const hasJobs = categories.length > 0 && totalJobs > 0;
  const hasApps = statuses.length > 0 && totalApps > 0;

  return (
    <div className="bg-white p-6 rounded-[8px] border border-slate-200 shadow-sm space-y-6 min-h-[350px] flex flex-col justify-between">
      {/* Category Stats */}
      <div className="space-y-3 flex-1">
        <div>
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Tin đăng theo danh mục</h4>
          <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Tỷ lệ phân bố các công việc đang tuyển dụng</p>
        </div>

        {!hasJobs ? (
          <div className="text-[10px] text-slate-400 font-semibold italic py-4">
            Chưa có tin đăng được xếp hạng.
          </div>
        ) : (
          <div className="space-y-3 max-h-[120px] overflow-y-auto pr-1">
            {categories.slice(0, 3).map((item, idx) => {
              const percentage = totalJobs > 0 ? Math.round((item.jobCount / totalJobs) * 100) : 0;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-slate-700 truncate max-w-[150px]" title={item.categoryName}>
                      {item.categoryName}
                    </span>
                    <span className="text-slate-500">{item.jobCount} tin ({percentage}%)</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#00B14F] rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <hr className="border-slate-100" />

      {/* Application Status Stats */}
      <div className="space-y-3 flex-1 mt-2">
        <div>
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Trạng thái đơn ứng tuyển</h4>
          <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Tỷ lệ duyệt và phản hồi hồ sơ ứng viên</p>
        </div>

        {!hasApps ? (
          <div className="text-[10px] text-slate-400 font-semibold italic py-4">
            Chưa nhận đơn ứng tuyển nào.
          </div>
        ) : (
          <div className="space-y-3 max-h-[120px] overflow-y-auto pr-1">
            {statuses.map((item, idx) => {
              const { label, colorClass, textColor } = mapStatus(item.statusName);
              const percentage = totalApps > 0 ? Math.round((item.count / totalApps) * 100) : 0;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-slate-700">{label}</span>
                    <span className={`${textColor}`}>{item.count} hồ sơ ({percentage}%)</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colorClass} rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
