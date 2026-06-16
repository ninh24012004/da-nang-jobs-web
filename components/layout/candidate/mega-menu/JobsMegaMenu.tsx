"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
    Search,
    FileCheck,
    ThumbsUp,
} from "lucide-react";

import { categoryService } from "@/services/categoryService";
import { CategoryTreeResponse } from "@/types/category";
import MegaMenuItem from "./MegaMenuItem";
import MegaMenuColumn from "./MegaMenuColumn";
import MegaMenuSectionTitle from "./MegaMenuSectionTitle";
import MegaMenuTextLink from "./MegaMenuTextLink";

export default function JobsMegaMenu() {
    const pathname = usePathname();
    const [parentCategories, setParentCategories] = useState<CategoryTreeResponse[]>([]);

    useEffect(() => {
        const loadParentCategories = async () => {
            try {
                const res = await categoryService.getCategoryTree();
                if (res) {
                    // Get top 10 parent categories
                    setParentCategories(res.slice(0, 10));
                }
            } catch (err) {
                console.warn("Error fetching parent categories for mega-menu:", err);
            }
        };

        loadParentCategories();
    }, []);

    return (
        <div className="absolute left-0 top-full pt-5 hidden group-hover:block select-none animate-fadeIn">
            <div className="w-[680px] bg-white rounded-[8px] border border-slate-200 shadow-2xl overflow-hidden">
                <div className="grid grid-cols-[240px_1fr]">

                    {/* LEFT COLUMN: Actions & Links */}
                    <MegaMenuColumn bordered>
                        <MegaMenuSectionTitle title="QUẢN LÝ VIỆC LÀM" />

                        <div className="space-y-0.5 mt-3">
                            <MegaMenuItem
                                href="/jobs"
                                label="Tìm việc làm"
                                icon={<Search />}
                                active={pathname === "/jobs"}
                            />

                            <MegaMenuItem
                                href="/candidate/applications"
                                label="Việc làm đã ứng tuyển"
                                icon={<FileCheck />}
                                active={pathname === "/candidate/applications"}
                            />

                            <MegaMenuItem
                                href="/candidate/profile?tab=recommendations"
                                label="Việc làm phù hợp"
                                icon={<ThumbsUp />}
                                active={pathname === "/candidate/profile"}
                            />
                        </div>
                    </MegaMenuColumn>

                    {/* RIGHT COLUMN: Dynamic Parent Categories Grid */}
                    <MegaMenuColumn>
                        <MegaMenuSectionTitle title="NGÀNH NGHỀ TIÊU BIỂU" />

                        {parentCategories.length === 0 ? (
                          <div className="flex items-center gap-2 mt-6 text-gray-400 text-xs font-medium">
                            <Loader2 className="w-4 h-4 animate-spin text-[#00B14F]" />
                            <span>Đang tải danh mục...</span>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-x-6 gap-y-0.5 mt-4">
                              {parentCategories.map((cat) => (
                                  <MegaMenuTextLink
                                      key={cat.id}
                                      href={`/jobs?categoryIds=${cat.id}`}
                                      label={cat.categoryName}
                                  />
                              ))}
                          </div>
                        )}
                    </MegaMenuColumn>

                </div>
            </div>
        </div>
    );
}

// Add a helper icon for loader just in case
function Loader2(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}