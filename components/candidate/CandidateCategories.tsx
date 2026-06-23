"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Palmtree,
  Megaphone,
  Calculator,
  Languages,
  Hammer,
  HeartPulse,
  Users,
  Scale,
  Paintbrush,
  Truck,
  Briefcase,
  ArrowRight,
  Code,
  Loader2
} from "lucide-react";

import { categoryService } from "@/services/categoryService";
import { CategoryTreeResponse } from "@/types/category";

export default function CandidateCategories() {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryTreeResponse[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      setLoadingCategories(true);
      try {
        const treeRes = await categoryService.getCategoryTree();
        if (treeRes) {
          setCategories(treeRes);
        }
      } catch (err) {
        console.warn("Error fetching categories data:", err);
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  const getCategoryIcon = (name: string) => {
    const lower = name.toLowerCase();

    if (
      lower.includes("công nghệ") ||
      lower.includes("tin học") ||
      lower.includes("phần mềm") ||
      lower.includes("it") ||
      lower.includes("lập trình")
    ) {
      return <Code size={24} className="text-[#00B14F]" />;
    }

    if (
      lower.includes("du lịch") ||
      lower.includes("khách sạn") ||
      lower.includes("nhà hàng") ||
      lower.includes("ẩm thực") ||
      lower.includes("dịch vụ ăn uống")
    ) {
      return <Palmtree size={24} className="text-amber-600" />;
    }

    if (
      lower.includes("bán hàng") ||
      lower.includes("marketing") ||
      lower.includes("kinh doanh") ||
      lower.includes("sale") ||
      lower.includes("quảng cáo") ||
      lower.includes("thương mại")
    ) {
      return <Megaphone size={24} className="text-indigo-650" />;
    }

    if (
      lower.includes("kế toán") ||
      lower.includes("tài chính") ||
      lower.includes("ngân hàng") ||
      lower.includes("thuế") ||
      lower.includes("kiểm toán")
    ) {
      return <Calculator size={24} className="text-emerald-650" />;
    }

    if (
      lower.includes("ngoại ngữ") ||
      lower.includes("giáo dục") ||
      lower.includes("giảng dạy") ||
      lower.includes("đào tạo") ||
      lower.includes("tiếng")
    ) {
      return <Languages size={24} className="text-purple-600" />;
    }

    if (
      lower.includes("xây dựng") ||
      lower.includes("kỹ thuật") ||
      lower.includes("cơ khí") ||
      lower.includes("kiến trúc") ||
      lower.includes("sản xuất")
    ) {
      return <Hammer size={24} className="text-slate-600" />;
    }

    if (
      lower.includes("y tế") ||
      lower.includes("sức khỏe") ||
      lower.includes("dược") ||
      lower.includes("bác sĩ") ||
      lower.includes("nha khoa")
    ) {
      return <HeartPulse size={24} className="text-rose-600" />;
    }

    if (
      lower.includes("nhân sự") ||
      lower.includes("hành chính") ||
      lower.includes("văn phòng") ||
      lower.includes("lễ tân")
    ) {
      return <Users size={24} className="text-sky-600" />;
    }

    if (lower.includes("luật") || lower.includes("pháp lý")) {
      return <Scale size={24} className="text-yellow-600" />;
    }

    if (
      lower.includes("thiết kế") ||
      lower.includes("mỹ thuật") ||
      lower.includes("đồ họa")
    ) {
      return <Paintbrush size={24} className="text-pink-650" />;
    }

    if (
      lower.includes("vận tải") ||
      lower.includes("giao nhận") ||
      lower.includes("logistics") ||
      lower.includes("kho bãi")
    ) {
      return <Truck size={24} className="text-orange-600" />;
    }

    return <Briefcase size={24} className="text-[#00B14F]" />;
  };

  const getCategoryBg = (name: string) => {
    const lower = name.toLowerCase();

    if (
      lower.includes("công nghệ") ||
      lower.includes("tin học") ||
      lower.includes("phần mềm") ||
      lower.includes("it") ||
      lower.includes("lập trình")
    ) {
      return "bg-emerald-50/50";
    }

    if (
      lower.includes("du lịch") ||
      lower.includes("khách sạn") ||
      lower.includes("nhà hàng") ||
      lower.includes("ẩm thực") ||
      lower.includes("dịch vụ ăn uống")
    ) {
      return "bg-amber-50/50";
    }

    if (
      lower.includes("bán hàng") ||
      lower.includes("marketing") ||
      lower.includes("kinh doanh") ||
      lower.includes("sale") ||
      lower.includes("quảng cáo") ||
      lower.includes("thương mại")
    ) {
      return "bg-indigo-50/50";
    }

    if (
      lower.includes("kế toán") ||
      lower.includes("tài chính") ||
      lower.includes("ngân hàng") ||
      lower.includes("thuế") ||
      lower.includes("kiểm toán")
    ) {
      return "bg-emerald-50/50";
    }

    if (
      lower.includes("ngoại ngữ") ||
      lower.includes("giáo dục") ||
      lower.includes("giảng dạy") ||
      lower.includes("đào tạo") ||
      lower.includes("tiếng")
    ) {
      return "bg-purple-50/50";
    }

    if (
      lower.includes("xây dựng") ||
      lower.includes("kỹ thuật") ||
      lower.includes("cơ khí") ||
      lower.includes("kiến trúc") ||
      lower.includes("sản xuất")
    ) {
      return "bg-slate-50";
    }

    if (
      lower.includes("y tế") ||
      lower.includes("sức khỏe") ||
      lower.includes("dược") ||
      lower.includes("bác sĩ") ||
      lower.includes("nha khoa")
    ) {
      return "bg-rose-50/50";
    }

    if (
      lower.includes("nhân sự") ||
      lower.includes("hành chính") ||
      lower.includes("văn phòng") ||
      lower.includes("lễ tân")
    ) {
      return "bg-sky-50/50";
    }

    if (lower.includes("luật") || lower.includes("pháp lý")) {
      return "bg-yellow-50/50";
    }

    if (
      lower.includes("thiết kế") ||
      lower.includes("mỹ thuật") ||
      lower.includes("đồ họa")
    ) {
      return "bg-pink-50/50";
    }

    if (
      lower.includes("vận tải") ||
      lower.includes("giao nhận") ||
      lower.includes("logistics") ||
      lower.includes("kho bãi")
    ) {
      return "bg-orange-50/50";
    }

    return "bg-[#00B14F]/5";
  };

  const visibleCategories = categories.slice(0, 8);

  const getDescendantIds = (node: CategoryTreeResponse): number[] => {
    let ids = [node.id];

    if (node.children) {
      for (const child of node.children) {
        ids = [...ids, ...getDescendantIds(child)];
      }
    }

    return ids;
  };

  if (loadingCategories) {
    return (
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
            <div className="h-6 w-32 bg-gray-100 rounded animate-pulse mx-auto"></div>
            <div className="h-8 w-64 bg-gray-100 rounded animate-pulse mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-[8px] p-6 flex items-center gap-4 animate-pulse"
              >
                <div className="bg-gray-100 rounded-[6px] w-12 h-12 flex-shrink-0"></div>
                <div className="space-y-2 flex-grow">
                  <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-16 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00B14F] uppercase tracking-widest bg-[#00B14F]/10 px-3 py-1 rounded-[4px]">
            <span>Ngành nghề nổi bật</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            Top Ngành Nghề Nổi Bật Tại Đà Nẵng
          </h2>

          <p className="text-slate-500 text-xs sm:text-sm font-normal">
            Khám phá và đón đầu cơ hội thăng tiến sự nghiệp của bạn qua các nhóm ngành có nhu cầu tuyển dụng lớn nhất.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {visibleCategories.map((cat) => {
            const allIds = getDescendantIds(cat);
            const queryParams = allIds
              .map((id) => `categoryIds=${id}`)
              .join("&");

            return (
              <div
                key={cat.id}
                onClick={() => router.push(`/jobs?${queryParams}`)}
                className="
                  bg-white border border-slate-200 rounded-[8px] p-5 shadow-sm
                  hover:border-[#00B14F]/30 hover:bg-slate-50/50
                  transition-colors duration-150
                  cursor-pointer
                "
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`
                      p-3 rounded-[6px]
                      ${getCategoryBg(cat.categoryName)}
                    `}
                  >
                    {getCategoryIcon(cat.categoryName)}
                  </div>

                  <div className="flex-1 overflow-hidden">
                    <h3
                      className="
                        font-bold text-slate-800
                        text-sm truncate
                        hover:text-[#00B14F]
                        transition-colors duration-150
                      "
                    >
                      {cat.categoryName}
                    </h3>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {categories.length > 8 && (
          <div className="flex justify-center mt-10">
            <Link
              href="/jobs"
              className="group inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-50 border border-slate-200 text-[#00B14F] font-bold rounded-[6px] text-xs shadow-sm transition-colors duration-150"
            >
              <span>Xem thêm tất cả</span>
              <ArrowRight
                size={12}
                className="group-hover:translate-x-0.5 transition-transform duration-150"
              />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}