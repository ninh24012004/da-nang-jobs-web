"use client";

import { CheckCircle, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function CandidateAppBanner() {
  const handleProfileRedirect = () => {
    toast.info("Đang chuyển hướng tới trang tạo hồ sơ cá nhân...");
    window.location.href = "/candidate/profile";
  };

  return (
    <section className="py-16 md:py-24 bg-gray-50 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-gradient-to-r from-gray-900 to-[#0c1e24] rounded-[2rem] border border-gray-800 shadow-2xl p-8 sm:p-12 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-12 text-left relative overflow-hidden">
          {/* Decorative glow spheres inside banner */}
          <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-[#006b7a]/15 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none"></div>

          {/* Left descriptions and actions */}
          <div className="lg:w-1/2 space-y-6 text-white z-10">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-400 uppercase tracking-widest bg-[#006b7a]/20 border border-[#006b7a]/30 px-3 py-1.5 rounded-full">
              <CheckCircle size={14} className="text-teal-400" />
              <span>Cơ hội nghề nghiệp</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Tìm việc làm nhanh chóng &amp; dễ dàng hơn bao giờ hết
            </h2>

            <p className="text-gray-300 text-sm sm:text-base font-light leading-relaxed">
              Tạo hồ sơ cá nhân trực tuyến chỉ trong vài phút, ứng tuyển nhanh chóng vào các doanh nghiệp hàng đầu tại Đà Nẵng và tương tác trực tiếp với nhà tuyển dụng.
            </p>

            {/* Bullets lists */}
            <div className="space-y-3.5 pt-2 text-xs sm:text-sm font-medium text-gray-200">
              <div className="flex items-center gap-3">
                <CheckCircle size={16} className="text-teal-400 flex-shrink-0" />
                <span>Hàng ngàn việc làm chất lượng cập nhật mỗi ngày</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle size={16} className="text-teal-400 flex-shrink-0" />
                <span>Nộp hồ sơ trực tuyến chỉ bằng 1 cú nhấp chuột</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle size={16} className="text-teal-400 flex-shrink-0" />
                <span>Thông tin tuyển dụng minh bạch, chính xác và an toàn</span>
              </div>
            </div>

            {/* CTA action buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 max-w-sm sm:max-w-none">
              <button
                onClick={handleProfileRedirect}
                className="flex items-center justify-center gap-1.5 w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#006b7a] hover:bg-[#005a66] text-white font-bold text-sm shadow-lg shadow-[#006b7a]/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Tạo hồ sơ cá nhân</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Right graphics column - Job card mockup */}
          <div className="lg:w-1/2 w-full flex justify-center z-10">
            <div className="relative group max-w-sm w-full bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-[#006b7a]/15 rounded-2xl blur-xl group-hover:scale-105 transition-transform duration-500 pointer-events-none"></div>
              
              <div className="relative flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300 font-bold text-lg flex-shrink-0">
                  DN
                </div>
                <div className="space-y-1">
                  <h4 className="text-white font-bold text-base">Tuyển dụng Lập trình viên ReactJS</h4>
                  <p className="text-teal-400 text-xs font-semibold">Công ty Cổ phần Công nghệ Đà Nẵng</p>
                </div>
              </div>
              <div className="relative mt-6 space-y-3">
                <div className="flex justify-between items-center text-xs text-gray-300">
                  <span>Mức lương:</span>
                  <span className="text-teal-300 font-bold">15 - 25 triệu</span>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-300">
                  <span>Địa điểm:</span>
                  <span className="text-white">Q. Hải Châu, TP. Đà Nẵng</span>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-300">
                  <span>Hình thức:</span>
                  <span className="text-white">Toàn thời gian</span>
                </div>
              </div>
              <div className="relative mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-[10px] text-gray-400">Đăng tuyển 2 giờ trước</span>
                <span className="px-3 py-1.5 rounded-lg bg-teal-500 text-white font-bold text-[11px] select-none">Ứng tuyển ngay</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
