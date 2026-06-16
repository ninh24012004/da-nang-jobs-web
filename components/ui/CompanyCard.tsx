"use client";

import Link from "next/link";
import { ArrowRight, Building2, MapPin } from "lucide-react";

interface CompanyCardProps {
  company: {
    id: number;
    companyName: string;
    logoUrl?: string;
    companySize?: string;
    description?: string;
    address?: string;
    wardId?: number | string;
    totalActiveJobs?: number;
  };
  wards?: any[];
}

export default function CompanyCard({ company, wards = [] }: CompanyCardProps) {
  const getCompanyInitials = (name?: string) => {
    if (!name) return "CO";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getFullAddress = (address?: string, wardId?: number | string) => {
    if (!address && !wardId) return "Đà Nẵng, Việt Nam";
    const matchedWard = wardId ? wards.find((w) => Number(w.id) === Number(wardId)) : null;
    if (matchedWard) {
      return `${address || ""}, Phường ${matchedWard.wardName}${matchedWard.districtName ? `, Quận ${matchedWard.districtName}` : ""}`;
    }
    return address || "Đà Nẵng, Việt Nam";
  };

  return (
    <Link
      href={`/candidate/companies/${company.id}`}
      className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm hover:border-[#00B14F]/30 hover:bg-slate-50/50 transition-all duration-155 flex flex-col justify-between overflow-hidden group cursor-pointer text-left h-full"
    >
      <div className="space-y-4">
        {/* Logo */}
        <div className="flex items-center justify-between gap-4">
          <div className="h-14 w-14 rounded-md border border-slate-200 bg-slate-50 text-[#00B14F] flex items-center justify-center overflow-hidden font-extrabold text-xs select-none flex-shrink-0">
            {company.logoUrl ? (
              <img src={company.logoUrl} alt={company.companyName} className="max-h-full max-w-full object-cover h-full w-full" />
            ) : (
              <span>{getCompanyInitials(company.companyName)}</span>
            )}
          </div>
          <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded truncate max-w-[120px]">
            {company.companySize || "Quy mô: N/A"}
          </span>
        </div>

        {/* Info titles */}
        <div className="space-y-2">
          <h3 className="font-bold text-slate-800 text-sm sm:text-base tracking-tight leading-snug group-hover:text-[#00B14F] transition-colors line-clamp-1">
            {company.companyName}
          </h3>
          <p className="text-slate-500 text-xs font-normal leading-relaxed line-clamp-3">
            {company.description || "Doanh nghiệp tuyển dụng hàng đầu với môi trường làm việc chuyên nghiệp, đãi ngộ tốt và lộ trình phát triển lâu dài."}
          </p>
        </div>

        {/* Location Info (if address or wardId present) */}
        {(company.address || company.wardId) && (
          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-light pt-1.5 border-t border-slate-100">
            <MapPin size={12} className="text-slate-350 flex-shrink-0" />
            <span className="truncate text-slate-500">{getFullAddress(company.address, company.wardId)}</span>
          </div>
        )}
      </div>

      {/* Vacancy count and arrow link */}
      <div className="pt-4 mt-4 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-[#00B14F] group-hover:text-[#00873D] transition-colors">
        <span>{company.totalActiveJobs ? `${company.totalActiveJobs} việc làm đang tuyển` : "Xem việc làm đang tuyển"}</span>
        <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
      </div>
    </Link>
  );
}
