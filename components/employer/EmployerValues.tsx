"use client";

import { CheckCircle2, ShieldCheck, Briefcase } from "lucide-react";

export default function EmployerValues() {
  const values = [
    {
      title: "Đối với Doanh nghiệp",
      icon: <ShieldCheck className="text-[#006b7a]" size={24} />,
      img: "https://tuyendung.topcv.vn/images/service/92836.png",
      bullets: [
        "Lợi thế cạnh tranh vượt trội: Chiêu mộ nhân sự xuất sắc, đẩy nhanh tiến trình chuyển đổi số và phát triển doanh nghiệp.",
        "Tiết kiệm chi phí vận hành: Rút ngắn thời gian tuyển dụng và tối ưu ngân sách truyền thông nhờ tệp ứng viên địa phương sẵn có.",
        "Định vị thương hiệu uy tín: Xây dựng thương hiệu nhà tuyển dụng chuyên nghiệp hàng đầu tại địa bàn Đà Nẵng.",
        "Hỗ trợ phân tích chuyên sâu: Cung cấp báo cáo phễu chuyển đổi để tối ưu hóa kế hoạch nhân sự định kỳ.",
      ],
    },
    {
      title: "Đối với Bộ phận Tuyển dụng",
      icon: <Briefcase className="text-[#006b7a]" size={24} />,
      img: "https://tuyendung.topcv.vn/images/service/17732.png",
      bullets: [
        "Quản lý hồ sơ tập trung: Dễ dàng quản lý toàn bộ hồ sơ ứng viên nhận được theo từng tin tuyển dụng khoa học.",
        "Sàng lọc thông minh, nhanh chóng: Phân nhóm trạng thái ứng tuyển giúp tăng tốc tốc độ duyệt hồ sơ lên 3 lần.",
        "Tương tác chuyên nghiệp: Gửi thông tin thông báo trạng thái, phản hồi kết quả phỏng vấn nhanh tới ứng viên.",
        "Đánh giá năng lực khách quan: Tích hợp thiết lập bài test năng lực online, nâng cao tỷ lệ tuyển chọn chính xác ứng viên.",
      ],
    },
  ];

  return (
    <section className="bg-gray-50 py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header content */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006b7a] uppercase tracking-widest bg-[#006b7a]/10 px-3 py-1.5 rounded-md">
            <span>Giá trị mang lại</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800">
            Giá trị cốt lõi mang đến cho doanh nghiệp
          </h2>
          <p className="text-gray-500 text-sm md:text-base font-light">
            Chúng tôi tự hào là cầu nối tin cậy cho sự phát triển nhân sự vững mạnh của cộng đồng doanh nghiệp Đà Nẵng.
          </p>
        </div>

        {/* Value panels grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {values.map((val, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6 sm:p-10 space-y-8 text-left flex flex-col justify-between"
            >
              <div className="space-y-6">
                {/* Illustration wrapper */}
                <div className="rounded-xl overflow-hidden bg-gray-50 border border-gray-100/50 p-4 flex justify-center">
                  <img
                    src={val.img}
                    alt={val.title}
                    className="max-h-56 w-auto object-contain hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Section title */}
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#006b7a]/10 rounded-lg">{val.icon}</div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-gray-800 tracking-tight">
                    {val.title}
                  </h3>
                </div>

                {/* Bullet List */}
                <ul className="space-y-4">
                  {val.bullets.map((bullet, bIdx) => {
                    // Split bullet by ':' to bold the header if applicable
                    const parts = bullet.split(":");
                    return (
                      <li key={bIdx} className="flex items-start gap-3">
                        <CheckCircle2 size={18} className="text-[#006b7a] mt-0.5 flex-shrink-0" />
                        <span className="text-gray-650 text-sm md:text-base font-light leading-relaxed">
                          {parts.length > 1 ? (
                            <>
                              <strong className="font-semibold text-gray-800">{parts[0]}:</strong>
                              <span>{parts.slice(1).join(":")}</span>
                            </>
                          ) : (
                            <span>{bullet}</span>
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
