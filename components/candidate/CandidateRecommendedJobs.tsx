"use client";
 
import { useEffect, useState } from "react";
import Link from "next/link";
import { DollarSign, MapPin, Calendar, ArrowRight, ShieldCheck, Sparkles, Sliders, Loader2, Building2 } from "lucide-react";
import { JobResponse } from "@/types/job";
import { CandidateResponse } from "@/types/candidate";
import { candidateService } from "@/services/candidateService";
import { jobService } from "@/services/jobService";
import { formatTime } from "@/lib/utils";
 
export default function CandidateRecommendedJobs() {
  const [recommendedJobs, setRecommendedJobs] = useState<JobResponse[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState<CandidateResponse | null>(null);
  const [hasPreferences, setHasPreferences] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
 
  useEffect(() => {
    const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
 
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.roleName === "CANDIDATE") {
          setIsAuthenticated(true);
 
          const loadRecommendedData = async () => {
            setIsLoadingProfile(true);
            try {
              // 1. Fetch Profile
              const candidateProfile = await candidateService.getCandidateProfile();
              setProfile(candidateProfile);
 
              const categoriesCount = candidateProfile.categories?.length || 0;
              const skillsCount = candidateProfile.skills?.length || 0;
              const hasPrefs = categoriesCount > 0 || skillsCount > 0;
              setHasPreferences(hasPrefs);
 
              if (hasPrefs) {
                // 2. Fetch recommended jobs from backend
                const res = await jobService.getRecommendedJobs(0, 6);
                if (res && res.content && res.content.length > 0) {
                  setRecommendedJobs(res.content);
                } else {
                  // Fallback: Client-side scoring and matching algorithm
                  console.log("Backend recommended jobs was empty. Running client-side matching fallback...");
                  let allJobsRes = null;
                  try {
                    allJobsRes = await jobService.getAllJobs(0, 20);
                  } catch (err) {
                    console.warn("getAllJobs failed in RecommendedJobs. Trying advancedSearchJobs fallback...", err);
                    try {
                      allJobsRes = await jobService.advancedSearchJobs({}, 0, 20);
                    } catch (searchErr) {
                      console.error("Both getAllJobs and advancedSearchJobs failed:", searchErr);
                    }
                  }
 
                  const activeApprovedJobs = (allJobsRes?.content || []).filter(
                    (j: any) => j.approveStatus === "APPROVED" && j.visibilityStatus === "ACTIVE"
                  );
 
                  const candidateCategoriesSet = new Set(
                    (candidateProfile.categories || []).map((c) => c.categoryName)
                  );
                  const candidateSkillsSet = new Set(
                    (candidateProfile.skills || []).map((s) => s.skillName)
                  );
 
                  const matched = activeApprovedJobs
                    .map((job: any) => {
                      let score = 0;
                      let matchedCategoriesCount = 0;
                      let matchedSkillsCount = 0;
 
                      if (job.categoryNames && job.categoryNames.length > 0) {
                        job.categoryNames.forEach((catName: string) => {
                          if (candidateCategoriesSet.has(catName)) {
                            score += 40; // Category match weight
                            matchedCategoriesCount++;
                          }
                        });
                      }
 
                      if (job.skillNames && job.skillNames.length > 0) {
                        job.skillNames.forEach((skillName: string) => {
                          if (candidateSkillsSet.has(skillName)) {
                            score += 15; // Skill match weight
                            matchedSkillsCount++;
                          }
                        });
                      }
 
                      return {
                        job,
                        score: Math.min(score, 100),
                        matchedCategoriesCount,
                        matchedSkillsCount
                      };
                    })
                    .filter((item: any) => item.score > 0)
                    .sort((a: any, b: any) => b.score - a.score)
                    .slice(0, 6)
                    .map((item: any) => item.job);
 
                  setRecommendedJobs(matched);
                }
              }
            } catch (err) {
              console.error("Error loading recommended jobs:", err);
            } finally {
              setIsLoadingProfile(false);
            }
          };
 
          loadRecommendedData();
        } else {
          setIsLoadingProfile(false);
        }
      } catch (e) {
        console.error(e);
        setIsLoadingProfile(false);
      }
    } else {
      setIsLoadingProfile(false);
    }
  }, []);
 
  const formatSalary = (type: string, min?: number, max?: number) => {
    if (type === "Lương thỏa thuận" || type === "NEGOTIABLE") return "Thỏa thuận";
    if (!min && !max) return "Thỏa thuận";
    const toMillions = (val: number) => (val / 1000000).toFixed(0);
    if (min && max) return `${toMillions(min)} - ${toMillions(max)} triệu`;
    if (min) return `Từ ${toMillions(min)} triệu`;
    if (max) return `Lên đến ${toMillions(max)} triệu`;
    return "Thỏa thuận";
  };
 
  const getCompanyInitials = (name?: string) => {
    if (!name) return "CO";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };
 
  // Do not render anything if user is not a candidate
  if (!isAuthenticated) return null;
 
  return (
    <section className="bg-white py-16 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 select-none">
          <div className="max-w-3xl text-left space-y-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00B14F] uppercase tracking-widest bg-[#00B14F]/10 px-3 py-1 rounded-[4px]">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Gợi ý việc làm thông minh</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
              Cơ Hội Việc Làm Phù Hợp Nhất Cho Bạn
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm font-normal">
              Hệ thống tự động phân tích Ngành nghề quan tâm &amp; Kỹ năng chuyên môn của bạn để gợi ý những công việc tốt nhất tại Đà Nẵng.
            </p>
          </div>
          <Link
            href="/candidate/profile?tab=preferences"
            className="flex items-center gap-1.5 self-start md:self-end px-4 py-2.5 bg-white hover:bg-gray-50 text-[#00B14F] hover:text-[#00873D] border border-slate-200 rounded-[6px] text-xs font-bold transition-colors duration-150 shadow-sm"
          >
            <Sliders size={13} />
            <span>Thay đổi cài đặt gợi ý</span>
          </Link>
        </div>
 
        {isLoadingProfile ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white rounded-[8px] border border-slate-200 p-6 shadow-sm flex flex-col justify-between h-[280px] animate-pulse"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="h-12 w-12 bg-gray-100 rounded-[6px]" />
                    <div className="space-y-1.5 flex flex-col items-end">
                      <div className="h-3 w-16 bg-gray-100 rounded" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-5/6 bg-gray-100 rounded-md" />
                    <div className="h-3.5 w-1/2 bg-gray-105 rounded-md" />
                  </div>
                </div>
                <div className="h-8 w-full bg-gray-100 rounded-[6px] mt-4" />
              </div>
            ))}
          </div>
        ) : !hasPreferences ? (
          <div className="bg-white rounded-[8px] border border-dashed border-slate-200 p-8 md:p-12 text-center max-w-2xl mx-auto shadow-sm space-y-6">
            <div className="h-12 w-12 bg-[#00B14F]/10 text-[#00B14F] rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="h-6 w-6 text-amber-500 fill-amber-500/25" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-extrabold text-slate-800">Chưa thiết lập gợi ý việc làm</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Để kích hoạt thuật toán gợi ý việc làm của AI, vui lòng cập nhật **Lĩnh vực ngành nghề quan tâm** và **Kỹ năng chuyên môn** trong hồ sơ cá nhân của bạn.
              </p>
            </div>
            <Link
              href="/candidate/profile?tab=preferences"
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#00B14F] hover:bg-[#00873D] text-white text-xs font-bold rounded-[6px] shadow-sm transition-colors duration-150 cursor-pointer"
            >
              <Sliders size={14} />
              <span>Thiết lập gợi ý ngay</span>
            </Link>
          </div>
        ) : recommendedJobs.length === 0 ? (
          <div className="bg-white rounded-[8px] border border-dashed border-slate-200 p-8 md:p-12 text-center max-w-2xl mx-auto shadow-sm space-y-6">
            <div className="h-12 w-12 bg-amber-500/10 text-amber-600 rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="h-6 w-6 text-amber-500 fill-amber-500/25" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-extrabold text-slate-800">Chưa tìm thấy việc làm phù hợp</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Hệ thống chưa tìm thấy tin tuyển dụng nào trùng khớp trực tiếp với các ngành nghề hoặc kỹ năng hiện tại của bạn.
              </p>
              <p className="text-[11px] text-slate-400 font-medium">
                * Mẹo: Hãy mở rộng cài đặt gợi ý của bạn để bổ sung thêm nhiều ngành nghề hoặc kỹ năng liên quan!
              </p>
            </div>
            <Link
              href="/candidate/profile?tab=preferences"
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#00B14F] hover:bg-[#00873D] text-white text-xs font-bold rounded-[6px] shadow-sm transition-colors duration-150 cursor-pointer"
            >
              <Sliders size={14} />
              <span>Điều chỉnh cài đặt</span>
            </Link>
          </div>
        ) : (
          /* Jobs Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recommendedJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-[8px] border border-slate-200 shadow-sm p-6 hover:border-[#00B14F]/30 hover:bg-slate-55/30 transition-colors duration-150 flex flex-col justify-between space-y-6 text-left group"
              >
                <div className="space-y-4">
                  {/* Header card: logo and time */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="h-12 w-12 rounded-[6px] border border-slate-200 bg-slate-50 text-[#00B14F] flex items-center justify-center overflow-hidden font-extrabold text-xs select-none">
                      {getCompanyInitials(job.employerName)}
                    </div>
                    <div className="text-right">
                      <span className="flex items-center gap-1 text-[10px] text-slate-400 font-light">
                        <Calendar size={10} />
                        {formatTime(job.createdAt)}
                      </span>
                      <span className="inline-flex items-center gap-0.5 mt-1 px-2 py-0.5 rounded-[4px] bg-emerald-50 text-emerald-700 text-[9px] font-extrabold uppercase tracking-wider border border-emerald-200">
                        <ShieldCheck size={8} className="fill-emerald-500 text-white" />
                        Phù hợp
                      </span>
                    </div>
                  </div>
 
                  {/* Job Title and Company */}
                  <div className="space-y-1">
                    <Link
                      href={`/jobs/${job.id}`}
                      className="block font-bold text-slate-800 text-sm sm:text-base leading-snug tracking-tight hover:text-[#00B14F] transition-colors duration-150 line-clamp-1 cursor-pointer"
                    >
                      {job.jobTitle}
                    </Link>
                    <p className="text-xs text-slate-500 font-light line-clamp-1 flex items-center gap-1">
                      <Building2 size={12} className="text-slate-400" />
                      <span>{job.employerName || "Doanh nghiệp Đà Nẵng"}</span>
                    </p>
                  </div>
 
                  {/* Bullets: Salary & Location */}
                  <div className="space-y-2 pt-1.5 text-xs text-slate-600 border-t border-slate-200">
                    <div className="flex items-center gap-2">
                      <DollarSign size={14} className="text-[#00B14F] flex-shrink-0" />
                      <span className="font-bold text-[#00B14F] text-sm">
                        {formatSalary(job.salaryType, job.minimumSalary, job.maximumSalary)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-light">
                      <MapPin size={14} className="text-slate-400 flex-shrink-0" />
                      <span className="line-clamp-1">{job.address}</span>
                    </div>
                  </div>
 
                  {/* Tag pills (Skills / Categories) */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {(job.skillNames || []).slice(0, 2).map((skill, tIdx) => (
                      <span
                        key={`s-${tIdx}`}
                        className="px-2 py-0.5 rounded-[4px] bg-[#00B14F]/5 text-[#00B14F] text-[9px] font-bold border border-[#00B14F]/10"
                      >
                        {skill}
                      </span>
                    ))}
                    {(job.categoryNames || []).slice(0, 1).map((cat, tIdx) => (
                      <span
                        key={`c-${tIdx}`}
                        className="px-2 py-0.5 rounded-[4px] bg-amber-500/5 text-amber-600 text-[9px] font-bold border border-amber-500/10"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
 
                {/* Action Apply Button */}
                <div className="flex items-center gap-2">
                  <Link
                    href={`/jobs/${job.id}`}
                    className="flex-grow py-2 bg-slate-50 border border-slate-200 hover:bg-[#00B14F] hover:border-[#00B14F] text-slate-600 hover:text-white font-bold rounded-[6px] text-xs flex items-center justify-center gap-1.5 transition-colors duration-150"
                  >
                    <span>Xem chi tiết</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
