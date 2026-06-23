"use client";

import Link from "next/link";
import { Building2, Calendar, DollarSign, MapPin, ShieldCheck, ArrowRight, Heart } from "lucide-react";
import { formatTime } from "@/lib/utils";

interface JobCardProps {
  job: {
    id: number;
    logoUrl: string;
    jobTitle: string;
    employerName?: string;
    salaryType?: string;
    minimumSalary?: number;
    maximumSalary?: number;
    address?: string;
    deadline: string | Date;
    createdAt?: string | Date;
    positionName?: string;
    experienceLevelName?: string;
    categoryNames?: string[];
    skillNames?: string[];
  };
  hideAction?: boolean;
  customBadge?: React.ReactNode;
  isSaved?: boolean;
  onSaveToggle?: (e: React.MouseEvent) => void;
}

export default function JobCard({
  job,
  hideAction = false,
  customBadge,
  isSaved = false,
  onSaveToggle,
}: JobCardProps) {
  const getCompanyInitials = (name?: string) => {
    if (!name) return "CO";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const formatSalary = (type?: string, min?: number, max?: number) => {
    if (type === "Lương thỏa thuận" || type === "NEGOTIABLE" || !min || !max) {
      return "Thỏa thuận";
    }
    return `${(min / 1000000).toFixed(0)}Tr - ${(max / 1000000).toFixed(0)}Tr VNĐ`;
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm hover:border-[#00B14F]/40 hover:shadow-md transition-all duration-150 flex flex-col md:flex-row justify-between gap-5 group text-left">
      {/* Job Details Left Side */}
      <div className="flex gap-4 items-start flex-grow">
        {/* Logo Frame */}
        <div className="h-12 w-12 rounded-md border border-slate-200 bg-slate-50 text-slate-600 flex items-center justify-center overflow-hidden font-bold text-xs select-none flex-shrink-0">
          {job.logoUrl ? (
            <img
              src={job.logoUrl}
              alt={job.employerName}
              className="h-full w-full object-cover"
            />
          ) : (
            getCompanyInitials(job.employerName)
          )}
        </div>

        {/* Title & Stats */}
        <div className="space-y-2 overflow-hidden flex-grow">
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
              <span>{formatSalary(job.salaryType, job.minimumSalary, job.maximumSalary)}</span>
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
              <span className="px-2 py-0.5 rounded bg-slate-50 text-slate-650 text-[10px] font-semibold border border-slate-200">
                {job.positionName}
              </span>
            )}
            {job.experienceLevelName && (
              <span className="px-2 py-0.5 rounded bg-slate-50 text-slate-650 text-[10px] font-semibold border border-slate-200">
                {job.experienceLevelName}
              </span>
            )}
            {(job.categoryNames || job.skillNames || []).slice(0, 2).map((name, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded bg-[#00B14F]/5 text-[#00B14F] text-[10px] font-semibold border border-[#00B14F]/10"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Action Button Right Side */}
      <div className="flex flex-row md:flex-col justify-between items-end md:w-36 flex-shrink-0 md:border-l md:border-slate-100 md:pl-4">
        <div className="flex flex-col items-end w-full md:w-auto">
          <div className="flex items-center justify-between w-full md:justify-end gap-2">
            {onSaveToggle && (
              <button
                onClick={onSaveToggle}
                className={`p-1.5 rounded-md border border-slate-200 hover:border-red-200 hover:bg-red-50/50 transition-colors cursor-pointer bg-white ${isSaved ? "text-red-500 fill-red-500/10 border-red-200" : "text-slate-400"
                  }`}
                title={isSaved ? "Bỏ lưu việc làm" : "Lưu việc làm"}
              >
                <Heart size={14} />
              </button>
            )}
            {customBadge ? (
              customBadge
            ) : (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-slate-50 text-slate-500 text-[9px] font-bold uppercase border border-slate-200 shadow-sm select-none">
                <ShieldCheck size={10} className="text-[#00B14F]" />
                Xác thực
              </span>
            )}
          </div>
          {job.createdAt && (
            <p className="text-[10px] text-slate-400 font-normal mt-1.5 hidden md:block">
              Đăng {formatTime(job.createdAt)}
            </p>
          )}
        </div>

        {!hideAction && (
          <Link
            href={`/jobs/${job.id}`}
            className="w-auto md:w-full py-1.5 px-3 md:px-0 bg-[#00B14F]/10 hover:bg-[#00B14F] border border-[#00B14F]/20 hover:border-[#00B14F] text-[#00B14F] hover:text-white font-bold rounded-md text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
          >
            <span>Ứng tuyển ngay</span>
            <ArrowRight size={11} />
          </Link>
        )}
      </div>
    </div>
  );
}
