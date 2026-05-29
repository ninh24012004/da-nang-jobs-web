"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Building2, Search, ArrowRight, Loader2, MapPin, Sparkles, Sliders } from "lucide-react";
import { employerService } from "@/services/employerService";
import { locationService } from "@/services/locationService";
import { EmployerPublicResponse } from "@/types/employer";

export default function CompaniesDirectoryPage() {
  const [companies, setCompanies] = useState<EmployerPublicResponse[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const companiesPerPage = 12;

  // Load all wards once for client-side location mapping to optimize API calls
  useEffect(() => {
    const fetchAllWardsData = async () => {
      try {
        const data = await locationService.getAllWards();
        if (data) {
          setWards(data);
        }
      } catch (err) {
        console.warn("Error loading wards:", err);
      }
    };
    fetchAllWardsData();
  }, []);

  useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoading(true);
      try {
        const res = await employerService.getCompaniesForPublic(currentPage - 1, companiesPerPage);
        if (res) {
          setCompanies(res.content || []);
          setTotalPages(res.totalPages || 1);
        }
      } catch (err) {
        console.error("Error loading public companies:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies();
  }, [currentPage]);

  // Client-side search filtering on top of fetched page for ultra-responsive search
  const filteredCompanies = useMemo(() => {
    if (!searchQuery.trim()) return companies;
    return companies.filter((c) =>
      c.companyName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [companies, searchQuery]);

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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-20 font-sans antialiased text-gray-800">
      
      {/* Premium Hero Search Header */}
      <div className="w-full bg-gradient-to-r from-[#006b7a] via-[#008ba0] to-[#00a8c2] text-white py-16 px-4 relative overflow-hidden select-none text-center">
        <div className="absolute right-0 bottom-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-16 -mb-16"></div>
        <div className="absolute left-1/4 top-0 w-48 h-48 bg-white/5 rounded-full blur-2xl -mt-16"></div>

        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-100 uppercase tracking-widest bg-white/10 px-3.5 py-1.5 rounded-full backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span>Khám phá 500+ doanh nghiệp hàng đầu</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            Tìm Kiếm Doanh Nghiệp & Nhà Tuyển Dụng
          </h1>
          <p className="text-teal-50 text-xs md:text-base font-light max-w-2xl mx-auto leading-relaxed">
            Tra cứu thông tin chi tiết, quy mô nhân sự, văn hóa doanh nghiệp và khám phá các vị trí tuyển dụng VIP đang hoạt động tại thành phố Đà Nẵng.
          </p>

          {/* Search Box Bar */}
          <div className="max-w-xl mx-auto mt-8 relative">
            <input
              type="text"
              placeholder="Nhập tên công ty hoặc từ khóa để tìm kiếm nhanh..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-gray-800 border-none outline-none focus:ring-4 focus:ring-teal-500/20 rounded-2xl px-5 py-4 pl-12 text-sm shadow-lg font-medium transition-all"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold font-sans"
              >
                Xóa
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Companies Directory Grid Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-9 h-9 animate-spin text-[#006b7a]" />
            <p className="text-gray-400 font-bold text-xs tracking-wide">Đang tải danh mục nhà tuyển dụng Đà Nẵng...</p>
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 max-w-xl mx-auto shadow-xs">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="font-extrabold text-gray-700 text-base">Không tìm thấy doanh nghiệp phù hợp</h3>
            <p className="text-gray-450 text-xs mt-1 leading-normal font-light max-w-xs mx-auto">
              Không có doanh nghiệp nào khớp với từ khóa "{searchQuery}" trên trang này. Vui lòng thử lại với từ khóa khác!
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-5 px-4 py-2 bg-[#006B7A] hover:bg-[#005a66] text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-97 cursor-pointer"
              >
                Đặt lại tìm kiếm
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Grid display (4 columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredCompanies.map((company) => (
                <Link
                  key={company.id}
                  href={`/candidate/companies/${company.id}`}
                  className="bg-white rounded-2xl border border-gray-150 p-5 hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden group cursor-pointer text-left shadow-xs"
                >
                  <div className="space-y-4">
                    {/* Logo and scale */}
                    <div className="flex items-center justify-between gap-4">
                      <div className="h-14 w-14 rounded-xl border border-gray-150 bg-gradient-to-br from-[#006b7a]/5 to-[#006b7a]/15 text-[#006b7a] flex items-center justify-center overflow-hidden font-extrabold text-sm shadow-xs select-none">
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
                      <p className="text-gray-500 text-xs font-light leading-relaxed line-clamp-2">
                        {company.description || "Doanh nghiệp hàng đầu với môi trường làm việc chuyên nghiệp, cơ hội thăng tiến và đãi ngộ hấp dẫn tại thành phố Đà Nẵng."}
                      </p>
                    </div>

                    {/* Location Info */}
                    <div className="flex items-center gap-1 text-[11px] text-gray-400 font-light pt-1.5 border-t border-gray-50">
                      <MapPin size={12} className="text-gray-300 flex-shrink-0" />
                      <span className="truncate">{getFullAddress(company.address, company.wardId)}</span>
                    </div>
                  </div>

                  {/* Vacancy count and arrow link */}
                  <div className="pt-4 mt-4 border-t border-gray-50 flex items-center justify-between text-xs font-bold text-[#006b7a] group-hover:text-[#005a66] transition-colors">
                    <span>{company.totalActiveJobs ? `${company.totalActiveJobs} việc làm đang tuyển` : "Xem việc làm đang tuyển"}</span>
                    <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-12 pt-6 border-t border-gray-150">
                <button
                  onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3.5 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50 transition-all select-none"
                >
                  Trước
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all select-none ${
                      currentPage === page
                        ? "bg-[#006B7A] text-white shadow-sm"
                        : "border border-gray-200 text-gray-600 hover:bg-gray-50 bg-white"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3.5 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50 transition-all select-none"
                >
                  Sau
                </button>
              </div>
            )}
          </>
        )}
      </div>
      
    </div>
  );
}
