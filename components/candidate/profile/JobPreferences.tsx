"use client";

import React, { useMemo } from "react";
import { Grid, FileText, Check, Info, Save, ChevronDown, Loader2 } from "lucide-react";
import { useCandidateProfile } from "@/app/candidate/profile/CandidateProfileContext";
import { CategoryTreeResponse } from "@/types/category";

export default function JobPreferences() {
  const {
    isEditing,
    setIsEditing,
    formData,
    setFormData,
    allCategories,
    allSkills,
    categoriesTree,
    expandedCategoryGroups,
    setExpandedCategoryGroups,
    categorySearch,
    setCategorySearch,
    skillSearch,
    setSkillSearch,
    handleSaveProfile,
    loadCandidateProfile,
  } = useCandidateProfile();

  // Filter Categories and Skills by search keywords
  const filteredCategories = useMemo(() => {
    return allCategories.filter((c) =>
      c.categoryName.toLowerCase().includes(categorySearch.toLowerCase())
    );
  }, [allCategories, categorySearch]);

  const filteredSkills = useMemo(() => {
    return allSkills.filter((s) =>
      s.skillName.toLowerCase().includes(skillSearch.toLowerCase())
    );
  }, [allSkills, skillSearch]);

  // Toggle Skill selection
  const handleToggleSkill = (skillId: number) => {
    if (!isEditing) return;
    setFormData((prev) => {
      const isSelected = prev.skillIds.includes(skillId);
      const newSkillIds = isSelected
        ? prev.skillIds.filter((id) => id !== skillId)
        : [...prev.skillIds, skillId];
      return { ...prev, skillIds: newSkillIds };
    });
  };

  // Category tree helper methods
  const getDescendantIds = (node: CategoryTreeResponse): number[] => {
    let ids = [node.id];
    if (node.children) {
      for (const child of node.children) {
        ids = [...ids, ...getDescendantIds(child)];
      }
    }
    return ids;
  };

  const getCategorySelectionStatus = (node: CategoryTreeResponse, selectedList: number[]): "none" | "partial" | "all" => {
    const descendantIds = getDescendantIds(node);
    const selectedCount = descendantIds.filter(id => selectedList.includes(id)).length;
    if (selectedCount === 0) return "none";
    if (selectedCount === descendantIds.length) return "all";
    return "partial";
  };

  const handleToggleCategoryGroup = (node: CategoryTreeResponse) => {
    if (!isEditing) return;
    const descendantIds = getDescendantIds(node);
    const status = getCategorySelectionStatus(node, formData.categoryIds);

    let updatedCats: number[];
    if (status === "all") {
      updatedCats = formData.categoryIds.filter(id => !descendantIds.includes(id));
    } else {
      const next = [...formData.categoryIds];
      descendantIds.forEach(id => {
        if (!next.includes(id)) next.push(id);
      });
      updatedCats = next;
    }
    setFormData(prev => ({ ...prev, categoryIds: updatedCats }));
  };

  const handleToggleSubcategory = (subcatId: number) => {
    if (!isEditing) return;
    let updatedCats: number[];
    if (formData.categoryIds.includes(subcatId)) {
      updatedCats = formData.categoryIds.filter(id => id !== subcatId);
    } else {
      updatedCats = [...formData.categoryIds, subcatId];
    }
    setFormData(prev => ({ ...prev, categoryIds: updatedCats }));
  };

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

  return (
    <div className="bg-white rounded-[8px] border border-slate-200 p-6 shadow-sm space-y-6 text-left animate-fadeIn">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-800">Cấu hình việc làm gợi ý</h3>
          <p className="text-[10px] text-slate-455 mt-0.5">
            Lựa chọn chính xác ngành nghề và kỹ năng để hệ thống lọc các vị trí phù hợp nhất
          </p>
        </div>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-[#00B14F] hover:bg-[#00873D] text-white rounded-[6px] text-xs font-bold transition-colors cursor-pointer border-none shadow-sm"
          >
            Chỉnh sửa cài đặt
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                loadCandidateProfile();
                setIsEditing(false);
              }}
              className="px-3.5 py-2 border border-slate-250 hover:bg-slate-50 text-slate-655 rounded-[6px] text-xs font-semibold cursor-pointer"
            >
              Hủy
            </button>
            <button
              onClick={handleSaveProfile}
              className="px-4 py-2 bg-[#00B14F] hover:bg-[#00873D] text-white rounded-[6px] text-xs font-bold shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer border-none"
            >
              <Save size={13} />
              Lưu cài đặt
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Categories Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs uppercase font-bold tracking-wider text-[#00B14F] flex items-center gap-1.5">
              <Grid size={14} />
              <span>Lĩnh vực & Ngành nghề</span>
            </label>
            <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-[4px]">
              Đã chọn: {formData.categoryIds.length}
            </span>
          </div>

          {isEditing && (
            <input
              type="text"
              placeholder="Tìm nhanh ngành nghề (ví dụ: CNTT, Kinh doanh...)"
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              className="w-full bg-white border border-slate-200 focus:border-[#00B14F] focus:ring-1 focus:ring-[#00B14F] rounded-[6px] px-3.5 py-1.5 text-xs font-medium outline-none transition-colors"
            />
          )}

          <div className="max-h-80 overflow-y-auto p-3.5 space-y-3.5 custom-scrollbar bg-slate-50/50 rounded-[8px] border border-slate-150">
            {isEditing ? (
              categorySearch.trim() !== "" ? (
                (() => {
                  const matches = getMatchingCategories(categoriesTree, categorySearch);
                  return matches.length === 0 ? (
                    <p className="text-[10px] text-slate-400 font-medium py-6 text-center">Không tìm thấy danh mục nào phù hợp.</p>
                  ) : (
                    <div className="grid grid-cols-1 gap-2 text-left">
                      {matches.map((match) => {
                        const isSelected = formData.categoryIds.includes(match.id);
                        return (
                          <label
                            key={match.id}
                            className={`flex items-start gap-2.5 p-2.5 rounded-[6px] border border-slate-200 bg-white hover:border-[#00B14F]/20 cursor-pointer select-none transition-colors ${isSelected ? "bg-[#00B14F]/5 border-[#00B14F]/20" : ""
                              }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSubcategory(match.id)}
                              className="rounded border-slate-350 text-[#00B14F] focus:ring-[#00B14F] w-3.5 h-3.5 mt-0.5 cursor-pointer"
                            />
                            <div className="space-y-0.5">
                              <span className="text-xs font-semibold text-slate-800 leading-snug">{match.name}</span>
                              <p className="text-[10px] text-slate-455 font-normal">{match.path}</p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  );
                })()
              ) : categoriesTree.length === 0 ? (
                <div className="py-6 text-center text-slate-400 font-medium text-xs">
                  Đang tải sơ đồ ngành nghề...
                </div>
              ) : (
                <div className="space-y-2 animate-fadeIn">
                  {categoriesTree.map((catGroup) => {
                    const isExpanded = expandedCategoryGroups.includes(catGroup.id);
                    const status = getCategorySelectionStatus(catGroup, formData.categoryIds);
                    const isAnySelected = status === "all" || status === "partial";

                    return (
                      <div key={catGroup.id} className="rounded-[6px] bg-white border border-slate-150 overflow-hidden shadow-2xs">
                        <div
                          onClick={() => {
                            setExpandedCategoryGroups((prev) =>
                              prev.includes(catGroup.id)
                                ? prev.filter((id) => id !== catGroup.id)
                                : [...prev, catGroup.id]
                            );
                          }}
                          className="flex items-center justify-between p-2.5 hover:bg-slate-55 cursor-pointer select-none transition-colors"
                        >
                          <div className="flex items-center gap-2 flex-grow min-w-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleCategoryGroup(catGroup);
                              }}
                              className="focus:outline-none flex-shrink-0 cursor-pointer flex items-center justify-center bg-transparent border-none p-0"
                            >
                              {status === "all" ? (
                                <div className="w-4 h-4 border border-[#00B14F] rounded-[4px] flex items-center justify-center bg-[#00B14F] text-white">
                                  <Check size={10} className="stroke-[3.5]" />
                                </div>
                              ) : status === "partial" ? (
                                <div className="w-4 h-4 border border-[#00B14F] rounded-[4px] flex items-center justify-center bg-[#00B14F]/10 text-[#00B14F]">
                                  <div className="w-1.5 h-0.5 bg-[#00B14F]"></div>
                                </div>
                              ) : (
                                <div className="w-4 h-4 border border-slate-300 rounded-[4px] bg-white"></div>
                              )}
                            </button>
                            <span className={`text-xs font-semibold truncate leading-none ${isAnySelected ? "text-[#00B14F]" : "text-slate-700"}`}>
                              {catGroup.categoryName}
                            </span>
                          </div>

                          <div className={`text-slate-400 transition-transform ${isExpanded ? "transform rotate-180" : ""}`}>
                            <ChevronDown size={14} />
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="bg-slate-50/20 border-t border-slate-100 p-2.5 pl-6 space-y-2">
                            {!catGroup.children || catGroup.children.length === 0 ? (
                              <p className="text-[10px] text-slate-400 font-medium py-1">Chưa có danh mục con</p>
                            ) : (
                              catGroup.children.map((subcat) => {
                                const hasLevel3 = subcat.children && subcat.children.length > 0;
                                const subcatStatus = getCategorySelectionStatus(subcat, formData.categoryIds);
                                const isAnySubcatSelected = subcatStatus === "all" || subcatStatus === "partial";

                                if (hasLevel3) {
                                  return (
                                    <div key={subcat.id} className="bg-white rounded-[6px] p-2.5 space-y-2 border border-slate-200">
                                      <div
                                        onClick={() => handleToggleCategoryGroup(subcat)}
                                        className="flex items-center gap-2 pb-1.5 border-b border-slate-100 select-none cursor-pointer"
                                      >
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleToggleCategoryGroup(subcat);
                                          }}
                                          className="focus:outline-none flex-shrink-0 cursor-pointer flex items-center justify-center bg-transparent border-none p-0"
                                        >
                                          {subcatStatus === "all" ? (
                                            <div className="w-[15px] h-[15px] border border-[#00B14F] rounded-[3px] flex items-center justify-center bg-[#00B14F] text-white">
                                              <Check size={9} className="stroke-[4]" />
                                            </div>
                                          ) : subcatStatus === "partial" ? (
                                            <div className="w-[15px] h-[15px] border border-[#00B14F] rounded-[3px] flex items-center justify-center bg-[#00B14F]/10 text-[#00B14F]">
                                              <div className="w-1.5 h-0.5 bg-[#00B14F]"></div>
                                            </div>
                                          ) : (
                                            <div className="w-[15px] h-[15px] border border-slate-300 rounded-[3px] bg-white"></div>
                                          )}
                                        </button>
                                        <span className={`text-[11px] font-bold ${isAnySubcatSelected ? "text-[#00B14F]" : "text-slate-700"}`}>
                                          {subcat.categoryName}
                                        </span>
                                      </div>

                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-1.5">
                                        {subcat.children!.map((level3Node) => {
                                          const isLevel3Selected = formData.categoryIds.includes(level3Node.id);
                                          return (
                                            <div
                                              key={level3Node.id}
                                              onClick={() => handleToggleSubcategory(level3Node.id)}
                                              className="flex items-center gap-1.5 cursor-pointer select-none py-0.5 text-left"
                                            >
                                              <div className="focus:outline-none flex-shrink-0 flex items-center justify-center transition-all bg-transparent border-none p-0">
                                                {isLevel3Selected ? (
                                                  <div className="w-3 h-3 border border-[#00B14F] rounded-[2px] flex items-center justify-center bg-[#00B14F] text-white">
                                                    <Check size={7} className="stroke-[5]" />
                                                  </div>
                                                ) : (
                                                  <div className="w-3 h-3 border border-slate-350 rounded-[2px] bg-white"></div>
                                                )}
                                              </div>
                                              <span className={`text-[10px] transition-colors leading-tight ${isLevel3Selected ? "font-bold text-[#00B14F]" : "font-medium text-slate-500"}`}>
                                                {level3Node.categoryName}
                                              </span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );
                                }

                                const isSubcatSelected = subcatStatus === "all";
                                return (
                                  <div
                                    key={subcat.id}
                                    onClick={() => handleToggleSubcategory(subcat.id)}
                                    className="flex items-center gap-2 cursor-pointer select-none py-1 text-left pl-1"
                                  >
                                    <div className="focus:outline-none flex-shrink-0 flex items-center justify-center bg-transparent border-none p-0">
                                      {isSubcatSelected ? (
                                        <div className="w-3.5 h-3.5 border border-[#00B14F] rounded-[3px] flex items-center justify-center bg-[#00B14F] text-white">
                                          <Check size={8} className="stroke-[4]" />
                                        </div>
                                      ) : (
                                        <div className="w-3.5 h-3.5 border border-slate-300 rounded-[3px] bg-white"></div>
                                      )}
                                    </div>
                                    <span className={`text-xs transition-colors ${isSubcatSelected ? "font-bold text-[#00B14F]" : "font-semibold text-slate-650"}`}>
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
                </div>
              )
            ) : formData.categoryIds.length === 0 ? (
              <p className="text-xs text-slate-400 font-light text-center py-6">
                Chưa chọn ngành nghề nào quan tâm.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5 text-left animate-fadeIn">
                {allCategories
                  .filter((c) => formData.categoryIds.includes(c.id))
                  .map((c) => (
                    <span
                      key={c.id}
                      className="px-2.5 py-1 rounded-[6px] bg-[#00B14F]/5 border border-[#00B14F]/10 text-[#00B14F] text-[11px] font-semibold"
                    >
                      {c.categoryName}
                    </span>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Skills Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs uppercase font-bold tracking-wider text-[#00B14F] flex items-center gap-1.5">
              <FileText size={14} />
              <span>Kỹ năng của bạn</span>
            </label>
            <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-[4px]">
              Đã chọn: {formData.skillIds.length}
            </span>
          </div>

          {isEditing && (
            <input
              type="text"
              placeholder="Tìm nhanh kỹ năng (ví dụ: Java, Photoshop...)"
              value={skillSearch}
              onChange={(e) => setSkillSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 focus:border-[#00B14F] focus:ring-1 focus:ring-[#00B14F] rounded-[6px] px-3.5 py-1.5 text-xs font-medium outline-none transition-colors"
            />
          )}

          <div className="max-h-80 overflow-y-auto border border-slate-200 rounded-[8px] p-3.5 bg-slate-50/50 text-left">
            {filteredSkills.length === 0 ? (
              <p className="text-[10px] text-slate-400 font-medium py-6 text-center">Không tìm thấy kỹ năng nào.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {filteredSkills.map((s) => {
                  const isSelected = formData.skillIds.includes(s.id);
                  return (
                    <span
                      key={s.id}
                      onClick={() => handleToggleSkill(s.id)}
                      className={`px-2.5 py-1 rounded-[6px] border text-[11px] font-semibold transition-colors inline-flex items-center gap-1 ${isEditing ? "cursor-pointer" : ""
                        } ${isSelected
                          ? "bg-[#00B14F] text-white border-[#00B14F] font-bold animate-pulseFast"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-55"
                        }`}
                    >
                      <span>{s.skillName}</span>
                      {isSelected && <Check size={10} />}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {formData.categoryIds.length === 0 && (
        <div className="p-3 bg-amber-50 rounded-[6px] border border-amber-200 text-amber-700 text-xs font-semibold flex items-center gap-2">
          <Info size={14} className="text-amber-500 flex-shrink-0" />
          <span>Bạn chưa cấu hình ngành nghề. Hãy chọn để bắt đầu nhận gợi ý công việc.</span>
        </div>
      )}

      {isEditing && (
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              loadCandidateProfile();
              setIsEditing(false);
            }}
            className="px-4 py-2 border border-slate-250 hover:bg-slate-55 text-slate-600 rounded-[6px] font-semibold transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSaveProfile}
            className="bg-[#00B14F] hover:bg-[#00873D] text-white px-5 py-2 rounded-[6px] font-bold shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer border-none"
          >
            <Save size={13} />
            <span>Lưu & Tìm việc gợi ý</span>
          </button>
        </div>
      )}
    </div>
  );
}
