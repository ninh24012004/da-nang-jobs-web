"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import EmployerHeader from "@/components/layout/employer/EmployerHeader";
import EmployerFooter from "@/components/layout/employer/EmployerFooter";
import EmployerDashboardTabs from "@/components/employer/dashboard/EmployerDashboardTabs";
import { Award, Plus, Sparkles } from "lucide-react";
import { EmployerDashboardProvider, useEmployerDashboard } from "./EmployerDashboardContext";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    isAuthenticated,
    isApproved,
    companyDetails,
    jobsTotalElements,
    applicants,
    resetForm
  } = useEmployerDashboard();

  let activeTab = "dashboard";
  if (pathname.includes("/employer/dashboard/jobs")) activeTab = "jobs";
  else if (pathname.includes("/employer/dashboard/cvs")) activeTab = "cvs";
  else if (pathname.includes("/employer/dashboard/ai-search")) activeTab = "ai-search";
  else if (pathname.includes("/employer/dashboard/company")) activeTab = "company";
  else if (pathname.includes("/employer/dashboard/post-job")) activeTab = "post-job";

  if (!isAuthenticated || isApproved !== true) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-t-[#00B14F] border-slate-200" />
          <p className="text-slate-500 font-medium text-sm">Đang xác thực thông tin Nhà tuyển dụng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen flex flex-col font-sans antialiased text-slate-800">
      <EmployerHeader />

      <main className="flex-grow pt-[88px] max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Recruiter Banner */}
        <div className="mb-8 p-6 rounded-[8px] bg-gradient-to-r from-[#0F172A] to-[#1E293B] text-white shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 translate-x-10 -translate-y-10 pointer-events-none">
            <Award size={300} />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="bg-[#00B14F]/20 text-[#00B14F] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-[6px] backdrop-blur-sm border border-[#00B14F]/30">
                Không gian nhà tuyển dụng chuyên nghiệp
              </span>
              <h2 className="text-2xl font-extrabold mt-2 tracking-tight">Chào mừng bạn quay lại, {companyDetails.name}!</h2>
              <p className="text-xs text-slate-300 mt-1 max-w-xl font-light">
                DN JOBS AI Core đang hỗ trợ doanh nghiệp tiếp cận với nguồn ứng viên chất lượng tại thành phố Đà Nẵng. Hãy bắt đầu chiến dịch tuyển dụng hôm nay!
              </p>
            </div>
            <div className="flex gap-2 select-none">
              <button
                onClick={() => {
                  resetForm();
                  router.push("/employer/dashboard/post-job");
                }}
                className="flex items-center gap-1.5 bg-white text-[#0F172A] hover:bg-slate-100 px-4 py-2.5 rounded-[6px] text-xs font-bold transition-colors cursor-pointer border-none"
              >
                <Plus size={16} className="text-[#00B14F]" />
                <span>Đăng tuyển tin mới</span>
              </button>
              <button
                onClick={() => router.push("/employer/dashboard/ai-search")}
                className="flex items-center gap-1.5 bg-[#00B14F] hover:bg-[#00873D] text-white px-4 py-2.5 rounded-[6px] text-xs font-bold transition-colors cursor-pointer border-none"
              >
                <Sparkles size={16} className="text-yellow-300" />
                <span>Tìm ứng viên AI</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Dashboard Left Tab Menu Navigation */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <EmployerDashboardTabs
              activeTab={activeTab}
              onTabChange={(tab) => {
                if (tab === "dashboard") router.push("/employer/dashboard");
                else router.push(`/employer/dashboard/${tab}`);
              }}
              jobsCount={jobsTotalElements}
              pendingCvsCount={applicants.filter(a => a.status === "Mới tiếp nhận").length}
            />
          </div>

          {/* Dashboard Dynamic Tab Main Content Area */}
          <div className="flex-grow min-w-0">
            {children}
          </div>
        </div>
      </main>

      <EmployerFooter />
    </div>
  );
}

export default function EmployerDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <EmployerDashboardProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </EmployerDashboardProvider>
  );
}
