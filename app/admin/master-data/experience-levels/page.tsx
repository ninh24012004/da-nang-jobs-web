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

    // Style picker for experience level chips
    const getLevelColorStyle = (name: string) => {
        const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const styles = [
            { bg: "bg-amber-50 border-amber-200 text-amber-700", iconBg: "bg-amber-500/10 text-amber-650" },
            { bg: "bg-teal-50 border-teal-200 text-teal-700", iconBg: "bg-teal-500/10 text-teal-650" },
            { bg: "bg-rose-50 border-rose-200 text-rose-700", iconBg: "bg-rose-500/10 text-rose-650" },
            { bg: "bg-sky-50 border-sky-200 text-sky-700", iconBg: "bg-sky-500/10 text-sky-650" },
            { bg: "bg-emerald-50 border-emerald-200 text-emerald-700", iconBg: "bg-emerald-500/10 text-emerald-650" }
        ];
        return styles[hash % styles.length];
    };

    return (
        <div className="max-w-[1200px] mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                        <span className="p-2 bg-amber-55 rounded-2xl inline-block shadow-sm text-amber-550 bg-amber-50">
                            <TrendingUp className="w-7 h-7" />
                        </span>
                        Quản lý cấp độ kinh nghiệm
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium">Danh sách các cấp độ kinh nghiệm yêu cầu giúp lọc chính xác tin tuyển dụng và hồ sơ.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-[#006B7A] text-white px-6 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#005a66] active:scale-[0.98] transition-all shadow-lg shadow-[#006B7A]/20 cursor-pointer"
                >
                    <Plus className="w-5 h-5" />
                    Thêm cấp độ mới
                </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tổng số cấp độ</p>
                        <h3 className="text-2xl font-black text-gray-800 mt-1">{experienceLevels.length}</h3>
                    </div>
                    <div className="p-3 bg-[#006B7A]/10 text-[#006B7A] rounded-2xl">
                        <TrendingUp size={22} />
                    </div>
                </div>
                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-sans">Kinh nghiệm nâng cao</p>
                        <h3 className="text-2xl font-black text-gray-800 mt-1">
                            {experienceLevels.filter(el => /trên|năm|senior|middle|expert/i.test(el.levelName)).length} cấp
                        </h3>
                    </div>
                    <div className="p-3 bg-amber-50 text-amber-650 rounded-2xl">
                        <Sparkles size={22} />
                    </div>
                </div>
                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Hiệu quả phân loại</p>
                        <h3 className="text-2xl font-black text-emerald-600 mt-1">Tối ưu</h3>
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
                            placeholder="Tìm kiếm cấp độ kinh nghiệm..."
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
                            Kết quả: <span className="text-[#006B7A]">{filteredLevels.length}</span>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="p-8 flex-1 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-32 space-y-4">
                            <Loader2 className="w-10 h-10 text-[#006B7A] animate-spin" />
                            <p className="text-gray-400 text-sm font-bold">Đang tải danh sách...</p>
                        </div>
                    ) : filteredLevels.length > 0 ? (
                        viewMode === "grid" ? (
                            /* GRID VIEW */
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
                                {filteredLevels.map((level) => {
                                    const colors = getLevelColorStyle(level.levelName);
                                    return (
                                        <div
                                            key={level.id}
                                            className={cn(
                                                "border p-4.5 rounded-2xl bg-white hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4 group relative overflow-hidden",
                                                colors.bg
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className={cn("p-2 rounded-xl shadow-xs shrink-0", colors.iconBg)}>
                                                    <TrendingUp size={14} />
                                                </span>
                                                <span className="font-extrabold text-sm tracking-tight truncate pr-8">{level.levelName}</span>
                                            </div>

                                            {/* Action bar shown elegantly on card */}
                                            <div className="flex items-center justify-between border-t border-gray-150/40 pt-3">
                                                <span className="text-[10px] font-mono opacity-65">ID: {level.id}</span>
                                                <div className="flex gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleOpenModal(level)}
                                                        className="p-1.5 bg-white/80 hover:bg-white text-teal-650 hover:text-teal-700 rounded-lg border border-teal-100 shadow-xs transition-all cursor-pointer"
                                                        title="Sửa cấp độ"
                                                    >
                                                        <Edit2 size={12} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(level)}
                                                        className="p-1.5 bg-white/80 hover:bg-white text-rose-600 hover:text-rose-700 rounded-lg border border-rose-100 shadow-xs transition-all cursor-pointer"
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
                            <div className="border border-gray-150/70 rounded-3xl overflow-hidden shadow-xs animate-in fade-in duration-300">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100 font-bold text-gray-550 uppercase tracking-wider">
                                            <th className="px-6 py-4.5 w-20">STT</th>
                                            <th className="px-6 py-4.5 w-32">Mã cấp độ</th>
                                            <th className="px-6 py-4.5 min-w-[200px]">Tên cấp độ kinh nghiệm</th>
                                            <th className="px-6 py-4.5 text-right w-40">Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
                                        {filteredLevels.map((level, index) => (
                                            <tr key={level.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className="font-bold text-gray-400">{index + 1}</span>
                                                </td>
                                                <td className="px-6 py-4 font-mono text-[10px] text-gray-500">
                                                    EXP-{level.id}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2.5">
                                                        <span className="p-1.5 rounded-lg bg-amber-50 text-amber-550 border border-amber-100">
                                                            <TrendingUp size={13} />
                                                        </span>
                                                        <span className="font-extrabold text-gray-850">{level.levelName}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => handleOpenModal(level)}
                                                            className="flex items-center gap-1 bg-teal-50 border border-teal-100 hover:bg-teal-100 text-teal-700 px-2.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer"
                                                        >
                                                            <Edit2 size={11} />
                                                            <span>Sửa</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteClick(level)}
                                                            className="flex items-center gap-1 bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-600 px-2.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer"
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
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <TrendingUp className="w-10 h-10 text-gray-200" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Không tìm thấy cấp độ kinh nghiệm nào</h3>
                            <p className="text-gray-400 text-sm max-w-xs mt-1">
                                {searchTerm ? "Thử thay đổi từ khóa tìm kiếm của bạn." : "Bắt đầu bằng cách thêm cấp độ kinh nghiệm mới."}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer Info */}
                <div className="p-6 border-t border-gray-50 bg-gray-50/20 text-[11px] text-gray-400 flex items-center gap-2">
                    <AlertCircle className="w-3 h-3" />
                    Cấp độ kinh nghiệm giúp lọc chính xác và cải thiện chất lượng tìm kiếm cho ứng viên và nhà tuyển dụng.
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden">
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                                    {editingLevel ? "Chỉnh sửa cấp độ" : "Thêm cấp độ kinh nghiệm"}
                                </h2>
                                <p className="text-gray-500 text-xs mt-1.5 font-medium">
                                    {editingLevel ? "Cập nhật tên cấp độ yêu cầu kinh nghiệm." : "Tạo cấp độ kinh nghiệm mới cho hệ thống."}
                                </p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-700 ml-1 block uppercase tracking-wider">Tên cấp độ *</label>
                                <input
                                    type="text"
                                    value={formData.levelName}
                                    onChange={(e) => setFormData({ ...formData, levelName: e.target.value })}
                                    placeholder="Ví dụ: Chưa có kinh nghiệm, Dưới 1 năm, 1 - 2 năm, Trên 5 năm..."
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:bg-white focus:border-[#006B7A] focus:ring-4 focus:ring-[#006B7A]/5 font-semibold transition-all text-xs"
                                    required
                                />
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-gray-50">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-gray-100 hover:bg-gray-250 text-gray-700 py-3.5 rounded-2xl font-bold transition-all cursor-pointer text-xs"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 bg-[#006B7A] text-white py-3.5 rounded-2xl font-bold hover:bg-[#005a66] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#006B7A]/20 cursor-pointer text-xs disabled:opacity-60"
                                >
                                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {editingLevel ? "Lưu thay đổi" : "Lưu dữ liệu"}
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
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-650 mb-6">
                            <Trash2 className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Xóa cấp độ kinh nghiệm này?</h2>
                        <p className="text-gray-500 mb-8 leading-relaxed font-semibold text-xs text-center">
                            Hành động này sẽ xóa cấp độ kinh nghiệm <span className="font-extrabold text-gray-900">"{levelToDelete?.levelName}"</span>. Bạn có chắc chắn?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 bg-gray-100 hover:bg-gray-250 text-gray-700 py-3.5 rounded-2xl font-bold transition-all cursor-pointer text-xs"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={isSubmitting}
                                className="flex-1 bg-red-650 text-white py-3.5 rounded-2xl font-bold hover:bg-red-705 transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
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
