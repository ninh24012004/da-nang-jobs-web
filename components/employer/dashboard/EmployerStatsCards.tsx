"use client";

import React from "react";
import { Briefcase, UserCheck, Eye, Clock, TrendingUp, CheckCircle2, Sparkles } from "lucide-react";

interface EmployerStatsCardsProps {
  jobsTotalElements: number;
  applicantsCount: number;
  approvedJobsCount: number;
  pendingJobsCount: number;
}

export default function EmployerStatsCards({
  jobsTotalElements,
  applicantsCount,
  approvedJobsCount,
  pendingJobsCount,
}: EmployerStatsCardsProps) {
  const stats = [
    {
      label: "Tổng số tin đăng",
      value: jobsTotalElements,
      subtext: "Tổng chiến dịch tuyển dụng",
      trendIcon: TrendingUp,
      trendText: "Hoạt động và lưu trữ",
      trendColor: "text-emerald-600",
      icon: Briefcase,
      iconBg: "bg-[#00B14F]/10 text-[#00B14F]",
    },
    {
      label: "Hồ sơ ứng tuyển",
      value: applicantsCount,
      subtext: "Hồ sơ đã tiếp nhận",
      trendIcon: TrendingUp,
      trendText: "Từ các nguồn tuyển dụng",
      trendColor: "text-emerald-600",
      icon: UserCheck,
      iconBg: "bg-blue-50 text-blue-600",
    },
    {
      label: "Tin đang hiển thị",
      value: approvedJobsCount,
      subtext: "Tin đã phê duyệt",
      trendIcon: CheckCircle2,
      trendText: "Đang hiển thị nhận CV",
      trendColor: "text-emerald-600",
      icon: Eye,
      iconBg: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Tin chờ phê duyệt",
      value: pendingJobsCount,
      subtext: "Tin đang đợi duyệt",
      trendIcon: Clock,
      trendText: "Kiểm duyệt trong 24h",
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
            className="bg-white p-5 rounded-[8px] border border-slate-200 shadow-sm transition-colors flex items-center justify-between group"
          >
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-2xl font-extrabold text-slate-800 transition-colors">
                {stat.value}
              </h3>
              <p className={`text-[10px] ${stat.trendColor} flex items-center gap-1 font-semibold`}>
                <TrendIcon size={12} />
                <span>{stat.trendText}</span>
              </p>
            </div>
            <div className={`p-3.5 rounded-[6px] ${stat.iconBg} transition-colors`}>
              <Icon size={22} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
