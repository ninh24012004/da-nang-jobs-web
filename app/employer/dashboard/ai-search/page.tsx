"use client";

import React from "react";
import { Sparkles, Search, Briefcase, GraduationCap } from "lucide-react";
import { useEmployerDashboard } from "../EmployerDashboardContext";
import { toast } from "sonner";

export default function AiSearchPage() {
  const {
    scoutingQuery,
    setScoutingQuery,
    aiSearching,
    aiProgress,
    aiStepText,
    aiResults,
    setApplicants,
    handleAiSearch
  } = useEmployerDashboard();

  return (
    <div className="bg-white rounded-[8px] border border-slate-200 shadow-sm p-6 space-y-6 select-none font-sans text-xs text-slate-650 font-semibold">
      <div>
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
          <Sparkles className="text-amber-500" size={20} />
          <span>DNJ AI Core - Quét & Gợi ý ứng viên tối ưu</span>
        </h3>
        <p className="text-xs text-slate-400">Nhập tiêu chuẩn tuyển dụng, hệ thống AI sẽ tự động phân tích hành vi và kỹ năng để xuất ra 3 hồ sơ phù hợp nhất tại Đà Nẵng</p>
      </div>

      {/* Prompt Search Console */}
      <div className="p-4 rounded-[8px] bg-slate-50 border border-slate-150 space-y-3">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Yêu cầu, kỹ năng hoặc vị trí cần quét</label>
        <div className="flex gap-2">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Ví dụ: Cần tuyển ReactJS Developer có 2 năm kinh nghiệm, kỹ năng tốt về TailwindCSS..."
              value={scoutingQuery}
              onChange={(e) => setScoutingQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 focus:border-[#00B14F] focus:ring-1 focus:ring-[#00B14F] rounded-[6px] pl-9 pr-4 py-2.5 text-xs text-slate-700 outline-none transition-all font-medium"
            />
          </div>
          <button
            onClick={handleAiSearch}
            disabled={aiSearching}
            className="flex items-center gap-1.5 bg-[#00B14F] hover:bg-[#00873D] disabled:bg-slate-200 text-white px-5 py-2.5 rounded-[6px] text-xs font-bold transition-colors cursor-pointer border-none"
          >
            {aiSearching ? (
              <>
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                <span>Đang phân tích...</span>
              </>
            ) : (
              <>
                <Sparkles size={14} className="text-yellow-300" />
                <span>Tìm ứng viên AI</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress bar loader during scan */}
      {aiSearching && (
        <div className="p-6 border border-[#00B14F]/10 rounded-[8px] bg-[#00B14F]/5 space-y-3 text-center">
          <p className="text-xs font-bold text-[#00B14F]">{aiStepText}</p>
          <div className="h-2 w-full bg-slate-150 rounded-full overflow-hidden max-w-md mx-auto">
            <div className="h-full bg-gradient-to-r from-[#00B14F] to-[#00873D] rounded-full transition-all duration-300" style={{ width: `${aiProgress}%` }} />
          </div>
          <p className="text-[10px] text-slate-400 font-light">Quá trình dò hồ sơ có thể mất vài giây...</p>
        </div>
      )}

      {/* AI Candidate Matching Results */}
      {!aiSearching && aiResults.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kết quả đề xuất ứng viên phù hợp nhất</h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {aiResults.map((candidate, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-[8px] p-5 hover:border-[#00B14F]/40 hover:shadow-sm transition-all flex flex-col justify-between space-y-4 relative group">

                {/* Matching Score Badge */}
                <div className="absolute right-4 top-4 bg-amber-50 border border-amber-100 text-amber-600 text-[10px] font-extrabold px-2 py-0.5 rounded-[4px] flex items-center gap-0.5">
                  <Sparkles size={10} className="text-amber-500" />
                  <span>{candidate.score}% Khớp</span>
                </div>

                <div className="space-y-2">
                  <div className="h-9 w-9 rounded-full bg-[#00B14F]/15 text-[#00B14F] flex items-center justify-center font-bold text-sm">
                    {candidate.name.slice(0, 2).toUpperCase()}
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-800 text-sm">{candidate.name}</h5>
                    <p className="text-[10px] text-[#00B14F] font-bold mt-0.5">{candidate.role}</p>
                  </div>

                  <div className="space-y-1.5 pt-2 text-[11px] text-slate-600">
                    <p className="flex items-center gap-1.5">
                      <Briefcase size={12} className="text-slate-400 flex-shrink-0" />
                      <span>{candidate.exp}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <GraduationCap size={12} className="text-slate-400 flex-shrink-0" />
                      <span className="truncate">{candidate.school}</span>
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1 pt-1.5">
                    {candidate.skills.map((s: string, idx: number) => (
                      <span key={idx} className="bg-slate-50 text-slate-655 px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold border border-slate-150">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-medium leading-relaxed">
                  <strong className="text-slate-700 block mb-0.5">Lý do gợi ý:</strong>
                  {candidate.matchReason}
                </div>

                <div className="pt-2 select-none">
                  <button
                    onClick={() => {
                      setApplicants(prev => [
                        {
                          id: Date.now() + i,
                          name: candidate.name,
                          role: candidate.role,
                          date: new Date().toLocaleDateString("vi-VN"),
                          score: candidate.score,
                          status: "Mới tiếp nhận",
                          email: "candidate@dnj.com",
                          phone: "0905.xxx.xxx",
                          location: "Đà Nẵng",
                          resumeFileUrl: ""
                        },
                        ...prev
                      ]);
                      toast.success(`Đã gửi lời mời ứng tuyển trực tiếp đến ${candidate.name}!`);
                    }}
                    className="w-full text-center py-2 bg-[#00B14F] hover:bg-[#00873D] text-white rounded-[6px] text-xs font-bold transition-colors cursor-pointer border-none"
                  >
                    Yêu cầu kết nối trực tiếp
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
