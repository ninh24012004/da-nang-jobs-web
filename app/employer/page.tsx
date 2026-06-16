"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle,
  Building,
  Users,
  Briefcase,
  TrendingUp,
  FileText,
  HelpCircle,
  ArrowRight,
  ChevronDown,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  PlusCircle,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

import EmployerHeader from "@/components/layout/employer/EmployerHeader";
import EmployerFooter from "@/components/layout/employer/EmployerFooter";

export default function EmployerPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [submittingForm, setSubmittingForm] = useState(false);
  const [consultForm, setConsultForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    companyName: "",
    serviceNeed: "Đăng tin tuyển dụng"
  });

  const handleConsultSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingForm(true);
    setTimeout(() => {
      toast.success("Gửi yêu cầu tư vấn thành công! Đội ngũ tư vấn sẽ liên hệ với quý đối tác trong vòng 2 giờ làm việc.");
      setConsultForm({
        fullName: "",
        phone: "",
        email: "",
        companyName: "",
        serviceNeed: "Đăng tin tuyển dụng"
      });
      setSubmittingForm(false);
    }, 1000);
  };

  const faqs = [
    {
      q: "Đăng tin tuyển dụng trên DN Jobs có mất phí không?",
      a: "Doanh nghiệp có thể đăng tin tuyển dụng cơ bản hoàn toàn MIỄN PHÍ. Tin tuyển dụng cơ bản hiển thị trong 14 ngày và tiếp cận lượng ứng viên tiêu chuẩn tại Đà Nẵng."
    },
    {
      q: "Làm thế nào để tin tuyển dụng được hiển thị ưu tiên?",
      a: "Quý công ty có thể nâng cấp lên Gói Nâng Cao hoặc Gói VIP. Tin tuyển dụng sẽ được gắn nhãn Huy hiệu Xác thực, ghim ở đầu trang tìm kiếm và được đẩy thông báo tới các ứng viên có kỹ năng phù hợp."
    },
    {
      q: "DN Jobs hỗ trợ tìm kiếm ứng viên ở những lĩnh vực nào?",
      a: "Chúng tôi hỗ trợ kết nối nhân sự đa ngành nghề tại Đà Nẵng, đặc biệt là các ngành có nhu cầu tuyển dụng cao như: Công nghệ thông tin, Du lịch - Nhà hàng - Khách sạn, Kinh doanh - Marketing, Hành chính - Nhân sự, và Kỹ thuật - Sản xuất."
    },
    {
      q: "Quy trình thanh toán và xuất hóa đơn dịch vụ như thế nào?",
      a: "Chúng tôi hỗ trợ chuyển khoản ngân hàng và các ví điện tử thông dụng. Tất cả các dịch vụ trả phí của doanh nghiệp đều được cung cấp hóa đơn giá trị gia tăng (VAT) hợp pháp đầy đủ."
    }
  ];

  return (
    <div className="bg-[#F8FAFC] min-h-screen flex flex-col text-slate-800 font-sans">
      {/* Reusable Header */}
      <EmployerHeader />

      <main className="flex-grow pt-[72px]">
        
        {/* 1. HERO SECTION */}
        <section id="introduction-hero" className="relative bg-[#0F172A] text-white py-20 px-4 overflow-hidden border-b border-slate-800">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,177,79,0.08),transparent)] pointer-events-none"></div>
          
          <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[6px] bg-[#00B14F]/10 border border-[#00B14F]/20 text-[#00B14F] text-xs font-semibold uppercase tracking-wider mx-auto">
              <Sparkles size={12} />
              <span>Đối tác tuyển dụng chiến lược tại Đà Nẵng</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight max-w-4xl mx-auto">
              Giải Pháp Tuyển Dụng Nhân Sự <br />
              <span className="text-[#00B14F]">Toàn Diện & Hiệu Quả</span> Tại Đà Nẵng
            </h1>
            
            <p className="text-slate-400 text-xs sm:text-sm md:text-base max-w-2xl mx-auto font-light leading-relaxed">
              Tiếp cận hơn 100,000+ ứng viên địa phương được xác thực. Kết nối nhà tuyển dụng và nhân tài nhanh chóng bằng thuật toán lọc thông minh.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 select-none">
              <Link
                href="/employer/dashboard?tab=post-job"
                className="w-full sm:w-auto px-7 py-3 bg-[#00B14F] hover:bg-[#00873D] text-white font-bold rounded-[6px] text-sm transition-colors text-center shadow-sm flex items-center justify-center gap-2"
              >
                <PlusCircle size={16} />
                <span>Đăng tin tuyển dụng ngay</span>
              </Link>
              <a
                href="#banner-form"
                className="w-full sm:w-auto px-7 py-3 border border-slate-700 hover:bg-slate-800 text-white font-bold rounded-[6px] text-sm transition-colors text-center"
              >
                <span>Nhận tư vấn giải pháp</span>
              </a>
            </div>
          </div>
        </section>

        {/* 2. STATS SECTION */}
        <section className="py-12 bg-white border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="space-y-1">
                <p className="text-2xl sm:text-3xl font-extrabold text-[#00B14F]">5,000+</p>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Doanh nghiệp tin dùng</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl sm:text-3xl font-extrabold text-[#00B14F]">120,000+</p>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Hồ sơ ứng viên</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl sm:text-3xl font-extrabold text-[#00B14F]">15,000+</p>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Việc làm kết nối</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl sm:text-3xl font-extrabold text-[#00B14F]">94.8%</p>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Tỷ lệ tuyển thành công</p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. CORE BENEFITS SECTION */}
        <section id="service" className="py-16 px-4 bg-[#F8FAFC]">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-slate-800">Tại sao nên tuyển dụng tại DN Jobs?</h2>
              <p className="text-xs text-slate-500 max-w-xl mx-auto">
                Chúng tôi mang lại giải pháp tuyển dụng tối ưu chi phí và tăng hiệu quả kết nối nhân tài địa phương.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1 */}
              <div className="bg-white p-6 rounded-[8px] border border-slate-200 shadow-sm space-y-4 text-left">
                <div className="h-10 w-10 bg-[#00B14F]/10 rounded-[6px] flex items-center justify-center text-[#00B14F]">
                  <Users size={20} />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">Hồ sơ xác thực chất lượng</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Ứng viên được xác minh thông tin liên lạc và trình độ chuyên môn, giảm thiểu tối đa hồ sơ ảo hoặc không liên hệ được.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-white p-6 rounded-[8px] border border-slate-200 shadow-sm space-y-4 text-left">
                <div className="h-10 w-10 bg-[#00B14F]/10 rounded-[6px] flex items-center justify-center text-[#00B14F]">
                  <Sparkles size={20} />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">Công nghệ lọc thông minh</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Thuật toán đối sánh đề xuất danh sách ứng viên phù hợp trực tiếp dựa trên yêu cầu kỹ năng và vị trí đăng tuyển.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-white p-6 rounded-[8px] border border-slate-200 shadow-sm space-y-4 text-left">
                <div className="h-10 w-10 bg-[#00B14F]/10 rounded-[6px] flex items-center justify-center text-[#00B14F]">
                  <TrendingUp size={20} />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">Tối ưu hóa ngân sách</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Chi phí tuyển dụng cực kỳ linh hoạt. Hỗ trợ đăng tin cơ bản miễn phí giúp doanh nghiệp khởi nghiệp tiếp cận ứng viên dễ dàng.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. PRICING PACKAGES SECTION */}
        <section className="py-16 px-4 bg-white border-t border-b border-slate-200">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-slate-800">Các gói dịch vụ tuyển dụng</h2>
              <p className="text-xs text-slate-500 max-w-xl mx-auto">
                Lựa chọn gói dịch vụ phù hợp nhất với quy mô và tần suất tuyển dụng của doanh nghiệp của bạn.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              {/* Package 1 */}
              <div className="bg-white border border-slate-200 rounded-[8px] p-6 flex flex-col justify-between text-left shadow-sm hover:border-slate-300 transition-colors">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-800 text-sm">Gói Cơ Bản</h4>
                    <p className="text-xs text-slate-500">Phù hợp nhu cầu tuyển dụng đột xuất</p>
                  </div>
                  <div className="text-2xl font-extrabold text-slate-800">0đ <span className="text-xs text-slate-400 font-normal">/ tin</span></div>
                  <ul className="space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-4">
                    <li className="flex items-center gap-1.5"><CheckCircle size={14} className="text-[#00B14F]" /> Hiển thị tin tuyển dụng trong 14 ngày</li>
                    <li className="flex items-center gap-1.5"><CheckCircle size={14} className="text-[#00B14F]" /> Tiếp cận ứng viên tiêu chuẩn</li>
                    <li className="flex items-center gap-1.5 text-slate-400"><CheckCircle size={14} className="text-slate-200" /> Không hỗ trợ ghim ưu tiên</li>
                    <li className="flex items-center gap-1.5 text-slate-400"><CheckCircle size={14} className="text-slate-200" /> Không gắn nhãn Huy hiệu Xác thực</li>
                  </ul>
                </div>
                <Link
                  href="/employer/dashboard?tab=post-job"
                  className="w-full text-center py-2.5 mt-6 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-[6px] text-xs transition-colors"
                >
                  Bắt đầu đăng tin
                </Link>
              </div>

              {/* Package 2 */}
              <div className="bg-white border-2 border-[#00B14F] rounded-[8px] p-6 flex flex-col justify-between text-left shadow-md relative">
                <div className="absolute top-0 right-6 -translate-y-1/2 bg-[#00B14F] text-white text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-[4px]">
                  Phổ biến nhất
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-800 text-sm">Gói Nâng Cao</h4>
                    <p className="text-xs text-slate-500">Tối ưu hóa khả năng hiển thị và chuyển đổi CV</p>
                  </div>
                  <div className="text-2xl font-extrabold text-slate-800">990.000đ <span className="text-xs text-slate-400 font-normal">/ tháng</span></div>
                  <ul className="space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-4">
                    <li className="flex items-center gap-1.5"><CheckCircle size={14} className="text-[#00B14F]" /> Hiển thị tin tuyển dụng trong 30 ngày</li>
                    <li className="flex items-center gap-1.5"><CheckCircle size={14} className="text-[#00B14F]" /> Huy hiệu Xác Thực tăng 60% lượt xem</li>
                    <li className="flex items-center gap-1.5"><CheckCircle size={14} className="text-[#00B14F]" /> Gợi ý danh sách 10 CV phù hợp tự động</li>
                    <li className="flex items-center gap-1.5"><CheckCircle size={14} className="text-[#00B14F]" /> Hỗ trợ hiển thị trên trang chủ DN Jobs</li>
                  </ul>
                </div>
                <a
                  href="#banner-form"
                  className="w-full text-center py-2.5 mt-6 bg-[#00B14F] hover:bg-[#00873D] text-white font-bold rounded-[6px] text-xs transition-colors border-none"
                >
                  Mua gói dịch vụ
                </a>
              </div>

              {/* Package 3 */}
              <div className="bg-white border border-slate-200 rounded-[8px] p-6 flex flex-col justify-between text-left shadow-sm hover:border-slate-300 transition-colors">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-800 text-sm">Gói VIP Enterprise</h4>
                    <p className="text-xs text-slate-500">Tuyển dụng quy mô lớn, liên tục</p>
                  </div>
                  <div className="text-2xl font-extrabold text-slate-800">2.490.000đ <span className="text-xs text-slate-400 font-normal">/ tháng</span></div>
                  <ul className="space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-4">
                    <li className="flex items-center gap-1.5"><CheckCircle size={14} className="text-[#00B14F]" /> Không giới hạn số tin tuyển dụng</li>
                    <li className="flex items-center gap-1.5"><CheckCircle size={14} className="text-[#00B14F]" /> Tin ghim đầu mục tìm kiếm cố định</li>
                    <li className="flex items-center gap-1.5"><CheckCircle size={14} className="text-[#00B14F]" /> Quyền truy cập mở kho 50 CV tự chọn / tuần</li>
                    <li className="flex items-center gap-1.5"><CheckCircle size={14} className="text-[#00B14F]" /> Tư vấn viên tuyển dụng hỗ trợ riêng 24/7</li>
                  </ul>
                </div>
                <a
                  href="#banner-form"
                  className="w-full text-center py-2.5 mt-6 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-[6px] text-xs transition-colors"
                >
                  Liên hệ báo giá doanh nghiệp
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 5. PROCESS SECTION */}
        <section className="py-16 px-4 bg-[#F8FAFC]">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-slate-800">Quy trình đăng tuyển 4 bước đơn giản</h2>
              <p className="text-xs text-slate-500 max-w-xl mx-auto">
                Bắt đầu kết nối với nguồn nhân lực chất lượng tại Đà Nẵng chỉ trong vài phút.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2 text-left bg-white p-5 border border-slate-200 rounded-[8px] shadow-sm">
                <div className="text-xs font-bold text-[#00B14F] bg-[#00B14F]/10 px-2 py-0.5 rounded-[4px] w-fit">Bước 1</div>
                <h4 className="font-bold text-slate-800 text-sm">Đăng ký tài khoản</h4>
                <p className="text-[11px] text-slate-500 leading-normal">Tạo tài khoản nhà tuyển dụng và cập nhật thông tin giới thiệu công ty.</p>
              </div>
              <div className="space-y-2 text-left bg-white p-5 border border-slate-200 rounded-[8px] shadow-sm">
                <div className="text-xs font-bold text-[#00B14F] bg-[#00B14F]/10 px-2 py-0.5 rounded-[4px] w-fit">Bước 2</div>
                <h4 className="font-bold text-slate-800 text-sm">Soạn tin tuyển dụng</h4>
                <p className="text-[11px] text-slate-500 leading-normal">Điền mô tả công việc, mức lương, yêu cầu kinh nghiệm và địa chỉ làm việc.</p>
              </div>
              <div className="space-y-2 text-left bg-white p-5 border border-slate-200 rounded-[8px] shadow-sm">
                <div className="text-xs font-bold text-[#00B14F] bg-[#00B14F]/10 px-2 py-0.5 rounded-[4px] w-fit">Bước 3</div>
                <h4 className="font-bold text-slate-800 text-sm">Kiểm duyệt nhanh</h4>
                <p className="text-[11px] text-slate-500 leading-normal">Đội ngũ kỹ thuật hỗ trợ duyệt tin và đẩy hiển thị chỉ trong vòng 1 giờ.</p>
              </div>
              <div className="space-y-2 text-left bg-white p-5 border border-slate-200 rounded-[8px] shadow-sm">
                <div className="text-xs font-bold text-[#00B14F] bg-[#00B14F]/10 px-2 py-0.5 rounded-[4px] w-fit">Bước 4</div>
                <h4 className="font-bold text-slate-800 text-sm">Nhận hồ sơ ứng tuyển</h4>
                <p className="text-[11px] text-slate-500 leading-normal">Ứng viên nộp CV, quản lý trực tiếp danh sách và đổi trạng thái phỏng vấn.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. CONSULTATION FORM & CONTACT DIRECTORY */}
        <section id="contact" className="py-16 px-4 bg-white border-b border-slate-200">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Contact details left */}
            <div className="lg:col-span-5 text-left space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-800">Liên hệ với bộ phận hỗ trợ doanh nghiệp</h2>
                <p className="text-xs text-slate-500 leading-relaxed font-light">
                  DN Jobs cam kết đồng hành cùng nhà tuyển dụng tại Đà Nẵng. Vui lòng liên hệ trực tiếp qua hotline hoặc văn phòng giao dịch để nhận báo giá hoặc giải đáp kỹ thuật nhanh nhất.
                </p>
              </div>

              <div className="space-y-4 text-xs font-semibold text-slate-650">
                <div className="flex items-center gap-3">
                  <span className="p-2 bg-[#00B14F]/10 rounded-[6px] text-[#00B14F]"><Phone size={16} /></span>
                  <div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Hotline hỗ trợ</p>
                    <p className="text-xs font-bold text-slate-850">0236 730 7178 (Nhánh 2)</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="p-2 bg-[#00B14F]/10 rounded-[6px] text-[#00B14F]"><Mail size={16} /></span>
                  <div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Email liên hệ</p>
                    <p className="text-xs font-bold text-slate-855">employer@danangjobs.vn</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="p-2 bg-[#00B14F]/10 rounded-[6px] text-[#00B14F]"><MapPin size={16} /></span>
                  <div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Địa chỉ giao dịch</p>
                    <p className="text-xs font-bold text-slate-855 leading-normal">254 Nguyễn Văn Linh, Q. Thanh Khê, Đà Nẵng</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Consultation Form Right */}
            <div id="banner-form" className="lg:col-span-7 bg-slate-50 p-6 sm:p-8 rounded-[8px] border border-slate-200 shadow-sm text-left">
              <h3 className="text-base font-bold text-slate-800">Yêu cầu tư vấn dịch vụ</h3>
              <p className="text-[11px] text-slate-450 mt-0.5 mb-5 font-normal">Quý công ty vui lòng gửi thông tin, chuyên viên của chúng tôi sẽ liên hệ lại ngay.</p>

              <form onSubmit={handleConsultSubmit} className="space-y-4 text-xs font-semibold">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-500 uppercase tracking-wider">Họ và tên người liên hệ <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Nguyễn Văn A"
                      value={consultForm.fullName}
                      onChange={(e) => setConsultForm({ ...consultForm, fullName: e.target.value })}
                      className="w-full bg-white border border-slate-200 focus:border-[#00B14F] focus:ring-1 focus:ring-[#00B14F] rounded-[6px] px-3.5 py-2.5 text-slate-700 outline-none font-medium transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-slate-500 uppercase tracking-wider">Số điện thoại <span className="text-red-500">*</span></label>
                    <input
                      type="tel"
                      required
                      placeholder="Ví dụ: 0905 123 456"
                      value={consultForm.phone}
                      onChange={(e) => setConsultForm({ ...consultForm, phone: e.target.value })}
                      className="w-full bg-white border border-slate-200 focus:border-[#00B14F] focus:ring-1 focus:ring-[#00B14F] rounded-[6px] px-3.5 py-2.5 text-slate-700 outline-none font-medium transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-500 uppercase tracking-wider">Email doanh nghiệp <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      required
                      placeholder="hr@company.com"
                      value={consultForm.email}
                      onChange={(e) => setConsultForm({ ...consultForm, email: e.target.value })}
                      className="w-full bg-white border border-slate-200 focus:border-[#00B14F] focus:ring-1 focus:ring-[#00B14F] rounded-[6px] px-3.5 py-2.5 text-slate-700 outline-none font-medium transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-slate-500 uppercase tracking-wider">Tên công ty / Tổ chức <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Công ty TNHH DaNangTech"
                      value={consultForm.companyName}
                      onChange={(e) => setConsultForm({ ...consultForm, companyName: e.target.value })}
                      className="w-full bg-white border border-slate-200 focus:border-[#00B14F] focus:ring-1 focus:ring-[#00B14F] rounded-[6px] px-3.5 py-2.5 text-slate-700 outline-none font-medium transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-500 uppercase tracking-wider block">Dịch vụ quan tâm</label>
                  <select
                    value={consultForm.serviceNeed}
                    onChange={(e) => setConsultForm({ ...consultForm, serviceNeed: e.target.value })}
                    className="w-full bg-white border border-slate-200 focus:border-[#00B14F] focus:ring-1 focus:ring-[#00B14F] rounded-[6px] px-3.5 py-2.5 text-slate-700 outline-none cursor-pointer transition-colors"
                  >
                    <option value="Đăng tin tuyển dụng">Đăng tin tuyển dụng ghim đầu</option>
                    <option value="Mua gói dịch vụ VIP">Mua gói dịch vụ VIP Enterprise</option>
                    <option value="Tìm kiếm ứng viên theo yêu cầu">Lọc hồ sơ & tìm kiếm ứng viên theo yêu cầu</option>
                    <option value="Dịch vụ khác">Hợp tác thương hiệu / Khác</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submittingForm}
                    className="w-full py-2.5 bg-[#00B14F] hover:bg-[#00873D] text-white font-bold rounded-[6px] text-xs transition-colors shadow-sm cursor-pointer border-none flex items-center justify-center gap-1.5"
                  >
                    {submittingForm && <Loader2 size={13} className="animate-spin" />}
                    <span>Gửi thông tin yêu cầu</span>
                  </button>
                </div>
              </form>
            </div>

          </div>
        </section>

        {/* 7. FAQ SECTION */}
        <section className="py-16 px-4 bg-[#F8FAFC]">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-slate-800">Các câu hỏi thường gặp</h2>
              <p className="text-xs text-slate-500">Giải đáp nhanh các thắc mắc phổ biến của nhà tuyển dụng.</p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, index) => {
                const isOpen = activeFaq === index;
                return (
                  <div key={index} className="bg-white border border-slate-200 rounded-[8px] overflow-hidden transition-colors shadow-2xs">
                    <button
                      onClick={() => setActiveFaq(isOpen ? null : index)}
                      className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 focus:outline-none cursor-pointer"
                    >
                      <span className="font-bold text-slate-800 text-xs sm:text-sm">{faq.q}</span>
                      <ChevronDown size={16} className={`text-slate-450 transition-transform duration-150 flex-shrink-0 ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-4 text-xs text-slate-500 leading-relaxed border-t border-slate-100 pt-3 text-left">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

      </main>

      {/* Multi-column Footer */}
      <EmployerFooter />
    </div>
  );
}