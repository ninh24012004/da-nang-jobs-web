"use client";

import { useState, useEffect, useCallback, type FormEvent } from "react";
import {
    Plus,
    Search,
    Trash2,
    Edit2,
    MoreVertical,
    Loader2,
    Briefcase,
    AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { positionService } from "@/services/positionService";
import { PositionResponse, PositionFormData } from "@/types/position";

export default function PositionsPage() {
    const [positions, setPositions] = useState<PositionResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editingPosition, setEditingPosition] = useState<PositionResponse | null>(null);
    const [positionToDelete, setPositionToDelete] = useState<PositionResponse | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<PositionFormData>({
        positionName: ""
    });

    const fetchPositions = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await positionService.getAllPositions();
            if (response.success) {
                setPositions(response.data);
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Không thể tải danh sách cấp bậc");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPositions();
    }, [fetchPositions]);

    const handleOpenModal = (position: PositionResponse | null = null) => {
        if (position) {
            setEditingPosition(position);
            setFormData({ positionName: position.positionName });
        } else {
            setEditingPosition(null);
            setFormData({ positionName: "" });
        }
        setShowModal(true);
    };

    const handleSave = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!formData.positionName.trim()) {
            toast.error("Vui lòng nhập tên cấp bậc");
            return;
        }

        try {
            setIsSubmitting(true);
            let response;

            if (editingPosition) {
                response = await positionService.updatePosition(editingPosition.id, formData);
            } else {
                response = await positionService.createPosition(formData);
            }

            if (response.success) {
                toast.success(response.message);
                setShowModal(false);
                setEditingPosition(null);
                fetchPositions();
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi khi lưu cấp bậc");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteClick = (position: PositionResponse) => {
        setPositionToDelete(position);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!positionToDelete) return;

        try {
            setIsSubmitting(true);
            const response = await positionService.deletePosition(positionToDelete.id);
            if (response.success) {
                toast.success(response.message);
                setShowDeleteModal(false);
                setPositionToDelete(null);
                fetchPositions();
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi khi xóa cấp bậc");
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredPositions = positions.filter((position) =>
        position.positionName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-[1200px] mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                        <Briefcase className="w-8 h-8 text-slate-600" />
                        Quản lý cấp bậc
                    </h1>
                    <p className="text-gray-500 mt-1">Danh sách các cấp bậc dùng cho tin tuyển dụng và hồ sơ ứng viên.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-[#006B7A] text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#005a66] active:scale-[0.98] transition-all shadow-lg shadow-[#006B7A]/20"
                >
                    <Plus className="w-5 h-5" />
                    Thêm cấp bậc
                </button>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[620px]">
                <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm cấp bậc..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl outline-none focus:border-[#006B7A] focus:ring-4 focus:ring-[#006B7A]/5 transition-all text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-medium text-gray-500 shadow-sm">
                            Tổng số cấp bậc: <span className="text-[#006B7A] font-bold">{positions.length}</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-x-auto custom-scrollbar">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-32 space-y-4">
                            <Loader2 className="w-10 h-10 text-[#006B7A] animate-spin" />
                            <p className="text-gray-400 text-sm font-medium">Đang tải dữ liệu...</p>
                        </div>
                    ) : filteredPositions.length > 0 ? (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-[11px] uppercase tracking-wider text-gray-400 font-bold border-b border-gray-50">
                                    <th className="px-8 py-5 w-20">STT</th>
                                    <th className="px-8 py-5 min-w-[240px]">Tên cấp bậc</th>
                                    <th className="px-8 py-5 text-right w-32">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredPositions.map((position, index) => (
                                    <tr key={position.id} className="group hover:bg-gray-100 transition-colors duration-200">
                                        <td className="px-8 py-5">
                                            <span className="text-xs font-bold text-gray-400">{index + 1}</span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                                                    <Briefcase className="w-4 h-4 text-slate-500" />
                                                </div>
                                                <span className="font-bold text-gray-900">{position.positionName}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right relative">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-200 absolute right-8 top-1/2 -translate-y-1/2 z-10">
                                                <button
                                                    onClick={() => handleOpenModal(position)}
                                                    className="p-2 text-gray-400 hover:text-[#006B7A] hover:bg-[#006B7A]/5 rounded-lg transition-colors"
                                                    title="Chỉnh sửa"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(position)}
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
                                <Briefcase className="w-10 h-10 text-gray-200" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Không tìm thấy cấp bậc</h3>
                            <p className="text-gray-400 text-sm max-w-xs mt-1">
                                {searchTerm ? "Thử thay đổi từ khóa tìm kiếm của bạn." : "Bắt đầu bằng cách thêm cấp bậc mới vào hệ thống."}
                            </p>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-50 bg-gray-50/20 text-[11px] text-gray-400 flex items-center gap-2">
                    <AlertCircle className="w-3 h-3" />
                    Cấp bậc giúp chọn vị trí phù hợp cho tin tuyển dụng và hồ sơ ứng viên.
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden">
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {editingPosition ? "Chỉnh sửa cấp bậc" : "Thêm cấp bậc mới"}
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    {editingPosition ? "Cập nhật thông tin cấp bậc." : "Tạo cấp bậc mới cho hệ thống."}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-700 transition-colors"
                                aria-label="Đóng"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="w-6 h-6"
                                >
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Tên cấp bậc</label>
                                <input
                                    value={formData.positionName}
                                    onChange={(e) => setFormData({ positionName: e.target.value })}
                                    placeholder="Nhập tên cấp bậc"
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
                                    {isSubmitting ? "Đang lưu..." : editingPosition ? "Lưu thay đổi" : "Tạo cấp bậc"}
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
                            <h3 className="text-2xl font-bold text-gray-900">Xóa cấp bậc này?</h3>
                            <p className="text-gray-500">Hành động này không thể hoàn tác. Bạn có chắc muốn xóa cấp bậc <span className="font-semibold">{positionToDelete?.positionName}</span>?</p>
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
                                    {isSubmitting ? "Đang xóa..." : "Xóa cấp bậc"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
