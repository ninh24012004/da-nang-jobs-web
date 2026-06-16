"use client";

import React from "react";
import { LayoutDashboard, Briefcase, UserCheck, Sparkles, Building, Phone } from "lucide-react";

interface EmployerDashboardTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  jobsCount: number;
  pendingCvsCount: number;
}

export default function EmployerDashboardTabs({
  activeTab,
  onTabChange,
  jobsCount,
  pendingCvsCount,
}: EmployerDashboardTabsProps) {
  const tabs = [
    {
      id: "dashboard",
      label: "Bảng tin tổng quan",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: "jobs",
      label: "Quản lý tin đăng",
      icon: Briefcase,
      badge: jobsCount,
      badgeColor: "bg-[#00B14F]/10 text-[#00B14F]",
    },
    {
      id: "cvs",
      label: "Quản lý hồ sơ CV",
      icon: UserCheck,
      badge: pendingCvsCount,
      badgeColor: "bg-[#00B14F]/10 text-[#00B14F]",
    },
    {
      id: "ai-search",
      label: "Tìm hồ sơ AI Core",
      icon: Sparkles,
      iconColor: "text-amber-500",
      badge: null,
    },
    {
      id: "company",
      label: "Hồ sơ công ty",
      icon: Building,
      badge: null,
    },
  ];

  return (
    <div className="bg-white rounded-[8px] border border-slate-200 p-4 shadow-sm sticky top-24 space-y-1.5 select-none">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">Chuyên mục</p>

      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold rounded-[6px] transition-colors cursor-pointer text-left border-0 ${
              isActive
                ? "bg-[#00B14F]/10 text-[#00B14F]"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon size={16} className={tab.iconColor && !isActive ? tab.iconColor : ""} />
              <span>{tab.label}</span>
            </div>
            {tab.badge !== null && tab.badge > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-[4px] font-bold ${tab.badgeColor || ""}`}>
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}

      <div className="h-px bg-slate-100 my-4" />

      {/* Specialized consultant card in sidebar */}
      <div className="p-3 bg-[#00B14F]/5 border border-[#00B14F]/10 rounded-[8px]">
        <p className="text-[9px] font-bold text-[#00B14F] uppercase tracking-wider">Hỗ trợ riêng của bạn</p>
        <div className="flex items-center gap-2 mt-2">
          <div className="h-8 w-8 rounded-full bg-[#00B14F]/10 text-[#00B14F] flex items-center justify-center font-bold text-xs select-none">
            MA
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-800">Mai Anh Trần</p>
            <p className="text-[8px] text-slate-450">CSKH DN JOBS</p>
          </div>
        </div>
        <a
          href="tel:0905789123"
          className="mt-2.5 flex items-center justify-center gap-1 w-full bg-white border border-[#00B14F]/10 hover:bg-[#00B14F]/5 text-[10px] font-bold text-[#00B14F] py-1.5 rounded-[6px] transition-colors"
        >
          <Phone size={10} />
          <span>0905.789.123</span>
        </a>
      </div>
    </div>
  );
}
