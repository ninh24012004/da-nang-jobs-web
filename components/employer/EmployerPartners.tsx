"use client";

export default function EmployerPartners() {
  const clients = [
    { name: "FPT Software", logo: "https://tuyendung.topcv.vn/images/partner/fpt-software.png" },
    { name: "Viettel", logo: "https://static.topcv.vn/srp/website/images/home_page/partners/viettel.png" },
    { name: "Techcombank", logo: "https://static.topcv.vn/srp/website/images/home_page/partners/Techcombank_logo.png" },
    { name: "Shinhan Bank", logo: "https://tuyendung.topcv.vn/images/partner/shinhan-bank.png" },
    { name: "Edupia", logo: "https://tuyendung.topcv.vn/images/partner/edupia.png" },
    { name: "Teky", logo: "https://tuyendung.topcv.vn/images/partner/teky.png" },
  ];

  const mediaPartners = [
    { name: "VTV1", logo: "https://static.topcv.vn/srp/website/images/home_page/partners/vtv1.png" },
    { name: "VTV2", logo: "https://static.topcv.vn/srp/website/images/home_page/partners/vtv2.png" },
    { name: "VTV6", logo: "https://static.topcv.vn/srp/website/images/home_page/partners/vtv6.png" },
    { name: "VTC10", logo: "https://static.topcv.vn/srp/website/images/home_page/partners/vtc10.png" },
    { name: "GenK", logo: "https://static.topcv.vn/srp/website/images/home_page/partners/genk.png" },
    { name: "Cafebiz", logo: "https://static.topcv.vn/srp/website/images/home_page/partners/cafebiz.png" },
  ];

  return (
    <section className="bg-gray-50 py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header content */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006b7a] uppercase tracking-widest bg-[#006b7a]/10 px-3 py-1.5 rounded-md">
            <span>Đối tác đồng hành</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800">
            Khách hàng tiêu biểu & Đối tác truyền thông
          </h2>
          <p className="text-gray-500 text-sm md:text-base font-light">
            Nhận được sự tin tưởng từ hàng ngàn thương hiệu uy tín cùng các cơ quan truyền thông báo đài hàng đầu Việt Nam.
          </p>
        </div>

        {/* Double-column grid for Clients vs Media */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Key Clients Grid */}
          <div className="bg-white border border-gray-150 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-6 text-left">
            <h3 className="text-lg font-bold text-gray-800 border-l-4 border-[#006b7a] pl-3">
              Doanh nghiệp tiêu biểu
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 items-center">
              {clients.map((client) => (
                <div
                  key={client.name}
                  className="h-20 flex items-center justify-center p-3 border border-gray-50 rounded-xl bg-gray-50/30 hover:bg-white hover:border-gray-200 hover:shadow-sm transition-all duration-300 group"
                >
                  <img
                    src={client.logo}
                    alt={client.name}
                    className="max-h-full max-w-full object-contain filter grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-100 transition-all duration-300"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Media Partners Grid */}
          <div className="bg-white border border-gray-150 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-6 text-left">
            <h3 className="text-lg font-bold text-gray-800 border-l-4 border-[#006b7a] pl-3">
              Đối tác truyền thông
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 items-center">
              {mediaPartners.map((media) => (
                <div
                  key={media.name}
                  className="h-20 flex items-center justify-center p-3 border border-gray-50 rounded-xl bg-gray-50/30 hover:bg-white hover:border-gray-200 hover:shadow-sm transition-all duration-300 group"
                >
                  <img
                    src={media.logo}
                    alt={media.name}
                    className="max-h-full max-w-full object-contain filter grayscale group-hover:grayscale-0 opacity-65 group-hover:opacity-100 transition-all duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
