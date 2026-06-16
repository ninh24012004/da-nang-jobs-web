"use client";

import { useState, useEffect } from "react";
import { Plus, LayoutGrid, Search, AlertCircle, Trash2, Loader2, X } from "lucide-react";
import { Category, CategoryFormData } from "@/types/category";
import CategoryTree from "@/components/admin/category/CategoryTree";
import CategoryTreeItem from "@/components/admin/category/CategoryTreeItem";
import CategoryForm from "@/components/admin/category/CategoryForm";
import { cn } from "@/lib/utils";
import { useCategories } from "@/hooks/useCategories";

export default function CategoriesPage() {
    const {
        categories,
        searchResults,
        isLoading,
        isSearching,
        isSubmitting,
        fetchCategories,
        searchCategories,
        createCategory,
        updateCategory,
        deleteCategory,
        setSearchResults,
    } = useCategories();

    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [idToDelete, setIdToDelete] = useState<number | null>(null);

    // Search States
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    // Handle Search with Debounce
    useEffect(() => {
        if (!searchTerm.trim()) {
            setSearchResults([]);
            return;
        }

        const delayDebounceFn = setTimeout(() => {
            searchCategories(searchTerm);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, searchCategories, setSearchResults]);

    const handleSelectCategory = (category: Category) => {
        setSelectedCategory(category);
        setIsEditing(true);
    };

    const handleAddNew = () => {
        setSelectedCategory(null);
        setIsEditing(true);
    };

    const handleAddChild = (parent: Category) => {
        setSelectedCategory({
            id: 0,
            categoryName: "",
            parentId: parent.id
        });
        setIsEditing(true);
    };

    const handleSave = async (data: CategoryFormData) => {
        const res = selectedCategory?.id && selectedCategory.id !== 0
            ? await updateCategory(selectedCategory.id, data)
            : await createCategory(data);

        if (res.success) {
            setIsEditing(false);
            setSelectedCategory(null);
        }
    };

    const handleDeleteClick = (id: number) => {
        setIdToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!idToDelete) return;
        const res = await deleteCategory(idToDelete);
        if (res.success) {
            setShowDeleteModal(false);
            setIdToDelete(null);
            setSearchResults(prev => prev.filter(cat => cat.id !== idToDelete));
            if (selectedCategory?.id === idToDelete || selectedCategory?.parentId === idToDelete) {
                setIsEditing(false);
                setSelectedCategory(null);
            }
        }
    };

    return (
        <div className="max-w-[1200px] mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quản lý danh mục</h1>
                    <p className="text-slate-505 mt-1 text-xs font-medium">Cấu trúc phân cấp các ngành nghề và lĩnh vực tuyển dụng.</p>
                </div>
                <button
                    onClick={handleAddNew}
                    className="bg-slate-900 text-white px-4 py-2 rounded-md font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors duration-150 text-xs cursor-pointer shadow-xs"
                >
                    <Plus className="w-4 h-4" />
                    Thêm danh mục
                </button>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Left Column: Tree View */}
                <div className="lg:col-span-5 bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                    <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-2 font-bold text-slate-850 text-xs">
                            <LayoutGrid className="w-4 h-4 text-slate-700" />
                            {searchTerm ? "Kết quả tìm kiếm" : "Cấu trúc danh mục"}
                        </div>
                        <div className="group relative flex items-center">
                            <div className={cn(
                                "flex items-center bg-white rounded-md border border-slate-200 shadow-xs transition-all duration-150 w-10 group-hover:w-64 overflow-hidden",
                                searchTerm && "w-64 border-slate-350"
                            )}>
                                <div className="p-2 shrink-0">
                                    {isSearching ? (
                                        <Loader2 className="w-4 h-4 text-slate-600 animate-spin" />
                                    ) : (
                                        <Search className="w-4 h-4 text-slate-400" />
                                    )}
                                </div>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Tìm kiếm danh mục..."
                                    className={cn(
                                        "w-full bg-transparent border-none outline-none text-xs pr-10 opacity-0 group-hover:opacity-100 transition-opacity duration-150",
                                        searchTerm && "opacity-100"
                                    )}
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm("")}
                                        className="absolute right-2 p-1 hover:bg-slate-100 rounded-full text-slate-405 hover:text-slate-650 transition-colors"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-4 flex-1 overflow-hidden flex flex-col">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 space-y-3">
                                <Loader2 className="w-8 h-8 text-slate-650 animate-spin" />
                                <p className="text-slate-405 text-xs font-semibold">Đang tải dữ liệu...</p>
                            </div>
                        ) : searchTerm ? (
                            <div className="space-y-1 overflow-y-auto custom-scrollbar flex-1">
                                {searchResults.length > 0 ? (
                                    searchResults.map((result) => (
                                        <CategoryTreeItem
                                            key={result.id}
                                            category={result}
                                            level={0}
                                            selectedId={selectedCategory?.id}
                                            onSelect={handleSelectCategory}
                                            onEdit={handleSelectCategory}
                                            onDelete={handleDeleteClick}
                                            onAddChild={handleAddChild}
                                        />
                                    ))
                                ) : !isSearching && (
                                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                                        <Search className="w-10 h-10 text-slate-300 mb-2" />
                                        <p className="text-xs text-slate-500">Không tìm thấy danh mục nào</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <CategoryTree
                                categories={categories}
                                selectedId={selectedCategory?.id}
                                onSelect={handleSelectCategory}
                                onEdit={handleSelectCategory}
                                onDelete={handleDeleteClick}
                                onAddChild={handleAddChild}
                            />
                        )}
                    </div>

                    <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center gap-2">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {searchTerm ? "Kết quả tìm kiếm dạng danh sách rút gọn." : "Click vào danh mục để chỉnh sửa hoặc xem chi tiết."}
                    </div>
                </div>

                {/* Right Column: Form */}
                <div className="lg:col-span-7 bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                    <div className="p-4 border-b border-slate-200 bg-slate-50">
                        <div className="flex items-center gap-2 font-semibold text-slate-850 text-xs">
                            <div className={cn(
                                "w-2 h-2 rounded-full",
                                isEditing ? "bg-slate-900" : "bg-slate-300"
                            )} />
                            {selectedCategory?.id === 0
                                ? "Thêm danh mục con"
                                : selectedCategory?.id
                                    ? `Chỉnh sửa: ${selectedCategory.categoryName}`
                                    : "Thêm danh mục mới"}
                        </div>
                    </div>

                    <div className="p-6">
                        {isEditing ? (
                            <CategoryForm
                                initialData={selectedCategory}
                                allCategories={categories}
                                onSave={handleSave}
                                onCancel={() => {
                                    setIsEditing(false);
                                    setSelectedCategory(null);
                                }}
                                isSubmitting={isSubmitting}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-14 h-14 bg-slate-100 rounded-md flex items-center justify-center mb-4">
                                    <Plus className="w-6 h-6 text-slate-400" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 mb-1">Bắt đầu quản lý</h3>
                                <p className="text-slate-450 max-w-[260px] text-xs font-semibold">
                                    Chọn một danh mục bên trái để sửa hoặc nhấn nút thêm mới để bắt đầu.
                                </p>
                                <button
                                    onClick={handleAddNew}
                                    className="mt-6 text-slate-850 font-bold hover:text-slate-950 text-xs hover:underline cursor-pointer"
                                >
                                    + Thêm danh mục gốc
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-md overflow-hidden rounded-lg bg-white border border-slate-200 shadow-lg">

                        {/* Header */}
                        <div className="border-b border-slate-200 px-6 py-4">
                            <div className="flex items-start gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-red-50">
                                    <Trash2 className="h-5 h-5 text-red-500" />
                                </div>

                                <div>
                                    <h2 className="text-base font-bold text-slate-900">
                                        Xóa danh mục
                                    </h2>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Hành động này không thể hoàn tác.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="px-6 py-4">
                            <div className="rounded border border-red-100 bg-red-50 p-4">
                                <p className="mb-2 font-bold text-red-750 text-xs">
                                    Chỉ có thể xóa khi:
                                </p>

                                <div className="space-y-2 text-xs font-medium text-slate-700">
                                    <div className="flex items-center gap-3">
                                        <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                        Không có danh mục con
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                        Không gắn với công việc
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                        Không gắn với ứng viên
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex gap-2 border-t border-slate-200 px-6 py-4 bg-slate-50">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setIdToDelete(null);
                                }}
                                disabled={isSubmitting}
                                className="flex-1 rounded border border-slate-200 bg-white py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Hủy
                            </button>

                            <button
                                onClick={confirmDelete}
                                disabled={isSubmitting}
                                className="flex flex-1 items-center justify-center gap-2 rounded bg-red-600 py-2 text-xs font-bold text-white hover:bg-red-700 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isSubmitting && (
                                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                )}

                                {isSubmitting
                                    ? "Đang xóa..."
                                    : "Xác nhận xóa"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
