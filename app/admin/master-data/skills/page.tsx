"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Plus,
    Search,
    Trash2,
    Edit2,
    MoreVertical,
    Loader2,
    Zap,
    AlertCircle,
    X,
    Filter
} from "lucide-react";
import { toast } from "sonner";
import { skillService } from "@/services/skillService";
import { SkillResponse, SkillFormData } from "@/types/skill";
import { cn } from "@/lib/utils";

export default function SkillsPage() {
    const [skills, setSkills] = useState<SkillResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [editingSkill, setEditingSkill] = useState<SkillResponse | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [skillToDelete, setSkillToDelete] = useState<SkillResponse | null>(null);

    // Form states
    const [formData, setFormData] = useState<SkillFormData>({
        skillName: ""
    });

    const fetchSkills = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await skillService.getAllSkills();
            if (response.success) {
                setSkills(response.data);
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Không thể tải danh sách kỹ năng");
        } finally {
            setIsLoading(false);
        }
    }, []);

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

        try {
            setIsSubmitting(true);
            let response;
            if (editingSkill) {
                response = await skillService.updateSkill(editingSkill.id, formData);
            } else {
                response = await skillService.createSkill(formData);
            }

            if (response.success) {
                toast.success(response.message);
                setShowModal(false);
                fetchSkills();
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi khi lưu kỹ năng");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteClick = (skill: SkillResponse) => {
        setSkillToDelete(skill);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!skillToDelete) return;
        try {
            setIsSubmitting(true);
            const response = await skillService.deleteSkill(skillToDelete.id);
            if (response.success) {
                toast.success(response.message);
                setShowDeleteModal(false);
                fetchSkills();
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi khi xóa kỹ năng");
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredSkills = skills.filter(skill =>
        skill.skillName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-[1200px] mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                        <Zap className="w-8 h-8 text-amber-500 fill-amber-500" />
                        Quản lý kỹ năng
                    </h1>
                    <p className="text-gray-500 mt-1">Danh sách các kỹ năng yêu cầu trong tin tuyển dụng.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-[#006B7A] text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#005a66] active:scale-[0.98] transition-all shadow-lg shadow-[#006B7A]/20"
                >
                    <Plus className="w-5 h-5" />
                    Thêm kỹ năng
                </button>
            </div>

            {/* Content Card */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
                {/* Table Toolbar */}
                <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên hoặc mô tả..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl outline-none focus:border-[#006B7A] focus:ring-4 focus:ring-[#006B7A]/5 transition-all text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-medium text-gray-500 shadow-sm">
                            Tổng cộng: <span className="text-[#006B7A] font-bold">{skills.length}</span>
                        </div>
                        <button className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-[#006B7A] transition-all shadow-sm">
                            <Filter className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Table Content */}
                <div className="flex-1 overflow-x-auto custom-scrollbar">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-32 space-y-4">
                            <Loader2 className="w-10 h-10 text-[#006B7A] animate-spin" />
                            <p className="text-gray-400 text-sm font-medium">Đang tải dữ liệu...</p>
                        </div>
                    ) : filteredSkills.length > 0 ? (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-[11px] uppercase tracking-wider text-gray-400 font-bold border-b border-gray-50">
                                    <th className="px-8 py-5 w-20">STT</th>
                                    <th className="px-8 py-5 min-w-[200px]">Tên kỹ năng</th>
                                    <th className="px-8 py-5 text-right w-32">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredSkills.map((skill, index) => (
                                    <tr key={skill.id} className="group hover:bg-gray-100 transition-colors duration-200">
                                        <td className="px-8 py-5">
                                            <span className="text-xs font-bold text-gray-400">{index + 1}</span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                                                    <Zap className="w-4 h-4 text-amber-500" />
                                                </div>
                                                <span className="font-bold text-gray-900">{skill.skillName}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right relative">
                                            {/* Action Buttons - Always in DOM to prevent jump */}
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-200 absolute right-8 top-1/2 -translate-y-1/2 z-10">
                                                <button
                                                    onClick={() => handleOpenModal(skill)}
                                                    className="p-2 text-gray-400 hover:text-[#006B7A] hover:bg-[#006B7A]/5 rounded-lg transition-colors"
                                                    title="Chỉnh sửa"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(skill)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Xóa"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            
                                            {/* Static Icon - Fades out on hover */}
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
                                <Zap className="w-10 h-10 text-gray-200" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Không tìm thấy kỹ năng</h3>
                            <p className="text-gray-400 text-sm max-w-xs mt-1">
                                {searchTerm ? "Thử thay đổi từ khóa tìm kiếm của bạn." : "Bắt đầu bằng cách thêm kỹ năng mới vào hệ thống."}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer Info */}
                <div className="p-6 border-t border-gray-50 bg-gray-50/20 text-[11px] text-gray-400 flex items-center gap-2">
                    <AlertCircle className="w-3 h-3" />
                    Kỹ năng sẽ được dùng để gợi ý cho nhà tuyển dụng khi tạo tin và cho ứng viên khi tạo hồ sơ.
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {editingSkill ? "Chỉnh sửa kỹ năng" : "Thêm kỹ năng mới"}
                                </h2>
                                <p className="text-gray-500 text-sm mt-1">Cung cấp thông tin chi tiết về kỹ năng.</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Tên kỹ năng *</label>
                                <input
                                    type="text"
                                    value={formData.skillName}
                                    onChange={(e) => setFormData({ ...formData, skillName: e.target.value })}
                                    placeholder="Ví dụ: Java, React, SQL..."
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-[#006B7A] focus:ring-4 focus:ring-[#006B7A]/5 transition-all"
                                    required
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 bg-[#006B7A] text-white py-4 rounded-2xl font-bold hover:bg-[#005a66] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#006B7A]/20"
                                >
                                    {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
                                    {editingSkill ? "Cập nhật thay đổi" : "Lưu kỹ năng"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                                >
                                    Hủy
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
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Xác nhận xóa?</h2>
                        <p className="text-gray-500 mb-8 leading-relaxed">
                            Bạn có chắc chắn muốn xóa kỹ năng <span className="font-bold text-gray-900">"{skillToDelete?.skillName}"</span>?
                            Hành động này không thể hoàn tác.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={confirmDelete}
                                disabled={isSubmitting}
                                className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-bold hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? "Đang xóa..." : "Xác nhận xóa"}
                            </button>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
