"use client";
 
import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, ArrowRight, Loader2 } from "lucide-react";
import { employerService } from "@/services/employerService";
import { EmployerPublicResponse } from "@/types/employer";
 
export default function CandidateTopCompanies() {
  const [companies, setCompanies] = useState<EmployerPublicResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
 
  useEffect(() => {
    const fetchTopCompanies = async () => {
      setIsLoading(true);
      try {
        let cachedCompanies = null;
        if (typeof window !== "undefined") {
          try {
            const cached = sessionStorage.getItem("topCompanies");
            if (cached) cachedCompanies = JSON.parse(cached);
          } catch (e) {
            console.warn("Failed to parse cached top companies:", e);
          }
        }
 
        if (cachedCompanies) {
          setCompanies(cachedCompanies);
        } else {
          const res = await employerService.getCompaniesForPublic(0, 8);
          if (res && res.content) {
            setCompanies(res.content);
            if (typeof window !== "undefined") {
              sessionStorage.setItem("topCompanies", JSON.stringify(res.content));
            }
          }
        }
      } catch (err) {
        console.error("Error loading top companies:", err);
      } finally {
        setIsLoading(false);
      }
    };
 
    fetchTopCompanies();
  }, []);
 
  const getCompanyInitials = (name?: string) => {
    if (!name) return "CO";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };
 
  return (
    <section className="bg-white py-16 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header content */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00B14F] uppercase tracking-widest bg-[#00B14F]/10 px-3 py-1.5 rounded-[4px]">
            <span>Thương hiệu tiêu biểu</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            Nhà Tuyển Dụng Hàng Đầu Đà Nẵng
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm font-normal">
            Gia nhập các doanh nghiệp hàng đầu có văn hóa làm việc tuyệt vời, đãi ngộ xứng đáng và lộ trình phát triển rõ ràng.
          </p>
        </div>
 
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white rounded-[8px] border border-slate-200 p-6 shadow-sm flex flex-col justify-between h-[230px] animate-pulse"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="h-14 w-14 bg-gray-100 rounded-[6px]" />
                    <div className="h-5 w-24 bg-gray-100 rounded-md" />
                  </div>
                  <div className="space-y-2.5">
                    <div className="h-4 w-3/4 bg-gray-100 rounded-md" />
                    <div className="h-3 w-5/6 bg-gray-100 rounded-md" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : companies.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-[8px] border border-dashed border-slate-200 max-w-xl mx-auto shadow-sm">
            <Building2 className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-550 text-xs font-medium">Hiện tại chưa có dữ liệu nhà tuyển dụng nào công khai.</p>
          </div>
        ) : (
          /* Companies Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {companies.map((company) => (
              <Link
                key={company.id}
                href={`/candidate/companies/${company.id}`}
                className="bg-white rounded-[8px] border border-slate-200 p-6 shadow-sm hover:border-[#00B14F]/30 hover:bg-slate-50/50 transition-all duration-150 flex flex-col justify-between overflow-hidden group cursor-pointer text-left"
              >
                <div className="space-y-4">
                  {/* Logo */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="h-14 w-14 rounded-[6px] border border-slate-200 bg-slate-50 text-[#00B14F] flex items-center justify-center overflow-hidden font-extrabold text-xs select-none">
                      {company.logoUrl ? (
                        <img src={company.logoUrl} alt={company.companyName} className="max-h-full max-w-full object-cover h-full w-full" />
                      ) : (
                        <span>{getCompanyInitials(company.companyName)}</span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-[4px] truncate max-w-[120px]">
                      {company.companySize || "Quy mô: N/A"}
                    </span>
                  </div>
 
                  {/* Info titles */}
                  <div className="space-y-2">
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base tracking-tight leading-snug group-hover:text-[#00B14F] transition-colors duration-150 line-clamp-1">
                      {company.companyName}
                    </h3>
                    <p className="text-slate-500 text-xs font-normal leading-relaxed line-clamp-3">
                      {company.description || "Doanh nghiệp tuyển dụng hàng đầu với môi trường làm việc chuyên nghiệp, đãi ngộ tốt và lộ trình phát triển lâu dài."}
                    </p>
                  </div>
                </div>
 
                {/* Vacancy count and arrow link */}
                <div className="pt-4 mt-4 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-[#00B14F] group-hover:text-[#00873D] transition-colors duration-150">
                  <span>{company.totalActiveJobs ? `${company.totalActiveJobs} việc làm đang tuyển` : "Xem việc làm đang tuyển"}</span>
                  <ArrowRight size={14} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
