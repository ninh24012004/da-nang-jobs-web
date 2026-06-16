"use client";

import { CheckCircle2 } from "lucide-react";

export default function EmployerBigUpdate() {
  const handleScrollTo = (e: React.MouseEvent<HTMLDivElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="bg-gray-50 py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Text content column */}
          <div className="lg:w-1/2 space-y-6 text-left">
            <div className="inline-flex items-center gap-1 text-xs font-bold text-[#00B14F] uppercase tracking-widest bg-[#00B14F]/10 px-3 py-1.5 rounded">
              <span>Tính năng mới</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800 border-l-4 border-[#00B14F] pl-4 leading-tight">
              Đà Nẵng Job Smart Platform
            </h2>
            <p className="text-gray-600 text-base md:text-lg font-light leading-relaxed">
              Nền tảng công nghệ kết nối nhân sự toàn diện tại Đà Nẵng, ứng dụng các giải pháp
              toàn diện giúp doanh nghiệp giải quyết đồng thời các bài toán xoay quanh vấn
              đề tuyển dụng, từ việc tạo nguồn CV ứng viên địa phương, sàng lọc hồ sơ nhanh
              cho đến đo lường hiệu quả bài đăng.
            </p>

            {/* Bullets list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-sm text-gray-700 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#00B14F] flex-shrink-0" />
                <span>Đăng tin tuyển dụng nhanh</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#00B14F] flex-shrink-0" />
                <span>Quản lý chiến dịch thông minh</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#00B14F] flex-shrink-0" />
                <span>Báo cáo hiệu suất thực tế</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#00B14F] flex-shrink-0" />
                <span>Đánh giá năng lực tích hợp</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <div
                onClick={(e) => handleScrollTo(e as any, "#banner-form")}
                className="flex items-center justify-center w-full sm:w-auto border border-[#00B14F] text-[#00B14F] hover:bg-[#00B14F]/5 px-6 py-3 rounded-md text-sm font-bold shadow-sm transition-colors duration-150 cursor-pointer"
              >
                Nhận tư vấn ngay
              </div>
              <a
                href="#banner-form"
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.querySelector("#banner-form");
                  if (element) element.scrollIntoView({ behavior: "smooth" });
                }}
                className="flex items-center justify-center w-full sm:w-auto bg-[#00B14F] hover:bg-[#00873D] text-white px-6 py-3 rounded-md text-sm font-bold shadow-sm transition-colors duration-150"
              >
                Đăng tin ngay
              </a>
            </div>
          </div>

          {/* Image content column */}
          <div className="lg:w-1/2 w-full">
            <div className="relative group">
              <img
                src="https://tuyendung.topcv.vn/images/introduction/bg-big-update.png"
                alt="Cập nhật mới của trang đăng tin tuyển dụng miễn phí"
                className="relative w-full max-w-lg lg:max-w-none mx-auto rounded-lg shadow-sm border border-gray-100/50 object-cover transition-shadow duration-150"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
