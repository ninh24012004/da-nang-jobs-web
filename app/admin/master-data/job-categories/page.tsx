"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, LayoutGrid, Search, AlertCircle, Trash2, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Category, CategoryFormData, CategoryTreeResponse } from "@/types/category";
import CategoryTree from "@/components/admin/category/CategoryTree";
import CategoryTreeItem from "@/components/admin/category/CategoryTreeItem";
import CategoryForm from "@/components/admin/category/CategoryForm";
import { cn } from "@/lib/utils";
import { categoryService } from "@/services/categoryService";

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [idToDelete, setIdToDelete] = useState<number | null>(null);

    // Search States
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<Category[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Map API Tree to UI Tree
    const mapTree = (tree: CategoryTreeResponse[], parentId: number | null = null): Category[] => {
        return tree.map(node => ({
            id: node.id,
            categoryName: node.categoryName,
            parentId: parentId,
            children: node.children ? mapTree(node.children, node.id) : []
        }));
    };

    const fetchCategories = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await categoryService.getCategoryTree();
            if (response.success) {
                setCategories(mapTree(response.data));
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Không thể tải danh mục");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    // Handle Search with Debounce
    useEffect(() => {
        if (!searchTerm.trim()) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            try {
                setIsSearching(true);
                const response = await categoryService.searchCategories(searchTerm);
                if (response.success) {
                    const results = response.data.map(item => ({
                        id: item.id,
                        categoryName: item.categoryName,
                        parentId: item.parentCategoryId,
                        children: []
                    }));
                    setSearchResults(results);
                }
            } catch (error) {
                console.error("Search error:", error);
            } finally {
                setIsSearching(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

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
        try {
            setIsSubmitting(true);

            const requestData = {
                categoryName: data.categoryName,
                parentCategoryId: data.parentId
            };

            let response;
            if (selectedCategory?.id && selectedCategory.id !== 0) {
                // Update
                response = await categoryService.updateCategory(selectedCategory.id, requestData);
            } else {
                // Create
                response = await categoryService.createCategory(requestData);
            }

            if (response.success) {
                toast.success(response.message);
                setIsEditing(false);
                setSelectedCategory(null);
                fetchCategories(); // Refresh tree
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi khi lưu danh mục");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteClick = (id: number) => {
        setIdToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!idToDelete) return;
        try {
            setIsSubmitting(true);
            const response = await categoryService.deleteCategory(idToDelete);

            if (response.success) {
                toast.success(response.message);
                setShowDeleteModal(false);
                setIdToDelete(null);
                if (selectedCategory?.id === idToDelete) {
                    setIsEditing(false);
                    setSelectedCategory(null);
                }
                fetchCategories(); // Refresh tree
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi khi xóa danh mục");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-[1200px] mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Quản lý danh mục</h1>
                    <p className="text-gray-500 mt-1">Cấu trúc phân cấp các ngành nghề và lĩnh vực tuyển dụng.</p>
                </div>
                <button
                    onClick={handleAddNew}
                    className="bg-[#006B7A] text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#005a66] active:scale-[0.98] transition-all shadow-lg shadow-[#006B7A]/20"
                >
                    <Plus className="w-5 h-5" />
                    Thêm danh mục
                </button>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                {/* Left Column: Tree View */}
                <div className="lg:col-span-5 bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                    <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
                        <div className="flex items-center gap-2 font-bold text-gray-800">
                            <LayoutGrid className="w-5 h-5 text-[#006B7A]" />
                            {searchTerm ? "Kết quả tìm kiếm" : "Cấu trúc danh mục"}
                        </div>
                        <div className="group relative flex items-center">
                            <div className={cn(
                                "flex items-center bg-white rounded-xl border border-gray-100 shadow-sm transition-all duration-300 w-10 group-hover:w-64 overflow-hidden",
                                searchTerm && "w-64 border-[#006B7A]/30 ring-4 ring-[#006B7A]/5"
                            )}>
                                <div className="p-2 shrink-0">
                                    {isSearching ? (
                                        <Loader2 className="w-4 h-4 text-[#006B7A] animate-spin" />
                                    ) : (
                                        <Search className="w-4 h-4 text-gray-400" />
                                    )}
                                </div>
                                <input 
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Tìm kiếm danh mục..."
                                    className={cn(
                                        "w-full bg-transparent border-none outline-none text-sm pr-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100",
                                        searchTerm && "opacity-100"
                                    )}
                                />
                                {searchTerm && (
                                    <button 
                                        onClick={() => setSearchTerm("")}
                                        className="absolute right-2 p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-all"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-4 flex-1 overflow-hidden flex flex-col">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                <Loader2 className="w-8 h-8 text-[#006B7A] animate-spin" />
                                <p className="text-gray-400 text-sm">Đang tải dữ liệu...</p>
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
                                        <Search className="w-10 h-10 text-gray-300 mb-2" />
                                        <p className="text-sm text-gray-500">Không tìm thấy danh mục nào</p>
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

                    <div className="p-4 bg-gray-50/50 border-t border-gray-50 text-[11px] text-gray-400 flex items-center gap-2">
                        <AlertCircle className="w-3 h-3" />
                        {searchTerm ? "Kết quả tìm kiếm dạng danh sách rút gọn." : "Click vào danh mục để chỉnh sửa hoặc xem chi tiết."}
                    </div>
                </div>

                {/* Right Column: Form */}
                <div className="lg:col-span-7 bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                    <div className="p-6 border-b border-gray-50 bg-gray-50/30">
                        <div className="flex items-center gap-2 font-bold text-gray-800">
                            <div className={cn(
                                "w-2 h-2 rounded-full",
                                isEditing ? "bg-blue-500 animate-pulse" : "bg-gray-300"
                            )} />
                            {selectedCategory?.id === 0
                                ? "Thêm danh mục con"
                                : selectedCategory?.id
                                    ? `Chỉnh sửa: ${selectedCategory.categoryName}`
                                    : "Thêm danh mục mới"}
                        </div>
                    </div>

                    <div className="p-8">
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
                            <div className="flex flex-col items-center justify-center py-24 text-center">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                    <Plus className="w-10 h-10 text-gray-200" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Bắt đầu quản lý</h3>
                                <p className="text-gray-400 max-w-[300px] text-sm">
                                    Chọn một danh mục bên trái để sửa hoặc nhấn nút thêm mới để bắt đầu.
                                </p>
                                <button
                                    onClick={handleAddNew}
                                    className="mt-8 text-[#006B7A] font-bold hover:underline underline-offset-4"
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.25)] animate-in zoom-in-95 duration-200">

                        {/* Header */}
                        <div className="border-b border-gray-100 px-8 py-6">
                            <div className="flex items-start gap-4">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-50">
                                    <Trash2 className="h-7 w-7 text-red-500" />
                                </div>

                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        Xóa danh mục
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Hành động này không thể hoàn tác.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="px-8 py-6">
                            <div className="rounded-2xl border border-red-100 bg-red-50/60 p-5">
                                <p className="mb-4 font-semibold text-red-600">
                                    Chỉ có thể xóa khi:
                                </p>

                                <div className="space-y-3 text-sm text-gray-700">
                                    <div className="flex items-center gap-3">
                                        <div className="h-2 w-2 rounded-full bg-red-400" />
                                        Không có danh mục con
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="h-2 w-2 rounded-full bg-red-400" />
                                        Không gắn với công việc
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="h-2 w-2 rounded-full bg-red-400" />
                                        Không gắn với ứng viên
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex gap-3 border-t border-gray-100 px-8 py-6">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 rounded-2xl border border-gray-200 bg-white py-3.5 font-semibold text-gray-700 transition-all hover:bg-gray-50"
                            >
                                Hủy
                            </button>

                            <button
                                onClick={confirmDelete}
                                disabled={isSubmitting}
                                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-red-600 py-3.5 font-semibold text-white transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {isSubmitting && (
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
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
