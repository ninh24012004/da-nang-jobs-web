"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Plus,
    Search,
    Trash2,
    Edit2,
    Loader2,
    Zap,
    AlertCircle,
    X,
    LayoutGrid,
    List,
    Sparkles,
    SlidersHorizontal,
    TrendingUp
} from "lucide-react";
import { toast } from "sonner";
import { useSkills } from "@/hooks/useSkills";
import { SkillResponse, SkillFormData } from "@/types/skill";
import { cn } from "@/lib/utils";

export default function SkillsPage() {
    const {
        skills,
        isLoading,
        isSubmitting,
        fetchSkills,
        createSkill,
        updateSkill,
        deleteSkill,
    } = useSkills();

    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [editingSkill, setEditingSkill] = useState<SkillResponse | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [skillToDelete, setSkillToDelete] = useState<SkillResponse | null>(null);

    // Form states
    const [formData, setFormData] = useState<SkillFormData>({
        skillName: ""
    });

    useEffect(() => {
        fetchSkills();
    }, [fetchSkills]);

    const handleOpenModal = (skill: SkillResponse | null = null) => {
        if (skill) {
            setEditingSkill(skill);
            setFormData({
                skillName: skill.skillName
            });
        } else {
            setEditingSkill(null);
            setFormData({
                skillName: ""
            });
        }
        setShowModal(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.skillName.trim()) {
            toast.error("Vui lòng nhập tên kỹ năng");
            return;
        }

        const res = editingSkill
            ? await updateSkill(editingSkill.id, formData)
            : await createSkill(formData);

        if (res.success) {
            setShowModal(false);
            setEditingSkill(null);
        }
    };

    const handleDeleteClick = (skill: SkillResponse) => {
        setSkillToDelete(skill);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!skillToDelete) return;
        const res = await deleteSkill(skillToDelete.id);
        if (res.success) {
            setShowDeleteModal(false);
        }
    };

    const filteredSkills = skills.filter(skill =>
        skill.skillName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Dynamic color picker for skill chips - Simplified to neutral corporate colors
    const getSkillColorStyle = (name: string) => {
        return {
            bg: "bg-slate-50/85 border-slate-200 hover:bg-slate-100 text-slate-800",
            dot: "bg-slate-500",
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
                            <Zap className="w-5 h-5 text-slate-700" />
                        </span>
                        Quản lý kỹ năng
                    </h1>
                    <p className="text-slate-505 mt-1 text-xs font-medium">Danh sách các kỹ năng chuyên môn yêu cầu trong tin tuyển dụng và hồ sơ ứng viên.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-slate-900 text-white px-4 py-2 rounded-md font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors duration-150 text-xs cursor-pointer shadow-xs"
                >
                    <Plus className="w-4 h-4" />
                    Thêm kỹ năng mới
                </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tổng số kỹ năng</p>
                        <h3 className="text-2xl font-bold text-slate-900 mt-1">{skills.length}</h3>
                    </div>
                    <div className="p-2.5 bg-slate-100 text-slate-600 rounded-md">
                        <Zap size={20} className="fill-current" />
                    </div>
                </div>
                <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kỹ năng công nghệ</p>
                        <h3 className="text-2xl font-bold text-slate-900 mt-1">
                            {skills.filter(s => /react|angular|vue|js|java|python|c#|sql|cloud|devops|aws|docker|git/i.test(s.skillName)).length}
                        </h3>
                    </div>
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-md">
                        <Sparkles size={20} />
                    </div>
                </div>
            </div>

            {/* Content Card */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                {/* Table/Grid Toolbar */}
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm kỹ năng..."
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

                        <div className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded text-xs font-bold text-slate-700 shadow-xs select-none">
                            Kết quả: <span className="text-slate-900 font-extrabold">{filteredSkills.length}</span>
                        </div>
                    </div>
                </div>

                {/* Main Body */}
                <div className="p-6 flex-1 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-32 space-y-3">
                            <Loader2 className="w-8 h-8 text-slate-600 animate-spin" />
                            <p className="text-slate-405 text-xs font-bold">Đang tải danh sách kỹ năng...</p>
                        </div>
                    ) : filteredSkills.length > 0 ? (
                        viewMode === "grid" ? (
                            /* GRID MODE: Beautiful Card Chips */
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {filteredSkills.map((skill) => {
                                    const colors = getSkillColorStyle(skill.skillName);
                                    return (
                                        <div
                                            key={skill.id}
                                            className={cn(
                                                "border p-4 rounded-md transition-colors duration-150 flex flex-col justify-between space-y-3 group relative overflow-hidden",
                                                colors.bg
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className={cn("p-1.5 rounded shadow-xs shrink-0 border border-slate-200", colors.iconBg)}>
                                                    <Zap size={12} className="fill-current" />
                                                </span>
                                                <span className="font-bold text-xs tracking-tight truncate pr-8 text-slate-800">{skill.skillName}</span>
                                            </div>

                                            {/* Action bar shown elegantly on card */}
                                            <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                                                <span className="text-[10px] font-mono text-slate-400">ID: {skill.id}</span>
                                                <div className="flex gap-1.5">
                                                    <button
                                                        onClick={() => handleOpenModal(skill)}
                                                        className="p-1 bg-white hover:bg-slate-50 text-slate-650 hover:text-slate-900 rounded border border-slate-200 shadow-xs transition-colors cursor-pointer"
                                                        title="Sửa kỹ năng"
                                                    >
                                                        <Edit2 size={12} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(skill)}
                                                        className="p-1 bg-white hover:bg-red-50 text-red-600 hover:text-red-750 rounded border border-slate-200 shadow-xs transition-colors cursor-pointer"
                                                        title="Xóa kỹ năng"
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
                            /* TABLE MODE: Clean, clear details */
                            <div className="border border-slate-200 rounded-lg overflow-hidden shadow-xs">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-500 uppercase tracking-wider">
                                            <th className="px-4 py-3 w-16">STT</th>
                                            <th className="px-4 py-3 w-28">Mã kỹ năng</th>
                                            <th className="px-4 py-3 min-w-[200px]">Tên kỹ năng</th>
                                            <th className="px-4 py-3 text-right w-36">Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 font-medium text-slate-700">
                                        {filteredSkills.map((skill, index) => (
                                            <tr key={skill.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-4 py-3">
                                                    <span className="font-bold text-slate-400">{index + 1}</span>
                                                </td>
                                                <td className="px-4 py-3 font-mono text-[10px] text-slate-500">
                                                    SKILL-{skill.id}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="p-1 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                                            <Zap size={11} className="fill-current" />
                                                        </span>
                                                        <span className="font-bold text-slate-850">{skill.skillName}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => handleOpenModal(skill)}
                                                            className="flex items-center gap-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-2 py-1 rounded-md font-bold transition-colors cursor-pointer text-[11px]"
                                                        >
                                                            <Edit2 size={11} />
                                                            <span>Sửa</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteClick(skill)}
                                                            className="flex items-center gap-1 bg-white hover:bg-red-50 border border-slate-200 text-red-600 px-2 py-1 rounded-md font-bold transition-colors cursor-pointer text-[11px]"
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
                                <Zap className="w-8 h-8 text-slate-350" />
                            </div>
                            <h3 className="text-sm font-bold text-slate-900">Không tìm thấy kỹ năng</h3>
                            <p className="text-slate-455 text-xs max-w-xs mt-1 font-medium">
                                {searchTerm ? "Thử thay đổi từ khóa tìm kiếm của bạn." : "Bắt đầu bằng cách thêm kỹ năng mới vào hệ thống."}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer Info */}
                <div className="p-3 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500 flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Kỹ năng sẽ được dùng để gợi ý cho nhà tuyển dụng khi tạo tin và cho ứng viên khi tạo hồ sơ.
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
                    <div className="bg-white rounded-lg w-full max-w-lg shadow-lg border border-slate-200 overflow-hidden">
                        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                            <div>
                                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                                    {editingSkill ? "Chỉnh sửa kỹ năng" : "Thêm kỹ năng mới"}
                                </h2>
                                <p className="text-slate-500 text-xs mt-1 font-medium">Cung cấp thông tin chi tiết về tên kỹ năng.</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-650 transition-colors border border-slate-200 cursor-pointer">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-5 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">Tên kỹ năng *</label>
                                <input
                                    type="text"
                                    value={formData.skillName}
                                    onChange={(e) => setFormData({ ...formData, skillName: e.target.value })}
                                    placeholder="Ví dụ: Java, ReactJS, Python, Kubernetes..."
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
                                    {editingSkill ? "Lưu thay đổi" : "Lưu kỹ năng"}
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
                        <h2 className="text-base font-bold text-slate-900 mb-1">Xác nhận xóa kỹ năng?</h2>
                        <p className="text-slate-500 mb-5 leading-relaxed font-semibold text-xs">
                            Bạn có chắc chắn muốn xóa kỹ năng <span className="font-extrabold text-slate-900">"{skillToDelete?.skillName}"</span>?
                            Hành động này không thể hoàn tác.
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 bg-white hover:bg-slate-100 text-slate-700 py-2 rounded-md font-bold transition-all border border-slate-200 cursor-pointer text-xs"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={isSubmitting}
                                className="flex-1 bg-red-600 text-white py-2 rounded-md font-bold hover:bg-red-700 transition-colors duration-150 flex items-center justify-center gap-2 cursor-pointer text-xs disabled:opacity-50"
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
