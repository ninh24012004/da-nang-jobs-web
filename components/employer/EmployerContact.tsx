"use client";

import { Phone, MapPin, Headset } from "lucide-react";

export default function EmployerContact() {
  const haiChauThanhKhe = [
    { name: "Nguyễn Thị Lan", phone: "0968 821 848", role: "Tư vấn khu vực Hải Châu" },
    { name: "Lê Hoàng Nam", phone: "0395 460 635", role: "Tư vấn khu vực Thanh Khê" },
    { name: "Trần Thị Thu", phone: "0357 642 282", role: "Tư vấn khu vực Hải Châu" },
  ];

  const lienChieuCamLe = [
    { name: "Phan Minh Anh", phone: "0902 867 167", role: "Tư vấn khu vực Liên Chiểu" },
    { name: "Đặng Hồng Đào", phone: "0778 630 336", role: "Tư vấn khu vực Cẩm Lệ" },
    { name: "Trương Văn Khánh", phone: "0352 518 558", role: "Tư vấn khu vực Liên Chiểu" },
  ];

  return (
    <section id="contact" className="bg-white py-16 md:py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title elements */}
        <div className="text-left border-l-4 border-[#006b7a] pl-4 mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800 tracking-tight leading-snug">
            Sẵn sàng đồng hành cùng Doanh nghiệp tại Đà Nẵng
          </h2>
          <p className="text-gray-500 text-sm md:text-base font-light max-w-3xl leading-relaxed">
            Đội ngũ chuyên viên tư vấn Đà Nẵng Job luôn sẵn sàng lắng nghe, hỗ trợ tháo gỡ khó khăn tuyển dụng và đồng hành cùng quý nhà tuyển dụng địa phương.
          </p>
        </div>

        {/* Support contacts directory cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Hải Châu & Thanh Khê group */}
          <div className="bg-gray-50/50 border border-gray-150 rounded-2xl p-6 sm:p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-4 text-left">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-[#006b7a]/10 text-[#006b7a] rounded-lg">
                  <MapPin size={18} />
                </span>
                <h3 className="font-extrabold text-gray-800 text-lg tracking-tight">
                  Tư vấn Hải Châu &amp; Thanh Khê
                </h3>
              </div>
              <p className="text-xs text-gray-400 font-light">
                Hỗ trợ doanh nghiệp tại địa bàn Quận Hải Châu và Quận Thanh Khê
              </p>

              {/* Advisors List */}
              <div className="space-y-3 pt-2">
                {haiChauThanhKhe.map((advisor, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-3 rounded-xl border border-gray-100 hover:border-[#006b7a]/30 transition-colors flex items-center justify-between"
                  >
                    <div className="text-left">
                      <p className="text-xs font-semibold text-gray-800">{advisor.name}</p>
                      <p className="text-[10px] text-gray-450 mt-0.5">{advisor.role}</p>
                    </div>
                    <a
                      href={`tel:${advisor.phone.replace(/\s+/g, "")}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#006b7a]/10 hover:bg-[#006b7a]/15 text-[#006b7a] text-xs font-bold transition-colors"
                    >
                      <Phone size={12} />
                      <span>{advisor.phone}</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Liên Chiểu & Cẩm Lệ group */}
          <div className="bg-gray-50/50 border border-gray-150 rounded-2xl p-6 sm:p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-4 text-left">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-[#006b7a]/10 text-[#006b7a] rounded-lg">
                  <MapPin size={18} />
                </span>
                <h3 className="font-extrabold text-gray-800 text-lg tracking-tight">
                  Tư vấn Liên Chiểu &amp; Cẩm Lệ
                </h3>
              </div>
              <p className="text-xs text-gray-400 font-light">
                Hỗ trợ doanh nghiệp tại địa bàn Quận Liên Chiểu và Quận Cẩm Lệ
              </p>

              {/* Advisors List */}
              <div className="space-y-3 pt-2">
                {lienChieuCamLe.map((advisor, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-3 rounded-xl border border-gray-100 hover:border-[#006b7a]/30 transition-colors flex items-center justify-between"
                  >
                    <div className="text-left">
                      <p className="text-xs font-semibold text-gray-800">{advisor.name}</p>
                      <p className="text-[10px] text-gray-450 mt-0.5">{advisor.role}</p>
                    </div>
                    <a
                      href={`tel:${advisor.phone.replace(/\s+/g, "")}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#006b7a]/10 hover:bg-[#006b7a]/15 text-[#006b7a] text-xs font-bold transition-colors"
                    >
                      <Phone size={12} />
                      <span>{advisor.phone}</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Customer Support & Service Quality */}
          <div className="bg-teal-50/20 border border-gray-150 rounded-2xl p-6 sm:p-8 space-y-6 flex flex-col justify-between lg:col-span-1 md:col-span-2">
            <div className="space-y-6 text-left">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-[#006b7a]/10 text-[#006b7a] rounded-lg">
                  <Headset size={18} />
                </span>
                <h3 className="font-extrabold text-gray-800 text-lg tracking-tight">
                  Hỗ trợ kỹ thuật &amp; CSKH
                </h3>
              </div>
              <p className="text-xs text-gray-400 font-light">
                Hỗ trợ đăng tin nhanh, phản hồi lỗi hệ thống đăng tuyển hoặc giải đáp tài khoản
              </p>

              {/* Prominent Hotline */}
              <div className="bg-[#006b7a]/5 border border-[#006b7a]/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-3">
                <span className="p-3 bg-[#006b7a] text-white rounded-full shadow-md animate-pulse">
                  <Headset size={28} />
                </span>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Đường dây nóng Đà Nẵng Job
                  </p>
                  <a
                    href="tel:1900068889"
                    className="text-2xl font-black text-[#006b7a] hover:text-[#005a66] transition-colors block"
                  >
                    1900 068 889
                  </a>
                </div>
                <p className="text-[10px] text-gray-500 font-light leading-relaxed">
                  * Hoạt động liên tục từ 8:00 đến 17:30 các ngày từ thứ 2 đến thứ 7 hàng tuần.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
