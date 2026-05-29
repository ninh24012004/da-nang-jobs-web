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
        let cachedCategories = null;

        if (typeof window !== "undefined") {
          try {
            const cats = sessionStorage.getItem("categoryTree");
            if (cats) cachedCategories = JSON.parse(cats);
          } catch (e) {
            console.warn("Failed to parse cached categories data:", e);
          }
        }

        let treeRes = cachedCategories;

        if (!treeRes) {
          treeRes = await categoryService.getCategoryTree();

          if (treeRes && typeof window !== "undefined") {
            sessionStorage.setItem("categoryTree", JSON.stringify(treeRes));
          }
        }

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
      return <Code size={28} className="text-teal-600" />;
    }

    if (
      lower.includes("du lịch") ||
      lower.includes("khách sạn") ||
      lower.includes("nhà hàng") ||
      lower.includes("ẩm thực") ||
      lower.includes("dịch vụ ăn uống")
    ) {
      return <Palmtree size={28} className="text-amber-600" />;
    }

    if (
      lower.includes("bán hàng") ||
      lower.includes("marketing") ||
      lower.includes("kinh doanh") ||
      lower.includes("sale") ||
      lower.includes("quảng cáo") ||
      lower.includes("thương mại")
    ) {
      return <Megaphone size={28} className="text-indigo-600" />;
    }

    if (
      lower.includes("kế toán") ||
      lower.includes("tài chính") ||
      lower.includes("ngân hàng") ||
      lower.includes("thuế") ||
      lower.includes("kiểm toán")
    ) {
      return <Calculator size={28} className="text-emerald-600" />;
    }

    if (
      lower.includes("ngoại ngữ") ||
      lower.includes("giáo dục") ||
      lower.includes("giảng dạy") ||
      lower.includes("đào tạo") ||
      lower.includes("tiếng")
    ) {
      return <Languages size={28} className="text-purple-600" />;
    }

    if (
      lower.includes("xây dựng") ||
      lower.includes("kỹ thuật") ||
      lower.includes("cơ khí") ||
      lower.includes("kiến trúc") ||
      lower.includes("sản xuất")
    ) {
      return <Hammer size={28} className="text-blue-600" />;
    }

    if (
      lower.includes("y tế") ||
      lower.includes("sức khỏe") ||
      lower.includes("dược") ||
      lower.includes("bác sĩ") ||
      lower.includes("nha khoa")
    ) {
      return <HeartPulse size={28} className="text-rose-600" />;
    }

    if (
      lower.includes("nhân sự") ||
      lower.includes("hành chính") ||
      lower.includes("văn phòng") ||
      lower.includes("lễ tân")
    ) {
      return <Users size={28} className="text-sky-600" />;
    }

    if (lower.includes("luật") || lower.includes("pháp lý")) {
      return <Scale size={28} className="text-yellow-600" />;
    }

    if (
      lower.includes("thiết kế") ||
      lower.includes("mỹ thuật") ||
      lower.includes("đồ họa")
    ) {
      return <Paintbrush size={28} className="text-pink-600" />;
    }

    if (
      lower.includes("vận tải") ||
      lower.includes("giao nhận") ||
      lower.includes("logistics") ||
      lower.includes("kho bãi")
    ) {
      return <Truck size={28} className="text-orange-600" />;
    }

    return <Briefcase size={28} className="text-teal-600" />;
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
      return "bg-teal-50";
    }

    if (
      lower.includes("du lịch") ||
      lower.includes("khách sạn") ||
      lower.includes("nhà hàng") ||
      lower.includes("ẩm thực") ||
      lower.includes("dịch vụ ăn uống")
    ) {
      return "bg-amber-50";
    }

    if (
      lower.includes("bán hàng") ||
      lower.includes("marketing") ||
      lower.includes("kinh doanh") ||
      lower.includes("sale") ||
      lower.includes("quảng cáo") ||
      lower.includes("thương mại")
    ) {
      return "bg-indigo-50";
    }

    if (
      lower.includes("kế toán") ||
      lower.includes("tài chính") ||
      lower.includes("ngân hàng") ||
      lower.includes("thuế") ||
      lower.includes("kiểm toán")
    ) {
      return "bg-emerald-50";
    }

    if (
      lower.includes("ngoại ngữ") ||
      lower.includes("giáo dục") ||
      lower.includes("giảng dạy") ||
      lower.includes("đào tạo") ||
      lower.includes("tiếng")
    ) {
      return "bg-purple-50";
    }

    if (
      lower.includes("xây dựng") ||
      lower.includes("kỹ thuật") ||
      lower.includes("cơ khí") ||
      lower.includes("kiến trúc") ||
      lower.includes("sản xuất")
    ) {
      return "bg-blue-50";
    }

    if (
      lower.includes("y tế") ||
      lower.includes("sức khỏe") ||
      lower.includes("dược") ||
      lower.includes("bác sĩ") ||
      lower.includes("nha khoa")
    ) {
      return "bg-rose-50";
    }

    if (
      lower.includes("nhân sự") ||
      lower.includes("hành chính") ||
      lower.includes("văn phòng") ||
      lower.includes("lễ tân")
    ) {
      return "bg-sky-50";
    }

    if (lower.includes("luật") || lower.includes("pháp lý")) {
      return "bg-yellow-50";
    }

    if (
      lower.includes("thiết kế") ||
      lower.includes("mỹ thuật") ||
      lower.includes("đồ họa")
    ) {
      return "bg-pink-50";
    }

    if (
      lower.includes("vận tải") ||
      lower.includes("giao nhận") ||
      lower.includes("logistics") ||
      lower.includes("kho bãi")
    ) {
      return "bg-orange-50";
    }

    return "bg-teal-50/50";
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
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mx-auto"></div>
            <div className="h-10 w-64 bg-gray-200 rounded animate-pulse mx-auto"></div>
            <div className="h-4 w-96 bg-gray-200 rounded animate-pulse mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white border border-gray-100 rounded-2xl p-6 flex items-center gap-4 animate-pulse"
              >
                <div className="p-6 bg-gray-100 rounded-xl w-14 h-14 flex-shrink-0"></div>
                <div className="space-y-2 flex-grow">
                  <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gray-50 py-16 md:py-24 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006b7a] uppercase tracking-widest bg-[#006b7a]/10 px-3 py-1.5 rounded-md">
            <span>Ngành nghề phổ biến</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800 tracking-tight">
            Top Ngành Nghề Nổi Bật Tại Đà Nẵng
          </h2>

          <p className="text-gray-500 text-sm md:text-base font-light">
            Khám phá và đón đầu cơ hội thăng tiến sự nghiệp của bạn qua các nhóm ngành có lưu lượng tuyển dụng cao nhất.
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
                  bg-white border border-gray-100 rounded-2xl p-6
                  hover:border-[#006b7a]/30
                  hover:shadow-lg
                  hover:-translate-y-1
                  transition-all duration-300
                  cursor-pointer
                "
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`
                      p-4 rounded-xl
                      ${getCategoryBg(cat.categoryName)}
                      transition-transform duration-300
                    `}
                  >
                    {getCategoryIcon(cat.categoryName)}
                  </div>

                  <div className="flex-1 overflow-hidden">
                    <h3
                      className="
                        font-bold text-gray-800
                        text-lg truncate
                        hover:text-[#006b7a]
                        transition-colors
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
          <div className="flex justify-center mt-12">
            <Link
              href="/jobs"
              className="group inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 border border-gray-200 text-[#006b7a] font-bold rounded-full text-xs shadow-sm hover:shadow transition-all active:scale-[0.98]"
            >
              <span>Xem thêm</span>
              <ArrowRight
                size={14}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}