"use client";

import { Smartphone, CheckCircle, ArrowRight } from "lucide-react";
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
              <Smartphone size={14} className="text-teal-400 animate-pulse" />
              <span>Tiện ích di động</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Tìm việc hiệu quả cùng ứng dụng di động Đà Nẵng Job
            </h2>

            <p className="text-gray-350 text-sm sm:text-base font-light leading-relaxed">
              Tạo hồ sơ cá nhân nhanh chóng, tự động nhận thông báo cơ hội việc làm mới theo định vị địa lý, và kết nối chat trực tiếp với nhà tuyển dụng địa phương ngay lập tức.
            </p>

            {/* Bullets lists */}
            <div className="space-y-3.5 pt-2 text-xs sm:text-sm font-medium text-gray-200">
              <div className="flex items-center gap-3">
                <CheckCircle size={16} className="text-teal-400 flex-shrink-0" />
                <span>Nhận gợi ý việc làm tự động theo quận/huyện địa phương</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle size={16} className="text-teal-400 flex-shrink-0" />
                <span>Nộp hồ sơ trực tuyến trong chưa đầy 1 giây</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle size={16} className="text-teal-400 flex-shrink-0" />
                <span>Tương tác phỏng vấn trực tuyến thông suốt an toàn</span>
              </div>
            </div>

            {/* CTA action buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 max-w-sm sm:max-w-none">
              <button
                onClick={handleProfileRedirect}
                className="flex items-center justify-center gap-1.5 w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#006b7a] hover:bg-[#005a66] text-white font-bold text-sm shadow-lg shadow-[#006b7a]/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Tạo hồ sơ của bạn</span>
                <ArrowRight size={14} />
              </button>

              {/* Downloads app stores badges */}
              <div className="flex items-center justify-center gap-3 w-full sm:w-auto pt-2 sm:pt-0">
                <a
                  href="https://apps.apple.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:scale-[1.03] active:scale-[0.97] transition-all"
                >
                  <img
                    src="https://static.topcv.vn/srp/website/images/app/appstore.jpg"
                    alt="App Store download"
                    className="h-9 rounded-md object-contain"
                  />
                </a>
                <a
                  href="https://play.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:scale-[1.03] active:scale-[0.97] transition-all"
                >
                  <img
                    src="https://static.topcv.vn/srp/website/images/app/googleplay.jpg"
                    alt="Google Play download"
                    className="h-9 rounded-md object-contain"
                  />
                </a>
              </div>
            </div>
          </div>

          {/* Right graphics column */}
          <div className="lg:w-1/2 w-full flex justify-center z-10">
            <div className="relative group max-w-md">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-[#006b7a]/15 rounded-2xl blur-xl group-hover:scale-105 transition-transform duration-500 pointer-events-none"></div>
              <img
                src="https://tuyendung.topcv.vn/images/service/Macbook Pro Flying Mockup.png"
                alt="Đà Nẵng Job Mobile Application Mockup"
                className="relative max-h-72 sm:max-h-80 w-auto object-contain transform group-hover:-translate-y-1 transition-all duration-500"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
