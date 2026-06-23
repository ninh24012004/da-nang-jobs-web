"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Compass, Loader2, Building2, MapPin, DollarSign, ArrowRight } from "lucide-react";
import { useCandidateProfile } from "@/app/candidate/profile/CandidateProfileContext";

export default function JobRecommendations() {
  const {
    recommendedJobs,
    loadingJobs,
    formData,
    setActiveTab,
    setIsEditing,
  } = useCandidateProfile();

  return (
    <div className="space-y-5 text-left animate-fadeIn">
      <div className="bg-white p-5 rounded-[8px] border border-slate-200 shadow-sm">
        <h3 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-1.5">
          <Sparkles className="text-amber-500 fill-amber-500" size={16} />
          <span>Việc làm tương thích với bạn</span>
        </h3>
        <p className="text-[10px] text-slate-450 mt-0.5 leading-normal">
          Sắp xếp dựa trên cấu hình ngành nghề ({formData.categoryIds.length}) và kỹ năng ({formData.skillIds.length}) của bạn.
        </p>
      </div>

      {loadingJobs ? (
        <div className="py-20 flex flex-col items-center justify-center gap-2 bg-white border border-slate-200 rounded-[8px]">
          <Loader2 className="h-8 w-8 animate-spin text-[#00B14F]" />
          <p className="text-xs text-slate-400 font-semibold">Đang phân tích tin tuyển dụng...</p>
        </div>
      ) : recommendedJobs.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-[8px] border border-slate-200 flex flex-col items-center justify-center space-y-4">
          <div className="h-12 w-12 bg-slate-50 border border-slate-200 rounded-[8px] flex items-center justify-center text-slate-400">
            <Compass size={24} />
          </div>
          <div className="max-w-md">
            <h4 className="font-bold text-slate-700 text-sm">Chưa tìm thấy công việc phù hợp lý tưởng</h4>
            <p className="text-xs text-slate-455 mt-1 leading-normal">
              Hệ thống chưa tìm thấy tin tuyển dụng nào trực tiếp trùng khớp với danh sách ngành nghề của bạn.
            </p>
          </div>
          <button
            onClick={() => {
              setActiveTab("preferences");
              setIsEditing(true);
            }}
            className="px-4 py-2 bg-[#00B14F] hover:bg-[#00873D] text-white rounded-[6px] text-xs font-bold transition-colors cursor-pointer border-none"
          >
            Điều chỉnh gợi ý
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendedJobs.map(({ job, score, matchedCategoriesCount, matchedSkillsCount }) => (
            <div
              key={job.id}
              className="bg-white border border-slate-200 rounded-[8px] p-5 hover:shadow-md transition-all duration-150 flex flex-col justify-between group relative overflow-hidden text-left"
            >
              {/* Compatibility Badge */}
              <div className="absolute right-0 top-0 bg-amber-500/10 text-amber-600 font-bold text-[10px] px-2.5 py-1.5 rounded-bl-[8px] flex items-center gap-0.5">
                <Sparkles size={11} className="fill-amber-500 stroke-amber-500" />
                <span>{score}% khớp</span>
              </div>

              <div className="space-y-3">
                <div>
                  {/* Categories tags */}
                  <div className="flex flex-wrap gap-1 mb-2 pr-20">
                    {job.categoryNames?.slice(0, 2).map((catName) => (
                      <span key={catName} className="bg-[#00B14F]/5 text-[#00B14F] text-[9px] font-bold px-1.5 py-0.5 rounded-[4px] border border-[#00B14F]/10">
                        {catName}
                      </span>
                    ))}
                  </div>

                  {/* Title */}
                  <h4 className="font-bold text-slate-800 text-sm hover:text-[#00B14F] transition-colors leading-tight line-clamp-1">
                    {job.jobTitle}
                  </h4>
                  
                  {/* Recruiter */}
                  <p className="text-[10px] text-slate-455 font-semibold mt-1 flex items-center gap-1">
                    <Building2 size={12} className="text-slate-350" />
                    <span className="truncate">{job.employerName || "Doanh nghiệp tuyển dụng"}</span>
                  </p>
                </div>

                {/* Location and Salary */}
                <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-500 border-t border-b border-slate-100 py-2">
                  <div className="flex items-center gap-1">
                    <MapPin size={12} className="text-slate-400" />
                    <span className="truncate">{job.wardName || "Đà Nẵng"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign size={12} className="text-slate-400" />
                    <span className="text-[#00B14F] font-bold">
                      {job.salaryType === "NEGOTIABLE" || job.salaryType === "Lương thỏa thuận"
                        ? "Thỏa thuận" 
                        : `${(job.minimumSalary / 1000000).toFixed(0)} - ${(job.maximumSalary / 1000000).toFixed(0)} Tr`}
                    </span>
                  </div>
                </div>

                {/* Technical skill tags */}
                {job.skillNames && job.skillNames.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex flex-wrap gap-1">
                      {job.skillNames.slice(0, 2).map((sn) => (
                        <span key={sn} className="bg-slate-50 border border-slate-200 text-slate-550 text-[9px] px-1.5 py-0.5 rounded-[4px] font-semibold">
                          {sn}
                        </span>
                      ))}
                      {job.skillNames.length > 2 && (
                        <span className="bg-slate-100 text-slate-500 text-[8px] px-1.5 py-0.5 rounded-[4px] font-bold">
                          +{job.skillNames.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-4 mt-4 pt-3 border-t border-slate-100">
                <div className="text-[9px] text-slate-400 font-semibold leading-tight">
                  {matchedCategoriesCount > 0 && <span className="block">• Khớp {matchedCategoriesCount} ngành</span>}
                  {matchedSkillsCount > 0 && <span className="block">• Khớp {matchedSkillsCount} kỹ năng</span>}
                </div>

                <Link
                  href={`/jobs/${job.id}`}
                  className="px-3 py-1.5 bg-[#00B14F]/10 hover:bg-[#00B14F] text-[#00B14F] hover:text-white rounded-[6px] text-xs font-bold transition-colors flex items-center gap-0.5"
                >
                  <span>Chi tiết</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
