"use client";

import { Award, Target, TrendingUp, Users2, BarChart4, ClipboardList } from "lucide-react";

export default function EmployerStats() {
  const stats = [
    {
      value: "150.000+",
      label: "Ứng viên bật tìm việc",
      desc: "Lượng ứng viên chất lượng cao đang bật trạng thái sẵn sàng nhận đề nghị phỏng vấn tại TP Đà Nẵng.",
      icon: <Target className="text-white" size={24} />,
    },
    {
      value: "5.000+",
      label: "Doanh nghiệp đồng hành",
      desc: "Các thương hiệu, công ty và cơ sở kinh doanh hàng đầu tại Đà Nẵng tin dùng giải pháp đăng tuyển.",
      icon: <Users2 className="text-white" size={24} />,
    },
    {
      value: "12.000+",
      label: "Nhà tuyển dụng hoạt động",
      desc: "Tài khoản tuyển dụng sử dụng hệ thống thường xuyên để đăng tin và săn đón nhân tài địa phương.",
      icon: <ClipboardList className="text-white" size={24} />,
    },
    {
      value: "10.000+",
      label: "Tài khoản mới hàng tháng",
      desc: "Nguồn hồ sơ dồi dào luôn được làm mới liên tục với hàng ngàn ứng viên gia nhập cổng thông tin.",
      icon: <TrendingUp className="text-white" size={24} />,
    },
    {
      value: "500.000+",
      label: "Lượt truy cập hàng tháng",
      desc: "Một trong những trang web tuyển dụng việc làm có lưu lượng traffic người dùng lớn nhất tại khu vực Đà Nẵng.",
      icon: <BarChart4 className="text-white" size={24} />,
    },
    {
      value: "200.000+",
      label: "Tổng số hồ sơ ứng viên",
      desc: "Hệ thống cơ sở dữ liệu hồ sơ phong phú với hơn 50% nhân sự có kinh nghiệm chuyên môn dày dặn.",
      icon: <Award className="text-white" size={24} />,
    },
  ];

  return (
    <section className="bg-gray-900 text-white py-16 md:py-24 relative overflow-hidden">
      {/* Visual glowing decorators */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#006b7a]/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header content */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-400 uppercase tracking-widest bg-[#006b7a]/15 border border-[#006b7a]/20 px-3 py-1.5 rounded-full">
            <span>Dữ liệu thống kê</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Những con số bảo chứng hiệu quả tuyển dụng
          </h2>
          <p className="text-gray-400 text-sm md:text-base font-light">
            Khẳng định vị thế nền tảng công nghệ HR Tech hàng đầu khu vực Đà Nẵng qua dữ liệu hoạt động thực tế.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-gray-800/40 border border-gray-800 rounded-2xl p-6 lg:p-8 hover:border-[#006b7a]/30 hover:bg-gray-800/60 transition-all duration-300 group flex flex-col items-center text-center"
            >
              {/* Animated Floating Icon */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#006b7a] to-teal-600 shadow-md shadow-teal-950/20 group-hover:scale-110 transition-transform duration-300 mb-6">
                {stat.icon}
              </div>

              {/* Value and descriptions */}
              <div className="space-y-2">
                <span className="block text-4xl sm:text-5xl font-black bg-gradient-to-r from-teal-400 to-teal-300 bg-clip-text text-transparent tracking-tight">
                  {stat.value}
                </span>
                <h3 className="text-lg font-bold text-gray-200 tracking-wide">
                  {stat.label}
                </h3>
                <p className="text-gray-400 text-xs md:text-sm leading-relaxed font-light">
                  {stat.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-12 max-w-md mx-auto sm:max-w-none">
          <a
            href="#banner-form"
            className="flex items-center justify-center w-full sm:w-auto border border-[#006b7a] text-teal-400 hover:bg-[#006b7a]/10 px-8 py-3.5 rounded-lg text-sm font-bold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            Liên hệ tư vấn
          </a>
          <a
            href="#banner-form"
            className="flex items-center justify-center w-full sm:w-auto bg-gradient-to-r from-[#006b7a] to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white px-8 py-3.5 rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Đăng tin miễn phí
          </a>
        </div>
      </div>
    </section>
  );
}
