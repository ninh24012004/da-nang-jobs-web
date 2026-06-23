"use client";

import React from "react";
import { Edit2, Users, Globe, Phone, MapPin, FileText, Mail } from "lucide-react";
import { useEmployerDashboard } from "../EmployerDashboardContext";
import { useRouter } from "next/navigation";

export default function CompanyPage() {
  const router = useRouter();
  const { companyDetails } = useEmployerDashboard();

  return (
    <div className="bg-white rounded-[8px] border border-slate-200 shadow-sm p-6 space-y-8 select-none font-sans text-xs text-slate-650 font-semibold">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-150">
        <div>
          <h3 className="text-base font-extrabold text-slate-800">Hồ sơ doanh nghiệp tuyển dụng</h3>
          <p className="text-xs text-slate-400">Xem và quản lý thông tin thương hiệu hiển thị với các ứng viên</p>
        </div>
        <button
          onClick={() => router.push("/employer/onboarding")}
          className="flex items-center gap-1.5 bg-[#00B14F] hover:bg-[#00873D] text-white px-5 py-2.5 rounded-[6px] text-xs font-bold transition-colors cursor-pointer border-none shadow-xs"
        >
          <Edit2 size={15} />
          <span>Cập nhật thông tin</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left part: Logo Card */}
        <div className="flex flex-col items-center text-center p-6 bg-slate-50 rounded-[8px] border border-slate-200 space-y-4">
          <div className="h-24 w-24 rounded-[6px] bg-white border border-slate-200 flex items-center justify-center font-extrabold text-3xl text-[#00B14F] shadow-xs overflow-hidden">
            {companyDetails.logoUrl ? (
              <img src={companyDetails.logoUrl} alt="Logo" className="h-full w-full object-cover" />
            ) : (
              companyDetails.name ? companyDetails.name.slice(0, 2).toUpperCase() : "DN"
            )}
          </div>
          <div>
            <h4 className="font-extrabold text-base text-slate-800 leading-snug">{companyDetails.name}</h4>
            <p className="text-[10px] text-[#00B14F] bg-[#00B14F]/10 border border-[#00B14F]/20 mt-2 font-bold uppercase tracking-wider px-2 py-0.5 rounded-[6px] inline-block">Đã Xác Minh</p>
          </div>
        </div>

        {/* Right part: Details Grid */}
        <div className="lg:col-span-2 space-y-6 text-xs text-slate-655 font-semibold font-sans">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {companyDetails.taxCode && (
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mã số thuế</p>
                <p className="font-bold text-slate-800 text-sm font-mono">{companyDetails.taxCode}</p>
              </div>
            )}

            {companyDetails.size && companyDetails.size !== "Chưa cập nhật" && (
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quy mô nhân sự</p>
                <p className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <Users size={14} className="text-slate-450" />
                  {companyDetails.size}
                </p>
              </div>
            )}

            {companyDetails.website && (
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Địa chỉ trang Web</p>
                <p className="font-bold text-[#00B14F] text-sm">
                  <a
                    href={companyDetails.website.startsWith('http') ? companyDetails.website : `https://${companyDetails.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline inline-flex items-center gap-1 max-w-full"
                  >
                    <Globe size={13} className="flex-shrink-0" />
                    <span className="truncate max-w-[180px] sm:max-w-[240px] inline-block">
                      {companyDetails.website.replace(/^(https?:\/\/)?(www\.)?/, '')}
                    </span>
                  </a>
                </p>
              </div>
            )}

            {companyDetails.phoneNumber && (
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Số điện thoại liên hệ</p>
                <p className="font-bold text-slate-800 text-sm flex items-center gap-1">
                  <Phone size={13} className="text-slate-450" />
                  {companyDetails.phoneNumber}
                </p>
              </div>
            )}

            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email liên hệ</p>
              <p className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Mail size={13} className="text-slate-450" />
                {companyDetails.emailCompany ? (
                  <a href={`mailto:${companyDetails.emailCompany}`} className="hover:text-[#00B14F] hover:underline">
                    {companyDetails.emailCompany}
                  </a>
                ) : (
                  <span className="text-slate-400 italic font-medium">Chưa cập nhật</span>
                )}
              </p>
            </div>
          </div>

          {companyDetails.address && companyDetails.address !== "Chưa cập nhật" && (
            <div className="space-y-1.5 pt-4 border-t border-slate-150">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Địa chỉ trụ sở chính</p>
              <p className="font-bold text-slate-700 flex items-start gap-1 text-sm">
                <MapPin size={15} className="text-[#00B14F] mt-0.5 flex-shrink-0" />
                <span>{companyDetails.address}</span>
              </p>
            </div>
          )}

          {companyDetails.businessLicense && (
            <div className="space-y-1.5 pt-4 border-t border-slate-150">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Giấy phép đăng ký kinh doanh (PDF)</p>
              <a
                href={companyDetails.businessLicense}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[#00B14F] hover:underline font-bold bg-[#00B14F]/5 px-3 py-2 rounded-[6px] mt-1 border border-[#00B14F]/10"
              >
                <FileText size={15} className="text-[#00B14F]" />
                <span>Xem tài liệu PDF giấy phép kinh doanh</span>
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Company Description */}
      {companyDetails.about && companyDetails.about !== "Chưa có thông tin giới thiệu công ty." && (
        <div className="space-y-2 pt-6 border-t border-slate-150 text-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Giới thiệu ngắn hoạt động</p>
          <p className="font-medium text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-[8px] border border-slate-150 whitespace-pre-wrap">
            {companyDetails.about}
          </p>
        </div>
      )}
    </div>
  );
}
