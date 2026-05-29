"use client";

import { ChevronRight, Sparkles, PhoneCall } from "lucide-react";

export default function EmployerHero() {
  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section
      id="introduction-hero"
      className="relative min-h-[550px] md:min-h-[750px] flex items-center justify-center bg-cover bg-center bg-no-repeat pt-24 pb-16 px-4 overflow-hidden"
      style={{
        backgroundImage: 'url("https://tuyendung.topcv.vn/images/introduction/landing-page-hero.png")',
      }}
    >
      {/* Dark overlay with brand teal glow accents */}
      <div className="absolute inset-0 bg-[#070b12]/80 z-0"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#006b7a]/15 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#006b7a]/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative max-w-5xl mx-auto text-center z-10 space-y-6 md:space-y-8">
        {/* Danang Job Scoring pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#006b7a]/20 border border-[#006b7a]/40 text-[#006b7a] text-xs md:text-sm font-semibold tracking-wider uppercase animate-bounce">
          <Sparkles size={14} className="text-[#006b7a]" />
          <span>Hỗ Trợ Tuyển Dụng Đà Nẵng Cực Nhanh</span>
        </div>

        {/* Headlines with sleek gradient text */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-b from-gray-300 to-white bg-clip-text text-transparent">
              ĐÀ NẴNG
            </span>
            <span className="mx-2 md:mx-4 bg-gradient-to-r from-[#006b7a] to-teal-400 bg-clip-text text-transparent">
              JOBS
            </span>
          </h1>
          <h2 className="text-lg sm:text-2xl md:text-3xl text-gray-350 font-medium max-w-3xl mx-auto leading-relaxed">
            Nền tảng đăng tin tuyển dụng và tìm kiếm hồ sơ ứng viên hàng đầu tại Đà Nẵng, kết nối nhanh chóng, hiệu quả cao
          </h2>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 max-w-md mx-auto sm:max-w-none">
          <a
            href="#banner-form"
            onClick={(e) => handleScrollTo(e, "#banner-form")}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 rounded-xl border border-[#006b7a]/40 bg-[#006b7a]/15 hover:bg-[#006b7a]/25 text-white font-bold text-lg backdrop-blur-md shadow-lg shadow-teal-950/20 hover:shadow-[#006b7a]/10 transition-all active:scale-[0.98] group"
          >
            <PhoneCall size={18} className="text-[#006b7a] group-hover:scale-110 transition-transform" />
            <span>Liên hệ tư vấn</span>
          </a>

          <a
            href="#banner-form"
            onClick={(e) => handleScrollTo(e, "#banner-form")}
            className="flex items-center justify-center gap-1.5 w-full sm:w-auto px-8 py-4 rounded-xl bg-[#006b7a] hover:bg-[#005a66] text-white font-bold text-lg shadow-lg shadow-[#006b7a]/30 hover:shadow-[#006b7a]/40 hover:-translate-y-0.5 transition-all active:scale-[0.98] active:translate-y-0"
          >
            <span>Trải nghiệm ngay</span>
            <ChevronRight size={20} />
          </a>
        </div>

        {/* Small tags list */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 pt-8 text-xs md:text-sm text-gray-400 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#006b7a]"></span>
            Không giới hạn số lượng đăng tuyển
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#006b7a]"></span>
            Hơn 150.000+ hồ sơ ứng viên Đà Nẵng
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#006b7a]"></span>
            Hỗ trợ kết nối AI thông minh
          </span>
        </div>
      </div>
    </section>
  );
}
