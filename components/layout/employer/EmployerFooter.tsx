"use client";

import Link from "next/link";
import { Award, ShieldAlert, BadgeCheck } from "lucide-react";
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

  const ecosystem = [
    { name: "TopCV", logo: "https://tuyendung.topcv.vn/images/ecosystem/topcv_large.svg?v=1", href: "https://www.topcv.vn/" },
    { name: "HappyTime", logo: "https://tuyendung.topcv.vn/images/ecosystem/happy-time_large.svg?v=1", href: "https://www.happytime.vn/" },
    { name: "TestCenter", logo: "https://tuyendung.topcv.vn/images/ecosystem/test-center_large.svg?v=1", href: "https://www.testcenter.vn/" },
    { name: "S-Hiring", logo: "https://tuyendung.topcv.vn/images/ecosystem/s-hiring_large.svg?v=1", href: "https://shiring.ai/" },
  ];

  return (
    <footer className="bg-white border-t border-gray-200 text-gray-600 text-sm">
      {/* Top Footer Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Brand and badges column */}
          <div className="md:col-span-4 space-y-6">
            <Link href="/employer" className="block">
              <h1 className="text-4xl font-black tracking-tight">
                <span className="text-black">DN</span>{" "}
                <span className="text-[#006b7a]">JOBS</span>
              </h1>
              <p className="text-xs text-gray-450 mt-1 font-medium uppercase tracking-wider">
                Cổng Việc Làm &amp; Tuyển Dụng Đà Nẵng
              </p>
            </Link>

            {/* Badges */}
            <div className="flex items-center gap-4 py-2 border-b border-gray-100 pb-6">
              <a
                href="https://bit.ly/topcvstartupaccelerator"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-85 transition-opacity"
              >
                <img
                  src="https://static.topcv.vn/srp/website/images/logo-google-for-startup.png"
                  alt="Google for Startups Accelerator"
                  className="h-7 w-auto object-contain"
                />
              </a>
              <a
                href="https://www.dmca.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-85 transition-opacity"
              >
                <img
                  src="https://images.dmca.com/Badges/_dmca_premi_badge_2.png?ID=1b16a667-a95e-4730-846f-46f962522fce"
                  alt="DMCA Protected"
                  className="h-9 w-auto object-contain"
                />
              </a>
              <a
                href="http://online.gov.vn"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-85 transition-opacity"
              >
                <img
                  src="https://www.topcv.vn/images/bct.jpg"
                  alt="Bộ Công Thương"
                  className="h-8 w-auto object-contain"
                />
              </a>
            </div>

            {/* Downloads */}
            <div>
              <h5 className="font-bold text-gray-800 uppercase tracking-wider text-xs mb-3">
                Tải ứng dụng Đà Nẵng Job
              </h5>
              <div className="flex gap-3">
                <a
                  href="https://apps.apple.com/us/app/id1469009831"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <img
                    src="https://static.topcv.vn/srp/website/images/app/appstore.jpg"
                    alt="App Store"
                    className="h-9 rounded-md object-cover shadow-sm"
                  />
                </a>
                <a
                  href="https://play.google.com/store/apps/details?id=com.topcvemployer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <img
                    src="https://static.topcv.vn/srp/website/images/app/googleplay.jpg"
                    alt="Google Play"
                    className="h-9 rounded-md object-cover shadow-sm"
                  />
                </a>
              </div>
            </div>
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
                      className="text-gray-650 hover:text-[#006b7a] hover:underline transition-colors"
                    >
                      {link.label}
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
                      className="text-gray-650 hover:text-[#006b7a] hover:underline transition-colors"
                    >
                      {link.label}
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
                        className="text-gray-650 hover:text-[#006b7a] hover:underline transition-colors"
                      >
                        {link.label}
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
                    href="https://www.facebook.com/topcvbiz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-gray-50 hover:bg-teal-50 hover:text-[#006b7a] transition-all text-gray-600 shadow-sm"
                  >
                    <FaFacebook size={18} />
                  </a>
                  <a
                    href="https://www.linkedin.com/company/13378647/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-gray-50 hover:bg-teal-50 hover:text-[#006b7a] transition-all text-gray-600 shadow-sm"
                  >
                    <FaLinkedin size={18} />
                  </a>
                  <a
                    href="https://www.youtube.com/@topcvbusiness7093"
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-4">
              <h4 className="font-bold text-gray-800 text-base">
                Ban Quản Trị Cổng Thông Tin Đà Nẵng Job
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-2">
                  <p className="flex items-start gap-1">
                    <span className="font-semibold text-gray-700 min-w-[70px]">Giấy phép:</span>
                    <span>ĐKKD số 0107307178 cấp ngày 25/01/2016</span>
                  </p>
                  <p className="flex items-start gap-1">
                    <span className="font-semibold text-gray-700 min-w-[70px]">Hỗ trợ:</span>
                    <span>Hệ thống tuyển dụng phân loại tự động tại Đà Nẵng</span>
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="flex items-start gap-1">
                    <span className="font-semibold text-gray-700 min-w-[70px]">Trụ sở chính:</span>
                    <span>Số 254 Nguyễn Văn Linh, P. Thạc Gián, Q. Thanh Khê, TP Đà Nẵng</span>
                  </p>
                  <p className="flex items-start gap-1">
                    <span className="font-semibold text-gray-700 min-w-[70px]">Văn phòng:</span>
                    <span>Số 24C Phan Đăng Lưu, P. Hòa Cường Bắc, Q. Hải Châu, TP Đà Nẵng</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row items-center lg:justify-end gap-6">
              <div className="text-center sm:text-right hidden sm:block">
                <p className="text-xs text-gray-500 mb-1">Quét mã để truy cập nhanh</p>
                <p className="text-xs font-semibold text-[#006b7a]">Da Nang Jobs Platform</p>
              </div>
              <img
                src="https://tuyendung.topcv.vn/images/ecosystem/qr-code.svg"
                alt="QR Code"
                className="h-20 w-20 p-1 bg-white border border-gray-200 rounded-lg shadow-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Ecosystem & Copyright Section */}
      <div className="border-t border-gray-200 bg-gray-50 py-8 text-center sm:text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 w-full md:w-auto">
              <h5 className="font-bold text-gray-800 text-xs uppercase tracking-wider text-center md:text-left">
                Hệ sinh thái đối tác công nghệ
              </h5>
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 lg:gap-8">
                {ecosystem.map((eco) => (
                  <a
                    key={eco.name}
                    href={eco.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:scale-105 active:scale-95 transition-transform"
                  >
                    <img
                      src={eco.logo}
                      alt={eco.name}
                      className="h-10 lg:h-12 w-auto object-contain filter grayscale hover:grayscale-0 opacity-75 hover:opacity-100 transition-all duration-300"
                    />
                  </a>
                ))}
              </div>
            </div>
            <div className="text-xs text-gray-500 text-center md:text-right md:min-w-[280px]">
              <p className="font-semibold text-gray-600">© 2014 - 2026 Đà Nẵng Jobs Portal.</p>
              <p>All rights reserved. Phát triển cho Đề tài cổng kết nối nhân sự Đà Nẵng.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
