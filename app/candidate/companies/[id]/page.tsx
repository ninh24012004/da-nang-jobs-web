"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  MapPin,
  Globe,
  Phone,
  Mail,
  FileText,
  Calendar,
  DollarSign,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Loader2,
  ExternalLink,
  Info
} from "lucide-react";
import { employerService } from "@/services/employerService";
import { jobService } from "@/services/jobService";
import { locationService } from "@/services/locationService";
import { EmployerPublicResponse } from "@/types/employer";
import { JobResponse } from "@/types/job";
import { formatTime } from "@/lib/utils";
import Pagination from "@/components/ui/Pagination";

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = Number(params?.id);

  const [company, setCompany] = useState<EmployerPublicResponse | null>(null);
  const [allJobs, setAllJobs] = useState<JobResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [ward, setWard] = useState<any>(null);

  // Load company profile
  useEffect(() => {
    if (!companyId) return;

    const fetchCompanyData = async () => {
      setLoading(true);
      try {
        const data = await employerService.getCompanyById(companyId);
        if (data) {
          setCompany(data);
          
          if (data.wardId) {
            try {
              const wardData = await locationService.getWardById(Number(data.wardId));
              setWard(wardData);
              if (wardData && wardData.districtId && !wardData.districtName) {
                const districtData = await locationService.getDistrictById(wardData.districtId);
                setWard((prev: any) => ({
                  ...prev,
                  districtName: districtData.districtName
                }));
              }
            } catch (err) {
              console.warn("Error fetching ward details:", err);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching company details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [companyId]);

  // Load active jobs for filtering by company
  useEffect(() => {
    const fetchActiveJobs = async () => {
      setLoadingJobs(true);
      try {
        const res = await jobService.getAllJobs(0, 100);
        if (res && res.content) {
          setAllJobs(res.content);
        }
      } catch (err) {
        console.warn("Error loading jobs for company:", err);
      } finally {
        setLoadingJobs(false);
      }
    };

    fetchActiveJobs();
  }, []);

  // Filter jobs by employerName
  const companyJobs = useMemo(() => {
    if (!company || !allJobs.length) return [];
    return allJobs.filter(
      (job) =>
        job.employerName?.trim().toLowerCase() === company.companyName?.trim().toLowerCase() &&
        job.approveStatus === "APPROVED" &&
        job.visibilityStatus === "ACTIVE"
    );
  }, [company, allJobs]);

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

  const jobsPerPage = 8;
  const totalPages = Math.ceil(companyJobs.length / jobsPerPage);

  const paginatedJobs = useMemo(() => {
    return companyJobs.slice((currentPage - 1) * jobsPerPage, currentPage * jobsPerPage);
  }, [companyJobs, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const jobsSection = document.getElementById("jobs-section");
    if (jobsSection) {
      jobsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3 bg-white p-8 rounded-[8px] border border-slate-200 shadow-sm">
          <Loader2 className="h-10 w-10 animate-spin text-[#00B14F]" />
          <p className="text-slate-500 font-bold text-xs tracking-wide">Đang tải thông tin doanh nghiệp...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] p-4 text-center">
        <Building2 className="h-16 w-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-black text-slate-800">Không tìm thấy doanh nghiệp</h2>
        <p className="text-slate-500 text-xs mt-2 max-w-sm font-light">
          Doanh nghiệp này không tồn tại hoặc đã bị khóa khỏi hệ thống.
        </p>
        <button
          onClick={() => router.push("/candidate")}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-[#00B14F] hover:bg-[#00873D] text-white rounded-[6px] text-xs font-bold transition-all shadow-sm active:scale-98 cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Quay lại trang chủ</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-20 font-sans text-slate-800 antialiased">
      
      {/* Top Banner Cover - Matching CandidateHero theme */}
      <div className="w-full bg-gradient-to-r from-[#00873D] via-[#00B14F] to-[#22c55e] h-48 md:h-64 relative overflow-hidden select-none">
        <div className="absolute right-0 bottom-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-16 -mb-16"></div>
        <div className="absolute left-1/4 top-0 w-48 h-48 bg-white/5 rounded-full blur-2xl -mt-16"></div>
        
        {/* Back Button */}
        <div className="max-w-7xl mx-auto px-4 pt-6 relative z-10 text-left">
          <button
            onClick={() => router.push("/candidate/companies")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white rounded-[6px] text-xs font-bold transition-all cursor-pointer"
          >
            <ArrowLeft size={13} />
            <span>Danh sách công ty</span>
          </button>
        </div>
      </div>

      {/* Profile Header Block */}
      <div className="max-w-7xl mx-auto px-4 -mt-16 md:-mt-24 relative z-10">
        <div className="bg-white rounded-[8px] border border-slate-200 p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-5 text-center md:text-left">
            {/* Logo */}
            <div className="h-28 w-28 md:h-32 md:w-32 rounded-[8px] border-4 border-white bg-slate-50 text-[#00B14F] flex items-center justify-center overflow-hidden font-extrabold text-2xl shadow-sm select-none flex-shrink-0">
              {company.logoUrl ? (
                <img src={company.logoUrl} alt={company.companyName} className="h-full w-full object-cover" />
              ) : (
                <span>{getCompanyInitials(company.companyName)}</span>
              )}
            </div>

            {/* Info and Badges */}
            <div className="space-y-2 md:pb-2">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight leading-tight">
                  {company.companyName}
                </h1>
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-[4px] border border-emerald-200 flex items-center gap-0.5 select-none">
                  <ShieldCheck size={11} className="fill-emerald-500 text-white" />
                  Xác thực tuyển dụng
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1.5 text-xs text-slate-500 font-light">
                {company.companySize && (
                  <span className="bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-[4px] font-bold text-slate-650">
                    Quy mô: {company.companySize}
                  </span>
                )}
                {company.website && (
                  <a
                    href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-[#00B14F] transition-colors font-semibold text-slate-600"
                  >
                    <Globe size={13} className="text-slate-400" />
                    <span>Website doanh nghiệp</span>
                    <ExternalLink size={10} className="opacity-60" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Jobs Count Badge Card */}
          <div className="bg-[#00B14F]/5 border border-[#00B14F]/10 rounded-[8px] p-4 text-center min-w-[160px] select-none flex-shrink-0">
            <span className="block text-2xl font-black text-[#00B14F]">
              {companyJobs.length}
            </span>
            <span className="block text-[10px] text-slate-500 font-extrabold uppercase tracking-wider mt-0.5">
              Việc làm đang tuyển
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid Body Columns (About Company + Sidebar Info) */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Block - Detail Description */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Company */}
            <div className="bg-white rounded-[8px] border border-slate-200 p-6 md:p-8 shadow-xs text-left">
              <h3 className="text-base font-black text-slate-800 pb-3 border-b border-slate-100">
                Giới thiệu về công ty
              </h3>
              <div className="text-xs md:text-sm text-slate-650 leading-relaxed font-normal mt-5 whitespace-pre-wrap">
                {company.description || "Doanh nghiệp hàng đầu với lộ trình phát triển rõ ràng, cơ chế đãi ngộ hấp dẫn và văn hóa làm việc tuyệt vời. Chúng tôi liên tục tìm kiếm và bồi dưỡng các nhân tài xuất sắc gia nhập cùng kiến tạo các giá trị số và phục vụ cộng đồng tại thành phố Đà Nẵng."}
              </div>
            </div>
          </div>

          {/* Right Block - Sidebar Quick Contact & Info */}
          <div className="bg-white rounded-[8px] border border-slate-200 p-6 shadow-xs text-left space-y-6">
            <h4 className="font-black text-sm text-slate-800 pb-3 border-b border-slate-100 flex items-center gap-1.5">
              <Info size={15} className="text-[#00B14F]" />
              <span>Thông tin doanh nghiệp</span>
            </h4>

            <div className="space-y-5 text-xs font-semibold text-slate-600 leading-normal">
              
              <div>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Globe size={11} className="text-slate-350" />
                  <span>Trang Web</span>
                </p>
                {company.website ? (
                  <a
                    href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#00B14F] hover:underline font-bold break-all flex items-center gap-0.5"
                  >
                    <span>{company.website}</span>
                    <ExternalLink size={10} className="inline opacity-70" />
                  </a>
                ) : (
                  <p className="text-slate-400 font-medium">Chưa cập nhật</p>
                )}
              </div>

              <div>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Mail size={11} className="text-slate-350" />
                  <span>Email liên hệ</span>
                </p>
                {company.emailCompany ? (
                  <a
                    href={`mailto:${company.emailCompany}`}
                    className="text-[#00B14F] hover:underline font-bold break-all flex items-center gap-0.5"
                  >
                    <span>{company.emailCompany}</span>
                  </a>
                ) : (
                  <p className="text-slate-400 font-medium">Chưa cập nhật</p>
                )}
              </div>

              <div>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                  <MapPin size={11} className="text-slate-350" />
                  <span>Địa chỉ trụ sở</span>
                </p>
                <p className="text-slate-800 font-bold leading-relaxed">
                  {company.address}
                  {ward && `, Phường ${ward.wardName}, Quận ${ward.districtName || "Đà Nẵng"}`}
                  {!company.address && !ward && "Đà Nẵng, Việt Nam"}
                </p>
              </div>

              {company.companySize && (
                <div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Building2 size={11} className="text-slate-350" />
                    <span>Quy mô nhân sự</span>
                  </p>
                  <p className="text-slate-800 font-bold leading-relaxed">{company.companySize}</p>
                </div>
              )}

            </div>

            <div className="pt-4 border-t border-slate-100 text-center text-[10px] text-slate-400 leading-normal font-light">
              * Mọi dữ liệu tuyển dụng đều được kiểm duyệt chặt chẽ bởi Ban quản trị Đà Nẵng Jobs.
            </div>
          </div>

        </div>
      </div>

      {/* Full-Width Section: List of Job Openings */}
      <div id="jobs-section" className="max-w-7xl mx-auto px-4 pt-4 pb-16">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[8px] border border-slate-200 shadow-xs flex items-center justify-between text-left">
            <div>
              <h3 className="text-base font-black text-slate-800 flex items-center gap-1.5">
                <Sparkles className="text-amber-500 fill-amber-500" size={17} />
                <span>Vị trí tuyển dụng đang hoạt động</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 font-light leading-normal">
                Các cơ hội nghề nghiệp trực tiếp đến từ bộ phận nhân sự của {company.companyName}
              </p>
            </div>
          </div>

          {loadingJobs ? (
            <div className="bg-white py-16 rounded-[8px] border border-slate-200 flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-7 w-7 animate-spin text-[#00B14F]" />
              <p className="text-xs text-slate-400 font-bold">Đang quét cơ sở dữ liệu vị trí tuyển dụng...</p>
            </div>
          ) : companyJobs.length === 0 ? (
            <div className="bg-white p-12 rounded-[8px] border border-slate-200 text-center flex flex-col items-center justify-center space-y-3">
              <div className="h-14 w-14 bg-gray-50 border border-dashed border-slate-200 rounded-full flex items-center justify-center text-slate-300">
                <Building2 size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-700 text-sm">Chưa có vị trí tuyển dụng nào mới</h4>
                <p className="text-xs text-slate-450 mt-1 leading-normal font-light">
                  Doanh nghiệp hiện tại chưa đăng tin tuyển dụng công khai nào trong hệ thống lúc này.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Jobs Grid (4 columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {paginatedJobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-white border border-slate-200 rounded-[8px] p-5 hover:shadow-md hover:border-[#00B14F]/30 transition-all duration-300 flex flex-col justify-between group text-left relative overflow-hidden"
                  >
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex flex-wrap gap-1">
                          {job.categoryNames?.slice(0, 1).map((catName) => (
                            <span key={catName} className="bg-[#00B14F]/5 text-[#00B14F] text-[9px] font-extrabold px-2 py-0.5 rounded-[4px] border border-[#00B14F]/10">
                              {catName}
                            </span>
                          ))}
                        </div>
                        <span className="text-[10px] text-slate-400 font-light flex items-center gap-1">
                          <Calendar size={10} />
                          {formatTime(job.createdAt)}
                        </span>
                      </div>

                      {/* Title */}
                      <h4 className="font-bold text-slate-800 text-sm group-hover:text-[#00B14F] transition-colors leading-tight line-clamp-1">
                        {job.jobTitle}
                      </h4>

                      {/* Info details */}
                      <div className="space-y-2 border-t border-b border-slate-100 py-2.5">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#00B14F]">
                          <DollarSign size={13} className="text-[#00B14F] flex-shrink-0" />
                          <span className="font-bold">{formatSalary(job.salaryType, job.minimumSalary, job.maximumSalary)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] font-light text-slate-500">
                          <MapPin size={13} className="text-slate-350 flex-shrink-0" />
                          <span className="truncate">{job.wardName || "Đà Nẵng"}</span>
                        </div>
                      </div>

                      {/* Skills */}
                      {job.skillNames && job.skillNames.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {job.skillNames.slice(0, 2).map((sn) => (
                            <span key={sn} className="bg-slate-50 border border-slate-200 text-slate-500 text-[8px] px-1.5 py-0.5 rounded-[4px] font-semibold">
                              {sn}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Apply Link */}
                    <div className="flex items-center justify-end mt-4 pt-3 border-t border-slate-150">
                      <Link
                        href={`/jobs/${job.id}`}
                        className="w-full py-2 bg-[#00B14F]/10 text-[#00B14F] group-hover:bg-[#00B14F] group-hover:text-white rounded-[6px] text-xs font-bold flex items-center justify-center gap-1 transition-all shadow-xs active:scale-97 cursor-pointer"
                      >
                        <span>Xem chi tiết</span>
                        <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              <Pagination
                currentPage={currentPage - 1}
                totalPages={totalPages}
                onPageChange={(page) => handlePageChange(page + 1)}
              />
            </>
          )}
        </div>
      </div>

    </div>
  );
}
