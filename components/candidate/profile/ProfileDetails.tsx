"use client";

import React from "react";
import { Loader2, User, UploadCloud, Save, Check, X, Info, Sliders, FileText } from "lucide-react";
import { useCandidateProfile } from "@/app/candidate/profile/CandidateProfileContext";

export default function ProfileDetails() {
  const {
    isEditing,
    setIsEditing,
    formData,
    setFormData,
    districts,
    wards,
    loadingWards,
    uploadingAvatar,
    saving,
    userSession,
    completenessPercentage,
    isOnboardingNeeded,
    handleAvatarChange,
    handleSaveProfile,
    setActiveTab,
  } = useCandidateProfile();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fadeIn">
      {/* Left major card: Basic Info Form */}
      <div className="lg:col-span-2 bg-white rounded-[8px] border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div className="text-left">
            <h3 className="text-sm sm:text-base font-bold text-slate-800">Thông tin cơ bản</h3>
            <p className="text-[10px] text-slate-450 mt-0.5">Địa chỉ liên lạc để nhận các công việc gần nhất</p>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1.5 bg-[#00B14F]/10 text-[#00B14F] hover:bg-[#00B14F] hover:text-white rounded-[6px] text-xs font-bold transition-colors cursor-pointer border-none"
            >
              Chỉnh sửa
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-semibold text-left">
            {/* Avatar upload block inside editing */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-4 border-b border-slate-100 mb-4 select-none">
              <div className="h-20 w-20 rounded-full border-2 border-slate-200 bg-slate-55 flex items-center justify-center relative overflow-hidden flex-shrink-0 group">
                {uploadingAvatar ? (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-[#00B14F]" />
                  </div>
                ) : formData.avatarUrl ? (
                  <img src={formData.avatarUrl} alt="Avatar" className="h-full w-full object-cover rounded-full" />
                ) : (
                  <User className="h-10 w-10 text-slate-400" />
                )}
                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity text-[10px] font-bold text-white">
                  <UploadCloud size={16} className="mb-0.5 text-[#00B14F]" />
                  Tải ảnh
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
              </div>
              <div className="text-center sm:text-left space-y-1">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ảnh đại diện ứng viên</h4>
                <p className="text-[10px] text-slate-400 font-normal leading-normal">Bấm vào hình tròn bên cạnh để tải lên hoặc thay đổi ảnh đại diện (JPG, PNG, tối đa 3MB).</p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-500 uppercase tracking-wider block">Họ và tên ứng viên <span className="text-red-500">*</span></label>
              <input
                type="text"
                placeholder="Ví dụ: Nguyễn Văn A"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full bg-white border border-slate-200 focus:border-[#00B14F] focus:ring-1 focus:ring-[#00B14F] rounded-[6px] px-3.5 py-2 text-slate-700 outline-none font-medium transition-colors"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-slate-500 uppercase tracking-wider block">Quận / Huyện Đà Nẵng <span className="text-red-500">*</span></label>
                <select
                  value={formData.districtId}
                  onChange={(e) => setFormData({ ...formData, districtId: e.target.value, wardId: "" })}
                  className="w-full bg-white border border-slate-200 focus:border-[#00B14F] focus:ring-1 focus:ring-[#00B14F] rounded-[6px] px-3.5 py-2 text-slate-700 outline-none cursor-pointer transition-colors"
                  required
                >
                  <option value="">-- Chọn Quận/Huyện --</option>
                  {districts.map((d) => (
                    <option key={d.id} value={String(d.id)}>{d.districtName}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-500 uppercase tracking-wider block">
                  Phường / Xã <span className="text-red-500">*</span>
                  {loadingWards && <Loader2 size={12} className="inline ml-1 animate-spin text-[#00B14F]" />}
                </label>
                <select
                  value={formData.wardId}
                  onChange={(e) => setFormData({ ...formData, wardId: e.target.value })}
                  disabled={!formData.districtId || loadingWards}
                  className="w-full bg-white border border-slate-200 focus:border-[#00B14F] focus:ring-1 focus:ring-[#00B14F] rounded-[6px] px-3.5 py-2 text-slate-700 outline-none disabled:opacity-55 cursor-pointer transition-colors"
                  required
                >
                  <option value="">
                    {!formData.districtId ? "Chọn Quận/Huyện trước" : "Chọn Phường/Xã"}
                  </option>
                  {wards.map((w) => (
                    <option key={w.id} value={String(w.id)}>{w.wardName}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-500 uppercase tracking-wider block">Số nhà, Tên đường cụ thể <span className="text-red-500">*</span></label>
              <input
                type="text"
                placeholder="Ví dụ: K10/24 Nguyễn Văn Linh"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-white border border-slate-200 focus:border-[#00B14F] focus:ring-1 focus:ring-[#00B14F] rounded-[6px] px-3.5 py-2 text-slate-700 outline-none font-medium transition-colors"
                required
              />
            </div>

            {/* Actions buttons */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              {!isOnboardingNeeded && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-slate-250 hover:bg-slate-50 text-slate-600 rounded-[6px] font-semibold transition-colors cursor-pointer"
                >
                  Hủy
                </button>
              )}
              <button
                type="submit"
                disabled={saving}
                className="bg-[#00B14F] hover:bg-[#00873D] disabled:bg-slate-350 text-white px-5 py-2 rounded-[6px] font-bold shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer border-none"
              >
                {saving && <Loader2 size={13} className="animate-spin" />}
                <Save size={13} />
                <span>Lưu thông tin</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-5 text-xs text-left font-medium text-slate-600">
            {/* Avatar display block in view mode */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-4 border-b border-slate-100 mb-4 select-none">
              <div className="h-20 w-20 rounded-full border-2 border-slate-200 bg-slate-50 flex items-center justify-center relative overflow-hidden flex-shrink-0">
                {formData.avatarUrl ? (
                  <img src={formData.avatarUrl} alt="Avatar" className="h-full w-full object-cover rounded-full" />
                ) : (
                  <User className="h-10 w-10 text-slate-400" />
                )}
              </div>
              <div className="text-center sm:text-left space-y-1">
                <h4 className="text-sm font-bold text-slate-800">{formData.fullName}</h4>
                <p className="text-xs text-slate-500 font-medium">{userSession?.email}</p>
                <span className="inline-block bg-[#00B14F]/10 text-[#00B14F] text-[9px] font-bold px-2 py-0.5 rounded-[4px] border border-[#00B14F]/20 uppercase tracking-wider">
                  Ứng viên Đà Nẵng Jobs
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Họ và tên</p>
                <p className="text-sm font-bold text-slate-800 mt-1">{formData.fullName}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Email đăng ký</p>
                <p className="text-sm font-bold text-slate-800 mt-1">{userSession?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Địa chỉ sinh sống</p>
                <p className="text-sm font-bold text-slate-800 mt-1">
                  {formData.address}
                  {districts.find((d) => String(d.id) === formData.districtId) &&
                    `, Phường ${wards.find((w) => String(w.id) === formData.wardId)?.wardName}, Quận ${
                      districts.find((d) => String(d.id) === formData.districtId)?.districtName
                    }`}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Thành phố</p>
                <p className="text-sm font-bold text-slate-800 mt-1">Đà Nẵng, Việt Nam</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right column: Summary sidebar */}
      <div className="bg-white rounded-[8px] border border-slate-200 p-5 shadow-sm text-left space-y-4">
        <h4 className="font-bold text-xs sm:text-sm text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-1.5">
          <FileText size={14} className="text-[#00B14F]" />
          <span>Trạng thái hồ sơ</span>
        </h4>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-400">Họ tên:</span>
            <span className="text-emerald-600 flex items-center gap-0.5">
              <Check size={12} /> Hoàn thành
            </span>
          </div>
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-400">Ảnh đại diện:</span>
            {formData.avatarUrl ? (
              <span className="text-emerald-600 flex items-center gap-0.5">
                <Check size={12} /> Hoàn thành
              </span>
            ) : (
              <span className="text-amber-600 flex items-center gap-0.5">
                <Info size={12} /> Chưa tải
              </span>
            )}
          </div>
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-400">Địa chỉ cụ thể:</span>
            {formData.wardId && formData.address ? (
              <span className="text-emerald-600 flex items-center gap-0.5">
                <Check size={12} /> Hoàn thành
              </span>
            ) : (
              <span className="text-red-500 flex items-center gap-0.5">
                <X size={12} /> Chưa hoàn thiện
              </span>
            )}
          </div>
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-400">Ngành nghề gợi ý:</span>
            {formData.categoryIds.length > 0 ? (
              <span className="text-emerald-600 flex items-center gap-0.5">
                <Check size={12} /> {formData.categoryIds.length} đã chọn
              </span>
            ) : (
              <span className="text-amber-600 flex items-center gap-0.5">
                <Info size={12} /> Chưa thiết lập
              </span>
            )}
          </div>
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-400">Kỹ năng:</span>
            {formData.skillIds.length > 0 ? (
              <span className="text-emerald-600 flex items-center gap-0.5">
                <Check size={12} /> {formData.skillIds.length} đã chọn
              </span>
            ) : (
              <span className="text-amber-600 flex items-center gap-0.5">
                <Info size={12} /> Chưa thiết lập
              </span>
            )}
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100">
          <button
            onClick={() => {
              setActiveTab("preferences");
              setIsEditing(true);
            }}
            className="w-full text-center bg-[#00B14F] hover:bg-[#00873D] text-white py-2 rounded-[6px] text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer border-none"
          >
            <Sliders size={13} />
            <span>Cài đặt gợi ý công việc</span>
          </button>
        </div>
      </div>
    </div>
  );
}
