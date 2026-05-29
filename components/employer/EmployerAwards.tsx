"use client";

import { ExternalLink } from "lucide-react";

export default function EmployerAwards() {
  const awards = [
    {
      title: "Top 100 Thương hiệu hàng đầu Việt Nam 2020",
      tag: "Brand",
      desc: "Vinh danh Top 100 Thương hiệu tiêu biểu hàng đầu Việt Nam tại Lễ công bố Vietnam Top Brands.",
      img: "https://tuyendung.topcv.vn/images/about/top-100.png",
      link: "https://topcv.com.vn/blogs/3706/",
    },
    {
      title: "Top 15 Google Startups Accelerator",
      tag: "Startup",
      desc: "Nằm trong số 15 Startups xuất sắc nhất khu vực được Google lựa chọn hỗ trợ tăng tốc công nghệ.",
      img: "https://tuyendung.topcv.vn/images/about/startup.png",
      link: "https://topcv.com.vn/blogs/topcv-thuoc-top-15-startups-duoc-google-lua-chon-tham-gia-google-for-startups-accelerator-southeast-asia/",
    },
    {
      title: "Giải thưởng Make in Viet Nam 2022",
      tag: "Tech",
      desc: "Đạt giải thưởng Sản phẩm công nghệ số tiêu biểu xuất sắc trong cuộc cách mạng số Make in Viet Nam.",
      img: "https://tuyendung.topcv.vn/images/about/technology-product.png",
      link: "https://topcv.com.vn/blogs/topcv-viet-nam-nhan-bo-doi-giai-thuong-san-pham-cong-nghe-so-make-in-viet-nam-2022-2/",
    },
    {
      title: "Top 10 Doanh nghiệp CNTT Việt Nam 2022",
      tag: "Brand",
      desc: "Thành tựu xuất sắc tại Lễ vinh danh Top 10 doanh nghiệp Công nghệ thông tin hàng đầu Việt Nam.",
      img: "https://tuyendung.topcv.vn/images/about/top-10.png",
      link: "https://topcv.com.vn/blogs/topcv-nhan-cu-dup-giai-thuong-tai-le-vinh-danh-top-10-doanh-nghiep-cntt-viet-nam-2022/",
    },
  ];

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header content */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006b7a] uppercase tracking-widest bg-[#006b7a]/10 px-3 py-1.5 rounded-md">
            <span>Giải thưởng tiêu biểu</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800">
            Giải thưởng công nghệ & Thành tựu nổi bật
          </h2>
          <p className="text-gray-500 text-sm md:text-base font-light">
            Sự ghi nhận quý giá dành cho mô hình và nỗ lực đổi mới sáng tạo, chuyển đổi số tuyển dụng tại Việt Nam.
          </p>
        </div>

        {/* Awards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {awards.map((award, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
            >
              {/* Image element */}
              <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
                <img
                  src={award.img}
                  alt={award.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-[#006b7a] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
                  {award.tag}
                </span>
              </div>

              {/* Text descriptions */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4 text-left">
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-gray-800 tracking-tight line-clamp-2 group-hover:text-[#006b7a] transition-colors">
                    {award.title}
                  </h3>
                  <p className="text-gray-500 text-xs font-light leading-relaxed line-clamp-3">
                    {award.desc}
                  </p>
                </div>

                {/* Readmore Button */}
                <div className="pt-2">
                  <a
                    href={award.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-bold text-[#006b7a] hover:text-[#005a66] transition-all uppercase tracking-wider"
                  >
                    <span>Chi tiết</span>
                    <ExternalLink size={12} />
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
