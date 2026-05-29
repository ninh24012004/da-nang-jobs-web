"use client";

import Link from "next/link";
import { FaFacebook, FaLinkedin, FaYoutube } from "react-icons/fa";

export default function EmployerFooter() {
  const footerLinks = {
    about: [
      { label: "Giới thiệu cổng việc làm", href: "#introduction-hero" },
      { label: "Tuyển dụng", href: "#" },
      { label: "Liên hệ hỗ trợ", href: "#contact" },
      { label: "Chính sách quyền riêng tư", href: "#" },
      { label: "Điều khoản dịch vụ", href: "#" },
    ],
    candidates: [
      { label: "Tìm việc làm Đà Nẵng", href: "/candidate", external: false },
      { label: "Mẫu CV xin việc đẹp", href: "#" },
      { label: "Đánh giá trắc nghiệm MBTI", href: "#" },
      { label: "Cẩm nang hướng dẫn viết CV", href: "#" },
    ],
    partners: [
      { label: "Cộng đồng doanh nghiệp", href: "#" },
      { label: "Hợp tác trường đại học", href: "#" },
      { label: "Hợp tác đoàn thể, CLB", href: "#" },
    ],
  };

  return (
    <footer className="bg-white border-t border-gray-200 text-gray-600 text-sm">
      {/* Top Footer Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Brand and Info Column */}
          <div className="md:col-span-4 space-y-4">
            <Link href="/employer" className="block">
              <h1 className="text-4xl font-black tracking-tight">
                <span className="text-black">DN</span>{" "}
                <span className="text-[#006b7a]">JOBS</span>
              </h1>
              <p className="text-xs text-gray-400 mt-1 font-medium uppercase tracking-wider">
                Cổng Việc Làm &amp; Tuyển Dụng Đà Nẵng
              </p>
            </Link>
            <p className="text-xs text-gray-500 leading-relaxed max-w-sm mt-3">
              Cổng thông tin việc làm uy tín kết nối doanh nghiệp và người lao động tại Đà Nẵng. Hỗ trợ tìm kiếm cơ hội nghề nghiệp nhanh chóng, chính xác và hiệu quả.
            </p>
          </div>

          {/* Links Columns */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {/* About Column */}
            <div>
              <h5 className="font-bold text-gray-800 uppercase tracking-wider text-xs mb-4">
                Về Đà Nẵng Job
              </h5>
              <ul className="space-y-2">
                {footerLinks.about.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-gray-650 hover:text-[#006b7a] hover:underline transition-colors flex items-center flex-wrap gap-1"
                    >
                      <span>{link.label}</span>
                      {link.href === "#" && (
                        <span className="text-[10px] text-gray-400 font-normal italic">(Sắp ra mắt)</span>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Candidate Column */}
            <div>
              <h5 className="font-bold text-gray-800 uppercase tracking-wider text-xs mb-4">
                Ứng viên
              </h5>
              <ul className="space-y-2">
                {footerLinks.candidates.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-gray-650 hover:text-[#006b7a] hover:underline transition-colors flex items-center flex-wrap gap-1"
                    >
                      <span>{link.label}</span>
                      {link.href === "#" && (
                        <span className="text-[10px] text-gray-400 font-normal italic">(Sắp ra mắt)</span>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Partners & Socials Column */}
            <div className="col-span-2 sm:col-span-1 space-y-6">
              <div>
                <h5 className="font-bold text-gray-800 uppercase tracking-wider text-xs mb-4">
                  Đối tác
                </h5>
                <ul className="space-y-2">
                  {footerLinks.partners.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-gray-650 hover:text-[#006b7a] hover:underline transition-colors flex items-center flex-wrap gap-1"
                      >
                        <span>{link.label}</span>
                        {link.href === "#" && (
                          <span className="text-[10px] text-gray-400 font-normal italic">(Sắp ra mắt)</span>
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h5 className="font-bold text-gray-800 uppercase tracking-wider text-xs mb-3">
                  Kết nối với chúng tôi
                </h5>
                <div className="flex gap-3">
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-gray-50 hover:bg-teal-50 hover:text-[#006b7a] transition-all text-gray-600 shadow-sm"
                  >
                    <FaFacebook size={18} />
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-gray-50 hover:bg-teal-50 hover:text-[#006b7a] transition-all text-gray-600 shadow-sm"
                  >
                    <FaLinkedin size={18} />
                  </a>
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-gray-50 hover:bg-teal-50 hover:text-[#006b7a] transition-all text-gray-600 shadow-sm"
                  >
                    <FaYoutube size={18} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Office Addresses & Legal Section */}
      <div className="border-t border-gray-150 bg-gray-50/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            <h4 className="font-bold text-gray-800 text-base">
              Ban Quản Trị Cổng Thông Tin Đà Nẵng Job
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-2">
                <p className="flex items-start gap-1">
                  <span className="font-semibold text-gray-700 min-w-[80px]">Giấy phép:</span>
                  <span>ĐKKD số 0107307178 cấp ngày 25/01/2016</span>
                </p>
                <p className="flex items-start gap-1">
                  <span className="font-semibold text-gray-700 min-w-[80px]">Hỗ trợ:</span>
                  <span>Hệ thống tuyển dụng phân loại tự động tại Đà Nẵng</span>
                </p>
              </div>
              <div className="space-y-2">
                <p className="flex items-start gap-1">
                  <span className="font-semibold text-gray-700 min-w-[80px]">Trụ sở chính:</span>
                  <span>Số 254 Nguyễn Văn Linh, P. Thạc Gián, Q. Thanh Khê, TP Đà Nẵng</span>
                </p>
                <p className="flex items-start gap-1">
                  <span className="font-semibold text-gray-700 min-w-[80px]">Văn phòng:</span>
                  <span>Số 24C Phan Đăng Lưu, P. Hòa Cường Bắc, Q. Hải Châu, TP Đà Nẵng</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="border-t border-gray-200 bg-gray-50 py-6 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-medium text-gray-600">© 2014 - 2026 Đà Nẵng Jobs Portal. All rights reserved.</p>
          <p>Phát triển cho Đề tài cổng kết nối nhân sự Đà Nẵng.</p>
        </div>
      </div>
    </footer>
  );
}
