"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  MapPin,
  Briefcase,
  Sparkles,
  X,
  Calendar,
  DollarSign,
  ShieldCheck,
  ArrowRight,
  Loader2,
  SlidersHorizontal,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Check,
  RotateCcw,
  Building2,
  Map,
  ChevronDown,
  ChevronUp,
  List
} from "lucide-react";

import { jobService } from "@/services/jobService";
import { locationService } from "@/services/locationService";
import { categoryService } from "@/services/categoryService";
import { positionService } from "@/services/positionService";
import { experienceLevelService } from "@/services/experienceLevelService";

import { JobResponse } from "@/types/job";
import { DistrictResponse, WardResponse } from "@/types/location";
import { CategoryTreeResponse } from "@/types/category";
import { PositionResponse } from "@/types/position";
import { ExperienceLevelResponse } from "@/types/experienceLevel";
import { formatTime } from "@/lib/utils";

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Dropdown options lists
  const [districts, setDistricts] = useState<DistrictResponse[]>([]);
  const [wards, setWards] = useState<WardResponse[]>([]);
  const [categoriesList, setCategoriesList] = useState<{ id: number; name: string; level: number }[]>([]);
  const [categoriesTree, setCategoriesTree] = useState<CategoryTreeResponse[]>([]);
  const [expandedCategoryGroups, setExpandedCategoryGroups] = useState<number[]>([]);
  const [isShowingAllCategories, setIsShowingAllCategories] = useState(false);
  const [positions, setPositions] = useState<PositionResponse[]>([]);
  const [expLevels, setExpLevels] = useState<ExperienceLevelResponse[]>([]);

  // Local Filter states
  const [keyword, setKeyword] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<number | "">("");
  const [selectedWard, setSelectedWard] = useState<number | "">("");
  const [selectedPosition, setSelectedPosition] = useState<number | "">("");
  const [selectedExpLevel, setSelectedExpLevel] = useState<number | "">("");
  const [salaryType, setSalaryType] = useState<string>("");
  const [minSalary, setMinSalary] = useState<string>("");
  const [maxSalary, setMaxSalary] = useState<string>("");
  const [tempMinSalary, setTempMinSalary] = useState<string>("");
  const [tempMaxSalary, setTempMaxSalary] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(0);

  // States for premium capsule search bar
  const [isOpenCategoryModal, setIsOpenCategoryModal] = useState(false);
  const [isOpenLocationDropdown, setIsOpenLocationDropdown] = useState(false);
  const [activeParentCategoryId, setActiveParentCategoryId] = useState<number | null>(null);
  const [modalSearchQuery, setModalSearchQuery] = useState("");
  const [tempSelectedCategoryIds, setTempSelectedCategoryIds] = useState<number[]>([]);

  // Results & Loading
  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Utility to flatten categories tree
  const flattenCategories = (nodes: CategoryTreeResponse[], level = 0): { id: number; name: string; level: number }[] => {
    let result: { id: number; name: string; level: number }[] = [];
    for (const node of nodes) {
      result.push({
        id: node.id,
        name: node.categoryName,
        level: level
      });
      if (node.children && node.children.length > 0) {
        result = [...result, ...flattenCategories(node.children, level + 1)];
      }
    }
    return result;
  };

  // Helper: get descendant IDs recursively for group toggling
  const getDescendantIds = (node: CategoryTreeResponse): number[] => {
    let ids = [node.id];
    if (node.children) {
      for (const child of node.children) {
        ids = [...ids, ...getDescendantIds(child)];
      }
    }
    return ids;
  };

  // Helper: check selection level of a category group
  const getCategorySelectionStatus = (node: CategoryTreeResponse, selectedList: number[]): "none" | "partial" | "all" => {
    const descendantIds = getDescendantIds(node);
    const selectedCount = descendantIds.filter(id => selectedList.includes(id)).length;
    if (selectedCount === 0) return "none";
    if (selectedCount === descendantIds.length) return "all";
    return "partial";
  };

  // Helper: toggle select all descendants of a category group
  const handleToggleCategoryGroup = (node: CategoryTreeResponse) => {
    const descendantIds = getDescendantIds(node);
    const status = getCategorySelectionStatus(node, selectedCategories);

    let updatedCats: number[];
    if (status === "all") {
      // Remove all descendants
      updatedCats = selectedCategories.filter(id => !descendantIds.includes(id));
    } else {
      // Add all descendants
      const next = [...selectedCategories];
      descendantIds.forEach(id => {
        if (!next.includes(id)) next.push(id);
      });
      updatedCats = next;
    }
    setSelectedCategories(updatedCats);
    applyFilters({ categoryIds: updatedCats, page: 0 });
  };

  // Helpers for premium category explorer modal
  const getMatchingCategories = (nodes: CategoryTreeResponse[], query: string, path: string[] = []): { id: number; name: string; path: string }[] => {
    let matches: { id: number; name: string; path: string }[] = [];
    const lowerQuery = query.toLowerCase().trim();
    if (!lowerQuery) return [];

    for (const node of nodes) {
      const currentPath = [...path, node.categoryName];
      if (node.categoryName.toLowerCase().includes(lowerQuery)) {
        matches.push({
          id: node.id,
          name: node.categoryName,
          path: currentPath.join(" > ")
        });
      }
      if (node.children && node.children.length > 0) {
        matches = [...matches, ...getMatchingCategories(node.children, query, currentPath)];
      }
    }
    return matches;
  };

  const handleToggleCategory = (node: CategoryTreeResponse) => {
    const descendantIds = getDescendantIds(node);
    const allSelected = descendantIds.every(id => tempSelectedCategoryIds.includes(id));

    if (allSelected) {
      setTempSelectedCategoryIds(prev => prev.filter(id => !descendantIds.includes(id)));
    } else {
      setTempSelectedCategoryIds(prev => {
        const next = [...prev];
        descendantIds.forEach(id => {
          if (!next.includes(id)) next.push(id);
        });
        return next;
      });
    }
  };

  const getCategoryButtonText = () => {
    if (selectedCategories.length === 0) return "Danh mục Nghề";
    if (selectedCategories.length === 1) {
      const cat = categoriesList.find(c => c.id === selectedCategories[0]);
      return cat ? cat.name : "Danh mục Nghề";
    }
    return `Danh mục Nghề (${selectedCategories.length})`;
  };

  // 1. Initial Load of Filter Lists
  useEffect(() => {
    const loadDropdownData = async () => {
      setIsPageLoading(true);
      try {
        const [distRes, catRes, posRes, expRes] = await Promise.all([
          locationService.getAllDistricts(),
          categoryService.getCategoryTree(),
          positionService.getAllPositions(),
          experienceLevelService.getAllExperienceLevels()
        ]);
        if (distRes) setDistricts(distRes);
        if (catRes) {
          setCategoriesTree(catRes);
          setCategoriesList(flattenCategories(catRes));
        }
        if (posRes) setPositions(posRes);
        if (expRes) setExpLevels(expRes);
      } catch (err) {
        console.error("Error loading search page filter lists:", err);
      } finally {
        setIsPageLoading(false);
      }
    };
    loadDropdownData();
  }, []);

  // Auto-expand category groups that contain selected subcategories
  useEffect(() => {
    if (categoriesTree.length > 0 && selectedCategories.length > 0) {
      const groupsToExpand: number[] = [];
      categoriesTree.forEach(group => {
        const descendantIds = getDescendantIds(group);
        const hasSelectedDescendant = descendantIds.some(id => selectedCategories.includes(id));
        if (hasSelectedDescendant && !expandedCategoryGroups.includes(group.id)) {
          groupsToExpand.push(group.id);
        }
      });
      if (groupsToExpand.length > 0) {
        setExpandedCategoryGroups(prev => [...new Set([...prev, ...groupsToExpand])]);
      }
    }
  }, [categoriesTree, selectedCategories]);

  // 2. Fetch Jobs when URL query params change (browser history sync)
  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      try {
        const kw = searchParams.get("keyword") || "";
        const cats = searchParams.getAll("categoryIds").map(Number);
        const distId = searchParams.get("districtId") ? Number(searchParams.get("districtId")) : "";
        const wrdId = searchParams.get("wardId") ? Number(searchParams.get("wardId")) : "";
        const posId = searchParams.get("positionId") ? Number(searchParams.get("positionId")) : "";
        const expId = searchParams.get("experienceLevelId") ? Number(searchParams.get("experienceLevelId")) : "";
        const salT = searchParams.get("salaryType") || "";
        const minS = searchParams.get("minSalary") ? Number(searchParams.get("minSalary")) : "";
        const maxS = searchParams.get("maxSalary") ? Number(searchParams.get("maxSalary")) : "";
        const sort = searchParams.get("sortBy") || "";
        const pg = searchParams.get("page") ? Number(searchParams.get("page")) : 0;

        // Sync local states
        setKeyword(kw);
        setSelectedCategories(cats);
        setSelectedDistrict(distId);
        setSelectedWard(wrdId);
        setSelectedPosition(posId);
        setSelectedExpLevel(expId);
        setSalaryType(salT);
        setMinSalary(minS ? String(minS) : "");
        setMaxSalary(maxS ? String(maxS) : "");
        setTempMinSalary(minS ? String(minS) : "");
        setTempMaxSalary(maxS ? String(maxS) : "");
        setSortBy(sort);
        setCurrentPage(pg);

        // Fetch Wards dynamically if district is present
        if (distId) {
          const wardRes = await locationService.getWardsByDistrict(distId);
          setWards(wardRes || []);
        } else {
          setWards([]);
        }

        // Build API search request
        const requestBody = {
          keyword: kw || undefined,
          categoryIds: cats.length > 0 ? cats : undefined,
          positionId: posId ? Number(posId) : undefined,
          experienceLevelId: expId ? Number(expId) : undefined,
          wardId: wrdId ? Number(wrdId) : undefined,
          salaryType: salT || undefined,
          minSalary: minS ? Number(minS) * 1000000 : undefined,
          maxSalary: maxS ? Number(maxS) * 1000000 : undefined,
          sortBy: sort || undefined
        };

        const res = await jobService.advancedSearchJobs(requestBody, pg, 10);
        if (res) {
          setJobs(res.content || []);
          setTotalPages(res.totalPages || 0);
          setTotalElements(res.totalElements || 0);
        }
      } catch (err) {
        console.error("Error executing jobs advanced search:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [searchParams]);

  // 3. Update query params function
  const applyFilters = (updates: Record<string, any> = {}) => {
    const params = new URLSearchParams();

    const getVal = (key: string, stateVal: any) => {
      return updates.hasOwnProperty(key) ? updates[key] : stateVal;
    };

    const kw = getVal("keyword", keyword);
    if (kw.trim()) params.append("keyword", kw.trim());

    const cats = getVal("categoryIds", selectedCategories);
    cats.forEach((catId: number) => params.append("categoryIds", String(catId)));

    const dist = getVal("districtId", selectedDistrict);
    if (dist) params.append("districtId", String(dist));

    const wrd = getVal("wardId", selectedWard);
    if (wrd) params.append("wardId", String(wrd));

    const pos = getVal("positionId", selectedPosition);
    if (pos) params.append("positionId", String(pos));

    const exp = getVal("experienceLevelId", selectedExpLevel);
    if (exp) params.append("experienceLevelId", String(exp));

    const salT = getVal("salaryType", salaryType);
    if (salT) params.append("salaryType", salT);

    const minS = getVal("minSalary", minSalary);
    if (minS) params.append("minSalary", minS);

    const maxS = getVal("maxSalary", maxSalary);
    if (maxS) params.append("maxSalary", maxS);

    const sort = getVal("sortBy", sortBy);
    if (sort) params.append("sortBy", sort);

    const pg = getVal("page", currentPage);
    if (pg > 0) params.append("page", String(pg));

    router.push(`/jobs?${params.toString()}`);
  };

  const handleDistrictChange = async (districtIdVal: string) => {
    const distId = districtIdVal ? Number(districtIdVal) : "";
    setSelectedDistrict(distId);
    setSelectedWard(""); // Reset ward

    applyFilters({
      districtId: distId,
      wardId: "",
      page: 0
    });
  };

  const handleClearFilters = () => {
    setKeyword("");
    setSelectedCategories([]);
    setSelectedDistrict("");
    setSelectedWard("");
    setSelectedPosition("");
    setSelectedExpLevel("");
    setSalaryType("");
    setMinSalary("");
    setMaxSalary("");
    setTempMinSalary("");
    setTempMaxSalary("");
    setSortBy("");
    setCurrentPage(0);
    router.push("/jobs");
  };

  const removeFilterTag = (key: string, valueToRemove?: any) => {
    if (key === "keyword") {
      setKeyword("");
      applyFilters({ keyword: "", page: 0 });
    } else if (key === "category") {
      const updated = selectedCategories.filter(id => id !== valueToRemove);
      setSelectedCategories(updated);
      applyFilters({ categoryIds: updated, page: 0 });
    } else if (key === "district") {
      setSelectedDistrict("");
      setSelectedWard("");
      applyFilters({ districtId: "", wardId: "", page: 0 });
    } else if (key === "ward") {
      setSelectedWard("");
      applyFilters({ wardId: "", page: 0 });
    } else if (key === "position") {
      setSelectedPosition("");
      applyFilters({ positionId: "", page: 0 });
    } else if (key === "experience") {
      setSelectedExpLevel("");
      applyFilters({ experienceLevelId: "", page: 0 });
    } else if (key === "salary") {
      setSalaryType("");
      setMinSalary("");
      setMaxSalary("");
      setTempMinSalary("");
      setTempMaxSalary("");
      applyFilters({ salaryType: "", minSalary: "", maxSalary: "", page: 0 });
    }
  };

  // Salary formatter for job cards
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

  if (isPageLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-32 bg-gray-50/50 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#006b7a]" />
        <p className="text-gray-500 font-light text-sm">Đang thiết lập hệ thống tìm kiếm việc làm...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/40 pb-20">

      {/* Decorative Top Banner */}
      <div className="relative bg-gray-900 text-white overflow-hidden py-14 border-b border-gray-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-950/40 via-gray-900 to-gray-950 z-0"></div>
        <div className="absolute -top-10 -left-10 w-72 h-72 bg-[#006b7a]/15 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 text-left space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#006b7a]/20 border border-[#006b7a]/30 text-teal-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles size={12} className="text-teal-400 animate-pulse" />
              <span>Bộ lọc nâng cao thông minh</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-none text-white">
              Tìm Việc Làm Tại <span className="bg-gradient-to-r from-teal-400 to-teal-300 bg-clip-text text-transparent">Đà Nẵng</span>
            </h1>
            <p className="text-gray-300 text-sm max-w-2xl font-light">
              Sử dụng công cụ lọc nâng cao để kết nối trực tiếp với hàng ngàn tin tuyển dụng được xác thực uy tín.
            </p>
          </div>

          {/* Premium Search Capsule - Match CandidateHome search aesthetics */}
          <div className="bg-white rounded-3xl md:rounded-full p-2 shadow-xl max-w-4xl border border-gray-150/20 text-gray-800 relative z-20">
            <form onSubmit={(e) => {
              e.preventDefault();
              applyFilters({ keyword, categoryIds: selectedCategories, districtId: selectedDistrict, page: 0 });
            }} className="flex flex-col md:flex-row items-center gap-2 md:gap-0">
              
              {/* 1. BUTTON: Danh mục Nghề */}
              <div className="relative w-full md:w-auto flex-shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setTempSelectedCategoryIds([...selectedCategories]);
                    setIsOpenCategoryModal(true);
                    setIsOpenLocationDropdown(false);
                  }}
                  className="w-full md:w-auto flex items-center justify-between md:justify-start gap-2.5 px-5 py-3 hover:bg-gray-50 transition-colors text-xs font-bold rounded-2xl md:rounded-full border border-gray-150 md:border-none text-[#006b7a] active:scale-[0.99] cursor-pointer"
                >
                  <div className="flex items-center gap-2 max-w-[170px] min-w-0">
                    <List size={16} className="text-[#006b7a] flex-shrink-0" />
                    <span className="truncate leading-none">{getCategoryButtonText()}</span>
                  </div>
                  <ChevronDown size={12} className="text-gray-400 flex-shrink-0" />
                </button>
              </div>

              {/* Vertical Divider */}
              <div className="hidden md:block h-6 w-px bg-gray-250 self-center mx-1"></div>

              {/* 2. INPUT: Keywords */}
              <div className="flex items-center gap-2 px-5 py-2.5 w-full md:flex-grow min-w-0">
                <Search size={16} className="text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Vị trí tuyển dụng, tên công ty..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full text-xs font-medium placeholder-gray-400 focus:outline-none bg-transparent"
                />
              </div>

              {/* Vertical Divider */}
              <div className="hidden md:block h-6 w-px bg-gray-250/70 self-center mx-1"></div>

              {/* 3. DROPDOWN: Địa điểm (Custom District Dropdown) */}
              <div className="relative w-full md:w-48 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpenLocationDropdown(!isOpenLocationDropdown);
                    setIsOpenCategoryModal(false);
                  }}
                  className="w-full flex items-center justify-between gap-2.5 px-5 py-3 hover:bg-gray-50 transition-colors text-xs font-bold rounded-2xl md:rounded-full border border-gray-150 md:border-none text-gray-600 active:scale-[0.99] cursor-pointer"
                >
                  <div className="flex items-center gap-2 max-w-[130px] min-w-0">
                    <MapPin size={16} className="text-gray-400 flex-shrink-0" />
                    <span className="truncate leading-none">
                      {selectedDistrict ? districts.find(d => String(d.id) === String(selectedDistrict))?.districtName || "Địa điểm" : "Địa điểm"}
                    </span>
                  </div>
                  <ChevronDown size={12} className="text-gray-400 flex-shrink-0" />
                </button>

                {isOpenLocationDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpenLocationDropdown(false)}></div>
                    <div className="absolute left-0 right-0 md:left-auto md:w-48 mt-2 bg-white border border-gray-150 rounded-2xl shadow-xl overflow-hidden z-20 animate-in fade-in slide-in-from-top-1 duration-150 text-left max-h-60 overflow-y-auto custom-scrollbar">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDistrict("");
                          setSelectedWard("");
                          setIsOpenLocationDropdown(false);
                          applyFilters({ districtId: "", wardId: "", page: 0 });
                        }}
                        className={`w-full px-4 py-2.5 text-[11px] text-left font-bold transition-colors border-b border-gray-50 flex items-center justify-between ${!selectedDistrict ? "bg-teal-50/50 text-[#006b7a]" : "hover:bg-gray-50 text-gray-500"}`}
                      >
                        <span>Tất cả Quận/Huyện</span>
                        {!selectedDistrict && <Check size={10} className="text-[#006b7a] stroke-[3]" />}
                      </button>
                      {districts.map((d) => {
                        const isSelected = String(d.id) === String(selectedDistrict);
                        return (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => {
                              setSelectedDistrict(d.id);
                              setSelectedWard("");
                              setIsOpenLocationDropdown(false);
                              applyFilters({ districtId: d.id, wardId: "", page: 0 });
                            }}
                            className={`w-full px-4 py-2.5 text-[11px] text-left font-bold transition-colors border-b border-gray-50 last:border-0 flex items-center justify-between ${isSelected ? "bg-teal-50/50 text-[#006b7a]" : "hover:bg-gray-50 text-gray-500"}`}
                          >
                            <span>{d.districtName}</span>
                            {isSelected && <Check size={10} className="text-[#006b7a] stroke-[3]" />}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* 4. BUTTON: Submit Search */}
              <button
                type="submit"
                className="w-full md:w-auto px-6 py-2.5 bg-[#006b7a] hover:bg-[#005a66] text-white font-bold rounded-2xl md:rounded-full transition-all duration-300 shadow-md hover:shadow-lg active:scale-[0.97] flex-shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Search size={14} />
                <span>Tìm kiếm</span>
              </button>

            </form>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* COLUMN 1: SIDEBAR FILTERS */}
          <div className="lg:col-span-1 space-y-6">

            {/* Filter Card */}
            <div className="bg-white rounded-3xl border border-gray-150 shadow-sm p-6 space-y-6 text-left">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2 font-bold text-gray-800 text-base">
                  <SlidersHorizontal size={16} className="text-[#006b7a]" />
                  <span>Bộ lọc nâng cao</span>
                </div>
                <button
                  onClick={handleClearFilters}
                  className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors"
                >
                  <RotateCcw size={12} />
                  <span>Xóa bộ lọc</span>
                </button>
              </div>

              {/* FILTER: Keyword */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 tracking-wide">
                  Từ khóa tuyển dụng
                </label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Tên công việc, công ty..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") applyFilters({ page: 0 });
                    }}
                    className="w-full pl-9.5 pr-8 py-2.5 bg-gray-50 border border-gray-200 hover:border-gray-300 focus:bg-white rounded-xl text-xs font-semibold text-gray-750 focus:outline-none focus:border-[#006b7a] focus:ring-1 focus:ring-[#006b7a] transition-all"
                  />
                  {keyword && (
                    <button
                      onClick={() => removeFilterTag("keyword")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* FILTER: Categories (Premium Green Accordion UI) */}
              <div className="space-y-3 border-t border-gray-100 pt-5">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-bold text-gray-800">
                    Theo danh mục nghề
                  </label>
                  {selectedCategories.length > 0 && (
                    <button
                      onClick={() => {
                        setSelectedCategories([]);
                        applyFilters({ categoryIds: [], page: 0 });
                      }}
                      className="text-[11px] font-medium text-[#00b14f] hover:text-[#00a757] hover:underline"
                    >
                      Xóa chọn
                    </button>
                  )}
                </div>

                <div className="space-y-1.5 pr-1">
                  {(() => {
                    const filteredTree = categoriesTree.filter(
                      (catGroup) => catGroup && catGroup.categoryName && catGroup.categoryName.trim() !== ""
                    );
                    const categoriesToRender = isShowingAllCategories 
                      ? filteredTree.slice(0, 8) 
                      : filteredTree.slice(0, 4);

                    return (
                      <>
                        {categoriesToRender.map((catGroup) => {
                          const isExpanded = expandedCategoryGroups.includes(catGroup.id);
                          const status = getCategorySelectionStatus(catGroup, selectedCategories);
                          const isAnySelected = status === "all" || status === "partial";

                          // Realistic mock job count based on ID to match high-fidelity specs
                          const mockJobCount = (catGroup.id * 149) % 800 + 120;

                          return (
                            <div
                              key={catGroup.id}
                              className="group overflow-hidden transition-all duration-200 bg-white"
                            >
                              {/* Header Row */}
                              <div
                                className="flex items-center justify-between py-2 rounded-xl cursor-pointer select-none transition-colors duration-150"
                                onClick={() => {
                                  setExpandedCategoryGroups(prev =>
                                    prev.includes(catGroup.id)
                                      ? prev.filter(id => id !== catGroup.id)
                                      : [...prev, catGroup.id]
                                  );
                                }}
                              >
                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                  {/* Custom Green Checkbox */}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleCategoryGroup(catGroup);
                                    }}
                                    className="focus:outline-none flex-shrink-0 cursor-pointer flex items-center justify-center transition-all duration-200"
                                  >
                                    {status === "all" ? (
                                      <div className="w-[18px] h-[18px] border-2 border-[#00b14f] rounded flex items-center justify-center bg-[#00b14f] text-white shadow-3xs transition-colors">
                                        <Check size={11} className="stroke-[3.5]" />
                                      </div>
                                    ) : status === "partial" ? (
                                      <div className="w-[18px] h-[18px] border-2 border-[#00b14f] rounded flex items-center justify-center bg-[#00b14f]/10 text-[#00b14f]">
                                        <div className="w-2 h-0.5 bg-[#00b14f] rounded-full"></div>
                                      </div>
                                    ) : (
                                      <div className="w-[18px] h-[18px] border border-gray-300 rounded hover:border-[#00b14f] bg-white transition-colors"></div>
                                    )}
                                  </button>

                                  {/* Title */}
                                  <div className="text-left min-w-0 flex-1">
                                    <p className={`text-[13px] leading-snug transition-colors ${
                                      isAnySelected 
                                        ? "text-[#00b14f] font-bold" 
                                        : "text-gray-700 font-medium group-hover:text-gray-900"
                                    }`}>
                                      {catGroup.categoryName}
                                    </p>
                                  </div>
                                </div>

                                {/* Chevron Toggle */}
                                <div className={`p-1 transition-transform duration-250 ${
                                  isAnySelected ? "text-[#00b14f]" : "text-gray-400 group-hover:text-gray-650"
                                } ${isExpanded ? "transform rotate-180" : ""}`}>
                                  <ChevronDown size={14} className="stroke-[2.5]" />
                                </div>
                              </div>

                              {/* Subcategory Checkbox Panel */}
                              {isExpanded && (
                                <div className="pl-6 pb-2.5 pt-0.5 space-y-2 animate-fadeIn">
                                  {!catGroup.children || catGroup.children.length === 0 ? (
                                    <p className="text-[11px] text-gray-400 font-medium py-1">Chưa có danh mục con</p>
                                  ) : (
                                    catGroup.children.map((subcat) => {
                                      const isSubcatSelected = selectedCategories.includes(subcat.id);
                                      return (
                                        <div
                                          key={subcat.id}
                                          onClick={() => {
                                            let updatedCats;
                                            if (isSubcatSelected) {
                                              updatedCats = selectedCategories.filter(id => id !== subcat.id);
                                            } else {
                                              updatedCats = [...selectedCategories, subcat.id];
                                            }
                                            setSelectedCategories(updatedCats);
                                            applyFilters({ categoryIds: updatedCats, page: 0 });
                                          }}
                                          className="flex items-center gap-2.5 py-1 cursor-pointer select-none text-left"
                                        >
                                          {/* Custom Subcategory Checkbox */}
                                          <div className="focus:outline-none flex-shrink-0 flex items-center justify-center transition-all duration-200">
                                            {isSubcatSelected ? (
                                              <div className="w-4 h-4 border-2 border-[#00b14f] rounded flex items-center justify-center bg-[#00b14f] text-white shadow-3xs transition-colors">
                                                <Check size={9} className="stroke-[4]" />
                                              </div>
                                            ) : (
                                              <div className="w-4 h-4 border border-gray-300 rounded hover:border-[#00b14f] bg-white transition-colors"></div>
                                            )}
                                          </div>

                                          {/* Subcategory Name */}
                                          <span className={`text-[12px] transition-colors ${
                                            isSubcatSelected 
                                              ? "font-semibold text-[#00b14f]" 
                                              : "font-medium text-gray-650 hover:text-gray-900"
                                          }`}>
                                            {subcat.categoryName}
                                          </span>
                                        </div>
                                      );
                                    })
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {filteredTree.length > 4 && (
                          <button
                            type="button"
                            onClick={() => setIsShowingAllCategories(!isShowingAllCategories)}
                            className="text-xs font-bold text-[#00b14f] hover:text-[#00a757] flex items-center gap-1 mt-2.5 ml-1 cursor-pointer transition-colors"
                          >
                            {isShowingAllCategories ? "Thu gọn" : "Xem thêm"}
                          </button>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* FILTER: District & Ward (Linked) */}
              <div className="space-y-3 border-t border-gray-50 pt-4">
                <label className="block text-xs font-bold text-gray-700 tracking-wide">
                  Khu vực Đà Nẵng
                </label>

                {/* District */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400">Quận/Huyện</span>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5 pointer-events-none" />
                    <select
                      value={selectedDistrict}
                      onChange={(e) => handleDistrictChange(e.target.value)}
                      className="w-full appearance-none pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:border-[#006b7a] focus:ring-1 focus:ring-[#006b7a] transition-all cursor-pointer"
                    >
                      <option value="">Tất cả Quận/Huyện</option>
                      {districts.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.districtName}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Ward */}
                {selectedDistrict && (
                  <div className="space-y-1 animate-fadeIn">
                    <span className="text-[10px] font-bold text-gray-400">Phường/Xã</span>
                    <div className="relative">
                      <Map className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5 pointer-events-none" />
                      <select
                        value={selectedWard}
                        onChange={(e) => {
                          const wId = e.target.value ? Number(e.target.value) : "";
                          setSelectedWard(wId);
                          applyFilters({ wardId: wId, page: 0 });
                        }}
                        className="w-full appearance-none pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:border-[#006b7a] focus:ring-1 focus:ring-[#006b7a] transition-all cursor-pointer"
                      >
                        <option value="">Tất cả Phường/Xã</option>
                        {wards.map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.wardName}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                )}
              </div>

              {/* FILTER: Job Position */}
              <div className="space-y-2 border-t border-gray-50 pt-4">
                <label className="block text-xs font-bold text-gray-700 tracking-wide">
                  Vị trí tuyển dụng
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5 pointer-events-none" />
                  <select
                    value={selectedPosition}
                    onChange={(e) => {
                      const posId = e.target.value ? Number(e.target.value) : "";
                      setSelectedPosition(posId);
                      applyFilters({ positionId: posId, page: 0 });
                    }}
                    className="w-full appearance-none pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:border-[#006b7a] focus:ring-1 focus:ring-[#006b7a] transition-all cursor-pointer"
                  >
                    <option value="">Tất cả vị trí chức danh</option>
                    {positions.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.positionName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* FILTER: Experience Level */}
              <div className="space-y-2 border-t border-gray-50 pt-4">
                <label className="block text-xs font-bold text-gray-700 tracking-wide">
                  Cấp bậc kinh nghiệm
                </label>
                <div className="relative">
                  <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5 pointer-events-none" />
                  <select
                    value={selectedExpLevel}
                    onChange={(e) => {
                      const expId = e.target.value ? Number(e.target.value) : "";
                      setSelectedExpLevel(expId);
                      applyFilters({ experienceLevelId: expId, page: 0 });
                    }}
                    className="w-full appearance-none pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:border-[#006b7a] focus:ring-1 focus:ring-[#006b7a] transition-all cursor-pointer"
                  >
                    <option value="">Tất cả cấp bậc</option>
                    {expLevels.map((el) => (
                      <option key={el.id} value={el.id}>
                        {el.levelName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* FILTER: Predefined Salary Options (Redesigned Radio Grid & Custom Inputs) */}
              <div className="space-y-4 border-t border-gray-50 pt-4 text-left">
                <label className="block text-sm font-extrabold text-gray-800">
                  Mức lương
                </label>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 select-none">
                  {[
                    { id: "all", label: "Tất cả", salaryType: "", minSalary: "", maxSalary: "" },
                    { id: "under-10", label: "Dưới 10 triệu", salaryType: "Lương cố định", minSalary: "", maxSalary: "10" },
                    { id: "10-15", label: "10 - 15 triệu", salaryType: "Lương cố định", minSalary: "10", maxSalary: "15" },
                    { id: "15-20", label: "15 - 20 triệu", salaryType: "Lương cố định", minSalary: "15", maxSalary: "20" },
                    { id: "20-25", label: "20 - 25 triệu", salaryType: "Lương cố định", minSalary: "20", maxSalary: "25" },
                    { id: "25-30", label: "25 - 30 triệu", salaryType: "Lương cố định", minSalary: "25", maxSalary: "30" },
                    { id: "30-50", label: "30 - 50 triệu", salaryType: "Lương cố định", minSalary: "30", maxSalary: "50" },
                    { id: "over-50", label: "Trên 50 triệu", salaryType: "Lương cố định", minSalary: "50", maxSalary: "" },
                    { id: "negotiable", label: "Thoả thuận", salaryType: "Lương thỏa thuận", minSalary: "", maxSalary: "" }
                  ].map((opt) => {
                    const isSelected = (() => {
                      if (opt.id === "negotiable") {
                        return salaryType === "Lương thỏa thuận";
                      }
                      if (opt.id === "all") {
                        return salaryType === "" && minSalary === "" && maxSalary === "";
                      }
                      return salaryType === opt.salaryType && minSalary === opt.minSalary && maxSalary === opt.maxSalary;
                    })();

                    return (
                      <div
                        key={opt.id}
                        onClick={() => {
                          setSalaryType(opt.salaryType);
                          setMinSalary(opt.minSalary);
                          setMaxSalary(opt.maxSalary);
                          setTempMinSalary(opt.minSalary);
                          setTempMaxSalary(opt.maxSalary);

                          applyFilters({
                            salaryType: opt.salaryType,
                            minSalary: opt.minSalary,
                            maxSalary: opt.maxSalary,
                            page: 0
                          });
                        }}
                        className="flex items-center gap-2 cursor-pointer group py-0.5"
                      >
                        <div className="relative flex items-center justify-center flex-shrink-0">
                          <div
                            className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center ${
                              isSelected
                                ? "border-[#00b14f] bg-white"
                                : "border-gray-300 group-hover:border-gray-400 bg-white"
                            }`}
                          >
                            {isSelected && (
                              <div className="w-2.5 h-2.5 rounded-full bg-[#00b14f]" />
                            )}
                          </div>
                        </div>
                        <span
                          className={`text-xs transition-colors ${
                            isSelected ? "font-bold text-gray-800" : "font-medium text-gray-500 group-hover:text-gray-800"
                          }`}
                        >
                          {opt.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Custom input fields: Min - Max */}
                <div className="flex items-center gap-2 pt-2 justify-start text-xs font-semibold text-gray-500">
                  <input
                    type="number"
                    placeholder="Từ"
                    value={tempMinSalary}
                    onChange={(e) => {
                      setTempMinSalary(e.target.value);
                      if (salaryType === "Lương thỏa thuận") {
                        setSalaryType("Lương cố định");
                      }
                    }}
                    className={`w-24 px-4 py-2 border rounded-full text-center text-xs font-bold transition-all focus:outline-none focus:ring-1 focus:ring-[#00b14f] ${
                      tempMinSalary ? "border-[#00b14f] text-gray-850" : "border-gray-250 text-gray-700"
                    }`}
                  />
                  <span className="text-gray-400 font-light">-</span>
                  <input
                    type="number"
                    placeholder="Đến"
                    value={tempMaxSalary}
                    onChange={(e) => {
                      setTempMaxSalary(e.target.value);
                      if (salaryType === "Lương thỏa thuận") {
                        setSalaryType("Lương cố định");
                      }
                    }}
                    className={`w-24 px-4 py-2 border rounded-full text-center text-xs font-bold transition-all focus:outline-none focus:ring-1 focus:ring-[#00b14f] ${
                      tempMaxSalary ? "border-[#00b14f] text-gray-850" : "border-gray-250 text-gray-700"
                    }`}
                  />
                  <span className="text-gray-400 font-medium ml-1">triệu</span>
                </div>

                {/* Apply Button */}
                <div className="pt-1">
                  <button
                    type="button"
                    disabled={tempMinSalary === minSalary && tempMaxSalary === maxSalary}
                    onClick={() => {
                      const nextSalType = (!tempMinSalary && !tempMaxSalary) ? "" : "Lương cố định";
                      setSalaryType(nextSalType);
                      setMinSalary(tempMinSalary);
                      setMaxSalary(tempMaxSalary);
                      applyFilters({
                        salaryType: nextSalType,
                        minSalary: tempMinSalary,
                        maxSalary: tempMaxSalary,
                        page: 0
                      });
                    }}
                    className={`w-full py-2.5 rounded-full text-xs font-bold transition-all duration-200 select-none ${
                      (tempMinSalary !== minSalary || tempMaxSalary !== maxSalary)
                        ? "bg-[#00b14f] hover:bg-[#009c44] text-white active:scale-[0.98] shadow-sm cursor-pointer"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Áp dụng
                  </button>
                </div>
              </div>



            </div>

          </div>

          {/* COLUMN 2: JOBS RESULTS LIST */}
          <div className="lg:col-span-3 space-y-6">

            {/* Header controls bar */}
            <div className="bg-white border border-gray-150 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
              <div className="text-left space-y-1">
                <p className="text-xs text-gray-450 font-light">Kết quả phân tích việc làm</p>
                <h3 className="font-extrabold text-gray-800 text-sm sm:text-base">
                  {isLoading ? "Đang tìm kiếm..." : `Tìm thấy ${totalElements} việc làm đang tuyển`}
                </h3>
              </div>

              {/* Sort by Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-light whitespace-nowrap">Sắp xếp theo:</span>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    applyFilters({ sortBy: e.target.value, page: 0 });
                  }}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-light text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#006b7a] bg-transparent cursor-pointer"
                >
                  <option value="">Mới nhất</option>
                  <option value="salaryAsc">Lương thấp đến cao</option>
                  <option value="salaryDesc">Lương cao đến thấp</option>
                  <option value="viewDesc">Lượt xem nhiều nhất</option>
                </select>
              </div>
            </div>

            {/* Active filters tag pills */}
            {(keyword || selectedCategories.length > 0 || selectedDistrict || selectedWard || selectedPosition || selectedExpLevel || salaryType) && (
              <div className="flex flex-wrap gap-2 items-center text-left py-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1">Bộ lọc đang chọn:</span>

                {/* Keyword Tag */}
                {keyword && (
                  <span className="inline-flex items-center gap-1 bg-white border border-gray-200 px-3 py-1 rounded-full text-xs text-[#006b7a] font-medium shadow-3xs">
                    <span>Từ khóa: "{keyword}"</span>
                    <button onClick={() => removeFilterTag("keyword")} className="hover:text-red-500 transition-colors">
                      <X size={12} />
                    </button>
                  </span>
                )}

                {/* Categories Tag */}
                {selectedCategories.length <= 3 ? (
                  selectedCategories.map((catId) => {
                    const catObj = categoriesList.find(c => c.id === catId);
                    return (
                      <span key={catId} className="inline-flex items-center gap-1 bg-white border border-gray-200 px-3 py-1 rounded-full text-xs text-[#006b7a] font-medium shadow-3xs">
                        <span>Ngành nghề: {catObj?.name || `ID ${catId}`}</span>
                        <button onClick={() => removeFilterTag("category", catId)} className="hover:text-red-500 transition-colors">
                          <X size={12} />
                        </button>
                      </span>
                    );
                  })
                ) : (
                  <>
                    {selectedCategories.slice(0, 3).map((catId) => {
                      const catObj = categoriesList.find(c => c.id === catId);
                      return (
                        <span key={catId} className="inline-flex items-center gap-1 bg-white border border-gray-200 px-3 py-1 rounded-full text-xs text-[#006b7a] font-medium shadow-3xs">
                          <span>Ngành nghề: {catObj?.name || `ID ${catId}`}</span>
                          <button onClick={() => removeFilterTag("category", catId)} className="hover:text-red-500 transition-colors">
                            <X size={12} />
                          </button>
                        </span>
                      );
                    })}
                    <span className="inline-flex items-center gap-1 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full text-xs text-[#006b7a] font-bold shadow-3xs">
                      <span>+{selectedCategories.length - 3} ngành nghề khác</span>
                      <button
                        onClick={() => {
                          const keepIds = selectedCategories.slice(0, 3);
                          setSelectedCategories(keepIds);
                          applyFilters({ categoryIds: keepIds, page: 0 });
                        }}
                        className="hover:text-red-500 transition-colors"
                        title="Bỏ chọn các ngành nghề còn lại"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  </>
                )}

                {/* District Tag */}
                {selectedDistrict && (
                  <span className="inline-flex items-center gap-1 bg-white border border-gray-200 px-3 py-1 rounded-full text-xs text-[#006b7a] font-medium shadow-3xs">
                    <span>Quận/Huyện: {districts.find(d => d.id === selectedDistrict)?.districtName}</span>
                    <button onClick={() => removeFilterTag("district")} className="hover:text-red-500 transition-colors">
                      <X size={12} />
                    </button>
                  </span>
                )}

                {/* Ward Tag */}
                {selectedWard && (
                  <span className="inline-flex items-center gap-1 bg-white border border-gray-200 px-3 py-1 rounded-full text-xs text-[#006b7a] font-medium shadow-3xs">
                    <span>Phường/Xã: {wards.find(w => w.id === selectedWard)?.wardName}</span>
                    <button onClick={() => removeFilterTag("ward")} className="hover:text-red-500 transition-colors">
                      <X size={12} />
                    </button>
                  </span>
                )}

                {/* Position Tag */}
                {selectedPosition && (
                  <span className="inline-flex items-center gap-1 bg-white border border-gray-200 px-3 py-1 rounded-full text-xs text-[#006b7a] font-medium shadow-3xs">
                    <span>Chức danh: {positions.find(p => p.id === selectedPosition)?.positionName}</span>
                    <button onClick={() => removeFilterTag("position")} className="hover:text-red-500 transition-colors">
                      <X size={12} />
                    </button>
                  </span>
                )}

                {/* Experience Tag */}
                {selectedExpLevel && (
                  <span className="inline-flex items-center gap-1 bg-white border border-gray-200 px-3 py-1 rounded-full text-xs text-[#006b7a] font-medium shadow-3xs">
                    <span>Kinh nghiệm: {expLevels.find(e => e.id === selectedExpLevel)?.levelName}</span>
                    <button onClick={() => removeFilterTag("experience")} className="hover:text-red-500 transition-colors">
                      <X size={12} />
                    </button>
                  </span>
                )}

                {/* Salary Tag */}
                {salaryType && (
                  <span className="inline-flex items-center gap-1 bg-white border border-gray-200 px-3 py-1 rounded-full text-xs text-[#006b7a] font-medium shadow-3xs">
                    <span>Lương: {salaryType} {minSalary && `> ${minSalary}Tr`} {maxSalary && `< ${maxSalary}Tr`}</span>
                    <button onClick={() => removeFilterTag("salary")} className="hover:text-red-500 transition-colors">
                      <X size={12} />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Main results area */}
            {isLoading ? (

              /* Skeletons Loader */
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <div key={idx} className="bg-white border border-gray-100 rounded-3xl p-6 flex flex-col md:flex-row justify-between gap-6 animate-pulse">
                    <div className="flex gap-4">
                      <div className="w-14 h-14 bg-gray-100 rounded-xl flex-shrink-0"></div>
                      <div className="space-y-3 w-48 sm:w-80">
                        <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-100 rounded w-2/3"></div>
                      </div>
                    </div>
                    <div className="w-24 h-8 bg-gray-100 rounded-xl self-end md:self-center"></div>
                  </div>
                ))}
              </div>

            ) : jobs.length === 0 ? (

              /* High Fidelity Empty State */
              <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-12 md:p-20 text-center space-y-6">
                <div className="w-20 h-20 bg-[#006b7a]/5 rounded-3xl flex items-center justify-center mx-auto text-[#006b7a]">
                  <SlidersHorizontal className="w-10 h-10 text-teal-600 animate-pulse" />
                </div>
                <div className="space-y-2 max-w-md mx-auto">
                  <h3 className="font-extrabold text-gray-800 text-lg md:text-xl">
                    Chưa tìm thấy công việc phù hợp
                  </h3>
                  <p className="text-xs text-gray-450 leading-relaxed font-light">
                    Hệ thống chưa tìm thấy tin tuyển dụng nào thuộc các nhóm ngành hoặc điều kiện lọc hiện tại của bạn. Vui lòng nới lỏng bộ lọc hoặc xóa bộ lọc để xem các việc làm khác.
                  </p>
                </div>
                <button
                  onClick={handleClearFilters}
                  className="px-6 py-3 bg-[#006b7a] text-white text-xs font-bold rounded-xl hover:bg-[#005a66] transition-all shadow-md active:scale-[0.98] cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Trash2 size={13} />
                  <span>Xóa tất cả bộ lọc</span>
                </button>
              </div>

            ) : (

              /* Jobs List Container */
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-white rounded-3xl border border-gray-150/70 p-6 shadow-3xs hover:border-[#006b7a]/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col md:flex-row justify-between gap-6 group text-left"
                  >

                    {/* Job Details Left Side */}
                    <div className="flex gap-4 items-start">
                      {/* Logo Frame */}
                      <div className="h-14 w-14 rounded-2xl border border-gray-150 bg-gradient-to-br from-[#006b7a]/5 to-[#006b7a]/15 text-[#006b7a] flex items-center justify-center overflow-hidden font-black text-sm shadow-2xs select-none flex-shrink-0 group-hover:scale-105 transition-transform">
                        {getCompanyInitials(job.employerName)}
                      </div>

                      {/* Title & Stats */}
                      <div className="space-y-2 overflow-hidden">
                        <div className="space-y-0.5">
                          <Link
                            href={`/jobs/${job.id}`}
                            className="block font-black text-gray-800 text-sm md:text-base leading-snug tracking-tight hover:text-[#006b7a] transition-colors line-clamp-1 cursor-pointer"
                          >
                            {job.jobTitle}
                          </Link>
                          <p className="text-xs text-gray-450 font-medium flex items-center gap-1">
                            <Building2 size={12} className="text-gray-300" />
                            <span>{job.employerName || "Doanh nghiệp Đà Nẵng"}</span>
                          </p>
                        </div>

                        {/* Badges and Bullets */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1.5 border-t border-gray-50 text-xs text-gray-500 font-light">

                          {/* Salary */}
                          <div className="flex items-center gap-1 text-teal-600 font-bold">
                            <DollarSign size={13} className="text-teal-600" />
                            <span>
                              {formatSalary(job.salaryType, job.minimumSalary, job.maximumSalary)}
                            </span>
                          </div>

                          {/* Location */}
                          <div className="flex items-center gap-1">
                            <MapPin size={13} className="text-gray-300 flex-shrink-0" />
                            <span className="line-clamp-1">{job.address}</span>
                          </div>

                          {/* Deadline */}
                          <div className="flex items-center gap-1">
                            <Calendar size={13} className="text-gray-300" />
                            <span>Hạn nộp: {new Date(job.deadline).toLocaleDateString("vi-VN")}</span>
                          </div>

                        </div>

                        {/* Tag Pills */}
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {job.positionName && (
                            <span className="px-2 py-0.5 rounded-md bg-[#006b7a]/5 text-[#006b7a] text-[9px] font-bold border border-[#006b7a]/10">
                              {job.positionName}
                            </span>
                          )}
                          {job.experienceLevelName && (
                            <span className="px-2 py-0.5 rounded-md bg-purple-500/5 text-purple-600 text-[9px] font-bold border border-purple-500/10">
                              {job.experienceLevelName}
                            </span>
                          )}
                          {(job.categoryNames || []).slice(0, 2).map((catName, cIdx) => (
                            <span
                              key={cIdx}
                              className="px-2 py-0.5 rounded-md bg-amber-500/5 text-amber-600 text-[9px] font-bold border border-amber-500/10"
                            >
                              {catName}
                            </span>
                          ))}
                        </div>

                      </div>
                    </div>

                    {/* Action Button Right Side */}
                    <div className="flex flex-col justify-between items-end md:w-36 flex-shrink-0">

                      {/* Verfied Badge */}
                      <span className="inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-md bg-teal-50 text-teal-700 text-[9px] font-extrabold uppercase border border-teal-150 shadow-3xs select-none">
                        <ShieldCheck size={8} className="fill-teal-500 text-white" />
                        Xác thực
                      </span>

                      <p className="text-[10px] text-gray-400 font-light mt-1 mb-2 hidden md:block">
                        Đăng {formatTime(job.createdAt)}
                      </p>

                      <Link
                        href={`/jobs/${job.id}`}
                        className="w-full py-2.5 bg-gray-50 hover:bg-[#006b7a] border border-gray-150 hover:border-[#006b7a] text-gray-650 hover:text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-1 transition-all duration-300 active:scale-[0.98] cursor-pointer"
                      >
                        <span>Ứng tuyển ngay</span>
                        <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                      </Link>

                    </div>

                  </div>
                ))}
              </div>

            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">

                {/* Prev Button */}
                <button
                  onClick={() => applyFilters({ page: currentPage - 1 })}
                  disabled={currentPage === 0}
                  className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-550 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>

                {/* Page Numbers */}
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const isCurrent = idx === currentPage;
                  return (
                    <button
                      key={idx}
                      onClick={() => applyFilters({ page: idx })}
                      className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${isCurrent
                          ? "bg-[#006b7a] border-[#006b7a] text-white shadow-sm"
                          : "bg-white border-gray-200 hover:bg-gray-50 text-gray-750"
                        }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}

                {/* Next Button */}
                <button
                  onClick={() => applyFilters({ page: currentPage + 1 })}
                  disabled={currentPage === totalPages - 1}
                  className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-550 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>

              </div>
            )}

          </div>
        </div>
      </div>

      {/* ==================== MULTI-LEVEL CATEGORY SELECTOR MODAL ==================== */}
      {isOpenCategoryModal && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 z-0" onClick={() => setIsOpenCategoryModal(false)}></div>
          
          <div className="relative bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden border border-gray-150 animate-in fade-in zoom-in-95 duration-200 flex flex-col h-[85vh] max-h-[700px] text-gray-800 z-10">
            {/* Header */}
            <div className="p-5 md:p-6 border-b border-gray-100 flex items-center justify-between gap-4 bg-gray-50/50">
              <h3 className="text-sm md:text-base font-black tracking-tight text-gray-850 select-none">
                Chọn Nhóm nghề, Nghề hoặc Chuyên môn
              </h3>
              <button
                type="button"
                onClick={() => setIsOpenCategoryModal(false)}
                className="p-2 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-655 transition-colors shadow-2xs cursor-pointer flex items-center justify-center border-none bg-transparent"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search */}
            <div className="px-5 py-3.5 md:px-6 border-b border-gray-100 bg-white">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Nhập từ khóa tìm kiếm..."
                  value={modalSearchQuery}
                  onChange={(e) => setModalSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-10 py-3 bg-gray-50 border border-gray-200 focus:border-[#006b7a] focus:ring-1 focus:ring-[#006b7a] rounded-full text-xs font-bold placeholder-gray-400 focus:outline-none transition-all"
                />
                {modalSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setModalSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-655 cursor-pointer flex items-center justify-center border-none bg-transparent"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Split Content */}
            <div className="flex-1 flex overflow-hidden bg-white">
              {modalSearchQuery.trim() !== "" ? (
                <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-3">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 select-none">Kết quả tìm kiếm ngành nghề</p>
                  {getMatchingCategories(categoriesTree, modalSearchQuery).length === 0 ? (
                    <div className="text-center py-20 text-gray-400 text-xs font-light">
                      Không tìm thấy danh mục nào khớp với từ khóa "{modalSearchQuery}"
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-left">
                      {getMatchingCategories(categoriesTree, modalSearchQuery).map((match) => {
                        const isChecked = tempSelectedCategoryIds.includes(match.id);
                        return (
                          <label
                            key={match.id}
                            className={`flex items-start gap-3 p-3.5 rounded-xl border border-gray-150 hover:border-[#006b7a]/30 hover:bg-teal-50/10 cursor-pointer transition-all select-none ${isChecked ? "bg-teal-50/30 border-[#006b7a]/30" : "bg-white"}`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                setTempSelectedCategoryIds(prev =>
                                  isChecked ? prev.filter(id => id !== match.id) : [...prev, match.id]
                                );
                              }}
                              className="rounded border-gray-300 text-[#006b7a] focus:ring-[#006b7a] mt-0.5 w-4 h-4 cursor-pointer"
                            />
                            <div className="space-y-0.5">
                              <p className="text-xs font-bold text-gray-800 leading-snug">{match.name}</p>
                              <p className="text-[10px] text-gray-400 font-medium leading-none">{match.path}</p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* Left Column: NHÓM NGHỀ */}
                  <div className="w-1/3 border-r border-gray-150 overflow-y-auto bg-gray-50/40 custom-scrollbar text-left select-none">
                    <p className="p-4 pb-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">NHÓM NGHỀ</p>
                    <div className="px-2 pb-4 space-y-1">
                      {categoriesTree.map((catGroup) => {
                        const status = getCategorySelectionStatus(catGroup, tempSelectedCategoryIds);
                        const isActive = activeParentCategoryId === catGroup.id;

                        return (
                          <div
                            key={catGroup.id}
                            onMouseEnter={() => setActiveParentCategoryId(catGroup.id)}
                            onClick={() => setActiveParentCategoryId(catGroup.id)}
                            className={`flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all group ${isActive ? "bg-teal-50/50 text-[#006b7a] font-black" : "hover:bg-gray-100 text-gray-700 font-bold"}`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleCategory(catGroup);
                                }}
                                className="focus:outline-none flex-shrink-0 cursor-pointer flex items-center justify-center border-none bg-transparent"
                              >
                                {status === "all" ? (
                                  <div className="w-4 h-4 bg-[#006b7a] text-white rounded flex items-center justify-center"><Check size={12} className="stroke-[3]" /></div>
                                ) : status === "partial" ? (
                                  <div className="w-4 h-4 border border-[#006b7a] rounded flex items-center justify-center bg-[#006b7a]/15"><div className="w-2 h-0.5 bg-[#006b7a]"></div></div>
                                ) : (
                                  <div className="w-4 h-4 border border-gray-300 rounded hover:border-[#006b7a] bg-white"></div>
                                )}
                              </button>
                              <span className="text-xs truncate leading-none">{catGroup.categoryName}</span>
                            </div>
                            <ChevronDown size={14} className="text-gray-400 -rotate-90 group-hover:translate-x-0.5 transition-transform hidden md:block" />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: NGHỀ & VỊ TRÍ CHUYÊN MÔN */}
                  <div className="w-2/3 overflow-y-auto custom-scrollbar bg-white p-5 md:p-6 text-left">
                    {!activeParentCategoryId ? (
                      <div className="h-full flex flex-col items-center justify-center text-center space-y-5 py-20 select-none">
                        <div className="relative w-24 h-24 bg-teal-50/40 rounded-full flex items-center justify-center text-[#006b7a] shadow-inner">
                          <Briefcase size={40} className="text-[#006b7a] animate-pulse" />
                          <div className="absolute top-2.5 right-2.5 w-3 h-3 bg-teal-400 rounded-full border-2 border-white animate-ping"></div>
                        </div>
                        <div className="space-y-1.5 max-w-sm">
                          <h4 className="font-black text-gray-800 text-sm">Vui lòng chọn Nhóm nghề</h4>
                          <p className="text-[11px] text-gray-400 font-medium leading-relaxed">
                            Di chuột qua hoặc click chọn một Nhóm ngành lớn ở cột bên trái để hiển thị các chi tiết nghề nghiệp và các vị trí chuyên môn đầy đủ nhất.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {(() => {
                          const activeGroup = categoriesTree.find(c => c.id === activeParentCategoryId);
                          if (!activeGroup) return null;

                          return (
                            <>
                              <div className="border-b border-gray-100 pb-2.5 select-none">
                                <h4 className="font-black text-[#006b7a] text-sm leading-snug">
                                  {activeGroup.categoryName}
                                </h4>
                                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">NGHỀ & VỊ TRÍ CHUYÊN MÔN</p>
                              </div>

                              {!activeGroup.children || activeGroup.children.length === 0 ? (
                                <div className="text-center py-16 text-gray-400 text-xs font-light">
                                  Chưa có danh mục ngành nghề chi tiết cho nhóm này
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                  {activeGroup.children.map((subcat) => {
                                    const hasLevel3 = subcat.children && subcat.children.length > 0;
                                    const subcatStatus = getCategorySelectionStatus(subcat, tempSelectedCategoryIds);

                                    if (hasLevel3) {
                                      return (
                                        <div key={subcat.id} className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100/85 space-y-3 col-span-full">
                                          <div className="flex items-center gap-2.5 pb-2 border-b border-gray-250/50 select-none">
                                            <button
                                              type="button"
                                              onClick={() => handleToggleCategory(subcat)}
                                              className="focus:outline-none flex-shrink-0 cursor-pointer flex items-center justify-center transition-transform active:scale-95 border-none bg-transparent"
                                            >
                                              {subcatStatus === "all" ? (
                                                <div className="w-4 h-4 bg-[#006b7a] text-white rounded flex items-center justify-center"><Check size={11} className="stroke-[3]" /></div>
                                              ) : subcatStatus === "partial" ? (
                                                <div className="w-4 h-4 border border-[#006b7a] rounded flex items-center justify-center bg-[#006b7a]/15"><div className="w-2 h-0.5 bg-[#006b7a]"></div></div>
                                              ) : (
                                                <div className="w-4 h-4 border border-gray-300 rounded hover:border-[#006b7a] bg-white"></div>
                                              )}
                                            </button>
                                            <span className="text-xs font-black text-[#006b7a] uppercase tracking-wider">{subcat.categoryName}</span>
                                          </div>

                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                            {subcat.children!.map((level3Node) => {
                                              const isLevel3Checked = tempSelectedCategoryIds.includes(level3Node.id);
                                              return (
                                                <label
                                                  key={level3Node.id}
                                                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border border-gray-150/70 hover:border-[#006b7a]/20 hover:bg-white cursor-pointer transition-all select-none ${isLevel3Checked ? "bg-white border-[#006b7a]/30 shadow-2xs" : "bg-white/60"}`}
                                                >
                                                  <input
                                                    type="checkbox"
                                                    checked={isLevel3Checked}
                                                    onChange={() => {
                                                      setTempSelectedCategoryIds(prev =>
                                                        isLevel3Checked ? prev.filter(id => id !== level3Node.id) : [...prev, level3Node.id]
                                                      );
                                                    }}
                                                    className="rounded border-gray-300 text-[#006b7a] focus:ring-[#006b7a] w-3.5 h-3.5 cursor-pointer"
                                                  />
                                                  <span className="text-[11px] font-bold text-gray-700 leading-tight">{level3Node.categoryName}</span>
                                                </label>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      );
                                    }

                                    const isChecked = subcatStatus === "all";
                                    return (
                                      <label
                                        key={subcat.id}
                                        className={`flex items-center gap-3 p-3.5 rounded-xl border border-gray-150 hover:border-[#006b7a]/30 hover:bg-teal-50/10 cursor-pointer transition-all select-none ${isChecked ? "bg-teal-50/30 border-[#006b7a]/30" : "bg-white"}`}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={isChecked}
                                          onChange={() => handleToggleCategory(subcat)}
                                          className="rounded border-gray-300 text-[#006b7a] focus:ring-[#006b7a] w-4 h-4 cursor-pointer"
                                        />
                                        <span className="text-xs font-bold text-gray-800 leading-none">{subcat.categoryName}</span>
                                      </label>
                                    );
                                  })}
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-150 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4 px-5 md:px-6">
              <span className="text-[10px] text-gray-400 font-bold select-none">
                Bạn gặp vấn đề với Danh mục Nghề?{" "}
                <a href="#" className="text-[#006b7a] hover:underline">Gửi góp ý</a>
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setTempSelectedCategoryIds([])}
                  className="px-4.5 py-2 bg-white border border-gray-200 text-gray-500 font-bold rounded-full text-xs hover:bg-gray-100 hover:text-gray-750 shadow-2xs transition-colors cursor-pointer"
                >
                  Bỏ chọn tất cả
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpenCategoryModal(false)}
                  className="px-4.5 py-2 bg-white border border-gray-200 text-gray-500 font-bold rounded-full text-xs hover:bg-gray-100 hover:text-gray-750 shadow-2xs transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategories([...tempSelectedCategoryIds]);
                    applyFilters({ categoryIds: tempSelectedCategoryIds, page: 0 });
                    setIsOpenCategoryModal(false);
                  }}
                  className="px-5.5 py-2 bg-[#006b7a] hover:bg-[#005a66] text-white font-bold rounded-full text-xs shadow-md transition-colors active:scale-[0.98] cursor-pointer border-none"
                >
                  Chọn ({tempSelectedCategoryIds.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function AdvancedSearchPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex flex-col items-center justify-center py-32 bg-gray-50/50 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#006b7a]" />
        <p className="text-gray-500 font-light text-sm">Đang tải bộ lọc...</p>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
