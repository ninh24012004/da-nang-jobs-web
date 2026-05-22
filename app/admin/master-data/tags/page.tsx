"use client";

import { useState, useEffect, useCallback, type FormEvent } from "react";
import {
    Plus,
    Search,
    Trash2,
    Edit2,
    MoreVertical,
    Loader2,
    Tag,
    AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { tagService } from "@/services/tagService";
import { TagResponse, TagFormData } from "@/types/tag";
import CrossIcon from "@/components/icons/CrossIcon";
import { cn } from "@/lib/utils";

export default function TagsPage() {
    const [tags, setTags] = useState<TagResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editingTag, setEditingTag] = useState<TagResponse | null>(null);
    const [tagToDelete, setTagToDelete] = useState<TagResponse | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<TagFormData>({
        tagName: ""
    });

    const fetchTags = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await tagService.getAllTags();
            if (response.success) {
                setTags(response.data);
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Không thể tải danh sách tag");
        } finally {
            setIsLoading(false);
        }
    }, []);

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

        try {
            setIsSubmitting(true);
            let response;

            if (editingTag) {
                response = await tagService.updateTag(editingTag.id, formData);
            } else {
                response = await tagService.createTag(formData);
            }

            if (response.success) {
                toast.success(response.message);
                setShowModal(false);
                setEditingTag(null);
                fetchTags();
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi khi lưu tag");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteClick = (tag: TagResponse) => {
        setTagToDelete(tag);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!tagToDelete) return;

        try {
            setIsSubmitting(true);
            const response = await tagService.deleteTag(tagToDelete.id);
            if (response.success) {
                toast.success(response.message);
                setShowDeleteModal(false);
                setTagToDelete(null);
                fetchTags();
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi khi xóa tag");
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredTags = tags.filter((tag) =>
        tag.tagName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-[1200px] mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                        <Tag className="w-8 h-8 text-sky-500" />
                        Quản lý Loại công việc
                    </h1>
                    <p className="text-gray-500 mt-1">Quản lý loại công việc.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-[#006B7A] text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#005a66] active:scale-[0.98] transition-all shadow-lg shadow-[#006B7A]/20"
                >
                    <Plus className="w-5 h-5" />
                    Thêm
                </button>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[620px]">
                <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm ..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl outline-none focus:border-[#006B7A] focus:ring-4 focus:ring-[#006B7A]/5 transition-all text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-medium text-gray-500 shadow-sm">
                            Tổng số tag: <span className="text-[#006B7A] font-bold">{tags.length}</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-x-auto custom-scrollbar">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-32 space-y-4">
                            <Loader2 className="w-10 h-10 text-[#006B7A] animate-spin" />
                            <p className="text-gray-400 text-sm font-medium">Đang tải dữ liệu...</p>
                        </div>
                    ) : filteredTags.length > 0 ? (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-[11px] uppercase tracking-wider text-gray-400 font-bold border-b border-gray-50">
                                    <th className="px-8 py-5 w-20">STT</th>
                                    <th className="px-8 py-5 min-w-[200px]">Tên</th>
                                    <th className="px-8 py-5 text-right w-32">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredTags.map((tag, index) => (
                                    <tr key={tag.id} className="group hover:bg-gray-100 transition-colors duration-200">
                                        <td className="px-8 py-5">
                                            <span className="text-xs font-bold text-gray-400">{index + 1}</span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center">
                                                    <Tag className="w-4 h-4 text-sky-500" />
                                                </div>
                                                <span className="font-bold text-gray-900">{tag.tagName}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right relative">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-200 absolute right-8 top-1/2 -translate-y-1/2 z-10">
                                                <button
                                                    onClick={() => handleOpenModal(tag)}
                                                    className="p-2 text-gray-400 hover:text-[#006B7A] hover:bg-[#006B7A]/5 rounded-lg transition-colors"
                                                    title="Chỉnh sửa"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(tag)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Xóa"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="opacity-100 group-hover:opacity-0 transition-opacity duration-200">
                                                <MoreVertical className="w-4 h-4 text-gray-300 ml-auto" />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-32 text-center">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <Tag className="w-10 h-10 text-gray-200" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Không tìm thấy loại công việc</h3>
                            <p className="text-gray-400 text-sm max-w-xs mt-1">
                                {searchTerm ? "Thử thay đổi từ khóa tìm kiếm của bạn." : "Bắt đầu bằng cách thêm tag mới vào hệ thống."}
                            </p>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-50 bg-gray-50/20 text-[11px] text-gray-400 flex items-center gap-2">
                    <AlertCircle className="w-3 h-3" />
                    Loại công việc giúp lọc nhanh tin tuyển dụng và cải thiện khả năng tìm kiếm.
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden">
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {editingTag ? "Chỉnh sửa" : "Thêm mới"}
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    {editingTag ? "Cập nhật thông tin." : "Tạo mới để sử dụng cho tin tuyển dụng."}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-700 transition-colors"
                                aria-label="Đóng"
                            >
                                <CrossIcon />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Tên loại công việc</label>
                                <input
                                    value={formData.tagName}
                                    onChange={(e) => setFormData({ tagName: e.target.value })}
                                    placeholder="Nhập tên"
                                    className="w-full rounded-3xl border border-gray-200 px-5 py-3 outline-none transition focus:border-[#006B7A] focus:ring-4 focus:ring-[#006B7A]/10"
                                />
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="w-full sm:w-auto px-6 py-3 rounded-2xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full sm:w-auto bg-[#006B7A] text-white px-6 py-3 rounded-2xl font-bold hover:bg-[#005a66] transition disabled:opacity-60"
                                >
                                    {isSubmitting ? "Đang lưu..." : editingTag ? "Lưu thay đổi" : "Tạo"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden">
                        <div className="p-8 space-y-6 text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
                                <Trash2 className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">Xóa loại này?</h3>
                            <p className="text-gray-500">Hành động này không thể hoàn tác. Bạn có chắc muốn xóa loại công việc này. <span className="font-semibold">{tagToDelete?.tagName}</span>?</p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="px-6 py-3 rounded-2xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    disabled={isSubmitting}
                                    className="px-6 py-3 rounded-2xl bg-red-600 text-white font-bold hover:bg-red-700 transition disabled:opacity-60"
                                >
                                    {isSubmitting ? "Đang xóa..." : "Xóa"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}