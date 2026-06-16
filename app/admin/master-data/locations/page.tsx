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
    X,
} from "lucide-react";
import { toast } from "sonner";
import { useLocations } from "@/hooks/useLocations";
import {
    DistrictResponse,
    WardResponse,
    DistrictFormData,
    WardFormData,
} from "@/types/location";
import { cn } from "@/lib/utils";

export default function LocationsPage() {
    const {
        districts,
        wards,
        isLoadingDistricts,
        isLoadingWards,
        isSubmitting,
        fetchDistricts,
        fetchWards,
        createDistrict,
        updateDistrict,
        deleteDistrict,
        createWard,
        updateWard,
        deleteWard,
        setWards,
    } = useLocations();

    const [activeDistrict, setActiveDistrict] = useState<DistrictResponse | null>(null);
    const [districtSearch, setDistrictSearch] = useState("");
    const [wardSearch, setWardSearch] = useState("");
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

    useEffect(() => {
        fetchDistricts();
    }, [fetchDistricts]);

    useEffect(() => {
        if (activeDistrict) {
            fetchWards(activeDistrict.id);
        } else {
            setWards([]);
        }
    }, [activeDistrict, fetchWards, setWards]);

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

        const res = editingDistrict
            ? await updateDistrict(editingDistrict.id, districtForm)
            : await createDistrict(districtForm);

        if (res.success) {
            setShowDistrictModal(false);
            setEditingDistrict(null);
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

        const res = editingWard
            ? await updateWard(editingWard.id, wardForm)
            : await createWard(wardForm);

        if (res.success) {
            setShowWardModal(false);
            setEditingWard(null);
            if (activeDistrict?.id !== wardForm.districtId) {
                const nextActive = districts.find((item) => item.id === wardForm.districtId);
                if (nextActive) setActiveDistrict(nextActive);
            }
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

        const res = await deleteDistrict(districtToDelete.id);
        if (res.success) {
            setShowDistrictDeleteModal(false);
            if (activeDistrict?.id === districtToDelete.id) {
                setActiveDistrict(null);
            }
            setDistrictToDelete(null);
        }
    };

    const confirmDeleteWard = async () => {
        if (!wardToDelete) return;

        const res = await deleteWard(wardToDelete.id, wardToDelete.districtId);
        if (res.success) {
            setShowWardDeleteModal(false);
            setWardToDelete(null);
        }
    };

    return (
        <div className="max-w-[1200px] mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <span className="p-1.5 bg-slate-100 rounded inline-block border border-slate-200">
                            <MapPin className="w-5 h-5 text-slate-700" />
                        </span>
                        Quản lý địa điểm
                    </h1>
                    <p className="text-slate-505 mt-1 text-xs font-medium">Quản lý quận/huyện và phường/xã theo cấu trúc địa phương.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => openDistrictModal()}
                        className="bg-slate-900 text-white px-4 py-2 rounded-md font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors duration-150 text-xs cursor-pointer shadow-xs"
                    >
                        <Plus className="w-4 h-4" />
                        Thêm quận/huyện
                    </button>
                    <button
                        onClick={() => openWardModal()}
                        disabled={!activeDistrict}
                        className="px-4 py-2 rounded-md font-bold flex items-center gap-2 transition-colors duration-150 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs cursor-pointer"
                    >
                        <Plus className="w-4 h-4 text-slate-500" />
                        Thêm phường/xã
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_1.5fr] gap-6">
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-slate-850 font-bold text-xs">
                            <Layers className="w-4 h-4 text-slate-700" />
                            Quận/Huyện
                        </div>
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={districtSearch}
                                onChange={(e) => setDistrictSearch(e.target.value)}
                                placeholder="Tìm kiếm quận/huyện..."
                                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-md outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 text-xs font-medium text-slate-750"
                            />
                        </div>
                    </div>
                    <div className="overflow-x-auto custom-scrollbar">
                        {isLoadingDistricts ? (
                            <div className="flex flex-col items-center justify-center py-20 space-y-3">
                                <Loader2 className="w-8 h-8 text-slate-600 animate-spin" />
                                <p className="text-slate-405 text-xs font-semibold">Đang tải quận/huyện...</p>
                            </div>
                        ) : filteredDistricts.length > 0 ? (
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-200 bg-slate-50">
                                        <th className="px-4 py-3 w-16">STT</th>
                                        <th className="px-4 py-3">Quận/Huyện</th>
                                        <th className="px-4 py-3 text-right w-28">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 font-medium text-slate-700">
                                    {filteredDistricts.map((district, index) => {
                                        const isSelected = activeDistrict?.id === district.id;
                                        return (
                                            <tr
                                                key={district.id}
                                                onClick={() => handleSelectDistrict(district)}
                                                className={cn(
                                                    "group hover:bg-slate-50 transition-colors duration-150 cursor-pointer",
                                                    isSelected && "bg-slate-100"
                                                )}
                                            >
                                                <td className="px-4 py-3">
                                                    <span className="font-bold text-slate-400">{index + 1}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="font-bold text-slate-900">{district.districtName}</span>
                                                </td>
                                                <td className="px-4 py-3 text-right relative whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-150 absolute right-4 top-1/2 -translate-y-1/2 z-10">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openDistrictModal(district);
                                                            }}
                                                            className="p-1 text-slate-655 hover:text-slate-900 bg-white hover:bg-slate-150 rounded border border-slate-200 shadow-xs transition-colors cursor-pointer"
                                                            title="Chỉnh sửa"
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteDistrict(district);
                                                            }}
                                                            className="p-1 text-red-600 hover:text-red-750 bg-white hover:bg-red-50 rounded border border-slate-200 shadow-xs transition-colors cursor-pointer"
                                                            title="Xóa"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                    <div className="opacity-100 group-hover:opacity-0 transition-opacity duration-150">
                                                        <Layers className="w-3.5 h-3.5 text-slate-350 ml-auto" />
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-14 h-14 bg-slate-100 rounded-md flex items-center justify-center mb-4">
                                    <Layers className="w-7 h-7 text-slate-350" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900">Không tìm thấy quận/huyện</h3>
                                <p className="text-slate-455 text-xs max-w-xs mt-1 font-medium">Thêm quận/huyện mới để bắt đầu quản lý phường/xã.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col gap-4">
                        <div className="flex items-center gap-2 text-slate-850 font-bold text-xs">
                            <Home className="w-4 h-4 text-slate-700" />
                            Phường/Xã
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    value={wardSearch}
                                    onChange={(e) => setWardSearch(e.target.value)}
                                    placeholder="Tìm kiếm phường/xã..."
                                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-md outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 text-xs font-medium text-slate-750"
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
                                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-slate-405 focus:ring-1 focus:ring-slate-405 text-slate-750 cursor-pointer"
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
                                <div className="flex flex-col items-center justify-center py-20 space-y-3">
                                    <Loader2 className="w-8 h-8 text-slate-600 animate-spin" />
                                    <p className="text-slate-405 text-xs font-semibold">Đang tải phường/xã...</p>
                                </div>
                            ) : filteredWards.length > 0 ? (
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-200 bg-slate-50">
                                            <th className="px-4 py-3 w-16">STT</th>
                                            <th className="px-4 py-3">Phường/Xã</th>
                                            <th className="px-4 py-3 text-right w-28">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 font-medium text-slate-700">
                                        {filteredWards.map((ward, index) => (
                                            <tr key={ward.id} className="group hover:bg-slate-50 transition-colors duration-150">
                                                <td className="px-4 py-3">
                                                    <span className="font-bold text-slate-400">{index + 1}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="font-bold text-slate-900">{ward.wardName}</span>
                                                </td>
                                                <td className="px-4 py-3 text-right relative whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-150 absolute right-4 top-1/2 -translate-y-1/2 z-10">
                                                        <button
                                                            onClick={() => openWardModal(ward)}
                                                            className="p-1 text-slate-655 hover:text-slate-900 bg-white hover:bg-slate-150 rounded border border-slate-200 shadow-xs transition-colors cursor-pointer"
                                                            title="Chỉnh sửa"
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteWard(ward)}
                                                            className="p-1 text-red-600 hover:text-red-750 bg-white hover:bg-red-50 rounded border border-slate-200 shadow-xs transition-colors cursor-pointer"
                                                            title="Xóa"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                    <div className="opacity-100 group-hover:opacity-0 transition-opacity duration-150">
                                                        <MapPin className="w-3.5 h-3.5 text-slate-350 ml-auto" />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="w-14 h-14 bg-slate-100 rounded-md flex items-center justify-center mb-4">
                                        <Home className="w-7 h-7 text-slate-350" />
                                    </div>
                                    <h3 className="text-sm font-bold text-slate-900">Không tìm thấy phường/xã</h3>
                                    <p className="text-slate-455 text-xs max-w-xs mt-1 font-medium">Thêm phường/xã cho quận/huyện {activeDistrict.districtName}.</p>
                                </div>
                            )
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-14 h-14 bg-slate-100 rounded-md flex items-center justify-center mb-4">
                                    <MapPin className="w-7 h-7 text-slate-350" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900">Chọn quận/huyện</h3>
                                <p className="text-slate-455 text-xs max-w-xs mt-1 font-medium">Chọn quận/huyện ở bên trái hoặc trong bộ lọc để quản lý phường/xã tương ứng.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showDistrictModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
                    <div className="bg-white rounded-lg w-full max-w-lg shadow-lg border border-slate-200 overflow-hidden">
                        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                            <div>
                                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                                    {editingDistrict ? "Chỉnh sửa quận/huyện" : "Thêm quận/huyện mới"}
                                </h2>
                                <p className="text-xs text-slate-500 mt-1 font-medium">
                                    {editingDistrict ? "Cập nhật thông tin quận/huyện." : "Tạo quận/huyện mới để quản lý phường/xã."}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowDistrictModal(false)}
                                className="p-1 rounded hover:bg-slate-200 text-slate-450 hover:text-slate-655 transition-colors border border-slate-200 cursor-pointer"
                                aria-label="Đóng"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveDistrict} className="p-5 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">Tên quận/huyện</label>
                                <input
                                    value={districtForm.districtName}
                                    onChange={(e) => setDistrictForm({ districtName: e.target.value })}
                                    placeholder="Nhập tên quận/huyện"
                                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-xs font-medium outline-none transition-colors focus:border-slate-400 focus:ring-1 focus:ring-slate-400 text-slate-750"
                                />
                            </div>
                            <div className="flex gap-2 pt-4 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => setShowDistrictModal(false)}
                                    className="flex-1 bg-white hover:bg-slate-100 text-slate-700 py-2 rounded-md font-bold border border-slate-200 transition-all cursor-pointer text-xs"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 bg-slate-900 text-white py-2 rounded-md font-bold hover:bg-slate-800 transition-colors duration-150 flex items-center justify-center gap-2 cursor-pointer text-xs disabled:opacity-50"
                                >
                                    {isSubmitting ? "Đang lưu..." : editingDistrict ? "Lưu thay đổi" : "Tạo quận/huyện"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showWardModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
                    <div className="bg-white rounded-lg w-full max-w-lg shadow-lg border border-slate-200 overflow-hidden">
                        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                            <div>
                                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                                    {editingWard ? "Chỉnh sửa phường/xã" : "Thêm phường/xã mới"}
                                </h2>
                                <p className="text-xs text-slate-500 mt-1 font-medium">
                                    {editingWard
                                        ? "Cập nhật thông tin phường/xã."
                                        : "Tạo phường/xã mới cho quận/huyện hiện tại."}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowWardModal(false)}
                                className="p-1 rounded hover:bg-slate-200 text-slate-450 hover:text-slate-655 transition-colors border border-slate-200 cursor-pointer"
                                aria-label="Đóng"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveWard} className="p-5 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-505 block uppercase tracking-wider">Tên phường/xã</label>
                                <input
                                    value={wardForm.wardName}
                                    onChange={(e) => setWardForm({ ...wardForm, wardName: e.target.value })}
                                    placeholder="Nhập tên phường/xã"
                                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-xs font-medium outline-none transition-colors focus:border-slate-400 focus:ring-1 focus:ring-slate-400 text-slate-750"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-505 block uppercase tracking-wider">Quận/Huyện</label>
                                <select
                                    value={wardForm.districtId}
                                    onChange={(e) => setWardForm({ ...wardForm, districtId: Number(e.target.value) })}
                                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none transition-colors focus:border-slate-400 focus:ring-1 focus:ring-slate-400 text-slate-750 cursor-pointer"
                                >
                                    <option value={0}>Chọn quận/huyện</option>
                                    {districts.map((district) => (
                                        <option key={district.id} value={district.id}>
                                            {district.districtName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-2 pt-4 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => setShowWardModal(false)}
                                    className="flex-1 bg-white hover:bg-slate-100 text-slate-700 py-2 rounded-md font-bold border border-slate-200 transition-all cursor-pointer text-xs"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 bg-slate-900 text-white py-2 rounded-md font-bold hover:bg-slate-800 transition-colors duration-150 flex items-center justify-center gap-2 cursor-pointer text-xs disabled:opacity-50"
                                >
                                    {isSubmitting ? "Đang lưu..." : editingWard ? "Lưu thay đổi" : "Tạo phường/xã"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showDistrictDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
                    <div className="bg-white rounded-lg p-5 max-w-md w-full shadow-lg border border-slate-200">
                        <div className="w-10 h-10 bg-red-50 rounded flex items-center justify-center mb-4">
                            <Trash2 className="w-5 h-5 text-red-500" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mb-1">Xóa quận/huyện này?</h3>
                        <p className="text-slate-500 mb-5 leading-relaxed font-semibold text-xs">
                            Hành động này sẽ xóa quận/huyện <span className="font-extrabold text-slate-900">"{districtToDelete?.districtName}"</span>. Nếu còn phường/xã, hãy xử lý trước khi xóa.
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowDistrictDeleteModal(false)}
                                className="flex-1 bg-white hover:bg-slate-100 text-slate-700 py-2 rounded-md font-bold border border-slate-200 cursor-pointer text-xs"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={confirmDeleteDistrict}
                                disabled={isSubmitting}
                                className="flex-1 bg-red-600 text-white py-2 rounded-md font-bold hover:bg-red-700 transition-colors duration-150 flex items-center justify-center gap-2 cursor-pointer text-xs disabled:opacity-50"
                            >
                                {isSubmitting ? "Đang xóa..." : "Xóa quận/huyện"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showWardDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
                    <div className="bg-white rounded-lg p-5 max-w-md w-full shadow-lg border border-slate-200">
                        <div className="w-10 h-10 bg-red-50 rounded flex items-center justify-center mb-4">
                            <Trash2 className="w-5 h-5 text-red-500" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mb-1">Xóa phường/xã này?</h3>
                        <p className="text-slate-500 mb-5 leading-relaxed font-semibold text-xs">
                            Hành động này sẽ xóa phường/xã <span className="font-extrabold text-slate-900">"{wardToDelete?.wardName}"</span>.
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowWardDeleteModal(false)}
                                className="flex-1 bg-white hover:bg-slate-100 text-slate-700 py-2 rounded-md font-bold border border-slate-200 cursor-pointer text-xs"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={confirmDeleteWard}
                                disabled={isSubmitting}
                                className="flex-1 bg-red-600 text-white py-2 rounded-md font-bold hover:bg-red-700 transition-colors duration-150 flex items-center justify-center gap-2 cursor-pointer text-xs disabled:opacity-50"
                            >
                                {isSubmitting ? "Đang xóa..." : "Xóa phường/xã"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="p-3 border border-slate-200 bg-slate-50 text-[11px] text-slate-500 rounded-lg">
                <AlertCircle className="w-3.5 h-3.5 inline-block mr-2" />
                Khu vực được chia theo quận/huyện và phường/xã để quản lý vị trí tuyển dụng chính xác.
            </div>
        </div>
    );
}
