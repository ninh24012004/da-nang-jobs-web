"use client";

import { Category } from "@/types/category";
import CategoryTreeItem from "./CategoryTreeItem";
import { Layers } from "lucide-react";

interface CategoryTreeProps {
    categories: Category[];
    selectedId?: number | null;
    onSelect: (category: Category) => void;
    onEdit: (category: Category) => void;
    onDelete: (id: number) => void;
    onAddChild: (parent: Category) => void;
}

export default function CategoryTree({
    categories,
    selectedId,
    onSelect,
    onEdit,
    onDelete,
    onAddChild
}: CategoryTreeProps) {
    if (categories.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/30">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
                    <Layers className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-gray-900 font-semibold mb-1">Chưa có danh mục</h3>
                <p className="text-gray-400 text-sm max-w-[200px]">
                    Bắt đầu bằng cách thêm danh mục đầu tiên của bạn.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-1 pr-2 overflow-y-auto custom-scrollbar flex-1 min-h-[300px] max-h-[600px]">
            {categories.map((category) => (
                <CategoryTreeItem
                    key={category.id}
                    category={category}
                    level={0}
                    selectedId={selectedId}
                    onSelect={onSelect}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onAddChild={onAddChild}
                />
            ))}
        </div>
    );
}
