"use client";

import { useState, useEffect, useCallback, type FormEvent } from "react";
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
    SlidersHorizontal,
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

    // Color mapper for tag badges to look realistic and gorgeous
    const getTagColorStyle = (name: string) => {
        const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const styles = [
            { bg: "bg-teal-50 border-teal-200 text-teal-700", text: "Teal" },
            { bg: "bg-sky-50 border-sky-200 text-sky-700", text: "Sky" },
            { bg: "bg-purple-50 border-purple-200 text-purple-700", text: "Purple" },
            { bg: "bg-amber-50 border-amber-200 text-amber-700", text: "Amber" },
            { bg: "bg-emerald-50 border-emerald-200 text-emerald-700", text: "Emerald" },
            { bg: "bg-indigo-50 border-indigo-200 text-indigo-700", text: "Indigo" },
            { bg: "bg-rose-50 border-rose-200 text-rose-700", text: "Rose" }
        ];
        return styles[hash % styles.length];
    };

    return (
        <div className="max-w-[1200px] mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                        <span className="p-2 bg-sky-50 rounded-2xl inline-block shadow-sm">
                            <Tag className="w-7 h-7 text-sky-500" />
                        </span>
                        Quản lý Loại công việc
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium">Danh sách các nhãn tag phân loại hình thức và tính chất công việc tuyển dụng.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-[#006B7A] text-white px-6 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#005a66] active:scale-[0.98] transition-all shadow-lg shadow-[#006B7A]/20 cursor-pointer"
                >
                    <Plus className="w-5 h-5" />
                    Thêm loại công việc
                </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tổng số loại công việc</p>
                        <h3 className="text-2xl font-black text-gray-800 mt-1">{tags.length}</h3>
                    </div>
                    <div className="p-3 bg-[#006B7A]/10 text-[#006B7A] rounded-2xl">
                        <Tag size={22} />
                    </div>
                </div>
                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Hình thức phổ biến</p>
                        <h3 className="text-2xl font-black text-gray-800 mt-1">
                            {tags.filter(t => /toàn|bán|remote|part|full|freelance/i.test(t.tagName)).length} loại
                        </h3>
                    </div>
                    <div className="p-3 bg-sky-50 text-sky-650 rounded-2xl">
                        <Sparkles size={22} />
                    </div>
                </div>
                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Trạng thái hệ thống</p>
                        <h3 className="text-2xl font-black text-emerald-600 mt-1">Chuẩn hóa</h3>
                    </div>
                    <div className="p-3 bg-emerald-50 text-emerald-650 rounded-2xl">
                        <TrendingUp size={22} />
                    </div>
                </div>
            </div>

            {/* Content Container */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xs overflow-hidden flex flex-col min-h-[500px]">
                {/* Search & Actions Toolbar */}
                <div className="p-6 border-b border-gray-50 bg-gray-50/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm loại công việc..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-10 py-3 bg-white border border-gray-200 rounded-2xl outline-none focus:border-[#006B7A] focus:ring-4 focus:ring-[#006B7A]/5 transition-all text-sm font-semibold"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-450 hover:text-gray-650 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {/* View Switcher */}
                        <div className="bg-gray-100 p-1 rounded-2xl flex items-center border border-gray-200">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={cn(
                                    "p-2 rounded-xl transition-all cursor-pointer",
                                    viewMode === "grid" ? "bg-white text-[#006B7A] shadow-xs" : "text-gray-400 hover:text-gray-600"
                                )}
                                title="Xem dạng lưới"
                            >
                                <LayoutGrid size={16} />
                            </button>
                            <button
                                onClick={() => setViewMode("table")}
                                className={cn(
                                    "p-2 rounded-xl transition-all cursor-pointer",
                                    viewMode === "table" ? "bg-white text-[#006B7A] shadow-xs" : "text-gray-400 hover:text-gray-600"
                                )}
                                title="Xem dạng danh sách"
                            >
                                <List size={16} />
                            </button>
                        </div>

                        <div className="px-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-xs font-bold text-gray-500 shadow-xs select-none">
                            Kết quả: <span className="text-[#006B7A]">{filteredTags.length}</span>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="p-8 flex-1 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-32 space-y-4">
                            <Loader2 className="w-10 h-10 text-[#006B7A] animate-spin" />
                            <p className="text-gray-400 text-sm font-bold">Đang tải dữ liệu...</p>
                        </div>
                    ) : filteredTags.length > 0 ? (
                        viewMode === "grid" ? (
                            /* GRID MODE: Beautiful colorful tags */
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
                                {filteredTags.map((tag) => {
                                    const colors = getTagColorStyle(tag.tagName);
                                    return (
                                        <div
                                            key={tag.id}
                                            className="border border-gray-150 p-4.5 rounded-2xl bg-white hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4 group relative overflow-hidden"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className={cn("px-3 py-1 text-xs font-bold rounded-lg border shadow-xs truncate max-w-[80%]", colors.bg)}>
                                                    #{tag.tagName}
                                                </span>
                                                <span className="text-[9px] font-mono text-gray-400">ID: {tag.id}</span>
                                            </div>

                                            {/* Action bar shown elegantly on card */}
                                            <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                                                <span className="text-[10px] text-gray-400 font-sans font-medium">Hình thức</span>
                                                <div className="flex gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleOpenModal(tag)}
                                                        className="p-1.5 bg-gray-50 hover:bg-teal-50 text-teal-650 hover:text-teal-700 rounded-lg border border-gray-150 shadow-xs transition-all cursor-pointer"
                                                        title="Sửa"
                                                    >
                                                        <Edit2 size={12} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(tag)}
                                                        className="p-1.5 bg-gray-50 hover:bg-rose-50 text-rose-600 hover:text-rose-700 rounded-lg border border-gray-150 shadow-xs transition-all cursor-pointer"
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
                            <div className="border border-gray-150/70 rounded-3xl overflow-hidden shadow-xs animate-in fade-in duration-300">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100 font-bold text-gray-550 uppercase tracking-wider">
                                            <th className="px-6 py-4.5 w-20">STT</th>
                                            <th className="px-6 py-4.5 w-32">Mã nhãn dán</th>
                                            <th className="px-6 py-4.5 min-w-[200px]">Tên loại công việc</th>
                                            <th className="px-6 py-4.5 text-right w-40">Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
                                        {filteredTags.map((tag, index) => {
                                            const colors = getTagColorStyle(tag.tagName);
                                            return (
                                                <tr key={tag.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <span className="font-bold text-gray-400">{index + 1}</span>
                                                    </td>
                                                    <td className="px-6 py-4 font-mono text-[10px] text-gray-500">
                                                        TAG-{tag.id}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <span className={cn("px-2.5 py-1 text-xs font-bold rounded-lg border", colors.bg)}>
                                                                #{tag.tagName}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => handleOpenModal(tag)}
                                                                className="flex items-center gap-1 bg-teal-50 border border-teal-100 hover:bg-teal-100 text-teal-700 px-2.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer"
                                                            >
                                                                <Edit2 size={11} />
                                                                <span>Sửa</span>
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteClick(tag)}
                                                                className="flex items-center gap-1 bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-600 px-2.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer"
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
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <Tag className="w-10 h-10 text-gray-200" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Không tìm thấy loại công việc</h3>
                            <p className="text-gray-400 text-sm max-w-xs mt-1">
                                {searchTerm ? "Thử thay đổi từ khóa tìm kiếm của bạn." : "Bắt đầu bằng cách thêm loại công việc mới vào hệ thống."}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer Guide */}
                <div className="p-6 border-t border-gray-50 bg-gray-50/20 text-[11px] text-gray-400 flex items-center gap-2">
                    <AlertCircle className="w-3 h-3" />
                    Loại công việc giúp lọc nhanh tin tuyển dụng trên trang chủ và cải thiện khả năng tìm kiếm.
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                                    {editingTag ? "Chỉnh sửa loại công việc" : "Thêm loại công việc mới"}
                                </h2>
                                <p className="text-gray-500 text-xs mt-1.5 font-medium">
                                    {editingTag ? "Cập nhật thông tin phân loại tính chất công việc." : "Tạo loại công việc mới để sử dụng cho tin tuyển dụng."}
                                </p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-700 ml-1 block uppercase tracking-wider">Tên loại công việc *</label>
                                <input
                                    type="text"
                                    value={formData.tagName}
                                    onChange={(e) => setFormData({ ...formData, tagName: e.target.value })}
                                    placeholder="Ví dụ: Toàn thời gian, Part-time, Remote, Thực tập..."
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:bg-white focus:border-[#006B7A] focus:ring-4 focus:ring-[#006B7A]/5 font-semibold transition-all text-xs"
                                    required
                                />
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-gray-50">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3.5 rounded-2xl font-bold transition-all cursor-pointer text-xs"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 bg-[#006B7A] text-white py-3.5 rounded-2xl font-bold hover:bg-[#005a66] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#006B7A]/20 cursor-pointer text-xs disabled:opacity-60"
                                >
                                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {editingTag ? "Lưu thay đổi" : "Lưu dữ liệu"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
                            <Trash2 className="w-8 h-8 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Xác nhận xóa?</h2>
                        <p className="text-gray-500 mb-8 leading-relaxed font-semibold text-xs">
                            Bạn có chắc chắn muốn xóa loại công việc <span className="font-extrabold text-gray-900">"{tagToDelete?.tagName}"</span>?
                            Hành động này không thể hoàn tác.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3.5 rounded-2xl font-bold transition-all cursor-pointer text-xs"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={isSubmitting}
                                className="flex-1 bg-red-650 text-white py-3.5 rounded-2xl font-bold hover:bg-red-700 transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
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