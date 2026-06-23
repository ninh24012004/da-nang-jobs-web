"use client";

import { Suspense } from "react";
import {
  User,
  MapPin,
  Sparkles,
  Loader2,
  CheckCircle2,
  Sliders,
  FileCheck2,
  Briefcase,
  ShieldAlert
} from "lucide-react";
import Link from "next/link";

// Context
import { CandidateProfileProvider, useCandidateProfile } from "./CandidateProfileContext";

// Components
import ProfileDetails from "@/components/candidate/profile/ProfileDetails";
import JobPreferences from "@/components/candidate/profile/JobPreferences";
import JobRecommendations from "@/components/candidate/profile/JobRecommendations";
import ResumeManagement from "@/components/candidate/profile/ResumeManagement";
import AppliedJobs from "@/components/candidate/profile/AppliedJobs";

function CandidateProfileContent() {
  const {
    activeTab,
    setActiveTab,
    setIsEditing,
    loading,
    isAuthenticated,
    userSession,
    formData,
    completenessPercentage,
    isOnboardingNeeded,
    uploadingAvatar,
    handleAvatarChange,
    resumes,
    recommendedJobs,
    applications,
  } = useCandidateProfile();

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-[#00B14F]" />
          <p className="text-slate-500 font-bold text-xs tracking-wide">Đang tải thông tin hồ sơ ứng viên...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-16 font-sans">
      {/* Top Background Slate Banner */}
      <div className="w-full bg-[#0F172A] text-white py-10 px-4 md:px-8 relative overflow-hidden select-none border-b border-slate-800">
        <div className="absolute right-0 bottom-0 w-96 h-96 bg-[#00B14F]/5 rounded-full blur-3xl -mr-16 -mb-16"></div>

        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full border-2 border-slate-700 bg-slate-800 flex items-center justify-center relative overflow-hidden">
              {uploadingAvatar ? (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-[#00B14F]" />
                </div>
              ) : formData.avatarUrl ? (
                <img src={formData.avatarUrl} alt="Avatar" className="h-full w-full object-cover rounded-full" />
              ) : (
                <User className="h-8 w-8 text-slate-400" />
              )}
            </div>

            <div className="space-y-1 text-left">
              <div className="flex items-center gap-2">
                <h1 className="text-lg md:text-xl font-extrabold tracking-tight">
                  {formData.fullName || "Ứng Viên"}
                </h1>
                <span className="bg-[#00B14F]/10 text-[#00B14F] text-[9px] font-bold px-2 py-0.5 rounded-[4px] border border-[#00B14F]/20 uppercase tracking-wider flex items-center gap-0.5">
                  <CheckCircle2 size={10} />
                  Đã xác thực
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <span>{userSession?.email}</span>
                {formData.wardId && (
                  <>
                    <span className="text-slate-650">•</span>
                    <span className="flex items-center gap-0.5">
                      <MapPin size={12} /> Đà Nẵng
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Right Area: Profile Completeness Score Card */}
          <div className="bg-slate-900/50 rounded-[8px] p-4 border border-slate-800 max-w-xs w-full">
            <div className="flex justify-between items-center text-xs font-bold text-slate-355 mb-1.5">
              <span>Độ hoàn thiện CV</span>
              <span className="text-[#00B14F]">{completenessPercentage}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#00B14F] rounded-full transition-all duration-350"
                style={{ width: `${completenessPercentage}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1.5 text-left leading-normal">
              * Hồ sơ đầy đủ giúp các nhà tuyển dụng dễ dàng tìm thấy bạn.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Onboarding alert */}
        {isOnboardingNeeded && (
          <div className="mb-6 p-4 rounded-[8px] bg-amber-50 border border-amber-250 text-amber-800 shadow-sm flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-[6px] text-amber-600 flex-shrink-0">
              <ShieldAlert size={18} />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-xs uppercase tracking-wider">Cập nhật hồ sơ & Cài đặt gợi ý công việc</h3>
              <p className="text-xs text-amber-700 mt-1">
                Chào mừng bạn đến với Đà Nẵng Jobs! Vui lòng hoàn thành địa chỉ sinh sống và cập nhật các ngành nghề quan tâm để bắt đầu nhận gợi ý việc làm.
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar Menu Navigation */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-[8px] border border-slate-200 p-4 shadow-sm sticky top-24 space-y-1.5 select-none text-left">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">Hồ sơ ứng viên</p>

              <button
                onClick={() => {
                  setActiveTab("profile");
                  setIsEditing(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold rounded-[6px] transition-colors cursor-pointer text-left border-0 ${
                  activeTab === "profile"
                    ? "bg-[#00B14F]/10 text-[#00B14F]"
                    : "text-slate-600 bg-transparent hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <User size={16} />
                  <span>Hồ sơ cá nhân</span>
                </div>
              </button>

              <button
                onClick={() => {
                  setActiveTab("preferences");
                  setIsEditing(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold rounded-[6px] transition-colors cursor-pointer text-left border-0 ${
                  activeTab === "preferences"
                    ? "bg-[#00B14F]/10 text-[#00B14F]"
                    : "text-slate-600 bg-transparent hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Sliders size={16} />
                  <span>Cấu hình gợi ý</span>
                </div>
              </button>

              <button
                onClick={() => {
                  setActiveTab("recommendations");
                  setIsEditing(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold rounded-[6px] transition-colors cursor-pointer text-left border-0 ${
                  activeTab === "recommendations"
                    ? "bg-[#00B14F]/10 text-[#00B14F]"
                    : "text-slate-600 bg-transparent hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Sparkles size={16} className={recommendedJobs.length > 0 ? "text-amber-500 fill-amber-500/10" : ""} />
                  <span>Gợi ý việc làm</span>
                </div>
                {recommendedJobs.length > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-[4px] font-bold ${
                    activeTab === "recommendations" ? "bg-amber-500 text-white" : "bg-amber-500/10 text-amber-600"
                  }`}>
                    {recommendedJobs.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setActiveTab("resumes");
                  setIsEditing(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold rounded-[6px] transition-colors cursor-pointer text-left border-0 ${
                  activeTab === "resumes"
                    ? "bg-[#00B14F]/10 text-[#00B14F]"
                    : "text-slate-600 bg-transparent hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileCheck2 size={16} />
                  <span>Hồ sơ CV của tôi</span>
                </div>
                {resumes.length > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-[4px] font-bold ${
                    activeTab === "resumes" ? "bg-[#00B14F] text-white" : "bg-[#00B14F]/10 text-[#00B14F]"
                  }`}>
                    {resumes.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setActiveTab("applications");
                  setIsEditing(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold rounded-[6px] transition-colors cursor-pointer text-left border-0 ${
                  activeTab === "applications"
                    ? "bg-[#00B14F]/10 text-[#00B14F]"
                    : "text-slate-600 bg-transparent hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Briefcase size={16} />
                  <span>Việc làm đã ứng tuyển</span>
                </div>
                {applications.length > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-[4px] font-bold ${
                    activeTab === "applications" ? "bg-[#00B14F] text-white" : "bg-[#00B14F]/10 text-[#00B14F]"
                  }`}>
                    {applications.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-grow min-w-0">
            {activeTab === "profile" && <ProfileDetails />}
            {activeTab === "preferences" && <JobPreferences />}
            {activeTab === "recommendations" && <JobRecommendations />}
            {activeTab === "resumes" && <ResumeManagement />}
            {activeTab === "applications" && <AppliedJobs />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CandidateProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-[#00B14F]" />
          <p className="text-slate-500 font-bold text-xs tracking-wide">Đang tải thông tin hồ sơ ứng viên...</p>
        </div>
      </div>
    }>
      <CandidateProfileProvider>
        <CandidateProfileContent />
      </CandidateProfileProvider>
    </Suspense>
  );
}
