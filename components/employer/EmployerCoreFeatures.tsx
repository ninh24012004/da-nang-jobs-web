"use client";

import { ChevronRight, Settings, Users, FolderKanban, BarChart3, GraduationCap, Coins } from "lucide-react";

export default function EmployerCoreFeatures() {
  const features = [
    {
      title: "Đề xuất bởi DNJ AI",
      img: "https://tuyendung.topcv.vn/images/feature/suggestion.png",
      desc: "DNJ AI phân tích dữ liệu tuyển dụng địa phương và hành vi tìm việc của ứng viên để gợi ý hành động, đề xuất tuyển dụng tốt nhất.",
      link: "#",
      icon: <Settings className="text-[#00B14F]" size={20} />,
    },
    {
      title: "Chiến dịch tuyển dụng",
      img: "https://tuyendung.topcv.vn/images/feature/header_campaign.png",
      desc: "Hoàn thiện cấu trúc của quá trình quản lý tuyển dụng. Cho phép tối ưu hóa các phương pháp tìm kiếm nguồn ứng viên xuất sắc.",
      link: "#",
      icon: <FolderKanban className="text-[#00B14F]" size={20} />,
    },
    {
      title: "Tính năng quản lý CV",
      img: "https://tuyendung.topcv.vn/images/feature/cvs-management.png",
      desc: "Lưu trữ tập trung và hệ thống hóa toàn bộ kho hồ sơ ứng viên Đà Nẵng của bạn mà không sợ thất lạc hay rò rỉ dữ liệu bảo mật.",
      link: "#",
      icon: <Users className="text-[#00B14F]" size={20} />,
    },
    {
      title: "Báo cáo tuyển dụng",
      img: "https://tuyendung.topcv.vn/images/feature/report-system.png",
      desc: "Theo dõi trực quan tỷ lệ chuyển đổi phễu ứng viên qua từng vòng. Đo lường ngân sách chi phí tuyển dụng thực tế tức thời.",
      link: "#",
      icon: <BarChart3 className="text-[#00B14F]" size={20} />,
    },
    {
      title: "Đánh giá năng lực online",
      img: "https://tuyendung.topcv.vn/images/feature/testcenter-on-phone.png",
      desc: "Hệ thống test tích hợp giúp thiết lập các bài test online đánh giá kỹ năng chuyên môn ứng viên một cách toàn diện và khoa học.",
      link: "#",
      icon: <GraduationCap className="text-[#00B14F]" size={20} />,
    },
    {
      title: "Dịch vụ đẩy tin linh hoạt",
      img: "https://tuyendung.topcv.vn/images/feature/service.png",
      desc: "Kích hoạt linh hoạt các gói tin VIP nổi bật, định vị thương hiệu nhà tuyển dụng hàng đầu tại thị trường việc làm Đà Nẵng.",
      link: "#",
      icon: <Coins className="text-[#00B14F]" size={20} />,
    },
  ];

  return (
    <section id="feature" className="bg-gray-50 py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header content */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00B14F] uppercase tracking-widest bg-[#00B14F]/10 px-3 py-1.5 rounded">
            <span>Các tính năng cốt lõi</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800">
            Các tính năng chuyên nghiệp trên Đà Nẵng Job
          </h2>
          <p className="text-gray-500 text-sm md:text-base font-light">
            Giải quyết các bài toán tuyển dụng khó khăn, mang đến trải nghiệm đột phá toàn diện cho doanh nghiệp địa phương.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-150 flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-6 space-y-4 text-center">
                {/* Image Illustration */}
                <div className="h-36 flex items-center justify-center bg-gray-50 rounded-lg p-4 overflow-hidden relative">
                  <img
                    src={feature.img}
                    alt={feature.title}
                    className="max-h-full object-contain transition-transform duration-150"
                  />
                </div>

                {/* Info Text */}
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <span className="p-1 rounded-md bg-[#00B14F]/10">{feature.icon}</span>
                    <h3 className="text-lg font-bold text-gray-800 tracking-tight group-hover:text-[#00B14F] transition-colors duration-150">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-gray-500 text-sm font-light leading-relaxed text-center">
                    {feature.desc}
                  </p>
                </div>
              </div>

              {/* Action footer */}
              <div className="bg-gray-50/50 border-t border-gray-100 px-6 py-4">
                <a
                  href={feature.link}
                  className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#00B14F] hover:text-[#00873D] uppercase tracking-wider transition-colors duration-150"
                >
                  <span>Tìm hiểu thêm</span>
                  <ChevronRight size={14} />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* bottom CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-12 max-w-md mx-auto sm:max-w-none">
          <a
            href="#banner-form"
            className="flex items-center justify-center w-full sm:w-auto border border-[#00B14F] text-[#00B14F] hover:bg-[#00B14F]/5 px-8 py-3.5 rounded-md text-sm font-bold shadow-sm transition-colors duration-150 cursor-pointer"
          >
            Nhận tư vấn ngay
          </a>
          <a
            href="#banner-form"
            className="flex items-center justify-center w-full sm:w-auto bg-[#00B14F] hover:bg-[#00873D] text-white px-8 py-3.5 rounded-md text-sm font-bold shadow-sm transition-colors duration-150"
          >
            Đăng tin ngay
          </a>
        </div>
      </div>
    </section>
  );
}
