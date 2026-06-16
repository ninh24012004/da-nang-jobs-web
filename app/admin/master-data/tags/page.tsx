"use client";

import { useState, useEffect, type FormEvent } from "react";
import {
    Plus,
    Search,
    Trash2,
    Edit2,
    Loader2,
    Tag,
    AlertCircle,
    X,
    LayoutGrid,
    List,
    Sparkles,
    TrendingUp
} from "lucide-react";
import { toast } from "sonner";
import { useTags } from "@/hooks/useTags";
import { TagResponse, TagFormData } from "@/types/tag";
import { cn } from "@/lib/utils";

export default function TagsPage() {
    const {
        tags,
        isLoading,
        isSubmitting,
        fetchTags,
        createTag,
        updateTag,
        deleteTag,
    } = useTags();

    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [editingTag, setEditingTag] = useState<TagResponse | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [tagToDelete, setTagToDelete] = useState<TagResponse | null>(null);

    // Form states
    const [formData, setFormData] = useState<TagFormData>({
        tagName: ""
    });

    useEffect(() => {
        fetchTags();
    }, [fetchTags]);

    const handleOpenModal = (tag: TagResponse | null = null) => {
        if (tag) {
            setEditingTag(tag);
            setFormData({ tagName: tag.tagName });
        } else {
            setEditingTag(null);
            setFormData({ tagName: "" });
        }
        setShowModal(true);
    };

    const handleSave = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!formData.tagName.trim()) {
            toast.error("Vui lòng nhập tên tag");
            return;
        }

        const res = editingTag
            ? await updateTag(editingTag.id, formData)
            : await createTag(formData);

        if (res.success) {
            setShowModal(false);
            setEditingTag(null);
        }
    };

    const handleDeleteClick = (tag: TagResponse) => {
        setTagToDelete(tag);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!tagToDelete) return;

        const res = await deleteTag(tagToDelete.id);
        if (res.success) {
            setShowDeleteModal(false);
            setTagToDelete(null);
        }
    };

    const filteredTags = tags.filter((tag) =>
        tag.tagName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getTagColorStyle = (name: string) => {
        return { bg: "bg-slate-50 border-slate-200 text-slate-700", text: "Slate" };
    };

    return (
        <div className="max-w-[1200px] mx-auto space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <span className="p-1.5 bg-slate-100 rounded inline-block border border-slate-200">
                            <Tag className="w-5 h-5 text-slate-750" />
                        </span>
                        Quản lý Loại công việc
                    </h1>
                    <p className="text-slate-505 mt-1 text-xs font-medium">Danh sách các nhãn tag phân loại hình thức và tính chất công việc tuyển dụng.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-slate-900 text-white px-4 py-2 rounded-md font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors duration-150 text-xs cursor-pointer shadow-xs"
                >
                    <Plus className="w-4 h-4" />
                    Thêm loại công việc
                </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tổng số loại công việc</p>
                        <h3 className="text-xl font-bold text-slate-850 mt-1">{tags.length}</h3>
                    </div>
                    <div className="p-2 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                        <Tag size={18} />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hình thức phổ biến</p>
                        <h3 className="text-xl font-bold text-slate-850 mt-1">
                            {tags.filter(t => /toàn|bán|remote|part|full|freelance/i.test(t.tagName)).length} loại
                        </h3>
                    </div>
                    <div className="p-2 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                        <Sparkles size={18} />
                    </div>
                </div>
            </div>

            {/* Content Container */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
                {/* Search & Actions Toolbar */}
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm loại công việc..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-md outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 text-xs font-semibold text-slate-800"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100 transition-colors"
                            >
                                <X size={12} />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {/* View Switcher */}
                        <div className="bg-slate-100 p-0.5 rounded-md flex items-center border border-slate-200">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={cn(
                                    "p-1.5 rounded transition-all cursor-pointer",
                                    viewMode === "grid" ? "bg-white text-slate-900 shadow-xs border border-slate-200" : "text-slate-400 hover:text-slate-600"
                                )}
                                title="Xem dạng lưới"
                            >
                                <LayoutGrid size={14} />
                            </button>
                            <button
                                onClick={() => setViewMode("table")}
                                className={cn(
                                    "p-1.5 rounded transition-all cursor-pointer",
                                    viewMode === "table" ? "bg-white text-slate-900 shadow-xs border border-slate-200" : "text-slate-400 hover:text-slate-600"
                                )}
                                title="Xem dạng danh sách"
                            >
                                <List size={14} />
                            </button>
                        </div>

                        <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-md text-[10px] font-bold text-slate-505 shadow-xs select-none">
                            Kết quả: <span className="text-slate-950">{filteredTags.length}</span>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="p-6 flex-1 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-3">
                            <Loader2 className="w-8 h-8 text-slate-600 animate-spin" />
                            <p className="text-slate-405 text-xs font-semibold">Đang tải dữ liệu...</p>
                        </div>
                    ) : filteredTags.length > 0 ? (
                        viewMode === "grid" ? (
                            /* GRID MODE: Beautiful color-neutral tags */
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {filteredTags.map((tag) => {
                                    const colors = getTagColorStyle(tag.tagName);
                                    return (
                                        <div
                                            key={tag.id}
                                            className="border border-slate-200 p-4 rounded-md bg-white hover:bg-slate-50 transition-colors duration-150 flex flex-col justify-between space-y-4 group relative overflow-hidden"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className={cn("px-2 py-0.5 text-xs font-bold rounded border shadow-xs truncate max-w-[80%]", colors.bg)}>
                                                    #{tag.tagName}
                                                </span>
                                                <span className="text-[9px] font-mono text-slate-400">ID: {tag.id}</span>
                                            </div>

                                            {/* Action bar shown elegantly on card */}
                                            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                                                <span className="text-[10px] text-slate-400 font-sans font-medium">Hình thức</span>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-150">
                                                    <button
                                                        onClick={() => handleOpenModal(tag)}
                                                        className="p-1 bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 rounded border border-slate-200 shadow-xs transition-colors cursor-pointer"
                                                        title="Sửa"
                                                    >
                                                        <Edit2 size={12} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(tag)}
                                                        className="p-1 bg-white hover:bg-red-50 text-red-650 hover:text-red-700 rounded border border-slate-200 shadow-xs transition-colors cursor-pointer"
                                                        title="Xóa"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            /* TABLE MODE: Clean, always visible buttons */
                            <div className="border border-slate-200 rounded-md overflow-hidden shadow-xs">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-550 uppercase tracking-wider">
                                            <th className="px-4 py-3 w-16">STT</th>
                                            <th className="px-4 py-3 w-32">Mã nhãn dán</th>
                                            <th className="px-4 py-3 min-w-[200px]">Tên loại công việc</th>
                                            <th className="px-4 py-3 text-right w-40">Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 font-medium text-slate-700">
                                        {filteredTags.map((tag, index) => {
                                            const colors = getTagColorStyle(tag.tagName);
                                            return (
                                                <tr key={tag.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                                                    <td className="px-4 py-3">
                                                        <span className="font-bold text-slate-400">{index + 1}</span>
                                                    </td>
                                                    <td className="px-4 py-3 font-mono text-[10px] text-slate-500">
                                                        TAG-{tag.id}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <span className={cn("px-2 py-0.5 text-xs font-bold rounded border", colors.bg)}>
                                                                #{tag.tagName}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <button
                                                                onClick={() => handleOpenModal(tag)}
                                                                className="flex items-center gap-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-750 px-2.5 py-1.5 rounded-md font-bold transition-colors duration-150 cursor-pointer"
                                                            >
                                                                <Edit2 size={11} />
                                                                <span>Sửa</span>
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteClick(tag)}
                                                                className="flex items-center gap-1 bg-white hover:bg-red-50 border border-slate-200 text-red-655 px-2.5 py-1.5 rounded-md font-bold transition-colors duration-150 cursor-pointer"
                                                            >
                                                                <Trash2 size={11} />
                                                                <span>Xóa</span>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )
                    ) : (
                        /* EMPTY STATE */
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-14 h-14 bg-slate-100 rounded-md flex items-center justify-center mb-4">
                                <Tag className="w-7 h-7 text-slate-350" />
                            </div>
                            <h3 className="text-sm font-bold text-slate-900">Không tìm thấy loại công việc</h3>
                            <p className="text-slate-400 text-xs max-w-xs mt-1 font-medium">
                                {searchTerm ? "Thử thay đổi từ khóa tìm kiếm của bạn." : "Bắt đầu bằng cách thêm loại công việc mới vào hệ thống."}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer Guide */}
                <div className="p-4 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500 flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Loại công việc giúp lọc nhanh tin tuyển dụng trên trang chủ và cải thiện khả năng tìm kiếm.
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
                    <div className="bg-white rounded-lg w-full max-w-lg shadow-lg border border-slate-200 overflow-hidden">
                        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                            <div>
                                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                                    {editingTag ? "Chỉnh sửa loại công việc" : "Thêm loại công việc mới"}
                                </h2>
                                <p className="text-xs text-slate-500 mt-1.5 font-medium">
                                    {editingTag ? "Cập nhật thông tin phân loại tính chất công việc." : "Tạo loại công việc mới để sử dụng cho tin tuyển dụng."}
                                </p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-1 rounded hover:bg-slate-200 text-slate-450 hover:text-slate-655 transition-colors border border-slate-200 cursor-pointer">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-5 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">Tên loại công việc *</label>
                                <input
                                    type="text"
                                    value={formData.tagName}
                                    onChange={(e) => setFormData({ ...formData, tagName: e.target.value })}
                                    placeholder="Ví dụ: Toàn thời gian, Part-time, Remote, Thực tập..."
                                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold outline-none transition-colors focus:border-slate-400 focus:ring-1 focus:ring-slate-400 text-slate-750"
                                    required
                                />
                            </div>

                            <div className="flex gap-2 pt-4 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-white hover:bg-slate-100 text-slate-700 py-2 rounded-md font-bold border border-slate-200 transition-all cursor-pointer text-xs"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 bg-slate-900 text-white py-2 rounded-md font-bold hover:bg-slate-800 transition-colors duration-150 flex items-center justify-center gap-2 cursor-pointer text-xs disabled:opacity-50"
                                >
                                    {isSubmitting ? "Đang lưu..." : editingTag ? "Lưu thay đổi" : "Lưu dữ liệu"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
                    <div className="bg-white rounded-lg p-5 max-w-md w-full shadow-lg border border-slate-200">
                        <div className="w-10 h-10 bg-red-50 rounded flex items-center justify-center mb-4">
                            <Trash2 className="w-5 h-5 text-red-500" />
                        </div>
                        <h2 className="text-base font-bold text-slate-900 mb-1">Xác nhận xóa?</h2>
                        <p className="text-slate-500 mb-5 leading-relaxed font-semibold text-xs">
                            Bạn có chắc chắn muốn xóa loại công việc <span className="font-extrabold text-slate-900">"{tagToDelete?.tagName}"</span>?
                            Hành động này không thể hoàn tác.
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 bg-white hover:bg-slate-100 text-slate-700 py-2 rounded-md font-bold border border-slate-200 cursor-pointer text-xs"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={isSubmitting}
                                className="flex-1 bg-red-650 text-white py-2 rounded-md font-bold hover:bg-red-700 transition-colors duration-150 flex items-center justify-center gap-2 cursor-pointer text-xs disabled:opacity-50"
                            >
                                {isSubmitting ? "Đang xóa..." : "Xác nhận xóa"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}