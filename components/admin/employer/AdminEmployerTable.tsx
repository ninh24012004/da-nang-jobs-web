"use client";

import React, { useEffect, useState } from "react";
import employerService from "@/services/employerService";
import { EmployerResponse, EmployerStatus, EmployerUpdateResponse } from "@/types/employer";
import { locationService } from "@/services/locationService";
import { DistrictResponse, WardResponse } from "@/types/location";
import {
  Eye,
  FileText,
  Search,
  Globe,
  MapPin,
  Users,
  X,
  AlertTriangle,
  Loader2,
  Lock,
  Unlock,
  ExternalLink,
  Check
} from "lucide-react";
import { toast } from "sonner";

const REJECTION_TEMPLATES = [
  "Giấy phép đăng ký kinh doanh bị mờ, không rõ chữ hoặc không đầy đủ trang.",
  "Mã số thuế cung cấp không khớp với mã số thuế trên giấy đăng ký kinh doanh.",
  "Tên doanh nghiệp đăng ký chưa khớp chính xác với quyết định/giấy phép thành lập.",
  "Thông tin địa chỉ trụ sở chính hoặc hotline liên hệ chưa chính xác hoặc không hoạt động.",
  "Website doanh nghiệp không hoạt động hoặc không phù hợp với lĩnh vực đăng ký.",
];

