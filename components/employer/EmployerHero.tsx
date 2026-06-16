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
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-[#070b12]/80 z-0"></div>

      <div className="relative max-w-5xl mx-auto text-center z-10 space-y-6 md:space-y-8">
        {/* Danang Job Scoring pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-[#00B14F]/20 border border-[#00B14F]/40 text-[#00B14F] text-xs md:text-sm font-semibold tracking-wider uppercase">
          <Sparkles size={14} className="text-[#00B14F]" />
          <span>Hỗ Trợ Tuyển Dụng Đà Nẵng Cực Nhanh</span>
        </div>

        {/* Headlines with sleek text */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-b from-gray-300 to-white bg-clip-text text-transparent">
              ĐÀ NẴNG
            </span>
            <span className="mx-2 md:mx-4 text-[#00B14F]">
              JOBS
            </span>
          </h1>
          <h2 className="text-lg sm:text-2xl md:text-3xl text-gray-300 font-medium max-w-3xl mx-auto leading-relaxed">
            Nền tảng đăng tin tuyển dụng và tìm kiếm hồ sơ ứng viên hàng đầu tại Đà Nẵng, kết nối nhanh chóng, hiệu quả cao
          </h2>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 max-w-md mx-auto sm:max-w-none">
          <a
            href="#banner-form"
            onClick={(e) => handleScrollTo(e, "#banner-form")}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 rounded-md border border-[#00B14F]/40 bg-[#00B14F]/15 hover:bg-[#00B14F]/25 text-white font-bold text-lg backdrop-blur-md shadow-sm transition-colors duration-150 group"
          >
            <PhoneCall size={18} className="text-[#00B14F] transition-transform" />
            <span>Liên hệ tư vấn</span>
          </a>

          <a
            href="#banner-form"
            onClick={(e) => handleScrollTo(e, "#banner-form")}
            className="flex items-center justify-center gap-1.5 w-full sm:w-auto px-8 py-4 rounded-md bg-[#00B14F] hover:bg-[#00873D] text-white font-bold text-lg shadow-sm transition-colors duration-150"
          >
            <span>Trải nghiệm ngay</span>
            <ChevronRight size={20} />
          </a>
        </div>

        {/* Small tags list */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 pt-8 text-xs md:text-sm text-gray-400 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00B14F]"></span>
            Không giới hạn số lượng đăng tuyển
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00B14F]"></span>
            Hơn 150.000+ hồ sơ ứng viên Đà Nẵng
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00B14F]"></span>
            Hỗ trợ kết nối AI thông minh
          </span>
        </div>
      </div>
    </section>
  );
}
