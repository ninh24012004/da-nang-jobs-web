"use client";

import { useEffect, useState, useMemo } from "react";
import { Building2, Search, Loader2, Sparkles } from "lucide-react";
import { employerService } from "@/services/employerService";
import { locationService } from "@/services/locationService";
import { EmployerPublicResponse } from "@/types/employer";
import CompanyCard from "@/components/ui/CompanyCard";
import Pagination from "@/components/ui/Pagination";

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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-20 font-sans antialiased text-slate-800">
      
      {/* Hero Search Section - Styled matching CandidateHero */}
      <section className="relative min-h-[360px] flex items-center justify-center bg-[#F8FAFC] text-slate-800 py-16 px-4 overflow-hidden border-b border-slate-200">
        <div className="relative max-w-5xl mx-auto text-center z-10 space-y-6 w-full">
          {/* Pill notice */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[4px] bg-[#00B14F]/10 border border-[#00B14F]/20 text-[#00B14F] text-xs font-semibold tracking-wider uppercase select-none">
            <Sparkles size={14} className="text-[#00B14F]" />
            <span>Khám phá doanh nghiệp hàng đầu</span>
          </div>

          {/* Headlines */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight text-[#0F172A] select-none">
              Tìm Kiếm Doanh Nghiệp & <span className="text-[#00B14F]">NHÀ TUYỂN DỤNG</span>
            </h1>
            <p className="text-[#475569] text-xs sm:text-base max-w-2xl mx-auto font-normal leading-relaxed select-none">
              Tra cứu thông tin chi tiết, quy mô nhân sự, văn hóa doanh nghiệp và khám phá các vị trí tuyển dụng đang hoạt động tại thành phố Đà Nẵng.
            </p>
          </div>

          {/* Main Search Panel - Clean Rectangular Design */}
          <div className="bg-white rounded-[8px] p-4 shadow-sm max-w-2xl mx-auto border border-slate-200 text-slate-850 relative z-20">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* INPUT: Keywords */}
              <div className="flex-grow flex items-center gap-2 px-4 py-3 border border-slate-200 rounded-[6px] bg-white">
                <Search size={16} className="text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Nhập tên công ty hoặc từ khóa tuyển dụng..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs font-semibold placeholder-slate-400 focus:outline-none bg-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-slate-400 hover:text-slate-650 text-xs font-bold font-sans cursor-pointer pr-1"
                  >
                    Xóa
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Companies Directory Grid Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white rounded-[8px] border border-slate-200 shadow-sm">
            <Loader2 className="w-10 h-10 animate-spin text-[#00B14F]" />
            <p className="text-slate-500 font-bold text-xs tracking-wide">Đang tải danh mục nhà tuyển dụng Đà Nẵng...</p>
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[8px] border border-dashed border-slate-200 max-w-xl mx-auto shadow-sm">
            <Building2 className="w-12 h-12 text-slate-350 mx-auto mb-4" />
            <h3 className="font-bold text-slate-700 text-sm md:text-base">Không tìm thấy doanh nghiệp phù hợp</h3>
            <p className="text-slate-450 text-xs mt-1 leading-normal font-light max-w-xs mx-auto">
              Không có doanh nghiệp nào khớp với từ khóa "{searchQuery}" trên trang này. Vui lòng thử lại với từ khóa khác!
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-5 px-4 py-2 bg-[#00B14F] hover:bg-[#00873D] text-white text-xs font-bold rounded-[6px] shadow-sm transition-all duration-150 cursor-pointer"
              >
                Đặt lại tìm kiếm
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Grid display (4 columns) using the standard CompanyCard component */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredCompanies.map((company) => (
                <CompanyCard
                  key={company.id}
                  company={company}
                  wards={wards}
                />
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
  );
}
