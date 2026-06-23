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
import EmployerFooter from "@/components/layout/employer/EmployerFooter";

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

  // Mobile Filter Drawer state
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

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
      updatedCats = selectedCategories.filter(id => !descendantIds.includes(id));
    } else {
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
      <div className="flex-1 flex flex-col items-center justify-center py-32 bg-[#F8FAFC] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#00B14F]" />
        <p className="text-slate-500 font-normal text-sm">Đang thiết lập hệ thống tìm kiếm việc làm...</p>
      </div>
    );
  }

  // Common filter inputs and categories list to be shared between desktop sidebar and mobile drawer
  const renderFiltersContent = () => (
    <div className="space-y-6">
      {/* FILTER: Keyword */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Từ khóa tuyển dụng
        </label>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
          <input
            type="text"
            placeholder="Tên công việc, công ty..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") applyFilters({ page: 0 });
            }}
            className="w-full pl-9.5 pr-8 py-2 bg-slate-50 border border-slate-200 hover:border-slate-350 focus:bg-white rounded-[6px] text-xs font-medium text-slate-800 focus:outline-none focus:border-[#00B14F] focus:ring-1 focus:ring-[#00B14F] transition-colors"
          />
          {keyword && (
            <button
              onClick={() => removeFilterTag("keyword")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* FILTER: Categories */}
      <div className="space-y-3 border-t border-slate-100 pt-5">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Danh mục nghề
          </label>
          {selectedCategories.length > 0 && (
            <button
              onClick={() => {
                setSelectedCategories([]);
                applyFilters({ categoryIds: [], page: 0 });
              }}
              className="text-[11px] font-semibold text-[#00B14F] hover:text-[#00873D] hover:underline cursor-pointer"
            >
              Xóa chọn
            </button>
          )}
        </div>

        <div className="space-y-1.5 pr-1 max-h-64 overflow-y-auto custom-scrollbar">
          {(() => {
            const filteredTree = categoriesTree.filter(
              (catGroup) => catGroup && catGroup.categoryName && catGroup.categoryName.trim() !== ""
            );
            const categoriesToRender = isShowingAllCategories 
              ? filteredTree 
              : filteredTree.slice(0, 5);

            return (
              <>
                {categoriesToRender.map((catGroup) => {
                  const isExpanded = expandedCategoryGroups.includes(catGroup.id);
                  const status = getCategorySelectionStatus(catGroup, selectedCategories);
                  const isAnySelected = status === "all" || status === "partial";

                  return (
                    <div key={catGroup.id} className="overflow-hidden bg-white">
                      {/* Header Row */}
                      <div
                        className="flex items-center justify-between py-1.5 rounded-[6px] cursor-pointer select-none transition-colors"
                        onClick={() => {
                          setExpandedCategoryGroups(prev =>
                            prev.includes(catGroup.id)
                              ? prev.filter(id => id !== catGroup.id)
                              : [...prev, catGroup.id]
                          );
                        }}
                      >
                        <div className="flex items-center gap-2 flex-grow min-w-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleCategoryGroup(catGroup);
                            }}
                            className="focus:outline-none flex-shrink-0 cursor-pointer flex items-center justify-center"
                          >
                            {status === "all" ? (
                              <div className="w-4 h-4 border border-[#00B14F] rounded-[4px] flex items-center justify-center bg-[#00B14F] text-white">
                                <Check size={10} className="stroke-[3.5]" />
                              </div>
                            ) : status === "partial" ? (
                              <div className="w-4 h-4 border border-[#00B14F] rounded-[4px] flex items-center justify-center bg-[#00B14F]/10 text-[#00B14F]">
                                <div className="w-2 h-0.5 bg-[#00B14F]"></div>
                              </div>
                            ) : (
                              <div className="w-4 h-4 border border-slate-300 rounded-[4px] bg-white hover:border-[#00B14F]"></div>
                            )}
                          </button>

                          <div className="text-left min-w-0 flex-grow">
                            <p className={`text-xs truncate transition-colors ${
                              isAnySelected 
                                ? "text-[#00B14F] font-semibold" 
                                : "text-slate-700 font-medium"
                            }`}>
                              {catGroup.categoryName}
                            </p>
                          </div>
                        </div>

                        <div className={`p-0.5 transition-transform duration-150 ${
                          isAnySelected ? "text-[#00B14F]" : "text-slate-400"
                        } ${isExpanded ? "transform rotate-180" : ""}`}>
                          <ChevronDown size={14} />
                        </div>
                      </div>

                      {/* Subcategory Checkbox Panel */}
                      {isExpanded && (
                        <div className="pl-6 pb-2 pt-0.5 space-y-1.5">
                          {!catGroup.children || catGroup.children.length === 0 ? (
                            <p className="text-[10px] text-slate-400 font-medium">Chưa có danh mục con</p>
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
                                  className="flex items-center gap-2 py-1 cursor-pointer select-none text-left"
                                >
                                  <div className="focus:outline-none flex-shrink-0 flex items-center justify-center">
                                    {isSubcatSelected ? (
                                      <div className="w-3.5 h-3.5 border border-[#00B14F] rounded-[3px] flex items-center justify-center bg-[#00B14F] text-white">
                                        <Check size={9} className="stroke-[4]" />
                                      </div>
                                    ) : (
                                      <div className="w-3.5 h-3.5 border border-slate-300 rounded-[3px] bg-white hover:border-[#00B14F]"></div>
                                    )}
                                  </div>

                                  <span className={`text-xs transition-colors ${
                                    isSubcatSelected 
                                      ? "font-semibold text-[#00B14F]" 
                                      : "font-normal text-slate-600 hover:text-slate-800"
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

                {filteredTree.length > 5 && (
                  <button
                    type="button"
                    onClick={() => setIsShowingAllCategories(!isShowingAllCategories)}
                    className="text-[11px] font-semibold text-[#00B14F] hover:text-[#00873D] flex items-center gap-0.5 mt-2 cursor-pointer transition-colors"
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
      <div className="space-y-3 border-t border-slate-100 pt-4">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Khu vực Đà Nẵng
        </label>

        {/* District */}
        <div className="space-y-1">
          <span className="text-[10px] font-semibold text-slate-400">Quận/Huyện</span>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5 pointer-events-none" />
            <select
              value={selectedDistrict}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="w-full appearance-none pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 hover:border-slate-350 rounded-[6px] text-xs font-medium text-slate-700 focus:outline-none focus:border-[#00B14F] focus:ring-1 focus:ring-[#00B14F] transition-colors cursor-pointer"
            >
              <option value="">Tất cả Quận/Huyện</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.districtName}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Ward */}
        {selectedDistrict && (
          <div className="space-y-1 transition-opacity duration-150">
            <span className="text-[10px] font-semibold text-slate-400">Phường/Xã</span>
            <div className="relative">
              <Map className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5 pointer-events-none" />
              <select
                value={selectedWard}
                onChange={(e) => {
                  const wId = e.target.value ? Number(e.target.value) : "";
                  setSelectedWard(wId);
                  applyFilters({ wardId: wId, page: 0 });
                }}
                className="w-full appearance-none pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 hover:border-slate-350 rounded-[6px] text-xs font-medium text-slate-700 focus:outline-none focus:border-[#00B14F] focus:ring-1 focus:ring-[#00B14F] transition-colors cursor-pointer"
              >
                <option value="">Tất cả Phường/Xã</option>
                {wards.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.wardName}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      {/* FILTER: Job Position */}
      <div className="space-y-2 border-t border-slate-100 pt-4">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Vị trí tuyển dụng
        </label>
        <div className="relative">
          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5 pointer-events-none" />
          <select
            value={selectedPosition}
            onChange={(e) => {
              const posId = e.target.value ? Number(e.target.value) : "";
              setSelectedPosition(posId);
              applyFilters({ positionId: posId, page: 0 });
            }}
            className="w-full appearance-none pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 hover:border-slate-350 rounded-[6px] text-xs font-medium text-slate-700 focus:outline-none focus:border-[#00B14F] focus:ring-1 focus:ring-[#00B14F] transition-colors cursor-pointer"
          >
            <option value="">Tất cả vị trí</option>
            {positions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.positionName}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* FILTER: Experience Level */}
      <div className="space-y-2 border-t border-slate-100 pt-4">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Yêu cầu kinh nghiệm
        </label>
        <div className="relative">
          <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5 pointer-events-none" />
          <select
            value={selectedExpLevel}
            onChange={(e) => {
              const expId = e.target.value ? Number(e.target.value) : "";
              setSelectedExpLevel(expId);
              applyFilters({ experienceLevelId: expId, page: 0 });
            }}
            className="w-full appearance-none pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 hover:border-slate-350 rounded-[6px] text-xs font-medium text-slate-700 focus:outline-none focus:border-[#00B14F] focus:ring-1 focus:ring-[#00B14F] transition-colors cursor-pointer"
          >
            <option value="">Tất cả kinh nghiệm</option>
            {expLevels.map((el) => (
              <option key={el.id} value={el.id}>
                {el.levelName}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* FILTER: Predefined Salary Options */}
      <div className="space-y-3 border-t border-slate-100 pt-4">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Mức lương
        </label>
        <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 select-none">
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
                className="flex items-center gap-1.5 cursor-pointer py-1 group"
              >
                <div className="relative flex items-center justify-center flex-shrink-0">
                  <div
                    className={`w-4 h-4 rounded-full border transition-all flex items-center justify-center ${
                      isSelected
                        ? "border-[#00B14F] bg-white"
                        : "border-slate-300 group-hover:border-slate-400 bg-white"
                    }`}
                  >
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-[#00B14F]" />
                    )}
                  </div>
                </div>
                <span
                  className={`text-[11px] leading-none transition-colors ${
                    isSelected ? "font-semibold text-slate-800" : "font-normal text-slate-500 group-hover:text-slate-800"
                  }`}
                >
                  {opt.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Custom input fields: Min - Max */}
        <div className="flex items-center gap-1.5 pt-2 justify-start text-[11px] text-slate-500 font-medium">
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
            className={`w-20 px-2 py-1.5 border rounded-[6px] text-center text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#00B14F] ${
              tempMinSalary ? "border-[#00B14F] text-slate-800 bg-white" : "border-slate-200 text-slate-700 bg-slate-50"
            }`}
          />
          <span className="text-slate-400 font-normal">-</span>
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
            className={`w-20 px-2 py-1.5 border rounded-[6px] text-center text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#00B14F] ${
              tempMaxSalary ? "border-[#00B14F] text-slate-800 bg-white" : "border-slate-200 text-slate-700 bg-slate-50"
            }`}
          />
          <span className="text-slate-400">triệu</span>
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
            className={`w-full py-2 rounded-[6px] text-xs font-semibold transition-colors cursor-pointer ${
              (tempMinSalary !== minSalary || tempMaxSalary !== maxSalary)
                ? "bg-[#00B14F] hover:bg-[#00873D] text-white"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <div className="flex-grow pb-20">

      {/* Decorative Top Banner */}
      <div className="relative bg-[#0F172A] text-white overflow-hidden py-12 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,177,79,0.08),transparent)] pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 text-left space-y-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[6px] bg-[#00B14F]/10 border border-[#00B14F]/20 text-[#00B14F] text-xs font-semibold uppercase tracking-wider">
              <Sparkles size={12} className="text-[#00B14F]" />
              <span>Tìm kiếm thông minh nâng cao</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              Tìm Việc Làm Tại <span className="text-[#00B14F]">Đà Nẵng</span>
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm max-w-xl font-light">
              Kết nối trực tiếp với hàng ngàn tin tuyển dụng được xác thực uy tín. Tìm kiếm nhanh, lọc chính xác.
            </p>
          </div>

          {/* Premium Search Capsule */}
          <div className="bg-white rounded-[8px] p-2 shadow-sm max-w-4xl border border-slate-200 text-slate-800 relative z-20">
            <form onSubmit={(e) => {
              e.preventDefault();
              applyFilters({ keyword, categoryIds: selectedCategories, districtId: selectedDistrict, page: 0 });
            }} className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
              
              {/* 1. BUTTON: Danh mục Nghề */}
              <div className="relative w-full md:w-auto flex-shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setTempSelectedCategoryIds([...selectedCategories]);
                    setIsOpenCategoryModal(true);
                    setIsOpenLocationDropdown(false);
                  }}
                  className="w-full md:w-auto flex items-center justify-between md:justify-start gap-2 px-4 py-2 hover:bg-slate-50 transition-colors text-xs font-semibold rounded-[6px] border border-slate-200 md:border-none text-[#00B14F] cursor-pointer"
                >
                  <div className="flex items-center gap-2 max-w-[170px] min-w-0">
                    <List size={14} className="text-[#00B14F] flex-shrink-0" />
                    <span className="truncate leading-none">{getCategoryButtonText()}</span>
                  </div>
                  <ChevronDown size={12} className="text-slate-400 flex-shrink-0" />
                </button>
              </div>

              {/* Vertical Divider */}
              <div className="hidden md:block h-5 w-px bg-slate-200 self-center mx-0.5"></div>

              {/* 2. INPUT: Keywords */}
              <div className="flex items-center gap-2 px-3 py-1.5 w-full md:flex-grow min-w-0">
                <Search size={14} className="text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Vị trí tuyển dụng, tên công ty..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full text-xs font-medium placeholder-slate-450 focus:outline-none bg-transparent"
                />
              </div>

              {/* Vertical Divider */}
              <div className="hidden md:block h-5 w-px bg-slate-200 self-center mx-0.5"></div>

              {/* 3. DROPDOWN: Địa điểm */}
              <div className="relative w-full md:w-44 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpenLocationDropdown(!isOpenLocationDropdown);
                    setIsOpenCategoryModal(false);
                  }}
                  className="w-full flex items-center justify-between gap-2 px-4 py-2 hover:bg-slate-50 transition-colors text-xs font-semibold rounded-[6px] border border-slate-200 md:border-none text-slate-600 cursor-pointer"
                >
                  <div className="flex items-center gap-2 max-w-[130px] min-w-0">
                    <MapPin size={14} className="text-slate-400 flex-shrink-0" />
                    <span className="truncate leading-none">
                      {selectedDistrict ? districts.find(d => String(d.id) === String(selectedDistrict))?.districtName || "Địa điểm" : "Địa điểm"}
                    </span>
                  </div>
                  <ChevronDown size={12} className="text-slate-400 flex-shrink-0" />
                </button>

                {isOpenLocationDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpenLocationDropdown(false)}></div>
                    <div className="absolute left-0 right-0 md:left-auto md:w-48 mt-1.5 bg-white border border-slate-200 rounded-[8px] shadow-md overflow-hidden z-20 text-left max-h-60 overflow-y-auto custom-scrollbar">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDistrict("");
                          setSelectedWard("");
                          setIsOpenLocationDropdown(false);
                          applyFilters({ districtId: "", wardId: "", page: 0 });
                        }}
                        className={`w-full px-4 py-2 text-xs text-left font-semibold transition-colors border-b border-slate-50 flex items-center justify-between ${!selectedDistrict ? "bg-[#00B14F]/5 text-[#00B14F]" : "hover:bg-slate-50 text-slate-500"}`}
                      >
                        <span>Tất cả Quận/Huyện</span>
                        {!selectedDistrict && <Check size={10} className="text-[#00B14F] stroke-[3]" />}
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
                            className={`w-full px-4 py-2 text-xs text-left font-semibold transition-colors border-b border-slate-50 last:border-0 flex items-center justify-between ${isSelected ? "bg-[#00B14F]/5 text-[#00B14F]" : "hover:bg-slate-50 text-slate-500"}`}
                          >
                            <span>{d.districtName}</span>
                            {isSelected && <Check size={10} className="text-[#00B14F] stroke-[3]" />}
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
                className="w-full md:w-auto px-5 py-2 bg-[#00B14F] hover:bg-[#00873D] text-white font-bold rounded-[6px] transition-colors flex items-center justify-center gap-1.5 flex-shrink-0 cursor-pointer border-none"
              >
                <Search size={14} />
                <span>Tìm kiếm</span>
              </button>

            </form>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* COLUMN 1: SIDEBAR FILTERS (Desktop only, hidden on mobile) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-[8px] border border-slate-200 p-5 space-y-6 text-left shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm">
                  <SlidersHorizontal size={14} className="text-[#00B14F]" />
                  <span>Bộ lọc nâng cao</span>
                </div>
                <button
                  onClick={handleClearFilters}
                  className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                >
                  <RotateCcw size={11} />
                  <span>Xóa bộ lọc</span>
                </button>
              </div>

              {renderFiltersContent()}
            </div>
          </div>

          {/* COLUMN 2: JOBS RESULTS LIST */}
          <div className="lg:col-span-3 space-y-5">

            {/* Header controls bar */}
            <div className="bg-white border border-slate-200 rounded-[8px] p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
              <div className="text-left space-y-0.5">
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Kết quả tìm kiếm</p>
                <h3 className="font-extrabold text-slate-850 text-sm sm:text-base">
                  {isLoading ? "Đang tìm kiếm..." : `Tìm thấy ${totalElements} việc làm`}
                </h3>
              </div>

              <div className="flex items-center gap-3">
                {/* Mobile Filter Trigger Button */}
                <button
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-[6px] text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  <SlidersHorizontal size={14} className="text-[#00B14F]" />
                  <span>Bộ lọc</span>
                </button>

                {/* Sort by Dropdown */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400 whitespace-nowrap">Sắp xếp:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      applyFilters({ sortBy: e.target.value, page: 0 });
                    }}
                    className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-[6px] text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#00B14F] cursor-pointer"
                  >
                    <option value="">Mới nhất</option>
                    <option value="salaryAsc">Lương thấp đến cao</option>
                    <option value="salaryDesc">Lương cao đến thấp</option>
                    <option value="viewDesc">Lượt xem nhiều nhất</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Active filters tag pills */}
            {(keyword || selectedCategories.length > 0 || selectedDistrict || selectedWard || selectedPosition || selectedExpLevel || salaryType) && (
              <div className="flex flex-wrap gap-1.5 items-center text-left py-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Đang lọc:</span>

                {/* Keyword Tag */}
                {keyword && (
                  <span className="inline-flex items-center gap-1 bg-white border border-slate-250 px-2.5 py-1 rounded-[6px] text-xs text-[#00B14F] font-semibold shadow-sm">
                    <span>"{keyword}"</span>
                    <button onClick={() => removeFilterTag("keyword")} className="hover:text-red-500 transition-colors cursor-pointer">
                      <X size={12} />
                    </button>
                  </span>
                )}

                {/* Categories Tag */}
                {selectedCategories.length <= 3 ? (
                  selectedCategories.map((catId) => {
                    const catObj = categoriesList.find(c => c.id === catId);
                    return (
                      <span key={catId} className="inline-flex items-center gap-1 bg-white border border-slate-250 px-2.5 py-1 rounded-[6px] text-xs text-[#00B14F] font-semibold shadow-sm">
                        <span>{catObj?.name || `ID ${catId}`}</span>
                        <button onClick={() => removeFilterTag("category", catId)} className="hover:text-red-500 transition-colors cursor-pointer">
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
                        <span key={catId} className="inline-flex items-center gap-1 bg-white border border-slate-250 px-2.5 py-1 rounded-[6px] text-xs text-[#00B14F] font-semibold shadow-sm">
                          <span>{catObj?.name || `ID ${catId}`}</span>
                          <button onClick={() => removeFilterTag("category", catId)} className="hover:text-red-500 transition-colors cursor-pointer">
                            <X size={12} />
                          </button>
                        </span>
                      );
                    })}
                    <span className="inline-flex items-center gap-1 bg-[#00B14F]/5 border border-[#00B14F]/20 px-2.5 py-1 rounded-[6px] text-xs text-[#00B14F] font-bold shadow-sm">
                      <span>+{selectedCategories.length - 3} khác</span>
                      <button
                        onClick={() => {
                          const keepIds = selectedCategories.slice(0, 3);
                          setSelectedCategories(keepIds);
                          applyFilters({ categoryIds: keepIds, page: 0 });
                        }}
                        className="hover:text-red-500 transition-colors cursor-pointer"
                        title="Bỏ chọn các ngành nghề còn lại"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  </>
                )}

                {/* District Tag */}
                {selectedDistrict && (
                  <span className="inline-flex items-center gap-1 bg-white border border-slate-250 px-2.5 py-1 rounded-[6px] text-xs text-[#00B14F] font-semibold shadow-sm">
                    <span>{districts.find(d => d.id === selectedDistrict)?.districtName}</span>
                    <button onClick={() => removeFilterTag("district")} className="hover:text-red-500 transition-colors cursor-pointer">
                      <X size={12} />
                    </button>
                  </span>
                )}

                {/* Ward Tag */}
                {selectedWard && (
                  <span className="inline-flex items-center gap-1 bg-white border border-slate-250 px-2.5 py-1 rounded-[6px] text-xs text-[#00B14F] font-semibold shadow-sm">
                    <span>Phường/Xã: {wards.find(w => w.id === selectedWard)?.wardName}</span>
                    <button onClick={() => removeFilterTag("ward")} className="hover:text-red-500 transition-colors cursor-pointer">
                      <X size={12} />
                    </button>
                  </span>
                )}

                {/* Position Tag */}
                {selectedPosition && (
                  <span className="inline-flex items-center gap-1 bg-white border border-slate-250 px-2.5 py-1 rounded-[6px] text-xs text-[#00B14F] font-semibold shadow-sm">
                    <span>{positions.find(p => p.id === selectedPosition)?.positionName}</span>
                    <button onClick={() => removeFilterTag("position")} className="hover:text-red-500 transition-colors cursor-pointer">
                      <X size={12} />
                    </button>
                  </span>
                )}

                {/* Experience Tag */}
                {selectedExpLevel && (
                  <span className="inline-flex items-center gap-1 bg-white border border-slate-250 px-2.5 py-1 rounded-[6px] text-xs text-[#00B14F] font-semibold shadow-sm">
                    <span>{expLevels.find(e => e.id === selectedExpLevel)?.levelName}</span>
                    <button onClick={() => removeFilterTag("experience")} className="hover:text-red-500 transition-colors cursor-pointer">
                      <X size={12} />
                    </button>
                  </span>
                )}

                {/* Salary Tag */}
                {salaryType && (
                  <span className="inline-flex items-center gap-1 bg-white border border-slate-250 px-2.5 py-1 rounded-[6px] text-xs text-[#00B14F] font-semibold shadow-sm">
                    <span>Lương: {salaryType === "Lương thỏa thuận" ? "Thỏa thuận" : `${minSalary ? `${minSalary}Tr` : ""} - ${maxSalary ? `${maxSalary}Tr` : ""}`}</span>
                    <button onClick={() => removeFilterTag("salary")} className="hover:text-red-500 transition-colors cursor-pointer">
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
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-[8px] p-5 flex flex-col md:flex-row justify-between gap-5 animate-pulse">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-[6px] flex-shrink-0"></div>
                      <div className="space-y-2 w-48 sm:w-80">
                        <div className="h-3.5 bg-slate-100 rounded-[4px] w-3/4"></div>
                        <div className="h-2.5 bg-slate-100 rounded-[4px] w-1/2"></div>
                        <div className="h-2.5 bg-slate-100 rounded-[4px] w-2/3"></div>
                      </div>
                    </div>
                    <div className="w-24 h-7 bg-slate-100 rounded-[6px] self-end md:self-center"></div>
                  </div>
                ))}
              </div>
            ) : jobs.length === 0 ? (
              /* High Fidelity Empty State */
              <div className="bg-white rounded-[8px] border border-dashed border-slate-350 py-16 px-6 text-center space-y-4">
                <div className="w-14 h-14 bg-slate-50 border border-slate-200 rounded-[8px] flex items-center justify-center mx-auto text-slate-450">
                  <SlidersHorizontal className="w-6 h-6" />
                </div>
                <div className="space-y-1 max-w-md mx-auto">
                  <h3 className="font-bold text-slate-800 text-base">
                    Không tìm thấy công việc phù hợp
                  </h3>
                  <p className="text-xs text-slate-500 leading-normal">
                    Chúng tôi chưa tìm thấy tin tuyển dụng nào phù hợp với các bộ lọc hiện tại của bạn. Vui lòng nới lỏng hoặc xóa bộ lọc để xem nhiều tin tuyển dụng hơn.
                  </p>
                </div>
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 bg-[#00B14F] hover:bg-[#00873D] text-white text-xs font-bold rounded-[6px] transition-colors cursor-pointer inline-flex items-center gap-1.5 border-none"
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
                    className="bg-white rounded-[8px] border border-slate-200 p-5 shadow-sm hover:border-[#00B14F]/40 hover:shadow-md transition-all duration-150 flex flex-col md:flex-row justify-between gap-5 group text-left"
                  >
                    {/* Job Details Left Side */}
                    <div className="flex gap-4 items-start">
                      {/* Logo Frame */}
                      <div className="h-12 w-12 rounded-[6px] border border-slate-200 bg-slate-50 text-slate-600 flex items-center justify-center overflow-hidden font-bold text-xs select-none flex-shrink-0">
                        {job.logoUrl ? (
                          <img src={job.logoUrl} alt={job.employerName} className="h-full w-full object-cover" />
                        ) : (
                          getCompanyInitials(job.employerName)
                        )}
                      </div>

                      {/* Title & Stats */}
                      <div className="space-y-2 overflow-hidden">
                        <div className="space-y-0.5">
                          <Link
                            href={`/jobs/${job.id}`}
                            className="block font-bold text-slate-800 text-sm md:text-base leading-snug hover:text-[#00B14F] transition-colors line-clamp-1 cursor-pointer"
                          >
                            {job.jobTitle}
                          </Link>
                          <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                            <Building2 size={12} className="text-slate-450" />
                            <span>{job.employerName || "Doanh nghiệp Đà Nẵng"}</span>
                          </p>
                        </div>

                        {/* Badges and Bullets */}
                        <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 pt-1.5 border-t border-slate-100 text-xs text-slate-500 font-normal">
                          {/* Salary */}
                          <div className="flex items-center gap-0.5 text-[#00B14F] font-bold">
                            <DollarSign size={13} className="text-[#00B14F]" />
                            <span>
                              {formatSalary(job.salaryType, job.minimumSalary, job.maximumSalary)}
                            </span>
                          </div>

                          {/* Location */}
                          <div className="flex items-center gap-0.5">
                            <MapPin size={13} className="text-slate-450 flex-shrink-0" />
                            <span className="line-clamp-1">{job.address}</span>
                          </div>

                          {/* Deadline */}
                          <div className="flex items-center gap-0.5">
                            <Calendar size={13} className="text-slate-450" />
                            <span>Hạn: {new Date(job.deadline).toLocaleDateString("vi-VN")}</span>
                          </div>
                        </div>

                        {/* Tag Pills */}
                        <div className="flex flex-wrap gap-1 pt-1.5">
                          {job.positionName && (
                            <span className="px-2 py-0.5 rounded-[4px] bg-slate-50 text-slate-600 text-[10px] font-semibold border border-slate-200">
                              {job.positionName}
                            </span>
                          )}
                          {job.experienceLevelName && (
                            <span className="px-2 py-0.5 rounded-[4px] bg-slate-50 text-slate-600 text-[10px] font-semibold border border-slate-200">
                              {job.experienceLevelName}
                            </span>
                          )}
                          {(job.categoryNames || []).slice(0, 2).map((catName, cIdx) => (
                            <span
                              key={cIdx}
                              className="px-2 py-0.5 rounded-[4px] bg-[#00B14F]/5 text-[#00B14F] text-[10px] font-semibold border border-[#00B14F]/10"
                            >
                              {catName}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Action Button Right Side */}
                    <div className="flex flex-row md:flex-col justify-between items-end md:w-36 flex-shrink-0 md:border-l md:border-slate-100 md:pl-4">
                      <div className="flex flex-col items-end">
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-[4px] bg-slate-50 text-slate-500 text-[9px] font-bold uppercase border border-slate-200 shadow-sm select-none">
                          <ShieldCheck size={10} className="text-[#00B14F]" />
                          Xác thực
                        </span>
                        <p className="text-[10px] text-slate-400 font-normal mt-1.5 hidden md:block">
                          Đăng {formatTime(job.createdAt)}
                        </p>
                      </div>

                      <Link
                        href={`/jobs/${job.id}`}
                        className="w-auto md:w-full py-1.5 px-3 md:px-0 bg-[#00B14F]/10 hover:bg-[#00B14F] border border-[#00B14F]/20 hover:border-[#00B14F] text-[#00B14F] hover:text-white font-bold rounded-[6px] text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>Ứng tuyển ngay</span>
                        <ArrowRight size={11} />
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
                  className="p-2 bg-white border border-slate-200 rounded-[6px] hover:bg-slate-50 text-slate-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
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
                      className={`px-3 py-1.5 text-xs font-bold rounded-[6px] border transition-colors cursor-pointer ${isCurrent
                          ? "bg-[#00B14F] border-[#00B14F] text-white shadow-sm"
                          : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
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
                  className="p-2 bg-white border border-slate-200 rounded-[6px] hover:bg-slate-50 text-slate-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>

              </div>
            )}

          </div>
        </div>
      </div>

      {/* ==================== MOBILE FILTER DRAWER OVERLAY ==================== */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsMobileFilterOpen(false)}></div>
          {/* Content */}
          <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-white p-5 shadow-md flex flex-col h-full z-10 animate-in slide-in-from-right duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm">
                <SlidersHorizontal size={14} className="text-[#00B14F]" />
                <span>Bộ lọc nâng cao</span>
              </div>
              <button onClick={() => setIsMobileFilterOpen(false)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 cursor-pointer">
                <X size={16} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-1">
              {renderFiltersContent()}
            </div>

            <div className="border-t border-slate-100 pt-4 mt-4 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  handleClearFilters();
                  setIsMobileFilterOpen(false);
                }}
                className="w-1/2 py-2 border border-slate-250 text-slate-600 font-bold rounded-[6px] text-xs hover:bg-slate-50 cursor-pointer"
              >
                Xóa tất cả
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-1/2 py-2 bg-[#00B14F] hover:bg-[#00873D] text-white font-bold rounded-[6px] text-xs transition-colors cursor-pointer border-none"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MULTI-LEVEL CATEGORY SELECTOR MODAL ==================== */}
      {isOpenCategoryModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 z-0" onClick={() => setIsOpenCategoryModal(false)}></div>
          
          <div className="relative bg-white w-full max-w-5xl rounded-[8px] shadow-md overflow-hidden border border-slate-200 flex flex-col h-[85vh] max-h-[700px] text-slate-800 z-10">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/50">
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-800 select-none">
                Chọn Nhóm nghề, Nghề hoặc Chuyên môn
              </h3>
              <button
                type="button"
                onClick={() => setIsOpenCategoryModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer flex items-center justify-center border-none bg-transparent"
              >
                <X size={16} />
              </button>
            </div>

            {/* Search */}
            <div className="px-5 py-3 border-b border-slate-100 bg-white">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Nhập từ khóa tìm kiếm ngành nghề..."
                  value={modalSearchQuery}
                  onChange={(e) => setModalSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-9 py-2 bg-slate-50 border border-slate-200 focus:border-[#00B14F] focus:ring-1 focus:ring-[#00B14F] rounded-[6px] text-xs font-semibold placeholder-slate-400 focus:outline-none transition-colors"
                />
                {modalSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setModalSearchQuery("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer flex items-center justify-center border-none bg-transparent"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Split Content */}
            <div className="flex-1 flex overflow-hidden bg-white">
              {modalSearchQuery.trim() !== "" ? (
                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 select-none">Kết quả tìm kiếm</p>
                  {getMatchingCategories(categoriesTree, modalSearchQuery).length === 0 ? (
                    <div className="text-center py-20 text-slate-400 text-xs font-light">
                      Không tìm thấy danh mục nào khớp với từ khóa "{modalSearchQuery}"
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-left">
                      {getMatchingCategories(categoriesTree, modalSearchQuery).map((match) => {
                        const isChecked = tempSelectedCategoryIds.includes(match.id);
                        return (
                          <label
                            key={match.id}
                            className={`flex items-start gap-2.5 p-3 rounded-[6px] border border-slate-200 hover:border-[#00B14F]/30 hover:bg-[#00B14F]/5 cursor-pointer transition-all select-none ${isChecked ? "bg-[#00B14F]/5 border-[#00B14F]/30" : "bg-white"}`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                setTempSelectedCategoryIds(prev =>
                                  isChecked ? prev.filter(id => id !== match.id) : [...prev, match.id]
                                );
                              }}
                              className="rounded border-slate-300 text-[#00B14F] focus:ring-[#00B14F] mt-0.5 w-3.5 h-3.5 cursor-pointer"
                            />
                            <div className="space-y-0.5">
                              <p className="text-xs font-semibold text-slate-800 leading-snug">{match.name}</p>
                              <p className="text-[10px] text-slate-450 font-normal leading-none">{match.path}</p>
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
                  <div className="w-1/3 border-r border-slate-200 overflow-y-auto bg-slate-50/50 custom-scrollbar text-left select-none">
                    <p className="p-3 pb-1 text-[9px] font-bold text-slate-450 uppercase tracking-widest">NHÓM NGHỀ</p>
                    <div className="px-1.5 pb-4 space-y-0.5">
                      {categoriesTree.map((catGroup) => {
                        const status = getCategorySelectionStatus(catGroup, tempSelectedCategoryIds);
                        const isActive = activeParentCategoryId === catGroup.id;

                        return (
                          <div
                            key={catGroup.id}
                            onMouseEnter={() => setActiveParentCategoryId(catGroup.id)}
                            onClick={() => setActiveParentCategoryId(catGroup.id)}
                            className={`flex items-center justify-between p-2.5 rounded-[6px] cursor-pointer transition-all ${isActive ? "bg-[#00B14F]/5 text-[#00B14F] font-bold" : "hover:bg-slate-100 text-slate-700 font-medium"}`}
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-grow">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleCategory(catGroup);
                                }}
                                className="focus:outline-none flex-shrink-0 cursor-pointer flex items-center justify-center border-none bg-transparent"
                              >
                                {status === "all" ? (
                                  <div className="w-4 h-4 bg-[#00B14F] text-white rounded-[4px] flex items-center justify-center"><Check size={11} className="stroke-[3]" /></div>
                                ) : status === "partial" ? (
                                  <div className="w-4 h-4 border border-[#00B14F] rounded-[4px] flex items-center justify-center bg-[#00B14F]/10"><div className="w-1.5 h-0.5 bg-[#00B14F]"></div></div>
                                ) : (
                                  <div className="w-4 h-4 border border-slate-350 rounded-[4px] bg-white hover:border-[#00B14F]"></div>
                                )}
                              </button>
                              <span className="text-xs truncate leading-none">{catGroup.categoryName}</span>
                            </div>
                            <ChevronDown size={14} className="text-slate-400 -rotate-90 hidden md:block" />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: NGHỀ & VỊ TRÍ CHUYÊN MÔN */}
                  <div className="w-2/3 overflow-y-auto custom-scrollbar bg-white p-5 text-left">
                    {!activeParentCategoryId ? (
                      <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20 select-none">
                        <div className="relative w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 shadow-inner">
                          <Briefcase size={28} className="text-slate-400" />
                        </div>
                        <div className="space-y-1 max-w-sm">
                          <h4 className="font-semibold text-slate-800 text-xs">Vui lòng chọn Nhóm nghề</h4>
                          <p className="text-[11px] text-slate-400 leading-normal">
                            Di chuột qua hoặc click chọn một Nhóm ngành lớn ở cột bên trái để hiển thị các chi tiết nghề nghiệp và các vị trí chuyên môn đầy đủ nhất.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        {(() => {
                          const activeGroup = categoriesTree.find(c => c.id === activeParentCategoryId);
                          if (!activeGroup) return null;

                          return (
                            <>
                              <div className="border-b border-slate-100 pb-2 select-none">
                                <h4 className="font-bold text-[#00B14F] text-xs sm:text-sm leading-snug">
                                  {activeGroup.categoryName}
                                </h4>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">NGHỀ & VỊ TRÍ CHUYÊN MÔN</p>
                              </div>

                              {!activeGroup.children || activeGroup.children.length === 0 ? (
                                <div className="text-center py-16 text-slate-400 text-xs font-light">
                                  Chưa có danh mục ngành nghề chi tiết cho nhóm này
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {activeGroup.children.map((subcat) => {
                                    const hasLevel3 = subcat.children && subcat.children.length > 0;
                                    const subcatStatus = getCategorySelectionStatus(subcat, tempSelectedCategoryIds);

                                    if (hasLevel3) {
                                      return (
                                        <div key={subcat.id} className="bg-slate-50/50 rounded-[8px] p-3 border border-slate-150 space-y-2 col-span-full">
                                          <div className="flex items-center gap-2 pb-1.5 border-b border-slate-200 select-none">
                                            <button
                                              type="button"
                                              onClick={() => handleToggleCategory(subcat)}
                                              className="focus:outline-none flex-shrink-0 cursor-pointer flex items-center justify-center border-none bg-transparent"
                                            >
                                              {subcatStatus === "all" ? (
                                                <div className="w-4 h-4 bg-[#00B14F] text-white rounded-[4px] flex items-center justify-center"><Check size={11} className="stroke-[3]" /></div>
                                              ) : subcatStatus === "partial" ? (
                                                <div className="w-4 h-4 border border-[#00B14F] rounded-[4px] flex items-center justify-center bg-[#00B14F]/10"><div className="w-1.5 h-0.5 bg-[#00B14F]"></div></div>
                                              ) : (
                                                <div className="w-4 h-4 border border-slate-350 rounded-[4px] bg-white"></div>
                                              )}
                                            </button>
                                            <span className="text-[11px] font-bold text-[#00B14F] uppercase tracking-wider">{subcat.categoryName}</span>
                                          </div>

                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {subcat.children!.map((level3Node) => {
                                              const isLevel3Checked = tempSelectedCategoryIds.includes(level3Node.id);
                                              return (
                                                <label
                                                  key={level3Node.id}
                                                  className={`flex items-center gap-2 p-2 rounded-[6px] border border-slate-150 hover:border-[#00B14F]/20 hover:bg-white cursor-pointer transition-colors select-none ${isLevel3Checked ? "bg-white border-[#00B14F]/30 shadow-sm" : "bg-white/60"}`}
                                                >
                                                  <input
                                                    type="checkbox"
                                                    checked={isLevel3Checked}
                                                    onChange={() => {
                                                      setTempSelectedCategoryIds(prev =>
                                                        isLevel3Checked ? prev.filter(id => id !== level3Node.id) : [...prev, level3Node.id]
                                                      );
                                                    }}
                                                    className="rounded border-slate-300 text-[#00B14F] focus:ring-[#00B14F] w-3.5 h-3.5 cursor-pointer"
                                                  />
                                                  <span className="text-[11px] font-medium text-slate-700 leading-tight">{level3Node.categoryName}</span>
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
                                        className={`flex items-center gap-2.5 p-3 rounded-[6px] border border-slate-200 hover:border-[#00B14F]/30 hover:bg-[#00B14F]/5 cursor-pointer transition-all select-none ${isChecked ? "bg-[#00B14F]/5 border-[#00B14F]/30" : "bg-white"}`}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={isChecked}
                                          onChange={() => handleToggleCategory(subcat)}
                                          className="rounded border-slate-300 text-[#00B14F] focus:ring-[#00B14F] w-3.5 h-3.5 cursor-pointer"
                                        />
                                        <span className="text-xs font-semibold text-slate-800 leading-none">{subcat.categoryName}</span>
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
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 px-5">
              <span className="text-[10px] text-slate-400 font-semibold select-none">
                Bạn gặp vấn đề với Danh mục Nghề?{" "}
                <a href="#" className="text-[#00B14F] hover:underline">Gửi góp ý</a>
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setTempSelectedCategoryIds([])}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-semibold rounded-[6px] text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Bỏ chọn tất cả
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpenCategoryModal(false)}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-semibold rounded-[6px] text-xs hover:bg-slate-50 transition-colors cursor-pointer"
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
                  className="px-5 py-2 bg-[#00B14F] hover:bg-[#00873D] text-white font-bold rounded-[6px] text-xs transition-colors cursor-pointer border-none"
                >
                  Chọn ({tempSelectedCategoryIds.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
      <EmployerFooter />
    </div>
  );
}

export default function AdvancedSearchPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex flex-col items-center justify-center py-32 bg-[#F8FAFC] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#00B14F]" />
        <p className="text-slate-500 font-normal text-sm">Đang tải bộ lọc...</p>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
