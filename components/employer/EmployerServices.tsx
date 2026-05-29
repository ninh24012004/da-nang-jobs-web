"use client";

import { CheckCircle } from "lucide-react";

export default function EmployerServices() {
  const services = [
    {
      title: "Đăng tin tuyển dụng miễn phí",
      subtitle: "Free Job Posting",
      img: "https://tuyendung.topcv.vn/images/service/Macbook Pro Flying Mockup.png",
      bullets: [
        "Đăng tin tuyển dụng miễn phí hoàn toàn và không giới hạn số lượng bài đăng tuyển dụng tại Đà Nẵng.",
        "Giao diện trực quan, tạo tin tuyển dụng nhanh chóng và dễ dàng trong chưa đầy 1 phút.",
        "Tiếp cận nguồn hồ sơ CV phong phú tại khu vực miền Trung và TP Đà Nẵng.",
        "Đội ngũ quản trị viên kiểm duyệt nhanh chóng và hiển thị công khai tin trong vòng 24h.",
      ],
      badge: "Phổ biến nhất",
      reverse: false,
    },
    {
      title: "Tin tuyển dụng VIP & Tin Nổi Bật",
      subtitle: "Featured Posting Services",
      img: "https://tuyendung.topcv.vn/images/service/1.png",
      bullets: [
        "Gia tăng lượt tiếp cận của các ứng viên tìm việc chủ động tại Đà Nẵng thêm đến 300%.",
        "Tin tuyển dụng luôn hiển thị ở những vị trí nổi bật nhất trên giao diện cổng tìm việc.",
        "Đẩy tin tuyển dụng lên vị trí ưu tiên đầu trong kết quả tìm kiếm của ứng viên theo ngành nghề.",
        "Tự động gửi thông báo gợi ý tin tuyển dụng tới các ứng viên có kỹ năng phù hợp.",
      ],
      badge: "Gia tốc tuyển dụng",
      reverse: true,
    },
    {
      title: "DNJ Credits - Linh hoạt dịch vụ nền tảng",
      subtitle: "Flexible Credit System",
      img: "https://tuyendung.topcv.vn/images/service/001.png",
      bullets: [
        "Sử dụng DNJ Credit linh hoạt để chủ động mở khóa các dịch vụ tuyển dụng khác nhau trên website.",
        "Lựa chọn tiện ích theo chiến lược tuyển dụng thực tế từng thời điểm của doanh nghiệp.",
        "Dễ dàng kết hợp nhiều tiện ích cùng lúc theo chính sách quy đổi Credit tiện lợi.",
        "Tối ưu ngân sách bỏ ra với khả năng kiểm soát số dư Credit chính xác theo từng tin tuyển dụng.",
      ],
      badge: "Giải pháp thông minh",
      reverse: false,
    },
    {
      title: "CV đề xuất thông minh bằng thuật toán",
      subtitle: "AI Recommendation Profiles",
      img: "https://tuyendung.topcv.vn/images/service/ThanhMinh.png",
      bullets: [
        "Đa dạng nguồn hồ sơ ứng tuyển chất lượng cao mà không cần tốn công sức tìm kiếm lọc hồ sơ thủ công.",
        "Tiết kiệm 80% thời gian tìm kiếm nguồn ứng viên bị động trên thị trường nhân sự Đà Nẵng.",
        "Cam kết tỷ lệ khớp hồ sơ phù hợp lên đến 40% nhờ công nghệ kết nối tự động.",
        "Ứng viên trong danh mục đề xuất luôn ở trạng thái sẵn sàng tìm việc và phỏng vấn ngay.",
      ],
      badge: "Công nghệ số",
      reverse: true,
    },
    {
      title: "DNJ Branding - Truyền thông thương hiệu tuyển dụng",
      subtitle: "Employer Branding Solutions",
      img: "https://tuyendung.topcv.vn/images/service/iMac Pro Front View Mockup.png",
      bullets: [
        "Đưa hình ảnh văn hóa doanh nghiệp tiếp cận trực quan đến hàng ngàn ứng viên tiềm năng tại địa phương.",
        "Thiết kế trang doanh nghiệp chuyên nghiệp, độc quyền nâng tầm uy tín thương hiệu.",
        "Banner quảng cáo xuất hiện trên trang chủ thu hút sự chú ý của nhân tài xuất sắc tại Đà Nẵng.",
        "Báo cáo chi tiết lượt xem tin tuyển dụng, lượt click và mức độ quan tâm thương hiệu.",
      ],
      badge: "Nâng tầm thương hiệu",
      reverse: false,
    },
  ];

  return (
    <section id="service" className="bg-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header content */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006b7a] uppercase tracking-widest bg-[#006b7a]/10 px-3 py-1.5 rounded-md">
            <span>Dịch vụ cung cấp</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800">
            Dịch vụ tuyển dụng hiệu quả tại Đà Nẵng
          </h2>
          <p className="text-gray-500 text-sm md:text-base font-light">
            Các gói giải pháp hỗ trợ đắc lực doanh nghiệp tiếp cận, thu hút và chiêu mộ nhân tài địa phương một cách nhanh chóng và tối ưu.
          </p>
        </div>

        {/* Services alternating sections */}
        <div className="space-y-24">
          {services.map((service, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                service.reverse ? "lg:flex-row-reverse" : "lg:flex-row"
              } items-center gap-12 lg:gap-16`}
            >
              {/* Image side */}
              <div className="lg:w-1/2 w-full flex justify-center">
                <div className="relative group max-w-md lg:max-w-none">
                  {/* Outer circle glow decorative */}
                  <div className="absolute inset-0 bg-[#006b7a]/5 rounded-full blur-3xl pointer-events-none group-hover:scale-105 transition-transform duration-500"></div>
                  <img
                    src={service.img}
                    alt={service.title}
                    className="relative max-h-80 md:max-h-96 w-auto object-contain transform group-hover:-translate-y-1 transition-all duration-500"
                  />
                </div>
              </div>

              {/* Text side */}
              <div className="lg:w-1/2 space-y-6 text-left">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[#006b7a] uppercase tracking-wider bg-[#006b7a]/10 px-2.5 py-1 rounded">
                    {service.badge}
                  </span>
                  <span className="text-xs font-medium text-gray-400">
                    {service.subtitle}
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-800 tracking-tight leading-snug">
                  {service.title}
                </h3>

                {/* Bullets List */}
                <ul className="space-y-4">
                  {service.bullets.map((bullet, bulletIdx) => (
                    <li key={bulletIdx} className="flex items-start gap-3">
                      <CheckCircle size={18} className="text-[#006b7a] mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600 text-sm md:text-base font-light leading-relaxed">
                        {bullet}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                  <a
                    href="#banner-form"
                    onClick={(e) => {
                      e.preventDefault();
                      const element = document.querySelector("#banner-form");
                      if (element) element.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="flex items-center justify-center w-full sm:w-auto border border-[#006b7a] text-[#006b7a] hover:bg-[#006b7a]/5 px-6 py-3 rounded-lg text-sm font-bold shadow-sm transition-all active:scale-[0.98]"
                  >
                    Tư vấn dịch vụ
                  </a>
                  <a
                    href="#banner-form"
                    onClick={(e) => {
                      e.preventDefault();
                      const element = document.querySelector("#banner-form");
                      if (element) element.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="flex items-center justify-center w-full sm:w-auto bg-[#006b7a] hover:bg-[#005a66] text-white px-6 py-3 rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
                  >
                    Đăng ký ngay
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
