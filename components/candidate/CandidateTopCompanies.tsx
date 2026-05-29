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
    <section className="bg-gray-50 py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header content */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006b7a] uppercase tracking-widest bg-[#006b7a]/10 px-3 py-1.5 rounded-md">
            <span>Thương hiệu tiêu biểu</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800">
            Nhà Tuyển Dụng Hàng Đầu Đà Nẵng
          </h2>
          <p className="text-gray-500 text-sm md:text-base font-light">
            Gia nhập các doanh nghiệp hàng đầu có văn hóa làm việc tuyệt vời, đãi ngộ xứng đáng và lộ trình phát triển rõ ràng.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between h-[250px] animate-pulse"
              >
                <div className="space-y-4">
                  {/* Logo and company size pill shimmer */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="h-16 w-16 bg-gray-150 rounded-xl" />
                    <div className="h-5 w-24 bg-gray-100 rounded-md" />
                  </div>

                  {/* Text details shimmer */}
                  <div className="space-y-2.5">
                    <div className="h-5 w-3/4 bg-gray-150 rounded-md" />
                    <div className="space-y-1.5">
                      <div className="h-3 w-full bg-gray-100 rounded-md" />
                      <div className="h-3 w-5/6 bg-gray-100 rounded-md" />
                      <div className="h-3 w-2/3 bg-gray-100 rounded-md" />
                    </div>
                  </div>
                </div>

                {/* Footer link shimmer */}
                <div className="pt-6 mt-4 border-t border-gray-50 flex items-center justify-between">
                  <div className="h-4 w-2/3 bg-gray-150 rounded-md" />
                  <div className="h-4 w-4 bg-gray-100 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : companies.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200 max-w-xl mx-auto">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-xs font-medium">Hiện tại chưa có dữ liệu nhà tuyển dụng nào công khai.</p>
          </div>
        ) : (
          /* Companies Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {companies.map((company) => (
              <Link
                key={company.id}
                href={`/candidate/companies/${company.id}`}
                className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden group cursor-pointer text-left"
              >
                <div className="space-y-4">
                  {/* Logo and scale */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="h-16 w-16 rounded-xl border border-gray-150 bg-gradient-to-br from-[#006b7a]/5 to-[#006b7a]/15 text-[#006b7a] flex items-center justify-center overflow-hidden font-extrabold text-sm shadow-xs select-none">
                      {company.logoUrl ? (
                        <img src={company.logoUrl} alt={company.companyName} className="max-h-full max-w-full object-cover h-full w-full" />
                      ) : (
                        <span>{getCompanyInitials(company.companyName)}</span>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400 font-bold bg-gray-100 px-2 py-0.5 rounded-md truncate max-w-[120px]">
                      {company.companySize || "Quy mô: N/A"}
                    </span>
                  </div>

                  {/* Info titles */}
                  <div className="space-y-2">
                    <h3 className="font-extrabold text-gray-800 text-base tracking-tight leading-snug group-hover:text-[#006b7a] transition-colors line-clamp-1">
                      {company.companyName}
                    </h3>
                    <p className="text-gray-500 text-xs font-light leading-relaxed line-clamp-3">
                      {company.description || "Doanh nghiệp hàng đầu với môi trường chuyên nghiệp toàn cầu, đãi ngộ tốt và lộ trình phát triển rõ ràng tại Đà Nẵng."}
                    </p>
                  </div>
                </div>

                {/* Vacancy count and arrow link */}
                <div className="pt-6 mt-4 border-t border-gray-50 flex items-center justify-between text-xs font-bold text-[#006b7a] group-hover:text-[#005a66] transition-colors">
                  <span>{company.totalActiveJobs ? `${company.totalActiveJobs} việc làm đang tuyển` : "Xem việc làm đang tuyển"}</span>
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
