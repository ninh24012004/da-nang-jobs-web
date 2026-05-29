"use client";

import { useState } from "react";
import { User, Mail, Phone, Building, HelpCircle, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function EmployerConsultationForm() {
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phone: "",
    city: "8", // Đà Nẵng is the default selected city!
    consultingType: "",
    consultingText: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const cities = [
    { id: "8", name: "Đà Nẵng" },
    { id: "1", name: "Hà Nội" },
    { id: "2", name: "Hồ Chí Minh" },
    { id: "4", name: "Bắc Ninh" },
    { id: "5", name: "Đồng Nai" },
    { id: "9", name: "Hải Phòng" },
    { id: "33", name: "Khánh Hòa" },
    { id: "61", name: "Huế" },
    { id: "100", name: "Nước Ngoài" },
  ];

  const consultationNeeds = [
    { id: "1", name: "Tôi muốn được đăng tin tuyển dụng miễn phí" },
    { id: "2", name: "Tôi muốn tìm hiểu thêm về các gói dịch vụ tin nổi bật" },
    { id: "3", name: "Tôi muốn tìm hiểu về các chương trình khuyến mãi" },
    { id: "4", name: "Tôi muốn được hướng dẫn tạo tài khoản tuyển dụng" },
    { id: "5", name: "Nhu cầu khác" },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
    // Clear error for this field
    if (errors[id]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullname.trim()) {
      newErrors.fullname = "Họ và tên không được để trống";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email không được để trống";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không đúng định dạng";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Số điện thoại không được để trống";
    } else if (!/(84|0[3|5|7|8|9])+([0-9]{8})\b/.test(formData.phone)) {
      newErrors.phone = "Số điện thoại không đúng định dạng (VD: 0987654321)";
    }

    if (!formData.city) {
      newErrors.city = "Vui lòng chọn Tỉnh/Thành phố";
    }

    if (!formData.consultingType) {
      newErrors.consultingType = "Vui lòng chọn nhu cầu tư vấn";
    }

    if (formData.consultingType === "5" && !formData.consultingText.trim()) {
      newErrors.consultingText = "Vui lòng nhập nhu cầu tư vấn chi tiết của bạn";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Vui lòng điền đầy đủ và chính xác thông tin đăng ký!");
      return;
    }

    setIsSubmitting(true);

    // Simulate API submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast.success("Gửi yêu cầu thành công! Đà Nẵng Job sẽ liên hệ trong 24h.");
      setFormData({
        fullname: "",
        email: "",
        phone: "",
        city: "8",
        consultingType: "",
        consultingText: "",
      });
    }, 1500);
  };

  return (
    <section
      id="banner-form"
      className="py-16 md:py-24 bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: 'url("https://tuyendung.topcv.vn/images/background-form.png")',
      }}
    >
      <div className="absolute inset-0 bg-[#0c1424]/90 z-0"></div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        {/* Header content */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4 text-white">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Giải pháp tuyển dụng phù hợp cho doanh nghiệp của bạn?
          </h2>
          <p className="text-gray-300 text-sm md:text-base font-light">
            Hãy để lại thông tin và ban hỗ trợ Đà Nẵng Job sẽ liên hệ giải đáp ngay cho bạn.
          </p>
        </div>

        {/* Double column form panel */}
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col md:flex-row max-w-4xl mx-auto">
          {/* Left panel graphic illustration */}
          <div
            className="hidden md:block md:w-1/2 bg-cover bg-center min-h-[450px]"
            style={{
              backgroundImage: 'url("https://tuyendung.topcv.vn/images/banner_form_bg_v2.png")',
            }}
          >
            <div className="h-full w-full bg-[#006b7a]/15 backdrop-blur-[1px] flex flex-col justify-end p-8 text-white text-left">
              <h3 className="text-2xl font-black leading-snug">
                Tuyển dụng hiệu quả cùng Đà Nẵng Job
              </h3>
              <p className="text-sm font-light text-white/95 mt-2 leading-relaxed">
                Đăng tin tiếp cận nhanh chóng hàng ngàn ứng viên địa phương, đồng hành cùng sự phát triển bền vững của doanh nghiệp.
              </p>
            </div>
          </div>

          {/* Right panel actual form */}
          <div className="md:w-1/2 p-6 sm:p-10 text-left">
            {isSubmitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-10 space-y-4">
                <div className="p-4 rounded-full bg-teal-50 text-[#006b7a] animate-bounce">
                  <CheckCircle2 size={48} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Đăng ký thành công!</h3>
                <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
                  Cảm ơn bạn đã đăng ký. Đội ngũ chuyên viên tư vấn Đà Nẵng Job sẽ gọi điện hỗ trợ cho bạn trong vòng 24 giờ tới.
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="px-6 py-2 border border-[#006b7a] text-[#006b7a] rounded-lg text-sm font-semibold hover:bg-teal-50 transition-colors"
                >
                  Gửi yêu cầu mới
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-2xl font-extrabold text-[#006b7a] tracking-tight">
                    Đăng ký nhận tư vấn
                  </h3>
                  <p className="text-xs text-gray-400 font-light">
                    Vui lòng điền thông tin bên dưới để chuyên viên liên hệ hỗ trợ
                  </p>
                </div>

                {/* Họ và tên */}
                <div className="space-y-1.5">
                  <label htmlFor="fullname" className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                    Họ và tên *
                  </label>
                  <div
                    className={`flex items-center gap-2 border rounded-lg px-3 py-2.5 bg-white transition-all ${
                      errors.fullname ? "border-red-500 ring-1 ring-red-500" : "border-gray-250 focus-within:border-[#006b7a] focus-within:ring-1 focus-within:ring-[#006b7a]"
                    }`}
                  >
                    <User size={16} className="text-gray-400" />
                    <input
                      type="text"
                      id="fullname"
                      value={formData.fullname}
                      onChange={handleInputChange}
                      placeholder="Họ và tên của bạn"
                      className="w-full text-sm font-light text-gray-700 placeholder-gray-350 focus:outline-none bg-transparent"
                    />
                  </div>
                  {errors.fullname && <p className="text-[11px] text-red-500 font-medium pl-1">{errors.fullname}</p>}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                    Địa chỉ Email *
                  </label>
                  <div
                    className={`flex items-center gap-2 border rounded-lg px-3 py-2.5 bg-white transition-all ${
                      errors.email ? "border-red-500 ring-1 ring-red-500" : "border-gray-250 focus-within:border-[#006b7a] focus-within:ring-1 focus-within:ring-[#006b7a]"
                    }`}
                  >
                    <Mail size={16} className="text-gray-400" />
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="username@company.com"
                      className="w-full text-sm font-light text-gray-700 placeholder-gray-350 focus:outline-none bg-transparent"
                    />
                  </div>
                  {errors.email && <p className="text-[11px] text-red-500 font-medium pl-1">{errors.email}</p>}
                </div>

                {/* Số điện thoại */}
                <div className="space-y-1.5">
                  <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                    Số điện thoại *
                  </label>
                  <div
                    className={`flex items-center gap-2 border rounded-lg px-3 py-2.5 bg-white transition-all ${
                      errors.phone ? "border-red-500 ring-1 ring-red-500" : "border-gray-250 focus-within:border-[#006b7a] focus-within:ring-1 focus-within:ring-[#006b7a]"
                    }`}
                  >
                    <Phone size={16} className="text-gray-400" />
                    <input
                      type="text"
                      id="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Số điện thoại liên hệ"
                      className="w-full text-sm font-light text-gray-700 placeholder-gray-350 focus:outline-none bg-transparent"
                    />
                  </div>
                  {errors.phone && <p className="text-[11px] text-red-500 font-medium pl-1">{errors.phone}</p>}
                </div>

                {/* Tỉnh/Thành phố */}
                <div className="space-y-1.5">
                  <label htmlFor="city" className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                    Tỉnh/Thành phố *
                  </label>
                  <div
                    className={`flex items-center gap-2 border rounded-lg px-3 py-2.5 bg-white transition-all ${
                      errors.city ? "border-red-500 ring-1 ring-red-500" : "border-gray-250 focus-within:border-[#006b7a] focus-within:ring-1 focus-within:ring-[#006b7a]"
                    }`}
                  >
                    <Building size={16} className="text-gray-400" />
                    <select
                      id="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full text-sm font-light text-gray-750 focus:outline-none bg-transparent"
                    >
                      <option value="" disabled>Chọn Tỉnh/Thành phố</option>
                      {cities.map((city) => (
                        <option key={city.id} value={city.id}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.city && <p className="text-[11px] text-red-500 font-medium pl-1">{errors.city}</p>}
                </div>

                {/* Nhu cầu tư vấn */}
                <div className="space-y-1.5">
                  <label htmlFor="consultingType" className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                    Nhu cầu tư vấn *
                  </label>
                  <div
                    className={`flex items-center gap-2 border rounded-lg px-3 py-2.5 bg-white transition-all ${
                      errors.consultingType ? "border-red-500 ring-1 ring-red-500" : "border-gray-250 focus-within:border-[#006b7a] focus-within:ring-1 focus-within:ring-[#006b7a]"
                    }`}
                  >
                    <HelpCircle size={16} className="text-gray-400" />
                    <select
                      id="consultingType"
                      value={formData.consultingType}
                      onChange={handleInputChange}
                      className="w-full text-sm font-light text-gray-750 focus:outline-none bg-transparent"
                    >
                      <option value="" disabled>Chọn nhu cầu tư vấn</option>
                      {consultationNeeds.map((need) => (
                        <option key={need.id} value={need.id}>
                          {need.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.consultingType && <p className="text-[11px] text-red-500 font-medium pl-1">{errors.consultingType}</p>}
                </div>

                {/* Extra text area if Khác is selected */}
                {formData.consultingType === "5" && (
                  <div className="space-y-1.5 transition-all duration-300 animate-fadeIn">
                    <label htmlFor="consultingText" className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                      Chi tiết nhu cầu khác *
                    </label>
                    <textarea
                      id="consultingText"
                      value={formData.consultingText}
                      onChange={handleInputChange}
                      placeholder="Mô tả cụ thể thắc mắc hoặc yêu cầu riêng của bạn để chúng tôi chuẩn bị tư vấn tốt nhất..."
                      rows={3}
                      className={`w-full text-sm font-light text-gray-700 placeholder-gray-350 border rounded-lg p-3 bg-white transition-all focus:outline-none ${
                        errors.consultingText ? "border-red-500 focus:ring-1 focus:ring-red-500" : "border-gray-250 focus:border-[#006b7a] focus:ring-1 focus:ring-[#006b7a]"
                      }`}
                    ></textarea>
                    {errors.consultingText && <p className="text-[11px] text-red-500 font-medium pl-1">{errors.consultingText}</p>}
                  </div>
                )}

                {/* Button Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#006b7a] hover:bg-[#005a66] text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:bg-[#006b7a]/70 disabled:cursor-not-allowed pt-4"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      <span>Đang xử lý đăng ký...</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Gửi yêu cầu tư vấn</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
