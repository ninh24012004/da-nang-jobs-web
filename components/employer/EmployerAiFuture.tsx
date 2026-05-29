"use client";

import { Sparkles, Brain, Cpu, TrendingUp } from "lucide-react";

export default function EmployerAiFuture() {
  const handleScrollTo = (e: React.MouseEvent<HTMLDivElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="bg-white py-16 md:py-24 overflow-hidden relative">
      {/* Decorative gradients */}
      <div className="absolute right-0 top-1/4 w-72 h-72 bg-[#006b7a]/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute left-0 bottom-1/4 w-72 h-72 bg-teal-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#006b7a]/10 border border-[#006b7a]/20 text-[#006b7a] text-xs font-bold uppercase tracking-wider">
            <Brain size={14} className="text-[#006b7a] animate-pulse" />
            <span>AI Connection Core</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800">
            Kết nối ứng viên bằng thuật toán thông minh
          </h2>
          <p className="text-gray-500 text-sm md:text-base font-light">
            Tiên phong ứng dụng các thuật toán thông minh (AI) giúp tối ưu hóa việc phân loại hồ sơ và đề xuất ứng viên.
          </p>
        </div>

        <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-16">
          {/* Image Column */}
          <div className="lg:w-1/2 w-full">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#006b7a]/5 to-teal-500/5 rounded-2xl blur-xl group-hover:scale-105 transition-transform duration-500 pointer-events-none"></div>
              <img
                src="https://tuyendung.topcv.vn/images/introduction/new-feed.png"
                alt="Trang web đăng tin tuyển dụng miễn phí"
                className="relative w-full max-w-md lg:max-w-none mx-auto rounded-2xl shadow-xl border border-gray-100 object-contain transform group-hover:scale-[1.01] transition-transform duration-500"
              />
            </div>
          </div>

          {/* Text Content Column */}
          <div className="lg:w-1/2 space-y-6 text-left">
            <div className="inline-flex items-center gap-1 text-xs font-bold text-[#006b7a] uppercase tracking-widest bg-[#006b7a]/10 px-3 py-1.5 rounded-md">
              <span>DNJ AI Core</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-800 border-l-4 border-[#006b7a] pl-4 leading-tight">
              Tương lai kết nối nhân sự thông suốt
            </h3>
            <p className="text-gray-600 text-base font-light leading-relaxed">
              DNJ AI Core là hạt nhân kết nối của Đà Nẵng Job. Hệ thống được xây dựng và tối ưu
              bởi các thuật toán so khớp tiên tiến thông qua việc ứng dụng công nghệ lọc thông minh
              và máy học (Machine Learning).
            </p>
            <p className="text-gray-600 text-base font-light leading-relaxed">
              Hệ thống có khả năng phân tích tự động yêu cầu công việc, vị trí địa lý, kỹ năng mong muốn và thói quen tìm kiếm của ứng viên trên địa bàn Đà Nẵng, từ đó đưa ra các đề xuất chuẩn xác nhất để đẩy nhanh hiệu quả kết nối giữa nhà tuyển dụng địa phương và nhân lực chất lượng.
            </p>

            {/* AI Pillars grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex gap-3">
                <div className="p-2.5 h-fit rounded-lg bg-[#006b7a]/10 text-[#006b7a]">
                  <Cpu size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-sm">Phân tích hồ sơ</h4>
                  <p className="text-xs text-gray-500 font-light mt-0.5">Bóc tách kỹ năng, kinh nghiệm ứng viên tự động</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="p-2.5 h-fit rounded-lg bg-[#006b7a]/10 text-[#006b7a]">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-sm">Gợi ý khớp việc</h4>
                  <p className="text-xs text-gray-500 font-light mt-0.5">Tự động gợi ý ứng viên phù hợp với tin tuyển dụng</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <div
                onClick={(e) => handleScrollTo(e as any, "#banner-form")}
                className="flex items-center justify-center w-full sm:w-auto border border-[#006b7a] text-[#006b7a] hover:bg-[#006b7a]/5 px-6 py-3 rounded-lg text-sm font-bold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                Liên hệ tư vấn
              </div>
              <a
                href="#banner-form"
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.querySelector("#banner-form");
                  if (element) element.scrollIntoView({ behavior: "smooth" });
                }}
                className="flex items-center justify-center w-full sm:w-auto bg-[#006b7a] hover:bg-[#005a66] text-white px-6 py-3 rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Đăng tin ngay
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