export default function AdminEmployerTable({ mode = "ALL" }: { mode?: "ALL" | "PENDING" }) {
  const [companies, setCompanies] = useState<(EmployerResponse | EmployerUpdateResponse)[]>([]);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [districts, setDistricts] = useState<DistrictResponse[]>([]);
  const [wards, setWards] = useState<WardResponse[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<EmployerStatus | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");

  // Modals state
  const [selectedCompany, setSelectedCompany] = useState<EmployerResponse | EmployerUpdateResponse | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, [page, statusFilter]);

  useEffect(() => {
    locationService.getAllDistricts()
      .then((res) => setDistricts(res ?? []))
      .catch(() => console.warn("Không tải được danh sách quận/huyện"));

    locationService.getAllWards()
      .then((res) => setWards(res ?? []))
      .catch(() => console.warn("Không tải được danh sách phường/xã"));
  }, []);

  async function fetchCompanies() {
    setLoading(true);
    setError("");
    try {
      let res;
      if (statusFilter === "PENDING") {
        res = await employerService.getPendingCompanies(page, size);
      } else if (statusFilter === "ALL") {
        res = await employerService.getAllCompanies(page, size);
      } else {
        res = await employerService.getCompaniesByStatus(statusFilter as EmployerStatus, page, size);
      }

      const content: (EmployerResponse | EmployerUpdateResponse)[] = res.content || [];

      setCompanies(content);
      setTotalPages(res.totalPages || 1);
      setTotalElements(res.totalElements || 0);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Lỗi khi tải danh sách doanh nghiệp"
      );
    } finally {
      setLoading(false);
    }
  }

  // Handle Search Client-side
  const filteredCompanies = companies.filter((company) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      company.companyName?.toLowerCase().includes(query) ||
      company.taxCode?.toLowerCase().includes(query) ||
      (company as any).phoneNumber?.toLowerCase().includes(query) ||
      (company as any).emailCompany?.toLowerCase().includes(query)
    );
  });

  const handleApprove = async (company: EmployerUpdateResponse) => {
    if (!window.confirm(`Bạn có chắc chắn muốn phê duyệt doanh nghiệp "${company.companyName}"?`)) {
      return;
    }

    setActionLoading(true);
    try {
      await employerService.approveEmployer(company.employerId);
      toast.success(`Đã phê duyệt nhà tuyển dụng "${company.companyName}" thành công!`);

      await Promise.all([fetchCompanies()]);

      setIsDetailsModalOpen(false);
      setSelectedCompany(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Phê duyệt nhà tuyển dụng thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleBlock = async (company: EmployerResponse | EmployerUpdateResponse, block: boolean) => {
    const actionText = block ? "khóa tài khoản" : "mở khóa tài khoản";
    if (!window.confirm(`Bạn có chắc chắn muốn ${actionText} doanh nghiệp "${company.companyName}"?`)) {
      return;
    }

    setActionLoading(true);
    try {
      const employerId = (company as any).employerId || company.id;
      const targetStatus: EmployerStatus = block ? "BLOCKED" : "APPROVED";
      await employerService.changeEmployerStatus(employerId, targetStatus);
      toast.success(`Đã ${actionText} nhà tuyển dụng "${company.companyName}" thành công!`);

      await Promise.all([fetchCompanies()]);
      setIsDetailsModalOpen(false);
      setSelectedCompany(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || `Thao tác ${actionText} thất bại`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany) return;
    if (!rejectionReason.trim()) {
      toast.error("Vui lòng nhập hoặc chọn lý lý do từ chối!");
      return;
    }

    setActionLoading(true);
    try {
      await employerService.rejectEmployer(selectedCompany.id, {
        reason: rejectionReason
      });
      toast.success(`Đã từ chối nhà tuyển dụng "${selectedCompany.companyName}"!`);

      await Promise.all([fetchCompanies()]);

      // Reset modals
      setIsRejectModalOpen(false);
      setIsDetailsModalOpen(false);
      setSelectedCompany(null);
      setRejectionReason("");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Từ chối nhà tuyển dụng thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  const getFullAddress = (company: EmployerResponse | EmployerUpdateResponse) => {
    if (!company.wardId) return company.address || "Chưa cập nhật";
    const ward = wards.find(w => w.id === Number(company.wardId));
    if (!ward) return company.address || "Chưa cập nhật";
    const district = districts.find(d => d.id === ward.districtId);

    const parts = [];
    if (company.address) parts.push(company.address);
    parts.push(ward.wardName);
    if (ward.districtName) {
      parts.push(ward.districtName);
    } else if (district) {
      parts.push(district.districtName);
    }
    parts.push("Đà Nẵng");
    return parts.join(", ");
  };

  const getStatusBadge = (status: any) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-bold border border-emerald-100 shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Đã Duyệt
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 px-3 py-1.5 rounded-full text-xs font-bold border border-rose-100 shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            Bị Từ Chối
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-xs font-bold border border-amber-100 animate-pulse shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
            Chờ Phê Duyệt
          </span>
        );
      case "BLOCKED":
        return (
          <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-650 px-3 py-1.5 rounded-full text-xs font-bold border border-red-100 shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-red-650" />
            Đã Bị Khóa
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 bg-gray-50 text-gray-500 px-3 py-1.5 rounded-full text-xs font-bold border border-gray-150 shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
            Chưa Hoàn Tất
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 2. Tabs and Search controls */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col lg:flex-row gap-4 items-center justify-between">
        {/* Navigation Tabs */}
        <div className="flex bg-gray-50/80 p-1.5 rounded-2xl border border-gray-200/50 w-full lg:w-auto overflow-x-auto custom-scrollbar gap-1">
          {([
            { id: "ALL", label: "Tất cả" },
            { id: "PENDING", label: "Chờ duyệt" },
            { id: "APPROVED", label: "Đã duyệt" },
            { id: "REJECTED", label: "Từ chối" },
            { id: "BLOCKED", label: "Đã khóa" }
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id);
                setPage(0);
              }}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 flex-shrink-0 cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-white text-[#006B7A] shadow-md scale-[1.02]"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-100/50"
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full lg:w-80 shadow-inner">
          <input
            type="text"
            placeholder="Tìm theo tên công ty, MST, Hotline..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50/50 border border-gray-200 focus:border-[#006B7A] focus:ring-1 focus:ring-[#006B7A] rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-700 outline-none transition-all font-medium"
          />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>


      {/* 3. Main Data Table */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-semibold text-gray-700">
            <thead className="bg-gray-50 border-b border-gray-100 text-[10px] text-gray-400 uppercase tracking-widest">
              <tr>
                <th className="p-4 w-16 text-center">Logo</th>
                <th className="p-4">Doanh nghiệp</th>
                <th className="p-4">Mã số thuế</th>
                <th className="p-4">Hotline</th>
                <th className="p-4">Tài liệu pháp lý (PDF)</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-16 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="h-8 w-8 animate-spin text-[#006B7A]" />
                      <span className="text-[11px] font-bold text-gray-400">Đang tải dữ liệu nhà tuyển dụng...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-16 text-center text-gray-400 font-medium">
                    Không tìm thấy nhà tuyển dụng nào phù hợp!
                  </td>
                </tr>
              ) : (
                filteredCompanies.map((c) => (
                  <tr key={c.id} className="hover:bg-[#F8FAFC]/80 transition-all duration-200 group border-b border-gray-100">
                    <td className="p-4 text-center">
                      <div className="h-12 w-12 mx-auto rounded-xl border border-gray-100 overflow-hidden flex items-center justify-center font-bold text-xs shadow-inner relative transition-transform group-hover:scale-105">
                        {c.logoUrl && c.logoUrl.trim() !== "" ? (
                          <img src={c.logoUrl} alt="Logo" className="h-full w-full object-cover" />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-[#006B7A] to-[#009fb2] text-white flex items-center justify-center font-bold tracking-wider uppercase font-mono shadow-inner text-sm">
                            {c.companyName ? c.companyName.slice(0, 2).toUpperCase() : "DN"}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      <div>
                        <p className="font-extrabold text-gray-800 text-sm leading-snug group-hover:text-[#006B7A] transition-colors">{c.companyName}</p>
                        {c.website && (
                          <a
                            href={c.website.startsWith('http') ? c.website : `https://${c.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-[#006B7A] hover:underline inline-flex items-center gap-1 mt-1 font-bold max-w-full"
                          >
                            <Globe size={11} className="flex-shrink-0" />
                            <span className="truncate max-w-[140px] inline-block">
                              {c.website.replace(/^(https?:\/\/)?(www\.)?/, '')}
                            </span>
                          </a>
                        )}
                      </div>
                    </td>

                    <td className="p-4 font-mono font-bold text-gray-600">{c.taxCode}</td>

                    <td className="p-4 font-bold text-gray-600">{(c as any).phoneNumber || "—"}</td>

                    <td className="p-4">
                      {c.businessLicense && c.businessLicense.startsWith("http") ? (
                        <a
                          href={c.businessLicense}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[#006B7A] hover:text-[#005a66] hover:bg-[#006B7A]/10 font-bold bg-[#006B7A]/5 px-3 py-1.5 rounded-lg transition-all"
                        >
                          <FileText size={13} className="text-red-500" />
                          <span>Mở PDF</span>
                        </a>
                      ) : (
                        <span className="text-gray-400 italic font-medium">Chưa có tài liệu</span>
                      )}
                    </td>

                    <td className="p-4">{getStatusBadge(c.status)}</td>

                    <td className="p-4 text-right space-x-1.5">
                      <button
                        onClick={() => {
                          setSelectedCompany(c);
                          setIsDetailsModalOpen(true);
                        }}
                        className="bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 text-gray-600 px-3 py-1.5 rounded-xl shadow-xs transition-all active:scale-[0.98] inline-flex items-center gap-1 cursor-pointer font-bold"
                        title="Xem chi tiết hồ sơ"
                      >
                        <Eye size={13} />
                        <span>Xem chi tiết</span>
                      </button>

                      {c.status === "PENDING" ? (
                        <>
                          <button
                            onClick={() => handleApprove(c as EmployerUpdateResponse)}
                            disabled={actionLoading}
                            className="bg-[#006B7A] hover:bg-[#005a66] text-white px-3 py-1.5 rounded-xl shadow-xs transition-all active:scale-[0.98] inline-flex items-center gap-1 cursor-pointer font-extrabold"
                          >
                            <Check size={13} />
                            Duyệt
                          </button>
                          <button
                            onClick={() => {
                              setSelectedCompany(c);
                              setIsRejectModalOpen(true);
                            }}
                            disabled={actionLoading}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-650 px-3 py-1.5 rounded-xl border border-rose-100 transition-all active:scale-[0.98] cursor-pointer font-extrabold"
                          >
                            Từ chối
                          </button>
                        </>
                      ) : c.status === "BLOCKED" ? (
                        <button
                          onClick={() => handleToggleBlock(c, false)}
                          disabled={actionLoading}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-xl transition-all active:scale-[0.98] cursor-pointer font-extrabold shadow-xs inline-flex items-center gap-1"
                        >
                          <Unlock size={12} />
                          Mở khóa
                        </button>
                      ) : (
                        ((c.status as any) === "APPROVED" || (c.status as any) === "REJECTED") && (
                          <button
                            onClick={() => handleToggleBlock(c, true)}
                            disabled={actionLoading}
                            className="bg-red-50 hover:bg-red-100 text-red-650 border border-red-200 px-3 py-1.5 rounded-xl transition-all active:scale-[0.98] cursor-pointer font-extrabold shadow-xs inline-flex items-center gap-1"
                          >
                            <Lock size={12} />
                            Khóa tài khoản
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Pagination control */}
      <div className="flex items-center justify-between px-2 text-xs font-semibold">
        <div className="text-gray-500">
          Hiển thị trang {page + 1} / {totalPages} (Tổng cộng: {totalElements} doanh nghiệp)
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0 || loading}
            className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 text-gray-600 rounded-xl shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold"
          >
            Trang trước
          </button>

          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1 || loading}
            className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 text-gray-600 rounded-xl shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold"
          >
            Trang sau
          </button>
        </div>
      </div>

      {/* 5. PREMIUM DETAILS MODAL (GLASSMORPHISM POPUP) */}
      {isDetailsModalOpen && selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-2xl rounded-3xl border border-gray-100 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transform scale-100 transition-all duration-300">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-[#006B7A]/5 to-cyan-50/20">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl border border-gray-200 overflow-hidden flex items-center justify-center font-extrabold text-[#006B7A] text-lg bg-white shadow-sm relative">
                  {selectedCompany.logoUrl && selectedCompany.logoUrl.trim() !== "" ? (
                    <img src={selectedCompany.logoUrl} alt="Logo" className="h-full w-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#006B7A] to-[#009fb2] text-white flex items-center justify-center font-bold tracking-wider uppercase font-mono shadow-inner text-sm">
                      {selectedCompany.companyName ? selectedCompany.companyName.slice(0, 2).toUpperCase() : "DN"}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-gray-800 leading-tight">{selectedCompany.companyName}</h3>
                  <p className="text-[10px] text-gray-400 font-extrabold uppercase mt-1 tracking-wider">Hồ sơ pháp lý nhà tuyển dụng</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  setSelectedCompany(null);
                }}
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all duration-200 cursor-pointer border border-transparent hover:border-gray-200"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-gray-600 font-semibold custom-scrollbar">
              {/* Top Banner Status */}
              <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 flex items-center justify-between shadow-inner">
                <span className="text-gray-500 font-bold">Trạng thái tài khoản:</span>
                <span>{getStatusBadge(selectedCompany.status)}</span>
              </div>

              {/* Basic Fields grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mã số thuế</p>
                  <p className="font-mono font-bold text-gray-800 text-sm bg-gray-50 px-3 py-2 rounded-xl border border-gray-100 inline-block">{selectedCompany.taxCode}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Số điện thoại liên hệ</p>
                  <p className="font-bold text-gray-800 text-sm bg-gray-50 px-3 py-2 rounded-xl border border-gray-100 inline-block">{(selectedCompany as any).phoneNumber || "—"}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Website doanh nghiệp</p>
                  <div className="font-bold text-[#006B7A] text-sm">
                    {selectedCompany.website ? (
                      <a 
                        href={selectedCompany.website.startsWith('http') ? selectedCompany.website : `https://${selectedCompany.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="hover:underline inline-flex items-center gap-1 bg-teal-50 px-3 py-2 rounded-xl border border-teal-100 max-w-full"
                      >
                        <Globe size={13} className="flex-shrink-0" />
                        <span className="truncate max-w-[200px] sm:max-w-[260px] inline-block">
                          {selectedCompany.website.replace(/^(https?:\/\/)?(www\.)?/, '')}
                        </span>
                        <ExternalLink size={11} className="ml-0.5 flex-shrink-0" />
                      </a>
                    ) : (
                      <span className="text-gray-400 italic bg-gray-50 px-3 py-2 rounded-xl border border-gray-100 inline-block">Chưa có website</span>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Quy mô nhân sự</p>
                  <p className="font-bold text-gray-800 text-sm bg-gray-50 px-3 py-2 rounded-xl border border-gray-100 inline-flex items-center gap-1.5">
                    <Users size={14} className="text-gray-400" />
                    <span>{selectedCompany.companySize || "Chưa cập nhật"}</span>
                  </p>
                </div>
              </div>

              {/* Head office Address */}
              <div className="space-y-1 pt-2 border-t border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Địa chỉ trụ sở chính</p>
                <div className="font-bold text-gray-700 flex items-start gap-2 text-sm bg-gray-50 p-3 rounded-2xl border border-gray-100">
                  <MapPin size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <span>{getFullAddress(selectedCompany)}</span>
                </div>
              </div>

              {/* Description / Introduction */}
              <div className="space-y-1.5 pt-2 border-t border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Giới thiệu hoạt động</p>
                <div className="font-medium text-gray-600 leading-relaxed bg-[#F8FAFC] p-4.5 rounded-2xl border border-gray-200/50 text-xs">
                  {selectedCompany.description || "Chưa có thông tin giới thiệu hoạt động."}
                </div>
              </div>

              {/* Business License PDF Viewer Option */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tài liệu pháp lý (Giấy phép kinh doanh)</p>
                {selectedCompany.businessLicense && selectedCompany.businessLicense.startsWith("http") ? (
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-teal-100 bg-[#006B7A]/5 text-teal-900 shadow-sm transition-all hover:bg-[#006B7A]/10 duration-200">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2.5 bg-red-50 text-red-500 rounded-xl flex-shrink-0 shadow-xs">
                        <FileText size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-extrabold text-[12px] text-gray-700 truncate leading-tight">Giấy đăng ký kinh doanh.pdf</p>
                        <p className="text-[10px] text-gray-400 mt-0.5 font-light">Tài liệu đã được xác thực pháp lý</p>
                      </div>
                    </div>

                    <a
                      href={selectedCompany.businessLicense}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white hover:bg-gray-50 border border-gray-200 text-[#006B7A] px-4 py-2 rounded-xl text-xs font-bold shadow-xs hover:shadow transition-all active:scale-[0.98] inline-flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
                    >
                      <ExternalLink size={13} />
                      <span>Xem file PDF</span>
                    </a>
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl border border-gray-150 bg-gray-50/50 text-center font-medium text-gray-400 italic">
                    Doanh nghiệp chưa tải lên tệp tài liệu PDF giấy phép kinh doanh.
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50 rounded-b-3xl">
              <button
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  setSelectedCompany(null);
                }}
                className="px-5 py-2.5 border border-gray-200 hover:bg-gray-100 text-gray-600 rounded-xl font-bold transition-all active:scale-[0.98] cursor-pointer"
              >
                Đóng
              </button>
              {selectedCompany.status === "PENDING" ? (
                <>
                  <button
                    onClick={() => setIsRejectModalOpen(true)}
                    disabled={actionLoading}
                    className="bg-rose-50 hover:bg-rose-100 text-rose-650 px-5 py-2.5 rounded-xl font-bold border border-rose-100 transition-all active:scale-[0.98] cursor-pointer"
                  >
                    Từ chối phê duyệt
                  </button>
                  <button
                    onClick={() => handleApprove(selectedCompany as EmployerUpdateResponse)}
                    disabled={actionLoading}
                    className="bg-[#006B7A] hover:bg-[#005a66] text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98] flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check size={15} />
                    <span>Phê duyệt hồ sơ</span>
                  </button>
                </>
              ) : (selectedCompany.status as any) === "BLOCKED" ? (
                <button
                  onClick={() => handleToggleBlock(selectedCompany, false)}
                  disabled={actionLoading}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-5 py-2.5 rounded-xl font-extrabold transition-all active:scale-[0.98] cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                >
                  <Unlock size={14} />
                  <span>Mở khóa tài khoản</span>
                </button>
              ) : (
                <button
                  onClick={() => handleToggleBlock(selectedCompany, true)}
                  disabled={actionLoading}
                  className="bg-red-50 hover:bg-red-100 text-red-650 border border-red-200 px-5 py-2.5 rounded-xl font-extrabold transition-all active:scale-[0.98] cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                >
                  <Lock size={14} />
                  <span>Khóa tài khoản</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. REJECTION REASON DIALOG MODAL (WITH QUICK OPTIONS) */}
      {isRejectModalOpen && selectedCompany && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-gray-100 shadow-2xl overflow-hidden animate-scaleIn">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-rose-50/50">
              <div className="flex items-center gap-2 text-rose-800">
                <AlertTriangle size={18} />
                <h4 className="font-extrabold text-sm uppercase tracking-widest">Từ chối phê duyệt doanh nghiệp</h4>
              </div>
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form body */}
            <form onSubmit={handleRejectSubmit}>
              <div className="p-5 space-y-4 text-xs font-semibold">
                <p className="text-gray-500 leading-relaxed font-light text-[11px]">
                  Vui lòng cung cấp lý do từ chối cụ thể cho <strong>{selectedCompany.companyName}</strong>. Lý do này sẽ hiển thị trực tiếp trong bảng quản trị của nhà tuyển dụng để họ khắc phục/gửi lại.
                </p>

                {/* Quick Templates option */}
                <div className="space-y-2">
                  <label className="text-gray-400 uppercase tracking-widest block text-[10px] font-bold">Gợi ý nhanh lý do từ chối</label>
                  <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto p-1.5 rounded-2xl bg-gray-50 border border-gray-150 custom-scrollbar">
                    {REJECTION_TEMPLATES.map((tmpl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setRejectionReason(tmpl)}
                        className="bg-white hover:bg-rose-50 hover:text-rose-700 text-gray-600 px-3 py-2 rounded-xl border border-gray-200 hover:border-rose-200 transition-all text-left text-[11px] font-medium leading-relaxed block w-full cursor-pointer shadow-xs"
                      >
                        {tmpl}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-gray-400 uppercase tracking-widest block text-[10px] font-bold">Chi tiết lý do từ chối <span className="text-red-500">*</span></label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Ví dụ: Giấy đăng ký kinh doanh không rõ mã số thuế, vui lòng quét/chụp bản rõ hơn và gửi duyệt lại..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full bg-white border border-gray-250 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-2xl px-4 py-3 text-gray-700 outline-none transition-all font-medium leading-relaxed"
                  />
                </div>
              </div>

              {/* Action buttons footer */}
              <div className="p-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50 rounded-b-3xl">
                <button
                  type="button"
                  onClick={() => setIsRejectModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 hover:bg-gray-100 text-gray-600 rounded-xl font-bold transition-all active:scale-[0.98] cursor-pointer"
                >
                  Quay lại
                </button>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-red-650 hover:bg-red-700 disabled:bg-gray-300 text-white px-5 py-2 rounded-xl font-bold shadow-md transition-all active:scale-[0.98] flex items-center gap-1.5 cursor-pointer"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    <span>Xác nhận từ chối</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
