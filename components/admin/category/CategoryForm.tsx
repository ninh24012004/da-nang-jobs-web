"use client";

import { useEffect, useState } from "react";
import { Category, CategoryFormData } from "@/types/category";
import { Save, X, Info } from "lucide-react";

interface CategoryFormProps {
    initialData?: Category | null;
    allCategories: Category[];
    onSave: (data: CategoryFormData) => void;
    onCancel: () => void;
    isSubmitting?: boolean;
}

export default function CategoryForm({
    initialData,
    allCategories,
    onSave,
    onCancel,
    isSubmitting
}: CategoryFormProps) {
    const [formData, setFormData] = useState<CategoryFormData>({
        categoryName: "",
        parentId: null
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                categoryName: initialData.categoryName,
                parentId: initialData.parentId || null
            });
        } else {
            setFormData({
                categoryName: "",
                parentId: null
            });
        }
    }, [initialData]);

    // Flatten categories for select dropdown
    const flattenCategories = (cats: Category[], level = 0): { id: number; name: string; level: number }[] => {
        let result: { id: number; name: string; level: number }[] = [];
        cats.forEach(cat => {
            // Don't include the current category in the parent list (avoid loops)
            if (initialData && cat.id === initialData.id) return;
            
            result.push({ id: cat.id, name: cat.categoryName, level });
            if (cat.children) {
                result = [...result, ...flattenCategories(cat.children, level + 1)];
            }
        });
        return result;
    };

    const flatCategoriesList = flattenCategories(allCategories);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50 flex gap-3 mb-2">
                <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-sm text-blue-700 leading-relaxed">
                    {initialData 
                        ? "Đang chỉnh sửa danh mục. Bạn có thể thay đổi tên hoặc di chuyển danh mục này sang một danh mục cha khác." 
                        : "Thêm danh mục mới vào hệ thống. Bạn có thể chọn danh mục cha để tạo cấu trúc phân cấp."}
                </p>
            </div>

            <div className="space-y-4">
                {/* Name */}
                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700 ml-1">
                        Tên danh mục <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.categoryName}
                        onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                        placeholder="Nhập tên danh mục..."
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#006B7A] focus:ring-4 focus:ring-[#006B7A]/5 outline-none transition-all placeholder:text-gray-400"
                    />
                </div>

                {/* Parent Select */}
                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700 ml-1">
                        Danh mục cha
                    </label>
                    <select
                        value={formData.parentId || ""}
                        onChange={(e) => setFormData({ ...formData, parentId: e.target.value ? Number(e.target.value) : null })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#006B7A] focus:ring-4 focus:ring-[#006B7A]/5 outline-none transition-all appearance-none bg-white cursor-pointer"
                    >
                        <option value="">-- Danh mục gốc --</option>
                        {flatCategoriesList.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {"\u00A0".repeat(cat.level * 4)} {cat.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 pt-4">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-[#006B7A] text-white py-3 px-6 rounded-xl font-bold hover:bg-[#005a66] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-[#006B7A]/20"
                >
                    <Save className="w-4 h-4" />
                    {isSubmitting ? "Đang lưu..." : "Lưu danh mục"}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 active:scale-[0.98] transition-all flex items-center gap-2"
                >
                    <X className="w-4 h-4" />
                    Hủy
                </button>
            </div>
        </form>
    );
}
