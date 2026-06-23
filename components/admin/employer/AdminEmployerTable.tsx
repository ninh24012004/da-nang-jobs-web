"use client";

import React, { useEffect, useState } from "react";
import employerService from "@/services/employerService";
import { EmployerResponse, EmployerStatus } from "@/types/employer";
import { locationService } from "@/services/locationService";
import { DistrictResponse, WardResponse } from "@/types/location";
import {
  Eye,
  FileText,
  Search,
  Globe,
  Mail,
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
  const [companies, setCompanies] = useState<EmployerResponse[]>([]);
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
  const [selectedCompany, setSelectedCompany] = useState<EmployerResponse | null>(null);
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
        res = await employerService.getCompaniesByStatus("PENDING", page, size);
      } else if (statusFilter === "ALL") {
        res = await employerService.getAllCompanies(page, size);
      } else {
        res = await employerService.getCompaniesByStatus(statusFilter as EmployerStatus, page, size);
      }

      const content: EmployerResponse[] = res.content || [];

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
      company.phoneNumber?.toLowerCase().includes(query) ||
      company.emailCompany?.toLowerCase().includes(query)
    );
  });

  const handleApprove = async (company: EmployerResponse) => {
    if (!window.confirm(`Bạn có chắc chắn muốn phê duyệt doanh nghiệp "${company.companyName}"?`)) {
      return;
    }

    setActionLoading(true);
    try {
      await employerService.approveEmployer(company.id);
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

  const handleToggleBlock = async (company: EmployerResponse, block: boolean) => {
    const actionText = block ? "khóa tài khoản" : "mở khóa tài khoản";
    if (!window.confirm(`Bạn có chắc chắn muốn ${actionText} doanh nghiệp "${company.companyName}"?`)) {
      return;
    }

    setActionLoading(true);
    try {
      const employerId = company.id;
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

  const getFullAddress = (company: EmployerResponse) => {
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
          <span className="inline-flex items-center bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-xs font-semibold border border-emerald-100">
            Đã Duyệt
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center bg-rose-50 text-rose-700 px-2 py-0.5 rounded text-xs font-semibold border border-rose-100">
            Bị Từ Chối
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-xs font-semibold border border-amber-100">
            Chờ Phê Duyệt
          </span>
        );
      case "BLOCKED":
        return (
          <span className="inline-flex items-center bg-red-50 text-red-700 px-2 py-0.5 rounded text-xs font-semibold border border-red-100">
            Đã Bị Khóa
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-semibold border border-slate-250">
            Chưa Hoàn Tất
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 2. Tabs and Search controls */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between">
        {/* Navigation Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-md border border-slate-200/80 w-full lg:w-auto overflow-x-auto custom-scrollbar gap-0.5">
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
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded transition-colors duration-150 flex-shrink-0 cursor-pointer ${statusFilter === tab.id
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/40"
                }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full lg:w-80">
          <input
            type="text"
            placeholder="Tìm theo tên công ty, MST, Hotline..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded-md pl-10 pr-4 py-2 text-xs text-slate-700 outline-none transition-colors font-medium"
          />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </div>


      {/* 3. Main Data Table */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-md text-xs font-semibold flex items-center gap-2">
          <AlertTriangle size={14} />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-3 w-16 text-center">Logo</th>
                <th className="p-3">Doanh nghiệp</th>
                <th className="p-3">Mã số thuế</th>
                <th className="p-3">Hotline</th>
                <th className="p-3">Tài liệu pháp lý (PDF)</th>
                <th className="p-3">Trạng thái</th>
                <th className="p-3 text-right">Thao tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium text-slate-750">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-slate-900" />
                      <span className="text-[11px] font-semibold text-slate-400">Đang tải dữ liệu nhà tuyển dụng...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-400 font-medium">
                    Không tìm thấy nhà tuyển dụng nào phù hợp!
                  </td>
                </tr>
              ) : (
                filteredCompanies.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors duration-150 border-b border-slate-100">
                    <td className="p-3 text-center">
                      <div className="h-9 w-9 mx-auto rounded-md border border-slate-200 overflow-hidden flex items-center justify-center font-semibold text-xs relative bg-white">
                        {c.logoUrl && c.logoUrl.trim() !== "" ? (
                          <img src={c.logoUrl} alt="Logo" className="h-full w-full object-cover" />
                        ) : (
                          <div className="absolute inset-0 bg-slate-900 text-white flex items-center justify-center font-semibold uppercase font-mono text-xs">
                            {c.companyName ? c.companyName.slice(0, 2).toUpperCase() : "DN"}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="p-3">
                      <div>
                        <p className="font-semibold text-slate-900 text-xs leading-snug">{c.companyName}</p>
                        <div className="flex flex-col gap-0.5 mt-1 text-[10px] text-slate-600 font-semibold">
                          {c.website && (
                            <a
                              href={c.website.startsWith('http') ? c.website : `https://${c.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-slate-900 hover:underline inline-flex items-center gap-1 max-w-full"
                            >
                              <Globe size={11} className="flex-shrink-0" />
                              <span className="truncate max-w-[140px] inline-block">
                                {c.website.replace(/^(https?:\/\/)?(www\.)?/, '')}
                              </span>
                            </a>
                          )}
                          {c.emailCompany && (
                            <a
                              href={`mailto:${c.emailCompany}`}
                              className="hover:text-slate-900 hover:underline inline-flex items-center gap-1 max-w-full text-slate-500"
                            >
                              <Mail size={11} className="flex-shrink-0 text-slate-400" />
                              <span className="truncate max-w-[140px] inline-block">{c.emailCompany}</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="p-3 font-mono font-semibold text-slate-650">{c.taxCode}</td>

                    <td className="p-3 font-semibold text-slate-650">{c.phoneNumber || "—"}</td>

                    <td className="p-3">
                      {c.businessLicense && c.businessLicense.startsWith("http") ? (
                        <a
                          href={c.businessLicense}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-semibold bg-slate-50 border border-slate-200 px-2.5 py-1 rounded transition-colors"
                        >
                          <FileText size={12} className="text-red-650" />
                          <span>Mở PDF</span>
                        </a>
                      ) : (
                        <span className="text-slate-400 italic font-medium">Chưa có tài liệu</span>
                      )}
                    </td>

                    <td className="p-3">{getStatusBadge(c.status)}</td>

                    <td className="p-3 text-right space-x-1">
                      <button
                        onClick={() => {
                          setSelectedCompany(c);
                          setIsDetailsModalOpen(true);
                        }}
                        className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-650 px-2.5 py-1.5 rounded-md transition-colors inline-flex items-center gap-1 cursor-pointer font-semibold"
                        title="Xem chi tiết hồ sơ"
                      >
                        <Eye size={12} />
                        <span>Chi tiết</span>
                      </button>

                      {c.status === "PENDING" ? (
                        <>
                          <button
                            onClick={() => handleApprove(c)}
                            disabled={actionLoading}
                            className="bg-slate-900 hover:bg-slate-800 text-white px-2.5 py-1.5 rounded-md transition-colors inline-flex items-center gap-1 cursor-pointer font-semibold border border-transparent"
                          >
                            <Check size={12} />
                            Duyệt
                          </button>
                          <button
                            onClick={() => {
                              setSelectedCompany(c);
                              setIsRejectModalOpen(true);
                            }}
                            disabled={actionLoading}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 px-2.5 py-1.5 rounded-md border border-rose-250 transition-colors cursor-pointer font-semibold"
                          >
                            Từ chối
                          </button>
                        </>
                      ) : c.status === "BLOCKED" ? (
                        <button
                          onClick={() => handleToggleBlock(c, false)}
                          disabled={actionLoading}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-250 px-2.5 py-1.5 rounded-md transition-colors cursor-pointer font-semibold inline-flex items-center gap-1"
                        >
                          <Unlock size={11} />
                          Mở khóa
                        </button>
                      ) : (
                        ((c.status as any) === "APPROVED" || (c.status as any) === "REJECTED") && (
                          <button
                            onClick={() => handleToggleBlock(c, true)}
                            disabled={actionLoading}
                            className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-2.5 py-1.5 rounded-md transition-colors cursor-pointer font-semibold inline-flex items-center gap-1"
                          >
                            <Lock size={11} />
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
      <div className="flex items-center justify-between px-1 text-xs">
        <div className="text-slate-500">
          Hiển thị trang {page + 1} / {totalPages} (Tổng cộng: {totalElements} doanh nghiệp)
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0 || loading}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-650 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold cursor-pointer"
          >
            Trang trước
          </button>

          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1 || loading}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-650 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold cursor-pointer"
          >
            Trang sau
          </button>
        </div>
      </div>

      {/* 5. PREMIUM DETAILS MODAL (GLASSMORPHISM POPUP) */}
      {isDetailsModalOpen && selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-2xl rounded-lg border border-slate-200 shadow-xl flex flex-col max-h-[90vh] overflow-hidden transform scale-100 transition-all duration-300">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3.5">
                <div className="h-12 w-12 rounded-md border border-slate-200 overflow-hidden flex items-center justify-center font-bold text-slate-800 text-sm bg-white relative">
                  {selectedCompany.logoUrl && selectedCompany.logoUrl.trim() !== "" ? (
                    <img src={selectedCompany.logoUrl} alt="Logo" className="h-full w-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 bg-slate-900 text-white flex items-center justify-center font-bold font-mono text-xs">
                      {selectedCompany.companyName ? selectedCompany.companyName.slice(0, 2).toUpperCase() : "DN"}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-base text-slate-800 leading-tight">{selectedCompany.companyName}</h3>
                  <p className="text-[10px] text-slate-500 font-medium uppercase mt-0.5 tracking-wider">Hồ sơ pháp lý nhà tuyển dụng</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  setSelectedCompany(null);
                }}
                className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer border border-transparent"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-600 font-semibold custom-scrollbar">
              {/* Top Banner Status */}
              <div className="p-3 rounded-md border border-slate-200 bg-slate-50 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Trạng thái tài khoản:</span>
                <span>{getStatusBadge(selectedCompany.status)}</span>
              </div>

              {/* Basic Fields grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Mã số thuế</p>
                  <p className="font-mono font-bold text-slate-800 text-xs bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200 inline-block">{selectedCompany.taxCode}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Số điện thoại liên hệ</p>
                  <p className="font-bold text-slate-800 text-xs bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200 inline-block">{selectedCompany.phoneNumber || "—"}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Website doanh nghiệp</p>
                  <div className="font-bold text-slate-800 text-xs">
                    {selectedCompany.website ? (
                      <a
                        href={selectedCompany.website.startsWith('http') ? selectedCompany.website : `https://${selectedCompany.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline inline-flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200 max-w-full"
                      >
                        <Globe size={13} className="flex-shrink-0" />
                        <span className="truncate max-w-[200px] sm:max-w-[260px] inline-block">
                          {selectedCompany.website.replace(/^(https?:\/\/)?(www\.)?/, '')}
                        </span>
                        <ExternalLink size={11} className="ml-0.5 flex-shrink-0" />
                      </a>
                    ) : (
                      <span className="text-slate-400 italic bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200 inline-block">Chưa có website</span>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Quy mô nhân sự</p>
                  <p className="font-bold text-slate-800 text-xs bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200 inline-flex items-center gap-1.5">
                    <Users size={13} className="text-slate-400" />
                    <span>{selectedCompany.companySize || "Chưa cập nhật"}</span>
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Email liên hệ</p>
                  <div className="font-bold text-slate-800 text-xs">
                    {selectedCompany.emailCompany ? (
                      <a
                        href={`mailto:${selectedCompany.emailCompany}`}
                        className="hover:underline inline-flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200 max-w-full"
                      >
                        <Mail size={13} className="flex-shrink-0" />
                        <span className="truncate max-w-[200px] sm:max-w-[260px] inline-block">
                          {selectedCompany.emailCompany}
                        </span>
                      </a>
                    ) : (
                      <span className="text-slate-400 italic bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200 inline-block">Chưa có email</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Head office Address */}
              <div className="space-y-1 pt-1.5 border-t border-slate-100">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Địa chỉ trụ sở chính</p>
                <div className="font-semibold text-slate-700 flex items-start gap-2 text-xs bg-slate-50 p-2.5 rounded-md border border-slate-200">
                  <MapPin size={14} className="text-red-650 mt-0.5 flex-shrink-0" />
                  <span>{getFullAddress(selectedCompany)}</span>
                </div>
              </div>

              {/* Description / Introduction */}
              <div className="space-y-1 pt-1.5 border-t border-slate-100">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Giới thiệu hoạt động</p>
                <div className="font-medium text-slate-650 leading-relaxed bg-slate-50 p-3.5 rounded-md border border-slate-200/80 text-xs whitespace-pre-wrap">
                  {selectedCompany.description || "Chưa có thông tin giới thiệu hoạt động."}
                </div>
              </div>

              {/* Business License PDF Viewer Option */}
              <div className="space-y-2 pt-1.5 border-t border-slate-100">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Tài liệu pháp lý (Giấy phép kinh doanh)</p>
                {selectedCompany.businessLicense && selectedCompany.businessLicense.startsWith("http") ? (
                  <div className="flex items-center justify-between p-3.5 rounded-md border border-slate-200 bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 bg-red-50 text-red-600 rounded border border-red-100 flex-shrink-0">
                        <FileText size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-xs text-slate-700 truncate leading-tight">Giấy đăng ký kinh doanh.pdf</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">Tài liệu đã được xác thực pháp lý</p>
                      </div>
                    </div>

                    <a
                      href={selectedCompany.businessLicense}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors inline-flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
                    >
                      <ExternalLink size={12} />
                      <span>Xem file PDF</span>
                    </a>
                  </div>
                ) : (
                  <div className="p-4 rounded-md border border-slate-200 bg-slate-50 text-center font-medium text-slate-400 italic">
                    Doanh nghiệp chưa tải lên tệp tài liệu PDF giấy phép kinh doanh.
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-slate-200 flex justify-end gap-2 bg-slate-50 rounded-b-lg">
              <button
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  setSelectedCompany(null);
                }}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-md font-semibold text-xs transition-colors cursor-pointer"
              >
                Đóng
              </button>
              {selectedCompany.status === "PENDING" ? (
                <>
                  <button
                    onClick={() => setIsRejectModalOpen(true)}
                    disabled={actionLoading}
                    className="bg-rose-55 hover:bg-rose-100 text-rose-700 px-4 py-2 rounded-md font-semibold border border-rose-200 transition-colors cursor-pointer text-xs"
                  >
                    Từ chối phê duyệt
                  </button>
                  <button
                    onClick={() => handleApprove(selectedCompany)}
                    disabled={actionLoading}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-4.5 py-2 rounded-md font-semibold transition-colors flex items-center gap-1.5 cursor-pointer text-xs"
                  >
                    <Check size={14} />
                    <span>Phê duyệt hồ sơ</span>
                  </button>
                </>
              ) : (selectedCompany.status as any) === "BLOCKED" ? (
                <button
                  onClick={() => handleToggleBlock(selectedCompany, false)}
                  disabled={actionLoading}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-250 px-4.5 py-2 rounded-md font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5 text-xs"
                >
                  <Unlock size={13} />
                  <span>Mở khóa tài khoản</span>
                </button>
              ) : (
                <button
                  onClick={() => handleToggleBlock(selectedCompany, true)}
                  disabled={actionLoading}
                  className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-4.5 py-2 rounded-md font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5 text-xs"
                >
                  <Lock size={13} />
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
          <div className="bg-white w-full max-w-lg rounded-lg border border-slate-200 shadow-xl overflow-hidden transform transition-all duration-300">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2 text-slate-800">
                <AlertTriangle size={16} className="text-red-600" />
                <h4 className="font-semibold text-sm uppercase tracking-wider">Từ chối phê duyệt doanh nghiệp</h4>
              </div>
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form body */}
            <form onSubmit={handleRejectSubmit}>
              <div className="p-5 space-y-4 text-xs font-semibold">
                <p className="text-slate-500 leading-relaxed font-normal text-[11px]">
                  Vui lòng cung cấp lý do từ chối cụ thể cho <strong>{selectedCompany.companyName}</strong>. Lý do này sẽ hiển thị trực tiếp trong bảng quản trị của nhà tuyển dụng để họ khắc phục/gửi lại.
                </p>

                {/* Quick Templates option */}
                <div className="space-y-1.5">
                  <label className="text-slate-500 uppercase tracking-wider block text-[10px] font-bold">Gợi ý nhanh lý do từ chối</label>
                  <div className="flex flex-col gap-1 max-h-32 overflow-y-auto p-1.5 rounded-md bg-slate-50 border border-slate-200 custom-scrollbar">
                    {REJECTION_TEMPLATES.map((tmpl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setRejectionReason(tmpl)}
                        className="bg-white hover:bg-slate-100 text-slate-700 px-2.5 py-1.5 rounded border border-slate-200 transition-colors text-left text-[11px] font-medium leading-normal block w-full cursor-pointer"
                      >
                        {tmpl}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-500 uppercase tracking-wider block text-[10px] font-bold">Chi tiết lý do từ chối <span className="text-red-500">*</span></label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Ví dụ: Giấy đăng ký kinh doanh không rõ mã số thuế, vui lòng quét/chụp bản rõ hơn và gửi duyệt lại..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full bg-white border border-slate-250 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded-md px-3.5 py-2.5 text-xs text-slate-700 outline-none transition-colors font-medium leading-relaxed"
                  />
                </div>
              </div>

              {/* Action buttons footer */}
              <div className="p-3 border-t border-slate-200 flex justify-end gap-2 bg-slate-50 rounded-b-lg">
                <button
                  type="button"
                  onClick={() => setIsRejectModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-650 rounded-md font-semibold text-xs transition-colors cursor-pointer"
                >
                  Quay lại
                </button>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white px-4 py-2 rounded-md font-semibold transition-colors flex items-center gap-1.5 cursor-pointer text-xs"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 size={12} className="animate-spin" />
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
