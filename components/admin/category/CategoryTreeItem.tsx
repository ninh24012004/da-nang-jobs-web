"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, Folder, Edit2, Trash2, PlusCircle } from "lucide-react";
import { Category } from "@/types/category";
import { cn } from "@/lib/utils";

interface CategoryTreeItemProps {
    category: Category;
    level: number;
    selectedId?: number | null;
    onSelect: (category: Category) => void;
    onEdit: (category: Category) => void;
    onDelete: (id: number) => void;
    onAddChild: (parent: Category) => void;
}

export default function CategoryTreeItem({
    category,
    level,
    selectedId,
    onSelect,
    onEdit,
    onDelete,
    onAddChild
}: CategoryTreeItemProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const hasChildren = category.children && category.children.length > 0;
    const isSelected = selectedId === category.id;

    return (
        <div className="select-none">
            <div
                className={cn(
                    "group flex items-center gap-2 py-2 px-3 rounded-xl cursor-pointer transition-colors duration-200",
                    isSelected 
                        ? "bg-[#006B7A]/10 text-[#006B7A] font-semibold" 
                        : "hover:bg-gray-100 text-gray-700"
                )}
                style={{ paddingLeft: `${level * 1.5 + 0.75}rem` }}
                onClick={() => onSelect(category)}
            >
                {/* Expand/Collapse Icon */}
                <div 
                    className="w-5 h-5 flex items-center justify-center rounded-md hover:bg-black/5 transition-colors"
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(!isExpanded);
                    }}
                >
                    {hasChildren ? (
                        isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
                    ) : (
                        <div className="w-1 h-1 bg-gray-300 rounded-full ml-1" />
                    )}
                </div>

                {/* Folder Icon */}
                <Folder className={cn(
                    "w-4 h-4 shrink-0",
                    isSelected ? "text-[#006B7A]" : "text-gray-400 group-hover:text-gray-500"
                )} />

                {/* Name */}
                <span className="flex-1 truncate text-sm">{category.categoryName}</span>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddChild(category);
                        }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-[#006B7A] hover:bg-[#006B7A]/10 transition-colors"
                        title="Thêm danh mục con"
                    >
                        <PlusCircle className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(category);
                        }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Sửa"
                    >
                        <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(category.id);
                        }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Xóa"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Children Rendering */}
            {hasChildren && isExpanded && (
                <div className="mt-0.5 space-y-0.5">
                    {category.children!.map((child) => (
                        <CategoryTreeItem
                            key={child.id}
                            category={child}
                            level={level + 1}
                            selectedId={selectedId}
                            onSelect={onSelect}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onAddChild={onAddChild}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
