"use client";

import React from "react";
import { Loader2, Search, X, Check, ChevronDown } from "lucide-react";
import { useEmployerDashboard } from "../EmployerDashboardContext";
import { useRouter } from "next/navigation";

export default function PostJobPage() {
  const router = useRouter();
  const {
    editingJobId,
    editingJobStatus,
    formTitle,
    setFormTitle,
    formDescription,
    setFormDescription,
    formRequirements,
    setFormRequirements,
    formBenefits,
    setFormBenefits,
    formSalaryType,
    setFormSalaryType,
    formMinSalary,
    setFormMinSalary,
    formMaxSalary,
    setFormMaxSalary,
    formAddress,
    setFormAddress,
    formDeadline,
    setFormDeadline,
    formPositionId,
    setFormPositionId,
    formExperienceLevelId,
    setFormExperienceLevelId,
    formDistrictId,
    setFormDistrictId,
    formWardId,
    setFormWardId,
    formCategoryIds,
    setFormCategoryIds,
    formSkillIds,
    setFormSkillIds,
    formTagIds,
    setFormTagIds,
    categorySearch,
    setCategorySearch,
    skillSearch,
    setSkillSearch,
    tagSearch,
    setTagSearch,
    expandedCategoryGroups,
    setExpandedCategoryGroups,
    getCategorySelectionStatus,
    handleToggleCategoryGroup,
    handleToggleSubcategory,
    getMatchingCategories,
    positions,
    experienceLevels,
    districts,
    wards,
    categoriesTree,
    skills,
    tags,
    actionLoading,
    handleSubmitJob,
    resetForm
  } = useEmployerDashboard();

  return (
    <div className="bg-white rounded-[8px] border border-slate-200 p-6 space-y-6 select-none font-sans text-xs text-slate-650 font-semibold">
      <div>
        <h3 className="text-base font-extrabold text-slate-800">
          {editingJobId ? "Cập nhật thông tin tuyển dụng" : "Đăng tuyển dụng việc làm mới"}
        </h3>
        <p className="text-xs text-slate-450">
          {editingJobId
            ? `Chỉnh sửa chiến dịch tuyển dụng cho mã tin DNJ-${editingJobId}. Hãy đảm bảo thông tin chính xác.`
            : "Điền đầy đủ thông tin để tạo chiến dịch tuyển dụng việc làm của bạn tại thành phố Đà Nẵng"
          }
        </p>
      </div>

      <form onSubmit={handleSubmitJob} className="space-y-5 text-xs text-slate-650 font-semibold">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-slate-500 uppercase tracking-wider block text-[10px] font-bold">
              Tiêu đề tin tuyển dụng <span className="text-red-500">*</span>
              {editingJobId && editingJobStatus === "APPROVED" && (
                <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-[4px] font-extrabold ml-2">Cần duyệt lại</span>
              )}
            </label>
            <input
              type="text"
              placeholder="Ví dụ: Lập trình viên React Native (Middle/Senior)"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="w-full bg-white border border-slate-200 focus:border-[#00B14F] focus:ring-1 focus:ring-[#00B14F] rounded-[6px] px-4 py-2.5 text-slate-700 outline-none transition-all"
              required
            />
          </div>

          {/* Ward Address selection */}
          <div className="space-y-1.5">
            <label className="text-slate-500 uppercase tracking-wider block text-[10px] font-bold">
              Khu vực làm việc <span className="text-red-500">*</span>
              {editingJobId && editingJobStatus === "APPROVED" && (
                <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-[4px] font-extrabold ml-2">Cần duyệt lại</span>
              )}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={formDistrictId}
                onChange={(e) => {
                  setFormDistrictId(e.target.value);
                  setFormWardId("");
                }}
                className="w-full bg-white border border-slate-200 focus:border-[#00B14F] focus:ring-1 focus:ring-[#00B14F] rounded-[6px] px-3 py-2.5 text-slate-700 outline-none transition-colors cursor-pointer"
                required
              >
                <option value="">-- Chọn Quận/Huyện --</option>
                {districts.map((d) => (
                  <option key={d.id} value={d.id}>{d.districtName}</option>
                ))}
              </select>

              <select
                value={formWardId}
                onChange={(e) => setFormWardId(e.target.value)}
                className="w-full bg-white border border-slate-200 focus:border-[#00B14F] focus:ring-1 focus:ring-[#00B14F] rounded-[6px] px-3 py-2.5 text-slate-700 outline-none transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                required
                disabled={!formDistrictId}
              >
                <option value="">-- Chọn Phường/Xã --</option>
                {wards
                  .filter((w) => w.districtId === Number(formDistrictId))
                  .map((w) => (
                    <option key={w.id} value={w.id}>{w.wardName}</option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Position level selection */}
          <div className="space-y-1.5">
            <label className="text-slate-500 uppercase tracking-wider block text-[10px] font-bold">
              Cấp bậc tuyển dụng <span className="text-red-500">*</span>
              {editingJobId && editingJobStatus === "APPROVED" && (
                <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-[4px] font-extrabold ml-2">Cần duyệt lại</span>
              )}
            </label>
            <select
              value={formPositionId}
              onChange={(e) => setFormPositionId(e.target.value)}
              className="w-full bg-white border border-slate-200 focus:border-[#00B14F] focus:ring-1 focus:ring-[#00B14F] rounded-[6px] px-4 py-2.5 text-slate-700 outline-none transition-colors cursor-pointer"
              required
            >
              <option value="">-- Chọn Cấp bậc --</option>
              {positions.map((p) => (
                <option key={p.id} value={p.id}>{p.positionName}</option>
              ))}
            </select>
          </div>

          {/* Experience Level selection */}
          <div className="space-y-1.5">
            <label className="text-slate-500 uppercase tracking-wider block text-[10px] font-bold">
              Kinh nghiệm yêu cầu
              {editingJobId && editingJobStatus === "APPROVED" && (
                <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-[4px] font-extrabold ml-2">Cần duyệt lại</span>
              )}
            </label>
            <select
              value={formExperienceLevelId}
              onChange={(e) => setFormExperienceLevelId(e.target.value)}
              className="w-full bg-white border border-slate-200 focus:border-[#00B14F] focus:ring-1 focus:ring-[#00B14F] rounded-[6px] px-4 py-2.5 text-slate-700 outline-none transition-colors cursor-pointer"
            >
              <option value="">Không yêu cầu kinh nghiệm</option>
              {experienceLevels.map((el) => (
                <option key={el.id} value={el.id}>{el.levelName}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Salaries form section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-slate-500 uppercase tracking-wider block text-[10px] font-bold">
              Hình thức lương
              {editingJobId && editingJobStatus === "APPROVED" && (
                <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-[4px] font-extrabold ml-2">Cần duyệt lại</span>
              )}
            </label>
            <select
              value={formSalaryType}
              onChange={(e) => setFormSalaryType(e.target.value)}
              className="w-full bg-white border border-slate-200 focus:border-[#00B14F] focus:ring-1 focus:ring-[#00B14F] rounded-[6px] px-4 py-2.5 text-slate-700 outline-none transition-colors cursor-pointer"
            >
              <option value="Lương trong khoảng">Lương trong khoảng (Min - Max)</option>
              <option value="Lương thỏa thuận">Lương thỏa thuận</option>
            </select>
          </div>

          {formSalaryType === "Lương trong khoảng" && (
            <>
              <div className="space-y-1.5">
                <label className="text-slate-500 uppercase tracking-wider block text-[10px] font-bold">
                  Lương tối thiểu (VNĐ) <span className="text-red-500">*</span>
                  {editingJobId && editingJobStatus === "APPROVED" && (
                    <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-[4px] font-extrabold ml-2">Cần duyệt lại</span>
                  )}
                </label>
                <input
                  type="number"
                  value={formMinSalary}
                  onChange={(e) => setFormMinSalary(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 focus:border-[#00B14F] focus:ring-1 focus:ring-[#00B14F] rounded-[6px] px-4 py-2.5 text-slate-700 outline-none transition-all"
                  min={0}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-500 uppercase tracking-wider block text-[10px] font-bold">
                  Lương tối đa (VNĐ) <span className="text-red-500">*</span>
                  {editingJobId && editingJobStatus === "APPROVED" && (
                    <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-[4px] font-extrabold ml-2">Cần duyệt lại</span>
                  )}
                </label>
                <input
                  type="number"
                  value={formMaxSalary}
                  onChange={(e) => setFormMaxSalary(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 focus:border-[#00B14F] focus:ring-1 focus:ring-[#00B14F] rounded-[6px] px-4 py-2.5 text-slate-700 outline-none transition-all"
                  min={0}
                  required
                />
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Specific address street */}
          <div className="space-y-1.5">
            <label className="text-slate-500 uppercase tracking-wider block text-[10px] font-bold">
              Địa chỉ làm việc cụ thể <span className="text-red-500">*</span>
              {editingJobId && editingJobStatus === "APPROVED" && (
                <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-[4px] font-extrabold ml-2">Cần duyệt lại</span>
              )}
            </label>
            <input
              type="text"
              placeholder="Ví dụ: 120 Nguyễn Văn Linh"
              value={formAddress}
              onChange={(e) => setFormAddress(e.target.value)}
              className="w-full bg-white border border-slate-200 focus:border-[#00B14F] focus:ring-1 focus:ring-[#00B14F] rounded-[6px] px-4 py-2.5 text-slate-700 outline-none transition-all"
              required
            />
          </div>

          {/* Hạn nhận hồ sơ */}
          <div className="space-y-1.5">
            <label className="text-slate-500 uppercase tracking-wider block text-[10px] font-bold">
              Hạn cuối nhận hồ sơ <span className="text-red-500">*</span>
              {editingJobId && editingJobStatus === "APPROVED" && (
                <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-250 px-1.5 py-0.5 rounded-[4px] font-extrabold ml-2">Cập nhật trực tiếp</span>
              )}
            </label>
            <input
              type="date"
              value={formDeadline}
              onChange={(e) => setFormDeadline(e.target.value)}
              className="w-full bg-white border border-slate-200 focus:border-[#00B14F] focus:ring-1 focus:ring-[#00B14F] rounded-[6px] px-4 py-2.5 text-slate-700 outline-none transition-colors cursor-pointer"
              required
            />
          </div>
        </div>

        {/* Industry Categories (Selecting multiple from master categories tree list) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <label className="text-slate-500 uppercase tracking-wider block text-[10px] font-bold">
              Ngành nghề tuyển dụng (Chọn nhiều)
              {editingJobId && editingJobStatus === "APPROVED" && (
                <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-[4px] font-extrabold ml-2">Cần duyệt lại</span>
              )}
            </label>
            <div className="relative w-48 shrink-0">
              <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold" />
              <input
                type="text"
                placeholder="Tìm nhanh ngành nghề..."
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className="w-full pl-7 pr-6 py-1 bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#00B14F] rounded-[6px] text-[10px] font-bold outline-none transition-all"
              />
              {categorySearch && (
                <button
                  type="button"
                  onClick={() => setCategorySearch("")}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-650 rounded-full hover:bg-slate-100 transition-colors border-none bg-transparent"
                >
                  <X size={10} />
                </button>
              )}
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto p-4 space-y-3 bg-slate-50/30 rounded-[8px] border border-slate-200">
            {categorySearch.trim() !== "" ? (
              /* Searching */
              (() => {
                const matches = getMatchingCategories(categoriesTree, categorySearch);
                return matches.length === 0 ? (
                  <p className="text-[11px] text-slate-400 font-medium py-6 text-center">Không tìm thấy danh mục nào phù hợp.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-2 text-left">
                    {matches.map((match) => {
                      const isSelected = formCategoryIds.includes(match.id);
                      return (
                        <label
                          key={match.id}
                          className={`flex items-center gap-3 p-3.5 rounded-[6px] hover:bg-[#00B14F]/5 cursor-pointer transition-colors select-none ${isSelected ? "bg-[#00B14F]/10" : "bg-white border border-slate-200"}`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSubcategory(match.id)}
                            className="rounded border-slate-300 text-[#00B14F] focus:ring-[#00B14F] w-4 h-4 cursor-pointer"
                          />
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-slate-800 leading-snug">{match.name}</span>
                            <p className="text-[10px] text-slate-400 font-semibold">{match.path}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                );
              })()
            ) : (
              /* Tree View */
              categoriesTree.length === 0 ? (
                <div className="py-6 text-center text-slate-400 font-light text-xs animate-pulse">
                  Đang tải sơ đồ ngành nghề...
                </div>
              ) : (
                <div className="space-y-2.5">
                  {categoriesTree.map((catGroup) => {
                    const isExpanded = expandedCategoryGroups.includes(catGroup.id);
                    const status = getCategorySelectionStatus(catGroup, formCategoryIds);
                    const isAnySelected = status === "all" || status === "partial";

                    return (
                      <div key={catGroup.id} className="rounded-[6px] bg-white overflow-hidden shadow-2xs border border-slate-155">
                        {/* Parent Row */}
                        <div
                          onClick={() => {
                            setExpandedCategoryGroups(prev =>
                              prev.includes(catGroup.id)
                                ? prev.filter(id => id !== catGroup.id)
                                : [...prev, catGroup.id]
                            );
                          }}
                          className="flex items-center justify-between p-3.5 hover:bg-slate-50/50 cursor-pointer select-none transition-colors"
                        >
                          <div className="flex items-center gap-2.5 flex-1 min-w-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleCategoryGroup(catGroup);
                              }}
                              className="focus:outline-none flex-shrink-0 cursor-pointer flex items-center justify-center transition-colors bg-transparent border-none p-0"
                            >
                              {status === "all" ? (
                                <div className="w-[18px] h-[18px] border-2 border-[#00B14F] rounded flex items-center justify-center bg-[#00B14F] text-white">
                                  <Check size={11} className="stroke-[3.5]" />
                                </div>
                              ) : status === "partial" ? (
                                <div className="w-[18px] h-[18px] border-2 border-[#00B14F] rounded flex items-center justify-center bg-[#00B14F]/15 text-[#00B14F]">
                                  <div className="w-2 h-0.5 bg-[#00B14F] rounded-full"></div>
                                </div>
                              ) : (
                                <div className="w-[18px] h-[18px] border border-slate-300 rounded hover:border-[#00B14F] bg-white"></div>
                              )}
                            </button>
                            <span className={`text-[12px] font-bold truncate leading-none ${isAnySelected ? "text-[#00B14F]" : "text-slate-700"}`}>
                              {catGroup.categoryName}
                            </span>
                          </div>

                          <div className={`text-slate-400 transition-transform ${isExpanded ? "transform rotate-180" : ""}`}>
                            <ChevronDown size={14} className="stroke-[2.5]" />
                          </div>
                        </div>

                        {/* Children Panel */}
                        {isExpanded && (
                          <div className="bg-slate-50/30 border-t border-slate-150 p-3.5 pl-6.5 space-y-3 text-left">
                            {!catGroup.children || catGroup.children.length === 0 ? (
                              <p className="text-[11px] text-slate-400 font-medium py-1">Chưa có danh mục con</p>
                            ) : (
                              catGroup.children.map((subcat) => {
                                const hasLevel3 = subcat.children && subcat.children.length > 0;
                                const subcatStatus = getCategorySelectionStatus(subcat, formCategoryIds);
                                const isAnySubcatSelected = subcatStatus === "all" || subcatStatus === "partial";

                                if (hasLevel3) {
                                  return (
                                    <div key={subcat.id} className="bg-white rounded-[6px] p-3 space-y-2.5 text-left border border-slate-200">
                                      {/* Level 2 Subcategory Header */}
                                      <div
                                        onClick={() => handleToggleCategoryGroup(subcat)}
                                        className="flex items-center gap-2 pb-2 border-b border-slate-100 select-none cursor-pointer hover:opacity-80 transition-opacity"
                                      >
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleToggleCategoryGroup(subcat);
                                          }}
                                          className="focus:outline-none flex-shrink-0 cursor-pointer flex items-center justify-center transition-colors bg-transparent border-none p-0"
                                        >
                                          {subcatStatus === "all" ? (
                                            <div className="w-[16px] h-[16px] border-2 border-[#00B14F] rounded flex items-center justify-center bg-[#00B14F] text-white">
                                              <Check size={10} className="stroke-[4]" />
                                            </div>
                                          ) : subcatStatus === "partial" ? (
                                            <div className="w-[16px] h-[16px] border-2 border-[#00B14F] rounded flex items-center justify-center bg-[#00B14F]/15 text-[#00B14F]">
                                              <div className="w-1.5 h-0.5 bg-[#00B14F] rounded-full"></div>
                                            </div>
                                          ) : (
                                            <div className="w-[16px] h-[16px] border border-slate-300 rounded hover:border-[#00B14F] bg-white"></div>
                                          )}
                                        </button>
                                        <span className={`text-[11.5px] font-bold ${isAnySubcatSelected ? "text-[#00B14F]" : "text-slate-700"}`}>
                                          {subcat.categoryName}
                                        </span>
                                      </div>

                                      {/* Level 3 Leaves grid */}
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-1.5">
                                        {subcat.children!.map((level3Node) => {
                                          const isLevel3Selected = formCategoryIds.includes(level3Node.id);
                                          return (
                                            <div
                                              key={level3Node.id}
                                              onClick={() => handleToggleSubcategory(level3Node.id)}
                                              className="flex items-center gap-2 cursor-pointer select-none py-0.5 text-left"
                                            >
                                              <div className="focus:outline-none flex-shrink-0 flex items-center justify-center transition-colors bg-transparent border-none p-0">
                                                {isLevel3Selected ? (
                                                  <div className="w-3.5 h-3.5 border border-[#00B14F] rounded flex items-center justify-center bg-[#00B14F] text-white">
                                                    <Check size={8} className="stroke-[4.5]" />
                                                  </div>
                                                ) : (
                                                  <div className="w-3.5 h-3.5 border border-slate-300 rounded hover:border-[#00B14F] bg-white"></div>
                                                )}
                                              </div>
                                              <span className={`text-[11px] transition-colors leading-tight ${isLevel3Selected ? "font-bold text-[#00B14F]" : "font-medium text-slate-550 hover:text-slate-700"}`}>
                                                {level3Node.categoryName}
                                              </span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );
                                }

                                // Simple Level 2 Subcategory
                                const isSubcatSelected = subcatStatus === "all";
                                return (
                                  <div
                                    key={subcat.id}
                                    onClick={() => handleToggleSubcategory(subcat.id)}
                                    className="flex items-center gap-2.5 cursor-pointer select-none py-1 text-left pl-1.5"
                                  >
                                    <div className="focus:outline-none flex-shrink-0 flex items-center justify-center transition-colors bg-transparent border-none p-0">
                                      {isSubcatSelected ? (
                                        <div className="w-4 h-4 border-2 border-[#00B14F] rounded flex items-center justify-center bg-[#00B14F] text-white">
                                          <Check size={9} className="stroke-[4]" />
                                        </div>
                                      ) : (
                                        <div className="w-4 h-4 border border-slate-300 rounded hover:border-[#00B14F] bg-white"></div>
                                      )}
                                    </div>
                                    <span className={`text-[11.5px] transition-colors ${isSubcatSelected ? "font-bold text-[#00B14F]" : "font-semibold text-slate-650 hover:text-slate-800"}`}>
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
            )}
          </div>
        </div>

        {/* Multi-select check tags for Skills */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <label className="text-slate-500 uppercase tracking-wider block text-[10px] font-bold">
              Kỹ năng yêu cầu (Chọn nhiều)
              {editingJobId && editingJobStatus === "APPROVED" && (
                <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-[4px] font-extrabold ml-2">Cần duyệt lại</span>
              )}
            </label>
            <div className="relative w-48 shrink-0">
              <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold" />
              <input
                type="text"
                placeholder="Tìm nhanh kỹ năng..."
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
                className="w-full pl-7 pr-6 py-1 bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#00B14F] rounded-[6px] text-[10px] font-bold outline-none transition-all"
              />
              {skillSearch && (
                <button
                  type="button"
                  onClick={() => setSkillSearch("")}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-650 rounded-full hover:bg-slate-100 transition-colors border-none bg-transparent"
                >
                  <X size={10} />
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-2.5 bg-slate-50 border border-slate-200 rounded-[6px]">
            {skills
              .filter((s) => s.skillName.toLowerCase().includes(skillSearch.toLowerCase()))
              .map((s) => {
                const isChecked = formSkillIds.includes(s.id);
                return (
                  <label key={s.id} className={`flex items-center gap-1 px-3 py-1.5 rounded-[6px] border text-xs font-bold cursor-pointer select-none transition-colors ${isChecked ? "bg-[#00B14F]/10 border-[#00B14F]/20 text-[#00B14F]" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                    }`}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormSkillIds(prev => [...prev, s.id]);
                        } else {
                          setFormSkillIds(prev => prev.filter(id => id !== s.id));
                        }
                      }}
                      className="sr-only"
                    />
                    <span>{s.skillName}</span>
                  </label>
                );
              })}
          </div>
        </div>

        {/* Multi-select check tags for Tags */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <label className="text-slate-500 uppercase tracking-wider block text-[10px] font-bold">
              Nhãn dán tag liên quan (Chọn nhiều)
              {editingJobId && editingJobStatus === "APPROVED" && (
                <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-[4px] font-extrabold ml-2">Cần duyệt lại</span>
              )}
            </label>
            <div className="relative w-48 shrink-0">
              <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold" />
              <input
                type="text"
                placeholder="Tìm nhanh nhãn dán..."
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
                className="w-full pl-7 pr-6 py-1 bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#00B14F] rounded-[6px] text-[10px] font-bold outline-none transition-all"
              />
              {tagSearch && (
                <button
                  type="button"
                  onClick={() => setTagSearch("")}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-650 rounded-full hover:bg-slate-100 transition-colors border-none bg-transparent"
                >
                  <X size={10} />
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-2.5 bg-slate-50 border border-slate-200 rounded-[6px]">
            {tags
              .filter((t) => t.tagName.toLowerCase().includes(tagSearch.toLowerCase()))
              .map((t) => {
                const isChecked = formTagIds.includes(t.id);
                return (
                  <label key={t.id} className={`flex items-center gap-1 px-3 py-1.5 rounded-[6px] border text-xs font-bold cursor-pointer select-none transition-colors ${isChecked ? "bg-[#0F172A]/10 border-[#0F172A]/20 text-[#0F172A]" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                    }`}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormTagIds(prev => [...prev, t.id]);
                        } else {
                          setFormTagIds(prev => prev.filter(id => id !== t.id));
                        }
                      }}
                      className="sr-only"
                    />
                    <span>#{t.tagName}</span>
                  </label>
                );
              })}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-slate-500 uppercase tracking-wider block text-[10px] font-bold">
            Mô tả công việc <span className="text-red-500">*</span>
            {editingJobId && editingJobStatus === "APPROVED" && (
              <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-[4px] font-extrabold ml-2">Cần duyệt lại</span>
            )}
          </label>
          <textarea
            rows={5}
            placeholder="- Phát triển ứng dụng di động đa nền tảng bằng React Native.&#10;- Xây dựng các UI components đẹp mắt và tối ưu hóa hiệu năng ứng dụng..."
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            className="w-full bg-white border border-slate-200 focus:border-[#00B14F] focus:ring-1 focus:ring-[#00B14F] rounded-[6px] px-4 py-2.5 text-slate-700 outline-none transition-all font-medium leading-relaxed"
            required
          />
        </div>

        {/* Requirements */}
        <div className="space-y-1.5">
          <label className="text-slate-500 uppercase tracking-wider block text-[10px] font-bold">
            Yêu cầu ứng viên <span className="text-red-500">*</span>
            {editingJobId && editingJobStatus === "APPROVED" && (
              <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-[4px] font-extrabold ml-2">Cần duyệt lại</span>
            )}
          </label>
          <textarea
            rows={4}
            placeholder="- Tối thiểu 2 năm kinh nghiệm làm việc với React Native di động.&#10;- Nắm vững JavaScript/TypeScript, hiểu biết tốt về Redux, hooks..."
            value={formRequirements}
            onChange={(e) => setFormRequirements(e.target.value)}
            className="w-full bg-white border border-slate-200 focus:border-[#00B14F] focus:ring-1 focus:ring-[#00B14F] rounded-[6px] px-4 py-2.5 text-slate-700 outline-none transition-all font-medium leading-relaxed"
            required
          />
        </div>

        {/* Quyền lợi */}
        <div className="space-y-1.5">
          <label className="text-slate-500 uppercase tracking-wider block text-[10px] font-bold">
            Quyền lợi được hưởng
            {editingJobId && editingJobStatus === "APPROVED" && (
              <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-[4px] font-extrabold ml-2">Cần duyệt lại</span>
            )}
          </label>
          <textarea
            rows={4}
            placeholder="- Mức lương cạnh tranh kèm tháng lương thứ 13 + thưởng hiệu quả công việc.&#10;- Được đóng đầy đủ BHXH, BHYT và bảo hiểm chăm sóc sức khỏe riêng..."
            value={formBenefits}
            onChange={(e) => setFormBenefits(e.target.value)}
            className="w-full bg-white border border-slate-200 focus:border-[#00B14F] focus:ring-1 focus:ring-[#00B14F] rounded-[6px] px-4 py-2.5 text-slate-700 outline-none transition-all font-medium leading-relaxed"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-150 select-none">
          <button
            type="button"
            onClick={() => {
              resetForm();
              router.push("/employer/dashboard/jobs");
            }}
            className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-655 rounded-[6px] font-bold transition-colors cursor-pointer bg-white"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={actionLoading}
            className="bg-[#00B14F] hover:bg-[#00873D] text-white px-6 py-2.5 rounded-[6px] font-bold transition-colors cursor-pointer flex items-center gap-1 border-none"
          >
            {actionLoading ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <span>{editingJobId ? "Cập nhật tin đăng" : "Đăng tuyển ngay"}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
