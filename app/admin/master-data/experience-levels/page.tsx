"use client";

import { useState, useEffect, useCallback, type FormEvent } from "react";
import {
    Plus,
    Search,
    Trash2,
    Edit2,
    Loader2,
    TrendingUp,
    AlertCircle,
    X,
    LayoutGrid,
    List,
    Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { useExperienceLevels } from "@/hooks/useExperienceLevels";
import { ExperienceLevelResponse, ExperienceLevelFormData } from "@/types/experienceLevel";
import { cn } from "@/lib/utils";

export default function ExperienceLevelsPage() {
    const {
        experienceLevels,
        isLoading,
        isSubmitting,
        fetchExperienceLevels,
        createExperienceLevel,
        updateExperienceLevel,
        deleteExperienceLevel,
    } = useExperienceLevels();

    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [editingLevel, setEditingLevel] = useState<ExperienceLevelResponse | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [levelToDelete, setLevelToDelete] = useState<ExperienceLevelResponse | null>(null);

    // Form states
    const [formData, setFormData] = useState<ExperienceLevelFormData>({
        levelName: ""
    });

    useEffect(() => {
        fetchExperienceLevels();
    }, [fetchExperienceLevels]);

    const handleOpenModal = (level: ExperienceLevelResponse | null = null) => {
        if (level) {
            setEditingLevel(level);
            setFormData({ levelName: level.levelName });
        } else {
            setEditingLevel(null);
            setFormData({ levelName: "" });
        }
        setShowModal(true);
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!formData.levelName.trim()) {
            toast.error("Vui lòng nhập tên cấp độ kinh nghiệm");
            return;
        }

        const res = editingLevel
            ? await updateExperienceLevel(editingLevel.id, formData)
            : await createExperienceLevel(formData);

        if (res.success) {
            setShowModal(false);
            setEditingLevel(null);
        }
    };

    const handleDeleteClick = (level: ExperienceLevelResponse) => {
        setLevelToDelete(level);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!levelToDelete) return;

        const res = await deleteExperienceLevel(levelToDelete.id);
        if (res.success) {
            setShowDeleteModal(false);
            setLevelToDelete(null);
        }
    };

    const filteredLevels = experienceLevels.filter((level) =>
        level.levelName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Style picker for experience level chips - Simplified to neutral corporate style
    const getLevelColorStyle = (name: string) => {
        return {
            bg: "bg-slate-50/85 border-slate-200 hover:bg-slate-100 text-slate-805",
            iconBg: "bg-slate-200/60 text-slate-650"
        };
    };

    return (
        <div className="max-w-[1200px] mx-auto space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <span className="p-1.5 bg-slate-100 rounded inline-block border border-slate-200">
                            <TrendingUp className="w-5 h-5 text-slate-700" />
                        </span>
                        Quản lý cấp độ kinh nghiệm
                    </h1>
                    <p className="text-slate-505 mt-1 text-xs font-medium">Danh sách các cấp độ kinh nghiệm yêu cầu giúp lọc chính xác tin tuyển dụng và hồ sơ.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-slate-900 text-white px-4 py-2 rounded-md font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors duration-150 text-xs cursor-pointer shadow-xs"
                >
                    <Plus className="w-4 h-4" />
                    Thêm cấp độ mới
                </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tổng số cấp độ</p>
                        <h3 className="text-2xl font-bold text-slate-900 mt-1">{experienceLevels.length}</h3>
                    </div>
                    <div className="p-2.5 bg-slate-100 text-slate-600 rounded-md">
                        <TrendingUp size={20} />
                    </div>
                </div>
                <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-sans">Kinh nghiệm nâng cao</p>
                        <h3 className="text-2xl font-bold text-slate-900 mt-1">
                            {experienceLevels.filter(el => /trên|năm|senior|middle|expert/i.test(el.levelName)).length} cấp
                        </h3>
                    </div>
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-md">
                        <Sparkles size={20} />
                    </div>
                </div>
            </div>

            {/* Content Container */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                {/* Search & Actions Toolbar */}
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm cấp độ kinh nghiệm..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-10 py-2 bg-white border border-slate-200 rounded-md outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-colors text-xs font-semibold text-slate-750"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-405 hover:text-slate-650 rounded-full hover:bg-slate-100 transition-colors"
                            >
                                <X size={12} />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {/* View Switcher */}
                        <div className="bg-slate-100 p-1 rounded-md flex items-center border border-slate-200">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={cn(
                                    "p-1.5 rounded transition-colors cursor-pointer",
                                    viewMode === "grid" ? "bg-white text-slate-900 border border-slate-250 shadow-xs" : "text-slate-400 hover:text-slate-650"
                                )}
                                title="Xem dạng lưới"
                            >
                                <LayoutGrid size={14} />
                            </button>
                            <button
                                onClick={() => setViewMode("table")}
                                className={cn(
                                    "p-1.5 rounded transition-colors cursor-pointer",
                                    viewMode === "table" ? "bg-white text-slate-900 border border-slate-250 shadow-xs" : "text-slate-400 hover:text-slate-650"
                                )}
                                title="Xem dạng danh sách"
                            >
                                <List size={14} />
                            </button>
                        </div>

                        <div className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded text-xs font-bold text-slate-705 shadow-xs select-none">
                            Kết quả: <span className="text-slate-900 font-extrabold">{filteredLevels.length}</span>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="p-6 flex-1 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-32 space-y-3">
                            <Loader2 className="w-8 h-8 text-slate-600 animate-spin" />
                            <p className="text-slate-405 text-xs font-bold">Đang tải danh sách...</p>
                        </div>
                    ) : filteredLevels.length > 0 ? (
                        viewMode === "grid" ? (
                            /* GRID VIEW */
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {filteredLevels.map((level) => {
                                    const colors = getLevelColorStyle(level.levelName);
                                    return (
                                        <div
                                            key={level.id}
                                            className={cn(
                                                "border p-4 rounded-md transition-colors duration-150 flex flex-col justify-between space-y-3 group relative overflow-hidden",
                                                colors.bg
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className={cn("p-1.5 rounded shadow-xs shrink-0 border border-slate-200", colors.iconBg)}>
                                                    <TrendingUp size={12} />
                                                </span>
                                                <span className="font-bold text-xs tracking-tight truncate pr-8 text-slate-805">{level.levelName}</span>
                                            </div>

                                            {/* Action bar shown elegantly on card */}
                                            <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                                                <span className="text-[10px] font-mono text-slate-400">ID: {level.id}</span>
                                                <div className="flex gap-1.5">
                                                    <button
                                                        onClick={() => handleOpenModal(level)}
                                                        className="p-1 bg-white hover:bg-slate-50 text-slate-655 hover:text-slate-900 rounded border border-slate-200 shadow-xs transition-colors cursor-pointer"
                                                        title="Sửa cấp độ"
                                                    >
                                                        <Edit2 size={12} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(level)}
                                                        className="p-1 bg-white hover:bg-red-50 text-red-650 hover:text-red-750 rounded border border-slate-200 shadow-xs transition-colors cursor-pointer"
                                                        title="Xóa cấp độ"
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
                            /* TABLE VIEW */
                            <div className="border border-slate-200 rounded-lg overflow-hidden shadow-xs">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-505 uppercase tracking-wider">
                                            <th className="px-4 py-3 w-16">STT</th>
                                            <th className="px-4 py-3 w-28">Mã cấp độ</th>
                                            <th className="px-4 py-3 min-w-[200px]">Tên cấp độ kinh nghiệm</th>
                                            <th className="px-4 py-3 text-right w-36">Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 font-medium text-slate-700">
                                        {filteredLevels.map((level, index) => (
                                            <tr key={level.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-4 py-3">
                                                    <span className="font-bold text-slate-400">{index + 1}</span>
                                                </td>
                                                <td className="px-4 py-3 font-mono text-[10px] text-slate-500">
                                                    EXP-{level.id}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="p-1 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                                            <TrendingUp size={11} />
                                                        </span>
                                                        <span className="font-bold text-slate-850">{level.levelName}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => handleOpenModal(level)}
                                                            className="flex items-center gap-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-705 px-2 py-1 rounded-md font-bold transition-colors cursor-pointer text-[11px]"
                                                        >
                                                            <Edit2 size={11} />
                                                            <span>Sửa</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteClick(level)}
                                                            className="flex items-center gap-1 bg-white hover:bg-red-50 border border-slate-200 text-red-650 px-2 py-1 rounded-md font-bold transition-colors cursor-pointer text-[11px]"
                                                        >
                                                            <Trash2 size={11} />
                                                            <span>Xóa</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )
                    ) : (
                        /* EMPTY STATE */
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-14 h-14 bg-slate-100 rounded-md flex items-center justify-center mb-4">
                                <TrendingUp className="w-8 h-8 text-slate-350" />
                            </div>
                            <h3 className="text-sm font-bold text-slate-900">Không tìm thấy cấp độ kinh nghiệm nào</h3>
                            <p className="text-slate-455 text-xs max-w-xs mt-1 font-medium">
                                {searchTerm ? "Thử thay đổi từ khóa tìm kiếm của bạn." : "Bắt đầu bằng cách thêm cấp độ kinh nghiệm mới."}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer Info */}
                <div className="p-3 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-505 flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Cấp độ kinh nghiệm giúp lọc chính xác và cải thiện chất lượng tìm kiếm cho ứng viên và nhà tuyển dụng.
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
                    <div className="bg-white rounded-lg w-full max-w-lg shadow-lg border border-slate-200 overflow-hidden">
                        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                            <div>
                                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                                    {editingLevel ? "Chỉnh sửa cấp độ" : "Thêm cấp độ kinh nghiệm"}
                                </h2>
                                <p className="text-slate-500 text-xs mt-1 font-medium">
                                    {editingLevel ? "Cập nhật tên cấp độ yêu cầu kinh nghiệm." : "Tạo cấp độ kinh nghiệm mới cho hệ thống."}
                                </p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-655 transition-colors border border-slate-200 cursor-pointer">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-505 block uppercase tracking-wider">Tên cấp độ *</label>
                                <input
                                    type="text"
                                    value={formData.levelName}
                                    onChange={(e) => setFormData({ ...formData, levelName: e.target.value })}
                                    placeholder="Ví dụ: Chưa có kinh nghiệm, Dưới 1 năm, 1 - 2 năm, Trên 5 năm..."
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 font-medium transition-colors text-xs text-slate-750"
                                    required
                                />
                            </div>

                            <div className="flex gap-2 pt-4 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-white hover:bg-slate-100 text-slate-700 py-2 rounded-md font-bold transition-all border border-slate-200 cursor-pointer text-xs"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 bg-slate-900 text-white py-2 rounded-md font-bold hover:bg-slate-800 transition-colors duration-150 flex items-center justify-center gap-2 cursor-pointer text-xs disabled:opacity-50"
                                >
                                    {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                    {editingLevel ? "Lưu thay đổi" : "Lưu dữ liệu"}
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
                        <h2 className="text-base font-bold text-slate-900 mb-1">Xóa cấp độ kinh nghiệm này?</h2>
                        <p className="text-slate-550 mb-5 leading-relaxed font-semibold text-xs">
                            Hành động này sẽ xóa cấp độ kinh nghiệm <span className="font-extrabold text-slate-900">"{levelToDelete?.levelName}"</span>. Bạn có chắc chắn?
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 bg-white hover:bg-slate-100 text-slate-705 py-2 rounded-md font-bold transition-all border border-slate-200 cursor-pointer text-xs"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={isSubmitting}
                                className="flex-1 bg-red-655 text-white py-2 rounded-md font-bold hover:bg-red-700 transition-colors duration-150 flex items-center justify-center gap-2 cursor-pointer text-xs disabled:opacity-50"
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
