"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Briefcase, Sparkles, Loader2, List, ChevronDown, ChevronUp, X, Check } from "lucide-react";
import { categoryService } from "@/services/categoryService";
import { locationService } from "@/services/locationService";
import { CategoryTreeResponse } from "@/types/category";
import { DistrictResponse } from "@/types/location";

export default function CandidateHero() {
  const router = useRouter();

  // Search parameters
  const [keyword, setKeyword] = useState("");
  const [district, setDistrict] = useState("");

  // Dropdown lists
  const [districts, setDistricts] = useState<DistrictResponse[]>([]);
  const [rawCategories, setRawCategories] = useState<CategoryTreeResponse[]>([]);
  const [flatCategories, setFlatCategories] = useState<{ id: number; name: string; level: number }[]>([]);
  const [loading, setLoading] = useState(true);

  // Custom Selector UI States
  const [isOpenCategoryModal, setIsOpenCategoryModal] = useState(false);
  const [isOpenLocationDropdown, setIsOpenLocationDropdown] = useState(false);
  const [activeParentCategoryId, setActiveParentCategoryId] = useState<number | null>(null);
  const [modalSearchQuery, setModalSearchQuery] = useState("");

  // Confirmed vs. Temporary selections for category IDs
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [tempSelectedCategoryIds, setTempSelectedCategoryIds] = useState<number[]>([]);

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

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        let cachedDistricts = null;
        let cachedCategories = null;

        if (typeof window !== "undefined") {
          try {
            const dists = sessionStorage.getItem("allDistricts");
            const cats = sessionStorage.getItem("categoryTree");
            if (dists) cachedDistricts = JSON.parse(dists);
            if (cats) cachedCategories = JSON.parse(cats);
          } catch (e) {
            console.warn("Failed to parse cached hero data:", e);
          }
        }

        let distRes = cachedDistricts;
        let catRes = cachedCategories;

        const promises: Promise<any>[] = [];
        if (!distRes) {
          promises.push(
            locationService.getAllDistricts().then((res) => {
              distRes = res;
              if (res && typeof window !== "undefined") {
                sessionStorage.setItem("allDistricts", JSON.stringify(res));
              }
            })
          );
        }
        if (!catRes) {
          promises.push(
            categoryService.getCategoryTree().then((res) => {
              catRes = res;
              if (res && typeof window !== "undefined") {
                sessionStorage.setItem("categoryTree", JSON.stringify(res));
              }
            })
          );
        }

        if (promises.length > 0) {
          await Promise.all(promises);
        }

        if (distRes) {
          setDistricts(distRes);
        }
        if (catRes) {
          setRawCategories(catRes);
          setFlatCategories(flattenCategories(catRes));
        }
      } catch (err) {
        console.error("Error loading dropdown data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHeroData();
  }, []);

  const popularKeywords = ["ReactJS", "Marketing", "Lễ tân", "Kế toán", "Design", "Bán hàng"];

  // Search execution - passes multiple category IDs matching /jobs API expectations
  const executeSearch = (kw: string, distId: string, catIds: number[]) => {
    const params = new URLSearchParams();
    if (kw.trim()) params.append("keyword", kw.trim());
    if (distId) params.append("districtId", distId);
    if (catIds.length > 0) {
      catIds.forEach((id) => params.append("categoryIds", String(id)));
    }
    router.push(`/jobs?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(keyword, district, selectedCategoryIds);
  };

  const handlePopularKeywordClick = (kw: string) => {
    setKeyword(kw);
    executeSearch(kw, district, selectedCategoryIds);
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

  // Helper: toggle select all descendants
  const handleToggleCategory = (node: CategoryTreeResponse) => {
    const descendantIds = getDescendantIds(node);
    const allSelected = descendantIds.every(id => tempSelectedCategoryIds.includes(id));

    if (allSelected) {
      // Remove all descendants
      setTempSelectedCategoryIds(prev => prev.filter(id => !descendantIds.includes(id)));
    } else {
      // Add all descendants
      setTempSelectedCategoryIds(prev => {
        const next = [...prev];
        descendantIds.forEach(id => {
          if (!next.includes(id)) next.push(id);
        });
        return next;
      });
    }
  };

  // Helper: check selection level of a category
  const getCategorySelectionStatus = (node: CategoryTreeResponse, selectedList: number[]): "none" | "partial" | "all" => {
    const descendantIds = getDescendantIds(node);
    const selectedCount = descendantIds.filter(id => selectedList.includes(id)).length;
    if (selectedCount === 0) return "none";
    if (selectedCount === descendantIds.length) return "all";
    return "partial";
  };

  // Helper: recursive keyword search within categories
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

  // Render text inside the main search button based on selection count
  const getCategoryButtonText = () => {
    if (selectedCategoryIds.length === 0) return "Danh mục Nghề";
    if (selectedCategoryIds.length === 1) {
      const cat = flatCategories.find(c => c.id === selectedCategoryIds[0]);
      return cat ? cat.name : "Danh mục Nghề";
    }
    return `Danh mục Nghề (${selectedCategoryIds.length})`;
  };

  return (
    <section className="relative min-h-[500px] md:min-h-[650px] flex items-center justify-center bg-gray-900 text-white py-16 px-4 overflow-hidden">
      {/* City/Tech style backdrop grids */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-900/40 via-gray-950/90 to-gray-950 z-0"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#006b7a]/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-50/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative max-w-5xl mx-auto text-center z-10 space-y-8 w-full">
        {/* Pill notice */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#006b7a]/20 border border-[#006b7a]/40 text-teal-300 text-xs md:text-sm font-semibold tracking-wider uppercase select-none">
          <Sparkles size={14} className="text-teal-400 animate-pulse" />
          <span>Cơ hội việc làm mới nhất hôm nay</span>
        </div>

        {/* Headlines */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight select-none">
            Tìm Việc Làm Mơ Ước Tại{" "}
            <span className="bg-gradient-to-r from-teal-400 via-[#006b7a] to-teal-300 bg-clip-text text-transparent">
              ĐÀ NẴNG
            </span>
          </h1>
          <p className="text-gray-300 text-sm sm:text-lg max-w-2xl mx-auto font-light leading-relaxed select-none">
            Hơn 5.000+ tin tuyển dụng chất lượng cao, xác thực uy tín được cập nhật liên tục từ các doanh nghiệp hàng đầu tại thành phố đáng sống.
          </p>
        </div>

        {/* Main Search Panel - Capsule Design */}
        <div className="bg-white rounded-3xl md:rounded-full p-2.5 shadow-2xl max-w-4xl mx-auto border border-gray-150/20 text-gray-800 relative z-20">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center gap-2 md:gap-0">

            {/* 1. BUTTON: Danh mục Nghề */}
            <div className="relative w-full md:w-auto flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  setTempSelectedCategoryIds([...selectedCategoryIds]);
                  setIsOpenCategoryModal(true);
                  setIsOpenLocationDropdown(false);
                }}
                className="w-full md:w-auto flex items-center justify-between md:justify-start gap-2.5 px-5 py-3.5 hover:bg-gray-50 transition-colors text-sm font-bold rounded-2xl md:rounded-full border border-gray-150 md:border-none text-[#006b7a] active:scale-[0.99] cursor-pointer"
              >
                <div className="flex items-center gap-2 max-w-[170px] min-w-0">
                  <List size={18} className="text-[#006b7a] flex-shrink-0" />
                  <span className="truncate leading-none">{getCategoryButtonText()}</span>
                </div>
                <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />
              </button>
            </div>

            {/* Vertical Divider for desktop */}
            <div className="hidden md:block h-7 w-px bg-gray-250/70 self-center mx-1"></div>

            {/* 2. INPUT: Keywords */}
            <div className="flex items-center gap-2.5 px-5 py-3 w-full md:flex-grow min-w-0">
              <Search size={18} className="text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Vị trí tuyển dụng, tên công ty..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full text-sm font-medium placeholder-gray-400 focus:outline-none bg-transparent"
              />
            </div>

            {/* Vertical Divider for desktop */}
            <div className="hidden md:block h-7 w-px bg-gray-250/70 self-center mx-1"></div>

            {/* 3. DROPDOWN: Địa điểm (Custom District Dropdown) */}
            <div className="relative w-full md:w-56 flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsOpenLocationDropdown(!isOpenLocationDropdown);
                  setIsOpenCategoryModal(false);
                }}
                className="w-full flex items-center justify-between gap-2.5 px-5 py-3.5 hover:bg-gray-50 transition-colors text-sm font-bold rounded-2xl md:rounded-full border border-gray-150 md:border-none text-gray-700 active:scale-[0.99] cursor-pointer"
              >
                <div className="flex items-center gap-2 max-w-[150px] min-w-0">
                  <MapPin size={18} className="text-gray-400 flex-shrink-0" />
                  <span className="truncate leading-none">
                    {district ? districts.find(d => String(d.id) === String(district))?.districtName || "Địa điểm" : "Địa điểm"}
                  </span>
                </div>
                <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />
              </button>

              {/* District Popover Dropdown Panel */}
              {isOpenLocationDropdown && (
                <>
                  {/* Backdrop overlay for clicks outside */}
                  <div className="fixed inset-0 z-10" onClick={() => setIsOpenLocationDropdown(false)}></div>

                  <div className="absolute left-0 right-0 md:left-auto md:w-56 mt-2 bg-white border border-gray-150 rounded-2xl shadow-xl overflow-hidden z-20 animate-in fade-in slide-in-from-top-1 duration-150 text-left max-h-72 overflow-y-auto custom-scrollbar">
                    <button
                      type="button"
                      onClick={() => {
                        setDistrict("");
                        setIsOpenLocationDropdown(false);
                      }}
                      className={`w-full px-4 py-3 text-xs text-left font-bold transition-colors border-b border-gray-50 flex items-center justify-between ${!district ? "bg-teal-50/50 text-[#006b7a]" : "hover:bg-gray-50 text-gray-600"}`}
                    >
                      <span>Tất cả các Quận/Huyện</span>
                      {!district && <Check size={12} className="text-[#006b7a] stroke-[3]" />}
                    </button>
                    {districts.map((d) => {
                      const isSelected = String(d.id) === String(district);
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => {
                            setDistrict(String(d.id));
                            setIsOpenLocationDropdown(false);
                          }}
                          className={`w-full px-4 py-3 text-xs text-left font-bold transition-colors border-b border-gray-50 last:border-0 flex items-center justify-between ${isSelected ? "bg-teal-50/50 text-[#006b7a]" : "hover:bg-gray-50 text-gray-600"}`}
                        >
                          <span>{d.districtName}</span>
                          {isSelected && <Check size={12} className="text-[#006b7a] stroke-[3]" />}
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
              disabled={loading}
              className="w-full md:w-auto px-8 py-3.5 bg-[#006b7a] hover:bg-[#005a66] text-white font-bold rounded-2xl md:rounded-full transition-all duration-300 shadow-md hover:shadow-lg active:scale-[0.97] flex-shrink-0 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Search size={16} />
              )}
              <span>Tìm kiếm</span>
            </button>

          </form>
        </div>

        {/* Quick keywords list */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs md:text-sm text-gray-400 font-light select-none">
          <span className="font-medium text-gray-300">Từ khóa phổ biến:</span>
          {popularKeywords.map((kw) => (
            <button
              key={kw}
              onClick={() => handlePopularKeywordClick(kw)}
              className="px-3 py-1 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            >
              {kw}
            </button>
          ))}
        </div>
      </div>

      {/* ==================== MULTI-LEVEL CATEGORY SELECTOR MODAL ==================== */}
      {isOpenCategoryModal && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-xs z-50 flex items-center justify-center p-4">

          {/* Backdrop overlay to close when clicking outside of the modal */}
          <div className="fixed inset-0 z-0" onClick={() => setIsOpenCategoryModal(false)}></div>

          {/* Modal Card container */}
          <div className="relative bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden border border-gray-150 animate-in fade-in zoom-in-95 duration-200 flex flex-col h-[85vh] max-h-[700px] text-gray-800 z-10">

            {/* A. Modal Header */}
            <div className="p-5 md:p-6 border-b border-gray-100 flex items-center justify-between gap-4 bg-gray-50/50">
              <h3 className="text-sm md:text-base font-black tracking-tight text-gray-850 select-none">
                Chọn Nhóm nghề, Nghề hoặc Chuyên môn
              </h3>
              <button
                type="button"
                onClick={() => setIsOpenCategoryModal(false)}
                className="p-2 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-650 transition-colors shadow-2xs cursor-pointer flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            {/* B. Internal Search Bar */}
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
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-650 cursor-pointer flex items-center justify-center"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* C. Split Layout Content Area */}
            <div className="flex-1 flex overflow-hidden bg-white">

              {/* Scenario 1: Modal Search Query Active */}
              {modalSearchQuery.trim() !== "" ? (
                <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-3">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 select-none">Kết quả tìm kiếm ngành nghề</p>
                  {getMatchingCategories(rawCategories, modalSearchQuery).length === 0 ? (
                    <div className="text-center py-20 text-gray-400 text-xs font-light">
                      Không tìm thấy danh mục nào khớp với từ khóa "{modalSearchQuery}"
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-left">
                      {getMatchingCategories(rawCategories, modalSearchQuery).map((match) => {
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
                /* Scenario 2: 2-Column Category Explorer */
                <>
                  {/* Left Column: NHÓM NGHỀ */}
                  <div className="w-1/3 border-r border-gray-150 overflow-y-auto bg-gray-50/40 custom-scrollbar text-left select-none">
                    <p className="p-4 pb-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">NHÓM NGHỀ</p>
                    <div className="px-2 pb-4 space-y-1">
                      {rawCategories.map((catGroup) => {
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
                                  e.stopPropagation(); // prevent activating parent
                                  handleToggleCategory(catGroup);
                                }}
                                className="focus:outline-none flex-shrink-0 cursor-pointer flex items-center justify-center"
                              >
                                {status === "all" ? (
                                  <div className="w-4 h-4 bg-[#006b7a] text-white rounded flex items-center justify-center"><Check size={12} className="stroke-[3]" /></div>
                                ) : status === "partial" ? (
                                  <div className="w-4 h-4 border border-[#006b7a] rounded flex items-center justify-center bg-[#006b7a]/15"><div className="w-2 h-0.5 bg-[#006b7a]"></div></div>
                                ) : (
                                  <div className="w-4 h-4 border border-gray-300 rounded hover:border-gray-400 bg-white"></div>
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
                      /* Placeholder circular art illustration when no category group is chosen */
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
                      /* Dynamic subcategory lists */
                      <div className="space-y-6">
                        {(() => {
                          const activeGroup = rawCategories.find(c => c.id === activeParentCategoryId);
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
                                          {/* Level 2 Subheading with Checkbox */}
                                          <div className="flex items-center gap-2.5 pb-2 border-b border-gray-250/50 select-none">
                                            <button
                                              type="button"
                                              onClick={() => handleToggleCategory(subcat)}
                                              className="focus:outline-none flex-shrink-0 cursor-pointer flex items-center justify-center transition-transform active:scale-95"
                                            >
                                              {subcatStatus === "all" ? (
                                                <div className="w-4 h-4 bg-[#006b7a] text-white rounded flex items-center justify-center"><Check size={11} className="stroke-[3]" /></div>
                                              ) : subcatStatus === "partial" ? (
                                                <div className="w-4 h-4 border border-[#006b7a] rounded flex items-center justify-center bg-[#006b7a]/15"><div className="w-2 h-0.5 bg-[#006b7a]"></div></div>
                                              ) : (
                                                <div className="w-4 h-4 border border-gray-300 rounded hover:border-gray-400 bg-white"></div>
                                              )}
                                            </button>
                                            <span className="text-xs font-black text-[#006b7a] uppercase tracking-wider">{subcat.categoryName}</span>
                                          </div>

                                          {/* Level 3 Grid */}
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                            {subcat.children!.map((level3Node) => {
                                              const isLevel3Checked = tempSelectedCategoryIds.includes(level3Node.id);
                                              return (
                                                <label
                                                  key={level3Node.id}
                                                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border border-gray-150/70 hover:border-[#006b7a]/20 hover:bg-white cursor-pointer transition-all select-none ${isLevel3Checked ? "bg-white border-[#006b7a]/30 shadow-2xs" : "bg-white/60"
                                                    }`}
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

                                    // Standalone Level 2 node with no children
                                    const isChecked = subcatStatus === "all";
                                    return (
                                      <label
                                        key={subcat.id}
                                        className={`flex items-center gap-3 p-3.5 rounded-xl border border-gray-150 hover:border-[#006b7a]/30 hover:bg-teal-50/10 cursor-pointer transition-all select-none ${isChecked ? "bg-teal-50/30 border-[#006b7a]/30" : "bg-white"
                                          }`}
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

            {/* D. Modal Footer */}
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
                    setSelectedCategoryIds([...tempSelectedCategoryIds]);
                    setIsOpenCategoryModal(false);
                  }}
                  className="px-5.5 py-2 bg-[#006b7a] hover:bg-[#005a66] text-white font-bold rounded-full text-xs shadow-md transition-colors active:scale-[0.98] cursor-pointer"
                >
                  Chọn ({tempSelectedCategoryIds.length})
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}
