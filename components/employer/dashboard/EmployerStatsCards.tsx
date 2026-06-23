import React from "react";
import { Briefcase, UserCheck, Eye, Clock, TrendingUp, CheckCircle2, AlertCircle } from "lucide-react";
import { EmployerDashboardMetrics } from "@/types/dashboard";

interface EmployerStatsCardsProps {
  metrics: EmployerDashboardMetrics | null;
  approvedJobsCount: number;
  pendingJobsCount: number;
  loading?: boolean;
}

export default function EmployerStatsCards({ 
  metrics, 
  approvedJobsCount = 0,
  pendingJobsCount = 0,
  loading = false 
}: EmployerStatsCardsProps) {
  if (loading || !metrics) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-[8px] border border-slate-200 shadow-sm animate-pulse flex items-center justify-between"
          >
            <div className="space-y-2.5 w-2/3">
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              <div className="h-7 bg-slate-200 rounded w-2/3"></div>
              <div className="h-3 bg-slate-200 rounded w-5/6"></div>
            </div>
            <div className="w-11 h-11 bg-slate-200 rounded-[6px]"></div>
          </div>
        ))}
      </div>
    );
  }

  const stats = [
    {
      label: "Tổng tin đăng",
      value: metrics.totalJobs ?? 0,
      subtext: `Chờ duyệt: ${pendingJobsCount}`,
      trendIcon: Briefcase,
      trendText: "Tổng số chiến dịch tuyển dụng",
      trendColor: "text-slate-500",
      icon: Briefcase,
      iconBg: "bg-[#00B14F]/10 text-[#00B14F]",
    },
    {
      label: "Tin đang hoạt động",
      value: approvedJobsCount,
      subtext: "Tin đang tuyển hiển thị nhận CV",
      trendIcon: Eye,
      trendText: "Tin đã được phê duyệt",
      trendColor: "text-emerald-600",
      icon: Eye,
      iconBg: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Hồ sơ tiếp nhận",
      value: metrics.totalApplications ?? 0,
      subtext: `Đã duyệt: ${metrics.approvedApplications ?? 0} • Từ chối: ${metrics.rejectedApplications ?? 0}`,
      trendIcon: UserCheck,
      trendText: "Tổng lượng CV đã gửi về",
      trendColor: "text-blue-600",
      icon: UserCheck,
      iconBg: "bg-blue-50 text-blue-600",
    },
    {
      label: "Hồ sơ chờ tiếp nhận",
      value: metrics.pendingApplications ?? 0,
      subtext: "Yêu cầu xử lý hồ sơ mới",
      trendIcon: Clock,
      trendText: "Hồ sơ mới chưa duyệt",
      trendColor: "text-amber-600",
      icon: Clock,
      iconBg: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        const TrendIcon = stat.trendIcon;
        return (
          <div
            key={i}
            className="bg-white p-5 rounded-[8px] border border-slate-200 shadow-sm transition-all hover:shadow-md flex items-center justify-between group"
          >
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-2xl font-extrabold text-slate-800 transition-colors">
                {typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}
              </h3>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-slate-400 font-semibold block">{stat.subtext}</span>
                <p className={`text-[9px] ${stat.trendColor} flex items-center gap-0.5 font-bold`}>
                  <TrendIcon size={10} />
                  <span>{stat.trendText}</span>
                </p>
              </div>
            </div>
            <div className={`p-3.5 rounded-[6px] ${stat.iconBg} transition-colors group-hover:scale-105 duration-200`}>
              <Icon size={22} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
