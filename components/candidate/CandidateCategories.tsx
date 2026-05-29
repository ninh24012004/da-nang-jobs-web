"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Laptop,
  Palmtree,
  Megaphone,
  Calculator,
  Languages,
  Hammer,
  HeartPulse,
  Users,
  Scale,
  Paintbrush,
  Truck,
  Briefcase,
  Search,
  X,
  Calendar,
  DollarSign,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Loader2,
  Code,
  Building2,
  Sparkles
} from "lucide-react";

import { categoryService } from "@/services/categoryService";
import { jobService } from "@/services/jobService";
import { CategoryTreeResponse } from "@/types/category";
import { JobResponse } from "@/types/job";

export default function CandidateCategories() {
  const [categories, setCategories] = useState<CategoryTreeResponse[]>([]);
  const [allJobs, setAllJobs] = useState<JobResponse[]>([]);
  const [categoryJobCounts, setCategoryJobCounts] = useState<Record<string, number>>({});
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Modal State
  const [selectedCategory, setSelectedCategory] = useState<CategoryTreeResponse | null>(null);
  const [jobSearchQuery, setJobSearchQuery] = useState("");

  useEffect(() => {
    const loadCategoriesAndJobs = async () => {
      setLoadingCategories(true);
      try {
        let cachedCategories = null;
        let cachedJobCounts = null;
        let cachedAllJobs = null;

        if (typeof window !== "undefined") {
          try {
            const cats = sessionStorage.getItem("categoryTree");
            const counts = sessionStorage.getItem("categoryJobCounts");
            const jobs = sessionStorage.getItem("categoryAllJobs");
            if (cats) cachedCategories = JSON.parse(cats);
            if (counts) cachedJobCounts = JSON.parse(counts);
            if (jobs) cachedAllJobs = JSON.parse(jobs);
          } catch (e) {
            console.warn("Failed to parse cached categories data:", e);
          }
        }

        // 1. Fetch / Use categories tree
        let treeRes = cachedCategories;
        if (!treeRes) {
          treeRes = await categoryService.getCategoryTree();
          if (treeRes && typeof window !== "undefined") {
            sessionStorage.setItem("categoryTree", JSON.stringify(treeRes));
          }
        }
        if (treeRes) {
          setCategories(treeRes);
        }

        // 2. Fetch / Use job counts
        if (cachedJobCounts && cachedAllJobs) {
          setAllJobs(cachedAllJobs);
          setCategoryJobCounts(cachedJobCounts);
        } else {
          // Fetch a lower size of jobs (150 is more than enough for front-page active counts)
          const jobsRes = await jobService.getAllJobs(0, 150);
          const activeApprovedJobs = (jobsRes?.content || []).filter(
            (j: JobResponse) => j.approveStatus === "APPROVED" && j.visibilityStatus === "ACTIVE"
          );
          setAllJobs(activeApprovedJobs);

          // Compute job counts per category
          const counts: Record<string, number> = {};
          activeApprovedJobs.forEach((job: JobResponse) => {
            if (job.categoryNames && job.categoryNames.length > 0) {
              job.categoryNames.forEach((catName: string) => {
                counts[catName] = (counts[catName] || 0) + 1;
              });
            }
          });
          setCategoryJobCounts(counts);

          // Save to sessionStorage cache
          if (typeof window !== "undefined") {
            sessionStorage.setItem("categoryJobCounts", JSON.stringify(counts));
            sessionStorage.setItem("categoryAllJobs", JSON.stringify(activeApprovedJobs));
          }
        }
      } catch (err) {
        console.warn("Error fetching categories or jobs data:", err);
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategoriesAndJobs();
  }, []);

  // Helper mapping names to icons based on keywords
  const getCategoryIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("công nghệ") || lower.includes("tin học") || lower.includes("phần mềm") || lower.includes("it") || lower.includes("lập trình")) {
      return <Code size={28} className="text-teal-600" />;
    }
    if (lower.includes("du lịch") || lower.includes("khách sạn") || lower.includes("nhà hàng") || lower.includes("ẩm thực") || lower.includes("dịch vụ ăn uống")) {
      return <Palmtree size={28} className="text-amber-600" />;
    }
    if (lower.includes("bán hàng") || lower.includes("marketing") || lower.includes("kinh doanh") || lower.includes("sale") || lower.includes("quảng cáo") || lower.includes("thương mại")) {
      return <Megaphone size={28} className="text-indigo-600" />;
    }
    if (lower.includes("kế toán") || lower.includes("tài chính") || lower.includes("ngân hàng") || lower.includes("thuế") || lower.includes("kiểm toán")) {
      return <Calculator size={28} className="text-emerald-600" />;
    }
    if (lower.includes("ngoại ngữ") || lower.includes("giáo dục") || lower.includes("giảng dạy") || lower.includes("đào tạo") || lower.includes("tiếng")) {
      return <Languages size={28} className="text-purple-600" />;
    }
    if (lower.includes("xây dựng") || lower.includes("kỹ thuật") || lower.includes("cơ khí") || lower.includes("kiến trúc") || lower.includes("sản xuất")) {
      return <Hammer size={28} className="text-blue-600" />;
    }
    if (lower.includes("y tế") || lower.includes("sức khỏe") || lower.includes("dược") || lower.includes("bác sĩ") || lower.includes("nha khoa")) {
      return <HeartPulse size={28} className="text-rose-600" />;
    }
    if (lower.includes("nhân sự") || lower.includes("hành chính") || lower.includes("văn phòng") || lower.includes("lễ tân")) {
      return <Users size={28} className="text-sky-600" />;
    }
    if (lower.includes("luật") || lower.includes("pháp lý")) {
      return <Scale size={28} className="text-yellow-600" />;
    }
    if (lower.includes("thiết kế") || lower.includes("mỹ thuật") || lower.includes("đồ họa")) {
      return <Paintbrush size={28} className="text-pink-600" />;
    }
    if (lower.includes("vận tải") || lower.includes("giao nhận") || lower.includes("logistics") || lower.includes("kho bãi")) {
      return <Truck size={28} className="text-orange-600" />;
    }
    return <Briefcase size={28} className="text-teal-600" />;
  };

  // Helper mapping names to custom bg classes
  const getCategoryBg = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("công nghệ") || lower.includes("tin học") || lower.includes("phần mềm") || lower.includes("it") || lower.includes("lập trình")) {
      return "bg-teal-50";
    }
    if (lower.includes("du lịch") || lower.includes("khách sạn") || lower.includes("nhà hàng") || lower.includes("ẩm thực") || lower.includes("dịch vụ ăn uống")) {
      return "bg-amber-50";
    }
    if (lower.includes("bán hàng") || lower.includes("marketing") || lower.includes("kinh doanh") || lower.includes("sale") || lower.includes("quảng cáo") || lower.includes("thương mại")) {
      return "bg-indigo-50";
    }
    if (lower.includes("kế toán") || lower.includes("tài chính") || lower.includes("ngân hàng") || lower.includes("thuế") || lower.includes("kiểm toán")) {
      return "bg-emerald-50";
    }
    if (lower.includes("ngoại ngữ") || lower.includes("giáo dục") || lower.includes("giảng dạy") || lower.includes("đào tạo") || lower.includes("tiếng")) {
      return "bg-purple-50";
    }
    if (lower.includes("xây dựng") || lower.includes("kỹ thuật") || lower.includes("cơ khí") || lower.includes("kiến trúc") || lower.includes("sản xuất")) {
      return "bg-blue-50";
    }
    if (lower.includes("y tế") || lower.includes("sức khỏe") || lower.includes("dược") || lower.includes("bác sĩ") || lower.includes("nha khoa")) {
      return "bg-rose-50";
    }
    if (lower.includes("nhân sự") || lower.includes("hành chính") || lower.includes("văn phòng") || lower.includes("lễ tân")) {
      return "bg-sky-50";
    }
    if (lower.includes("luật") || lower.includes("pháp lý")) {
      return "bg-yellow-50";
    }
    if (lower.includes("thiết kế") || lower.includes("mỹ thuật") || lower.includes("đồ họa")) {
      return "bg-pink-50";
    }
    if (lower.includes("vận tải") || lower.includes("giao nhận") || lower.includes("logistics") || lower.includes("kho bãi")) {
      return "bg-orange-50";
    }
    return "bg-teal-50/50";
  };

  // Salary Formatter
  const formatSalary = (type: string, min?: number, max?: number) => {
    if (type === "Lương thỏa thuận") return "Thỏa thuận";
    if (!min && !max) return "Thỏa thuận";
    const toMillions = (val: number) => (val / 1000000).toFixed(0);
    if (min && max) return `${toMillions(min)} - ${toMillions(max)} triệu`;
    if (min) return `Từ ${toMillions(min)} triệu`;
    if (max) return `Lên đến ${toMillions(max)} triệu`;
    return "Thỏa thuận";
  };

  // Company Initials generator for fallback logos
  const getCompanyInitials = (name?: string) => {
    if (!name) return "CO";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Filter jobs for the selected category based on memory + search input
  const getFilteredJobs = () => {
    if (!selectedCategory) return [];
    return allJobs.filter((job) => {
      // 1. Matches selected category
      const matchesCategory =
        job.categoryNames &&
        job.categoryNames.some(
          (catName) => catName.toLowerCase() === selectedCategory.categoryName.toLowerCase()
        );

      if (!matchesCategory) return false;

      // 2. Matches search query inside the modal
      if (!jobSearchQuery.trim()) return true;
      const q = jobSearchQuery.toLowerCase();
      return (
        job.jobTitle.toLowerCase().includes(q) ||
        (job.employerName && job.employerName.toLowerCase().includes(q)) ||
        (job.jobDescription && job.jobDescription.toLowerCase().includes(q))
      );
    });
  };

  const filteredJobs = getFilteredJobs();
  const visibleCategories = categories.slice(0, 8);

  // Skeleton loading view
  if (loadingCategories) {
    return (
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mx-auto"></div>
            <div className="h-10 w-64 bg-gray-200 rounded animate-pulse mx-auto"></div>
            <div className="h-4 w-96 bg-gray-200 rounded animate-pulse mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white border border-gray-100 rounded-2xl p-6 flex items-center gap-4 animate-pulse"
              >
                <div className="p-6 bg-gray-100 rounded-xl w-14 h-14 flex-shrink-0"></div>
                <div className="space-y-2 flex-grow">
                  <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gray-50 py-16 md:py-24 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header content */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006b7a] uppercase tracking-widest bg-[#006b7a]/10 px-3 py-1.5 rounded-md">
            <span>Ngành nghề phổ biến</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800 tracking-tight">
            Top Ngành Nghề Nổi Bật Tại Đà Nẵng
          </h2>
          <p className="text-gray-500 text-sm md:text-base font-light">
            Khám phá và đón đầu cơ hội thăng tiến sự nghiệp của bạn qua các nhóm ngành có lưu lượng tuyển dụng cao nhất.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {visibleCategories.map((cat) => {
            const jobCount = categoryJobCounts[cat.categoryName] || 0;
            return (
              <div
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat);
                  setJobSearchQuery("");
                }}
                className="bg-white border border-gray-100 rounded-2xl p-6 hover:border-[#006b7a]/30 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group cursor-pointer text-left flex flex-col justify-between space-y-4"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-xl ${getCategoryBg(
                      cat.categoryName
                    )} group-hover:scale-105 transition-transform duration-300`}
                  >
                    {getCategoryIcon(cat.categoryName)}
                  </div>
                  <div className="space-y-1 overflow-hidden flex-grow">
                    <h3 className="font-bold text-gray-800 text-sm md:text-base tracking-tight leading-snug group-hover:text-[#006b7a] transition-colors line-clamp-1">
                      {cat.categoryName}
                    </h3>
                    <p className="text-[10px] md:text-xs font-bold text-teal-600 bg-teal-50/70 px-2.5 py-0.5 rounded w-fit select-none">
                      {jobCount} việc làm active
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Redirect to Job Search Page Button */}
        {categories.length > 8 && (
          <div className="flex justify-center mt-12">
            <Link
              href="/jobs"
              className="group inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 border border-gray-200 text-[#006b7a] font-bold rounded-full text-xs shadow-sm hover:shadow transition-all active:scale-[0.98]"
            >
              <span>Xem thêm</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        )}
      </div>

      {/* ==================== INTERACTIVE JOBS MODAL (GLASSMORPHISM) ==================== */}
      {selectedCategory && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 transition-all duration-300">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-gray-150/40 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="p-6 md:p-8 bg-gradient-to-r from-teal-50/50 to-white border-b border-gray-100 flex items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-2xl ${getCategoryBg(selectedCategory.categoryName)}`}>
                  {getCategoryIcon(selectedCategory.categoryName)}
                </div>
                <div className="space-y-1 text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#006b7a] bg-[#006b7a]/10 px-2.5 py-1 rounded-md">
                    Ngành nghề tuyển dụng
                  </span>
                  <h3 className="text-xl md:text-2xl font-extrabold text-gray-800 tracking-tight">
                    Việc làm {selectedCategory.categoryName}
                  </h3>
                  <p className="text-xs text-gray-400 font-light">
                    Hệ thống tìm thấy <span className="font-bold text-[#006b7a]">{filteredJobs.length}</span> tin tuyển dụng đang hoạt động.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCategory(null)}
                className="p-2.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors shadow-xs"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Search Panel */}
            <div className="px-6 py-4 md:px-8 border-b border-gray-100 bg-gray-50/50 flex items-center">
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder={`Tìm nhanh việc làm trong nhóm ngành ${selectedCategory.categoryName}...`}
                  value={jobSearchQuery}
                  onChange={(e) => setJobSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-light placeholder-gray-400 focus:outline-none focus:border-[#006b7a] focus:ring-1 focus:ring-[#006b7a] transition-all"
                />
                {jobSearchQuery && (
                  <button
                    onClick={() => setJobSearchQuery("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Modal Job List Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-4 bg-gray-50/30">
              {filteredJobs.length === 0 ? (
                <div className="text-center py-16 px-4 space-y-6 max-w-md mx-auto">
                  <div className="w-16 h-16 bg-[#006b7a]/5 rounded-2xl flex items-center justify-center mx-auto text-[#006b7a]">
                    <Sparkles className="w-8 h-8 text-amber-500 fill-amber-500/10" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-extrabold text-gray-800 text-base">
                      Chưa tìm thấy tin tuyển dụng phù hợp
                    </h4>
                    <p className="text-xs text-gray-400 leading-relaxed font-light">
                      Không có tin tuyển dụng nào thuộc ngành **{selectedCategory.categoryName}** trùng với điều kiện tìm kiếm của bạn tại thời điểm này.
                    </p>
                  </div>
                  {jobSearchQuery && (
                    <button
                      onClick={() => setJobSearchQuery("")}
                      className="px-4 py-2 bg-[#006b7a] text-white text-xs font-bold rounded-lg hover:bg-[#005a66] transition-all shadow-xs"
                    >
                      Xóa bộ lọc tìm kiếm
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredJobs.map((job) => (
                    <div
                      key={job.id}
                      className="bg-white rounded-2xl border border-gray-100 hover:border-[#006b7a]/30 shadow-xs hover:shadow-md transition-all duration-300 p-5 flex flex-col justify-between space-y-4 group text-left"
                    >
                      <div className="space-y-3">
                        {/* Company avatar and dynamic timing */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="h-12 w-12 rounded-xl border border-gray-150 bg-gradient-to-br from-[#006b7a]/5 to-[#006b7a]/15 text-[#006b7a] flex items-center justify-center font-extrabold text-xs shadow-2xs select-none flex-shrink-0">
                            {getCompanyInitials(job.employerName)}
                          </div>
                          <div className="text-right">
                            <span className="flex items-center gap-1 text-[10px] text-gray-400 font-light justify-end">
                              <Calendar size={10} />
                              Hạn nộp: {new Date(job.deadline).toLocaleDateString("vi-VN")}
                            </span>
                            <span className="inline-flex items-center gap-0.5 mt-1 px-2 py-0.5 rounded bg-teal-50 text-teal-700 text-[9px] font-extrabold uppercase border border-teal-150">
                              <ShieldCheck size={8} className="fill-teal-500 text-white" />
                              Xác thực
                            </span>
                          </div>
                        </div>

                        {/* Title & Company */}
                        <div className="space-y-0.5">
                          <Link
                            href={`/jobs/${job.id}`}
                            className="block font-extrabold text-gray-800 text-sm hover:text-[#006b7a] transition-colors line-clamp-1 leading-snug cursor-pointer"
                          >
                            {job.jobTitle}
                          </Link>
                          <p className="text-xs text-gray-400 font-light flex items-center gap-1 line-clamp-1">
                            <Building2 size={12} className="text-gray-300" />
                            <span>{job.employerName || "Doanh nghiệp Đà Nẵng"}</span>
                          </p>
                        </div>

                        {/* Salary and Location Info */}
                        <div className="space-y-1.5 pt-2 border-t border-gray-50 text-xs text-gray-500 font-light">
                          <div className="flex items-center gap-1.5 text-teal-600 font-bold">
                            <DollarSign size={13} className="text-teal-600 flex-shrink-0" />
                            <span>
                              {formatSalary(job.salaryType, job.minimumSalary, job.maximumSalary)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin size={13} className="text-gray-300 flex-shrink-0" />
                            <span className="line-clamp-1">{job.address}</span>
                          </div>
                        </div>
                      </div>

                      {/* Detail Link Button */}
                      <Link
                        href={`/jobs/${job.id}`}
                        className="w-full py-2 bg-gray-50 hover:bg-[#006b7a] border border-gray-150 hover:border-[#006b7a] text-gray-600 hover:text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-all active:scale-[0.98] cursor-pointer"
                      >
                        <span>Xem chi tiết tuyển dụng</span>
                        <ArrowRight size={11} />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400 font-light px-6 md:px-8">
              <span>* Nhấn phím ESC hoặc nhấp bên ngoài để đóng cửa sổ</span>
              <button
                onClick={() => setSelectedCategory(null)}
                className="px-4 py-1.5 bg-white border border-gray-200 text-gray-500 font-bold rounded-lg hover:bg-gray-100 transition-colors shadow-2xs"
              >
                Đóng
              </button>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}
