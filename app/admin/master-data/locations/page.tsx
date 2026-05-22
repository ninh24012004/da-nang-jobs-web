"use client";

import { useState, useEffect, useCallback, type FormEvent, type SVGProps } from "react";
import {
    Plus,
    Search,
    Trash2,
    Edit2,
    Loader2,
    Home,
    MapPin,
    Layers,
    AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { locationService } from "@/services/locationService";
import {
    DistrictResponse,
    WardResponse,
    DistrictFormData,
    WardFormData,
} from "@/types/location";
import { cn } from "@/lib/utils";

export default function LocationsPage() {
    const [districts, setDistricts] = useState<DistrictResponse[]>([]);
    const [wards, setWards] = useState<WardResponse[]>([]);
    const [activeDistrict, setActiveDistrict] = useState<DistrictResponse | null>(null);
    const [districtSearch, setDistrictSearch] = useState("");
    const [wardSearch, setWardSearch] = useState("");
    const [isLoadingDistricts, setIsLoadingDistricts] = useState(true);
    const [isLoadingWards, setIsLoadingWards] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDistrictModal, setShowDistrictModal] = useState(false);
    const [showWardModal, setShowWardModal] = useState(false);
    const [showDistrictDeleteModal, setShowDistrictDeleteModal] = useState(false);
    const [showWardDeleteModal, setShowWardDeleteModal] = useState(false);
    const [editingDistrict, setEditingDistrict] = useState<DistrictResponse | null>(null);
    const [districtToDelete, setDistrictToDelete] = useState<DistrictResponse | null>(null);
    const [editingWard, setEditingWard] = useState<WardResponse | null>(null);
    const [wardToDelete, setWardToDelete] = useState<WardResponse | null>(null);
    const [districtForm, setDistrictForm] = useState<DistrictFormData>({
        districtName: ""
    });
    const [wardForm, setWardForm] = useState<WardFormData>({
        wardName: "",
        districtId: 0
    });

    const fetchDistricts = useCallback(async () => {
        try {
            setIsLoadingDistricts(true);
            const response = await locationService.getAllDistricts();
            if (response.success) {
                setDistricts(response.data);
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Không thể tải danh sách quận/huyện");
        } finally {
            setIsLoadingDistricts(false);
        }
    }, []);

    const fetchWards = useCallback(async (districtId: number | null) => {
        if (districtId === null) {
            setWards([]);
            return;
        }

        try {
            setIsLoadingWards(true);
            const response = await locationService.getWardsByDistrict(districtId);
            if (response.success) {
                setWards(response.data);
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Không thể tải danh sách phường/xã");
        } finally {
            setIsLoadingWards(false);
        }
    }, []);

    useEffect(() => {
        fetchDistricts();
    }, [fetchDistricts]);

    useEffect(() => {
        if (activeDistrict) {
            fetchWards(activeDistrict.id);
        } else {
            setWards([]);
        }
    }, [activeDistrict, fetchWards]);

    const filteredDistricts = districts.filter((district) =>
        district.districtName.toLowerCase().includes(districtSearch.toLowerCase())
    );

    const filteredWards = wards.filter((ward) =>
        ward.wardName.toLowerCase().includes(wardSearch.toLowerCase())
    );

    const openDistrictModal = (district: DistrictResponse | null = null) => {
        if (district) {
            setEditingDistrict(district);
            setDistrictForm({ districtName: district.districtName });
        } else {
            setEditingDistrict(null);
            setDistrictForm({ districtName: "" });
        }
        setShowDistrictModal(true);
    };

    const openWardModal = (ward: WardResponse | null = null) => {
        if (ward) {
            setEditingWard(ward);
            setWardForm({
                wardName: ward.wardName,
                districtId: ward.districtId,
            });
        } else {
            setEditingWard(null);
            setWardForm({
                wardName: "",
                districtId: activeDistrict?.id ?? 0,
            });
        }
        setShowWardModal(true);
    };

    const handleSelectDistrict = (district: DistrictResponse) => {
        setActiveDistrict(district);
        setWardSearch("");
    };

    const handleSaveDistrict = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!districtForm.districtName.trim()) {
            toast.error("Vui lòng nhập tên quận/huyện");
            return;
        }

        try {
            setIsSubmitting(true);
            const response = editingDistrict
                ? await locationService.updateDistrict(editingDistrict.id, districtForm)
                : await locationService.createDistrict(districtForm);

            if (response.success) {
                toast.success(response.message);
                setShowDistrictModal(false);
                setEditingDistrict(null);
                fetchDistricts();
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi khi lưu quận/huyện");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSaveWard = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!wardForm.wardName.trim()) {
            toast.error("Vui lòng nhập tên phường/xã");
            return;
        }

        if (!wardForm.districtId) {
            toast.error("Vui lòng chọn quận/huyện");
            return;
        }

        try {
            setIsSubmitting(true);
            const response = editingWard
                ? await locationService.updateWard(editingWard.id, wardForm)
                : await locationService.createWard(wardForm);

            if (response.success) {
                toast.success(response.message);
                setShowWardModal(false);
                setEditingWard(null);
                fetchWards(wardForm.districtId);
                if (activeDistrict?.id !== wardForm.districtId) {
                    const nextActive = districts.find((item) => item.id === wardForm.districtId);
                    if (nextActive) setActiveDistrict(nextActive);
                }
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi khi lưu phường/xã");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteDistrict = (district: DistrictResponse) => {
        setDistrictToDelete(district);
        setShowDistrictDeleteModal(true);
    };

    const handleDeleteWard = (ward: WardResponse) => {
        setWardToDelete(ward);
        setShowWardDeleteModal(true);
    };

    const confirmDeleteDistrict = async () => {
        if (!districtToDelete) return;

        try {
            setIsSubmitting(true);
            const response = await locationService.deleteDistrict(districtToDelete.id);
            if (response.success) {
                toast.success(response.message);
                setShowDistrictDeleteModal(false);
                if (activeDistrict?.id === districtToDelete.id) {
                    setActiveDistrict(null);
                }
                fetchDistricts();
                setDistrictToDelete(null);
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi khi xóa quận/huyện");
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmDeleteWard = async () => {
        if (!wardToDelete) return;

        try {
            setIsSubmitting(true);
            const response = await locationService.deleteWard(wardToDelete.id);
            if (response.success) {
                toast.success(response.message);
                setShowWardDeleteModal(false);
                fetchWards(wardToDelete.districtId);
                setWardToDelete(null);
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi khi xóa phường/xã");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-[1200px] mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                        <MapPin className="w-8 h-8 text-sky-500" />
                        Quản lý địa điểm
                    </h1>
                    <p className="text-gray-500 mt-1">Quản lý quận/huyện và phường/xã theo cấu trúc địa phương.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => openDistrictModal()}
                        className="bg-[#006B7A] text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-[#005a66] transition-all shadow-lg shadow-[#006B7A]/20"
                    >
                        <Plus className="w-4 h-4" />
                        Thêm quận/huyện
                    </button>
                    <button
                        onClick={() => openWardModal()}
                        disabled={!activeDistrict}
                        className="px-5 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-[#006B7A]/10 disabled:opacity-60 disabled:cursor-not-allowed bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                    >
                        <Plus className="w-4 h-4 text-[#006B7A]" />
                        Thêm phường/xã
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_1.5fr] gap-8">
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-gray-800 font-bold">
                            <Layers className="w-5 h-5 text-[#006B7A]" />
                            Quận/Huyện
                        </div>
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={districtSearch}
                                onChange={(e) => setDistrictSearch(e.target.value)}
                                placeholder="Tìm kiếm quận/huyện..."
                                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl outline-none focus:border-[#006B7A] focus:ring-4 focus:ring-[#006B7A]/5 text-sm"
                            />
                        </div>
                    </div>
                    <div className="overflow-x-auto custom-scrollbar">
                        {isLoadingDistricts ? (
                            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                <Loader2 className="w-10 h-10 text-[#006B7A] animate-spin" />
                                <p className="text-gray-400 text-sm">Đang tải quận/huyện...</p>
                            </div>
                        ) : filteredDistricts.length > 0 ? (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-[11px] uppercase tracking-wider text-gray-400 font-bold border-b border-gray-50">
                                        <th className="px-8 py-5 w-20">STT</th>
                                        <th className="px-8 py-5">Quận/Huyện</th>
                                        <th className="px-8 py-5 text-right w-32">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredDistricts.map((district, index) => {
                                        const isSelected = activeDistrict?.id === district.id;
                                        return (
                                            <tr
                                                key={district.id}
                                                onClick={() => handleSelectDistrict(district)}
                                                className={cn(
                                                    "group hover:bg-gray-50 transition-colors duration-200 cursor-pointer",
                                                    isSelected && "bg-[#E6F7F9]"
                                                )}
                                            >
                                                <td className="px-8 py-5">
                                                    <span className="text-xs font-bold text-gray-400">{index + 1}</span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className="font-bold text-gray-900">{district.districtName}</span>
                                                </td>
                                                <td className="px-8 py-5 text-right relative">
                                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-200 absolute right-8 top-1/2 -translate-y-1/2 z-10">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openDistrictModal(district);
                                                            }}
                                                            className="p-2 text-gray-400 hover:text-[#006B7A] hover:bg-[#006B7A]/5 rounded-lg transition-colors"
                                                            title="Chỉnh sửa"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteDistrict(district);
                                                            }}
                                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Xóa"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    <div className="opacity-100 group-hover:opacity-0 transition-opacity duration-200">
                                                        <Layers className="w-4 h-4 text-gray-300 ml-auto" />
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-32 text-center">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <Layers className="w-10 h-10 text-gray-200" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Không tìm thấy quận/huyện</h3>
                                <p className="text-gray-400 text-sm max-w-xs mt-1">Thêm quận/huyện mới để bắt đầu quản lý phường/xã.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex flex-col gap-4">
                        <div className="flex items-center gap-2 text-gray-800 font-bold">
                            <Home className="w-5 h-5 text-[#006B7A]" />
                            Phường/Xã
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={wardSearch}
                                    onChange={(e) => setWardSearch(e.target.value)}
                                    placeholder="Tìm kiếm phường/xã..."
                                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl outline-none focus:border-[#006B7A] focus:ring-4 focus:ring-[#006B7A]/5 text-sm"
                                />
                            </div>
                            <div>
                                <select
                                    value={activeDistrict?.id ?? ""}
                                    onChange={(e) => {
                                        const id = Number(e.target.value);
                                        const district = districts.find((item) => item.id === id) ?? null;
                                        setActiveDistrict(district);
                                    }}
                                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#006B7A] focus:ring-4 focus:ring-[#006B7A]/10"
                                >
                                    <option value="">Chọn quận/huyện</option>
                                    {districts.map((district) => (
                                        <option key={district.id} value={district.id}>
                                            {district.districtName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto custom-scrollbar">
                        {activeDistrict ? (
                            isLoadingWards ? (
                                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                    <Loader2 className="w-10 h-10 text-[#006B7A] animate-spin" />
                                    <p className="text-gray-400 text-sm">Đang tải phường/xã...</p>
                                </div>
                            ) : filteredWards.length > 0 ? (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="text-[11px] uppercase tracking-wider text-gray-400 font-bold border-b border-gray-50">
                                            <th className="px-8 py-5 w-20">STT</th>
                                            <th className="px-8 py-5">Phường/Xã</th>
                                            <th className="px-8 py-5 text-right w-32">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredWards.map((ward, index) => (
                                            <tr key={ward.id} className="group hover:bg-gray-100 transition-colors duration-200">
                                                <td className="px-8 py-5">
                                                    <span className="text-xs font-bold text-gray-400">{index + 1}</span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className="font-bold text-gray-900">{ward.wardName}</span>
                                                </td>
                                                <td className="px-8 py-5 text-right relative">
                                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-200 absolute right-8 top-1/2 -translate-y-1/2 z-10">
                                                        <button
                                                            onClick={() => openWardModal(ward)}
                                                            className="p-2 text-gray-400 hover:text-[#006B7A] hover:bg-[#006B7A]/5 rounded-lg transition-colors"
                                                            title="Chỉnh sửa"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteWard(ward)}
                                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Xóa"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    <div className="opacity-100 group-hover:opacity-0 transition-opacity duration-200">
                                                        <MapPin className="w-4 h-4 text-gray-300 ml-auto" />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-32 text-center">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                        <Home className="w-10 h-10 text-gray-200" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">Không tìm thấy phường/xã</h3>
                                    <p className="text-gray-400 text-sm max-w-xs mt-1">Thêm phường/xã cho quận/huyện {activeDistrict.districtName}.</p>
                                </div>
                            )
                        ) : (
                            <div className="flex flex-col items-center justify-center py-32 text-center">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <MapPin className="w-10 h-10 text-gray-200" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Chọn quận/huyện</h3>
                                <p className="text-gray-400 text-sm max-w-xs mt-1">Chọn quận/huyện ở bên trái hoặc trong bộ lọc để quản lý phường/xã tương ứng.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showDistrictModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden">
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {editingDistrict ? "Chỉnh sửa quận/huyện" : "Thêm quận/huyện mới"}
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    {editingDistrict ? "Cập nhật thông tin quận/huyện." : "Tạo quận/huyện mới để quản lý phường/xã."}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowDistrictModal(false)}
                                className="text-gray-400 hover:text-gray-700 transition-colors"
                                aria-label="Đóng"
                            >
                                <CloseIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveDistrict} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Tên quận/huyện</label>
                                <input
                                    value={districtForm.districtName}
                                    onChange={(e) => setDistrictForm({ districtName: e.target.value })}
                                    placeholder="Nhập tên quận/huyện"
                                    className="w-full rounded-3xl border border-gray-200 px-5 py-3 outline-none transition focus:border-[#006B7A] focus:ring-4 focus:ring-[#006B7A]/10"
                                />
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowDistrictModal(false)}
                                    className="w-full sm:w-auto px-6 py-3 rounded-2xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full sm:w-auto bg-[#006B7A] text-white px-6 py-3 rounded-2xl font-bold hover:bg-[#005a66] transition disabled:opacity-60"
                                >
                                    {isSubmitting ? "Đang lưu..." : editingDistrict ? "Lưu thay đổi" : "Tạo quận/huyện"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showWardModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden">
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {editingWard ? "Chỉnh sửa phường/xã" : "Thêm phường/xã mới"}
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    {editingWard
                                        ? "Cập nhật thông tin phường/xã."
                                        : "Tạo phường/xã mới cho quận/huyện hiện tại."}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowWardModal(false)}
                                className="text-gray-400 hover:text-gray-700 transition-colors"
                                aria-label="Đóng"
                            >
                                <CloseIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveWard} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Tên phường/xã</label>
                                <input
                                    value={wardForm.wardName}
                                    onChange={(e) => setWardForm({ ...wardForm, wardName: e.target.value })}
                                    placeholder="Nhập tên phường/xã"
                                    className="w-full rounded-3xl border border-gray-200 px-5 py-3 outline-none transition focus:border-[#006B7A] focus:ring-4 focus:ring-[#006B7A]/10"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Quận/Huyện</label>
                                <select
                                    value={wardForm.districtId}
                                    onChange={(e) => setWardForm({ ...wardForm, districtId: Number(e.target.value) })}
                                    className="w-full rounded-3xl border border-gray-200 bg-white px-5 py-3 outline-none transition focus:border-[#006B7A] focus:ring-4 focus:ring-[#006B7A]/10"
                                >
                                    <option value={0}>Chọn quận/huyện</option>
                                    {districts.map((district) => (
                                        <option key={district.id} value={district.id}>
                                            {district.districtName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowWardModal(false)}
                                    className="w-full sm:w-auto px-6 py-3 rounded-2xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full sm:w-auto bg-[#006B7A] text-white px-6 py-3 rounded-2xl font-bold hover:bg-[#005a66] transition disabled:opacity-60"
                                >
                                    {isSubmitting ? "Đang lưu..." : editingWard ? "Lưu thay đổi" : "Tạo phường/xã"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showDistrictDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden">
                        <div className="p-8 space-y-6 text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
                                <Trash2 className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">Xóa quận/huyện này?</h3>
                            <p className="text-gray-500">Hành động này sẽ xóa quận/huyện <span className="font-semibold">{districtToDelete?.districtName}</span>. Nếu còn phường/xã, hãy xử lý trước khi xóa.</p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <button
                                    onClick={() => setShowDistrictDeleteModal(false)}
                                    className="px-6 py-3 rounded-2xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={confirmDeleteDistrict}
                                    disabled={isSubmitting}
                                    className="px-6 py-3 rounded-2xl bg-red-600 text-white font-bold hover:bg-red-700 transition disabled:opacity-60"
                                >
                                    {isSubmitting ? "Đang xóa..." : "Xóa quận/huyện"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showWardDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden">
                        <div className="p-8 space-y-6 text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
                                <Trash2 className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">Xóa phường/xã này?</h3>
                            <p className="text-gray-500">Hành động này sẽ xóa phường/xã <span className="font-semibold">{wardToDelete?.wardName}</span>.</p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <button
                                    onClick={() => setShowWardDeleteModal(false)}
                                    className="px-6 py-3 rounded-2xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={confirmDeleteWard}
                                    disabled={isSubmitting}
                                    className="px-6 py-3 rounded-2xl bg-red-600 text-white font-bold hover:bg-red-700 transition disabled:opacity-60"
                                >
                                    {isSubmitting ? "Đang xóa..." : "Xóa phường/xã"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="p-6 border-t border-gray-50 bg-gray-50/20 text-[11px] text-gray-400 rounded-[2.5rem]">
                <AlertCircle className="w-3 h-3 inline-block mr-2" />
                Khu vực được chia theo quận/huyện và phường/xã để quản lý vị trí tuyển dụng chính xác.
            </div>
        </div>
    );
}

function CloseIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    );
}
