"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import EmployerHeader from "@/components/layout/employer/EmployerHeader";
import EmployerFooter from "@/components/layout/employer/EmployerFooter";
import {
  Building, ShieldAlert, Sparkles, FileText,
  MapPin, Globe, Users, Phone, Mail, Award, Clock,
  Edit3, LogOut, Check, ChevronDown, UploadCloud, Trash2, Eye, Loader2
} from "lucide-react";
import { toast } from "sonner";
import { useEmployers } from "@/hooks/useEmployers";
import { EmployerStatus, EmployerResponse } from "@/types/employer";
import { useLocations } from "@/hooks/useLocations";
import { DistrictResponse, WardResponse } from "@/types/location";
import { useCloudinary } from "@/hooks/useCloudinary";

export default function EmployerOnboardingPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [status, setStatus] = useState<EmployerStatus>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(true);

  // Initialize hooks
  const { fetchProfile, updateProfile, updateProfileNow } = useEmployers();
  const { fetchDistricts, fetchWards, fetchWardById } = useLocations();
  const { uploadLogo, uploadLicense } = useCloudinary();

  // Location data
  const [districts, setDistricts] = useState<DistrictResponse[]>([]);
  const [wards, setWards] = useState<WardResponse[]>([]);
  const [loadingWards, setLoadingWards] = useState(false);

  // Form states
  const [originalProfile, setOriginalProfile] = useState<EmployerResponse | null>(null);
  const [companyDetails, setCompanyDetails] = useState({
    name: "",
    taxCode: "",
    website: "",
    size: "10 - 50 nhân viên",
    districtId: "",
    wardId: "",
    address: "",
    about: "",
    phoneNumber: "",
    emailCompany: "",
    businessLicense: "",
    logoUrl: ""
  });

  const [rejectionReason, setRejectionReason] = useState(
    "Giấy chứng nhận Đăng ký kinh doanh bị mờ, không rõ mã số thuế. Vui lòng chụp/quét lại bản rõ nét và gửi lại."
  );

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingLicense, setUploadingLicense] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước logo không được vượt quá 5MB!");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file hình ảnh (PNG, JPG, JPEG, WEBP)!");
      return;
    }

    setUploadingLogo(true);
    try {
      const url = await uploadLogo(file);
      setCompanyDetails((prev) => ({ ...prev, logoUrl: url }));
      toast.success("Tải logo lên thành công!");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Tải logo lên thất bại. Vui lòng kiểm tra cấu hình Cloudinary!");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleLicenseUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Kích thước tài liệu không được vượt quá 10MB!");
      return;
    }

    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      toast.error("Vui lòng tải lên file định dạng PDF!");
      return;
    }

    setUploadingLicense(true);
    try {
      const url = await uploadLicense(file);
      setCompanyDetails((prev) => ({ ...prev, businessLicense: url }));
      toast.success("Tải tài liệu Giấy phép kinh doanh lên thành công!");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Tải tài liệu lên thất bại. Vui lòng kiểm tra cấu hình Cloudinary!");
    } finally {
      setUploadingLicense(false);
    }
  };

  // Load all districts once on mount
  useEffect(() => {
    fetchDistricts()
      .then((res) => setDistricts(res ?? []))
      .catch(() => console.warn("Không tải được danh sách quận/huyện"));
  }, [fetchDistricts]);

  // When districtId changes, load wards for that district
  useEffect(() => {
    const id = Number(companyDetails.districtId);
    if (!id) {
      setWards([]);
      return;
    }
    setLoadingWards(true);
    fetchWards(id)
      .then((res) => setWards(res ?? []))
      .catch(() => console.warn("Không tải được danh sách phường/xã"))
      .finally(() => setLoadingWards(false));
  }, [companyDetails.districtId, fetchWards]);

  useEffect(() => {
    const localToken = localStorage.getItem("accessToken");
    const sessionToken = sessionStorage.getItem("accessToken");
    const token = localToken || sessionToken;

    if (!token) {
      toast.error("Vui lòng đăng nhập để truy cập trang cập nhật doanh nghiệp!");
      router.push("/employer/login");
      return;
    }

    setIsAuthenticated(true);

    // 1. Try to load cached employer details immediately to prevent lay-shift
    const localEmployer = localStorage.getItem("employer");
    const sessionEmployer = sessionStorage.getItem("employer");
    const employerDataStr = localEmployer || sessionEmployer;

    if (employerDataStr) {
      try {
        const cached = JSON.parse(employerDataStr);
        setStatus(cached.status || "INCOMPLETE");
        setIsEditing(cached.status === "REJECTED" || !cached.status || cached.status === "INCOMPLETE" || cached.status === "APPROVED");

        setCompanyDetails({
          name: cached.companyName || "",
          taxCode: cached.taxCode || "",
          website: cached.website || "",
          size: cached.companySize || "10 - 50 nhân viên",
          districtId: "",
          wardId: "",
          address: cached.address || "",
          about: cached.description || "",
          phoneNumber: cached.phoneNumber || "",
          emailCompany: cached.emailCompany || "",
          businessLicense: cached.businessLicense || "",
          logoUrl: cached.logoUrl || ""
        });
        setOriginalProfile(cached);

        if (cached.wardId) {
          fetchWardById(Number(cached.wardId))
            .then((wardRes) => {
              const ward = wardRes;
              if (ward) {
                setCompanyDetails((prev) => ({
                  ...prev,
                  districtId: String(ward.districtId),
                  wardId: String(ward.id)
                }));
              }
            })
            .catch((err) => console.warn("Không tải được chi tiết Phường/Xã từ cache wardId:", err));
        }
      } catch (e) {
        console.error("Error loading cached employer profile in onboarding:", e);
      }
    }

    fetchProfile()
      .then((data) => {
        if (data) {
          setStatus(data.status);
          setIsEditing(data.status === "REJECTED" || data.status === "INCOMPLETE" || data.status === "APPROVED");

          setCompanyDetails({
            name: data.companyName || "",
            taxCode: data.taxCode || "",
            website: data.website || "",
            size: data.companySize || "10 - 50 nhân viên",
            districtId: "",
            wardId: "",
            address: data.address || "",
            about: data.description || "",
            phoneNumber: data.phoneNumber || "",
            emailCompany: data.emailCompany || "",
            businessLicense: data.businessLicense || "",
            logoUrl: data.logoUrl || ""
          });
          setOriginalProfile(data);

          if (data.wardId) {
            fetchWardById(Number(data.wardId))
              .then((wardRes) => {
                const ward = wardRes;
                if (ward) {
                  setCompanyDetails((prev) => ({
                    ...prev,
                    districtId: String(ward.districtId),
                    wardId: String(ward.id)
                  }));
                }
              })
              .catch((err) => console.warn("Không tải được chi tiết Phường/Xã từ wardId:", err));
          }

          // Write back to storage
          const storage = localToken ? localStorage : sessionStorage;
          storage.setItem("employer", JSON.stringify(data));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.warn("Backend profile load failed in onboarding (assuming brand new recruiter account):", err);
        setStatus("INCOMPLETE");
        setIsEditing(true);
        setLoading(false);
      });
  }, [router, fetchProfile, fetchWardById]);

  const hasLegalChanges = !!(
    originalProfile &&
    originalProfile.status === "APPROVED" &&
    (companyDetails.name.trim() !== (originalProfile.companyName || "").trim() ||
      companyDetails.taxCode.trim() !== (originalProfile.taxCode || "").trim() ||
      companyDetails.businessLicense.trim() !== (originalProfile.businessLicense || "").trim())
  );

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyDetails.name.trim()) return toast.error("Vui lòng nhập tên doanh nghiệp!");
    if (!companyDetails.taxCode.trim()) return toast.error("Vui lòng nhập mã số thuế!");
    if (!companyDetails.phoneNumber.trim()) return toast.error("Vui lòng nhập số điện thoại hotline liên hệ!");
    if (!companyDetails.businessLicense.trim() || !companyDetails.businessLicense.startsWith("http")) {
      return toast.error("Vui lòng tải lên tài liệu Giấy phép kinh doanh (PDF)!");
    }
    if (!companyDetails.address.trim()) return toast.error("Vui lòng nhập địa chỉ trụ sở chính!");

    setSubmitting(true);
    try {

      let response;

      if (status === "APPROVED" && !hasLegalChanges) {
        response = await updateProfileNow({
          website: companyDetails.website,
          companySize: companyDetails.size,
          wardId: companyDetails.wardId ? Number(companyDetails.wardId) : undefined,
          address: companyDetails.address,
          description: companyDetails.about,
          phoneNumber: companyDetails.phoneNumber,
          emailCompany: companyDetails.emailCompany,
          logoUrl: companyDetails.logoUrl
        })
      } else {
        response = await updateProfile({
          companyName: companyDetails.name,
          taxCode: companyDetails.taxCode,
          website: companyDetails.website,
          companySize: companyDetails.size,
          wardId: companyDetails.wardId ? Number(companyDetails.wardId) : undefined,
          address: companyDetails.address,
          description: companyDetails.about,
          phoneNumber: companyDetails.phoneNumber,
          emailCompany: companyDetails.emailCompany,
          businessLicense: companyDetails.businessLicense,
          logoUrl: companyDetails.logoUrl
        });
      }

      if (status === "APPROVED" && !hasLegalChanges) {
        toast.success("Cập nhật trực tiếp thông tin doanh nghiệp thành công!");
      } else {
        toast.success("Nộp hồ sơ doanh nghiệp cho Ban Quản Trị thành công!");
      }

      const localToken = localStorage.getItem("accessToken");
      const storage = localToken ? localStorage : sessionStorage;
      storage.setItem("employer", JSON.stringify(response));

      setStatus(response.status);

      if (response.status === "APPROVED") {
        router.push("/employer/dashboard");
      } else {
        setIsEditing(false);
      }

      window.dispatchEvent(new CustomEvent("companyNameUpdated", { detail: response }));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Nộp hồ sơ lên hệ thống thất bại. Vui lòng liên hệ hỗ trợ!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("employer");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("employer");

    document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

    toast.success("Đăng xuất tài khoản tuyển dụng thành công!");
    router.push("/employer");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-t-[#006b7a] border-gray-200" />
      </div>
    );
  }

  return (
    <div className="bg-[#f4f5f5] min-h-screen flex flex-col font-sans antialiased text-gray-800">
      {/* Premium Header */}
      <EmployerHeader />

      <main className="flex-grow pt-[88px] max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

        {loading ? (
          <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-t-[#006b7a] border-gray-200" />
            <p className="text-gray-500 font-medium text-xs">Đang tải hồ sơ doanh nghiệp tuyển dụng...</p>
          </div>
        ) : (
          <div className="space-y-6">

            {/* 1. STATUS BANNERS */}
            {status === "APPROVED" && hasLegalChanges && (
              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 shadow-sm flex items-start gap-4 animate-fadeIn">
                <div className="p-3 bg-amber-100 rounded-xl text-amber-600 flex-shrink-0">
                  <ShieldAlert size={24} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider">Cảnh báo thay đổi thông tin pháp lý</h3>
                  <p className="text-xs text-amber-700 mt-2 font-medium leading-relaxed">
                    Bạn đang chỉnh sửa các trường thông tin pháp lý quan trọng (<strong>Tên doanh nghiệp, Mã số thuế</strong> hoặc <strong>Giấy phép kinh doanh</strong>).
                    Thay đổi này sẽ yêu cầu Ban Quản Trị phê duyệt lại hồ sơ. Trong thời gian kiểm duyệt, tài khoản của bạn tạm thời sẽ chuyển về trạng thái chờ duyệt.
                  </p>
                </div>
              </div>
            )}

            {status === "REJECTED" && (
              <div className="p-5 rounded-2xl bg-red-50 border border-red-200 text-red-800 shadow-sm flex items-start gap-4 animate-fadeIn">
                <div className="p-3 bg-red-100 rounded-xl text-red-600 flex-shrink-0">
                  <ShieldAlert size={24} />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider">Hồ sơ đăng ký doanh nghiệp bị Từ chối phê duyệt</h3>
                  <p className="text-xs text-red-700 mt-2 font-medium leading-relaxed">
                    <strong>Lý do từ chối:</strong> {rejectionReason}
                  </p>
                  <p className="text-[11px] text-red-500 mt-2.5">
                    * Vui lòng chỉnh sửa thông tin pháp lý bên dưới, bổ sung tài liệu hợp lệ và bấm gửi duyệt lại hồ sơ.
                  </p>
                </div>
              </div>
            )}

            {status === "PENDING" && !isEditing && (
              <div className="p-6 rounded-2xl bg-teal-50/50 border border-teal-150 text-teal-900 shadow-sm flex flex-col items-center text-center space-y-4 animate-fadeIn">
                <div className="h-16 w-16 bg-teal-100 text-[#006b7a] rounded-full flex items-center justify-center relative overflow-hidden animate-pulse">
                  <Clock size={32} />
                </div>

                <div className="max-w-xl space-y-2">
                  <span className="bg-[#006b7a]/15 text-[#006b7a] text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                    Đang kiểm duyệt
                  </span>
                  <h3 className="text-xl font-extrabold text-gray-800 tracking-tight">Hồ sơ doanh nghiệp đang chờ phê duyệt</h3>
                  <p className="text-xs text-gray-500 font-light leading-relaxed">
                    Hệ thống **Đà Nẵng Jobs** đã nhận được hồ sơ xác minh tư cách pháp lý doanh nghiệp của bạn. Đội ngũ kiểm duyệt viên đang xử lý để cấp quyền truy cập tin đăng VIP.
                  </p>
                </div>

                {/* Progress pipeline */}
                <div className="w-full max-w-2xl py-4 grid grid-cols-4 text-center text-[10px] font-bold text-gray-400 relative">
                  {/* Progress Line */}
                  <div className="absolute top-[23px] left-[12.5%] right-[12.5%] h-1 bg-gray-200 -z-10">
                    <div className="h-full bg-gradient-to-r from-teal-500 to-[#006b7a]" style={{ width: "66%" }} />
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <span className="h-5 w-5 bg-teal-600 text-white rounded-full flex items-center justify-center"><Check size={10} /></span>
                    <span className="text-[#006b7a]">Đăng ký</span>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <span className="h-5 w-5 bg-teal-600 text-white rounded-full flex items-center justify-center"><Check size={10} /></span>
                    <span className="text-[#006b7a]">Nộp hồ sơ</span>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <span className="h-5 w-5 bg-teal-100 text-[#006b7a] border border-[#006b7a]/35 rounded-full flex items-center justify-center animate-ping absolute" style={{ width: "20px", height: "20px" }} />
                    <span className="h-5 w-5 bg-teal-100 text-[#006b7a] border border-[#006b7a] rounded-full flex items-center justify-center relative font-extrabold text-[10px]">3</span>
                    <span className="text-[#006b7a]">Đang kiểm duyệt</span>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <span className="h-5 w-5 bg-gray-100 border border-gray-300 rounded-full flex items-center justify-center font-extrabold text-[10px]">4</span>
                    <span>Hoạt động</span>
                  </div>
                </div>

                <div className="w-full max-w-lg p-4 rounded-xl border border-gray-150 bg-white shadow-xs text-left grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="p-1.5 rounded-lg bg-teal-50 text-[#006b7a]"><Phone size={14} /></span>
                    <div>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider leading-none">Hotline CSKH</p>
                      <a href="tel:0905789123" className="font-bold text-gray-700 mt-1 block">0905.789.123</a>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="p-1.5 rounded-lg bg-teal-50 text-[#006b7a]"><Mail size={14} /></span>
                    <div>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider leading-none">Email hỗ trợ</p>
                      <a href="mailto:partner@danangjobs.vn" className="font-bold text-gray-700 mt-1 block">partner@danangjobs.vn</a>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all active:scale-[0.98]"
                  >
                    <Edit3 size={14} />
                    <span>Sửa hồ sơ đã nộp</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-650 px-4 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-[0.98]"
                  >
                    <LogOut size={14} />
                    <span>Đăng xuất tài khoản</span>
                  </button>
                </div>
              </div>
            )}

            {/* 2. ONBOARDING FORM / DETAIL SHOWCASE */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

              {/* Left Column: Form Editor or Summary Grid */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-150 p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-base font-extrabold text-gray-800">
                    {isEditing ? "Cập nhật hồ sơ pháp lý doanh nghiệp" : "Thông tin doanh nghiệp đã đăng ký"}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 leading-normal font-light">
                    {isEditing
                      ? "Cung cấp mã số thuế doanh nghiệp và tài liệu ĐKKD chính xác để kích hoạt các tính năng đăng tin tuyển dụng VIP."
                      : "Dưới đây là bản sao hồ sơ doanh nghiệp của bạn đang được kiểm tra bởi Ban Quản Trị."}
                  </p>
                </div>

                {isEditing ? (
                  <form onSubmit={handleSubmitProfile} className="space-y-5 text-xs font-semibold">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-gray-500 uppercase tracking-wider block">Tên doanh nghiệp <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          placeholder="Ví dụ: Công ty TNHH Phần mềm FPT Đà Nẵng"
                          value={companyDetails.name || ""}
                          onChange={(e) => setCompanyDetails({ ...companyDetails, name: e.target.value })}
                          className="w-full bg-white border border-gray-200 focus:border-[#006b7a] focus:ring-1 focus:ring-[#006b7a] rounded-xl px-4 py-2.5 text-gray-700 outline-none transition-all"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-gray-500 uppercase tracking-wider block">Mã số thuế doanh nghiệp <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          placeholder="Ví dụ: 0401827364"
                          value={companyDetails.taxCode || ""}
                          onChange={(e) => setCompanyDetails({ ...companyDetails, taxCode: e.target.value })}
                          className="w-full bg-white border border-gray-200 focus:border-[#006b7a] focus:ring-1 focus:ring-[#006b7a] rounded-xl px-4 py-2.5 text-gray-700 outline-none transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-gray-500 uppercase tracking-wider block">Số điện thoại hotline <span className="text-red-500">*</span></label>
                        <input
                          type="tel"
                          placeholder="Ví dụ: 0905.123.456 hoặc 0236.3123.456"
                          value={companyDetails.phoneNumber || ""}
                          onChange={(e) => setCompanyDetails({ ...companyDetails, phoneNumber: e.target.value })}
                          className="w-full bg-white border border-gray-200 focus:border-[#006b7a] focus:ring-1 focus:ring-[#006b7a] rounded-xl px-4 py-2.5 text-gray-700 outline-none transition-all"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-gray-500 uppercase tracking-wider block">Email liên hệ <span className="text-red-500">*</span></label>
                        <input
                          type="email"
                          placeholder="Ví dụ: contact@mycompany.vn"
                          value={companyDetails.emailCompany || ""}
                          onChange={(e) => setCompanyDetails({ ...companyDetails, emailCompany: e.target.value })}
                          className="w-full bg-white border border-gray-200 focus:border-[#006b7a] focus:ring-1 focus:ring-[#006b7a] rounded-xl px-4 py-2.5 text-gray-700 outline-none transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-gray-500 uppercase tracking-wider block">Giấy phép ĐKKD (PDF) <span className="text-red-500">*</span></label>
                      {companyDetails.businessLicense && companyDetails.businessLicense.startsWith("http") ? (
                        <div className="flex items-center justify-between p-3 rounded-xl border border-teal-150 bg-teal-50/20 text-teal-900">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="p-2 bg-red-50 text-red-500 rounded-lg flex-shrink-0">
                              <FileText size={18} />
                            </div>
                            <div className="min-w-0">
                              <p className="font-extrabold text-[11px] text-gray-700 truncate leading-tight">Giấy phép đăng ký kinh doanh.pdf</p>
                              <a
                                href={companyDetails.businessLicense}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-[#006b7a] font-bold hover:underline flex items-center gap-0.5 mt-0.5"
                              >
                                <Eye size={11} />
                                <span>Xem chi tiết file PDF</span>
                              </a>
                            </div>
                          </div>
                          <div className="flex gap-1.5 flex-shrink-0">
                            <label className="cursor-pointer bg-white hover:bg-gray-50 border border-gray-200 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-gray-600 shadow-sm transition-all active:scale-[0.98] inline-flex items-center gap-1">
                              <UploadCloud size={12} />
                              <span>Thay thế</span>
                              <input
                                type="file"
                                accept=".pdf"
                                onChange={handleLicenseUpload}
                                disabled={uploadingLicense}
                                className="hidden"
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => setCompanyDetails((prev) => ({ ...prev, businessLicense: "" }))}
                              className="bg-red-50 hover:bg-red-100 text-red-650 px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all active:scale-[0.98] inline-flex items-center gap-1"
                            >
                              <Trash2 size={12} />
                              <span>Xóa</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="relative">
                          <label className="flex flex-col items-center justify-center gap-1.5 p-4 rounded-xl border border-dashed border-gray-200 bg-gray-50/50 hover:bg-gray-50/80 hover:border-gray-300 transition-all cursor-pointer text-center">
                            {uploadingLicense ? (
                              <>
                                <Loader2 className="h-6 w-6 animate-spin text-[#006b7a]" />
                                <span className="text-[10px] font-bold text-[#006b7a]">Đang tải tài liệu lên Cloudinary...</span>
                              </>
                            ) : (
                              <>
                                <UploadCloud className="h-6 w-6 text-gray-400" />
                                <div>
                                  <span className="text-[10px] font-bold text-gray-700 block">Nhấp để tải Giấy phép ĐKKD (PDF) lên</span>
                                  <span className="text-[9px] text-gray-400 font-light mt-0.5 block">File duy nhất định dạng PDF. Tối đa 10MB.</span>
                                </div>
                              </>
                            )}
                            <input
                              type="file"
                              accept=".pdf"
                              onChange={handleLicenseUpload}
                              disabled={uploadingLicense}
                              className="hidden"
                            />
                          </label>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-gray-500 uppercase tracking-wider block">Địa chỉ trang Web (Không bắt buộc)</label>
                        <input
                          type="url"
                          placeholder="Ví dụ: https://mycompany.vn"
                          value={companyDetails.website || ""}
                          onChange={(e) => setCompanyDetails({ ...companyDetails, website: e.target.value })}
                          className="w-full bg-white border border-gray-200 focus:border-[#006b7a] focus:ring-1 focus:ring-[#006b7a] rounded-xl px-4 py-2.5 text-gray-700 outline-none transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-gray-500 uppercase tracking-wider block">Quy mô nhân sự</label>
                        <div className="relative">
                          <select
                            value={companyDetails.size || ""}
                            onChange={(e) => setCompanyDetails({ ...companyDetails, size: e.target.value })}
                            className="w-full appearance-none bg-white border border-gray-200 focus:border-[#006b7a] focus:ring-1 focus:ring-[#006b7a] rounded-xl px-4 py-2.5 text-gray-700 outline-none transition-all pr-9"
                          >
                            <option value="Dưới 10 nhân viên">Dưới 10 nhân viên</option>
                            <option value="10 - 50 nhân viên">10 - 50 nhân viên</option>
                            <option value="50 - 150 nhân viên">50 - 150 nhân viên</option>
                            <option value="150 - 200 nhân viên">150 - 200 nhân viên</option>
                            <option value="200 - 500 nhân viên">200 - 500 nhân viên</option>
                            <option value="Trên 500 nhân viên">Trên 500 nhân viên</option>
                          </select>
                          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-gray-500 uppercase tracking-wider block">Logo đại diện doanh nghiệp (Không bắt buộc)</label>
                      <div className="flex items-center gap-3.5 p-3.5 rounded-xl border border-dashed border-gray-200 bg-gray-50/50">
                        <div className="relative h-16 w-16 rounded-xl bg-white border border-gray-150 flex items-center justify-center font-extrabold text-xl shadow-xs overflow-hidden flex-shrink-0">
                          {uploadingLogo && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white z-10">
                              <Loader2 className="h-5 w-5 animate-spin text-white" />
                            </div>
                          )}
                          {companyDetails.logoUrl ? (
                            <img src={companyDetails.logoUrl} alt="Logo" className="h-full w-full object-cover" />
                          ) : (
                            <Building className="h-6 w-6 text-gray-300" />
                          )}
                        </div>
                        <div className="flex-grow space-y-1">
                          <div className="flex gap-2">
                            <label className="cursor-pointer bg-white hover:bg-gray-50 border border-gray-200 hover:border-[#006b7a] hover:text-[#006b7a] px-3 py-1.5 rounded-lg text-[10px] font-bold text-gray-700 shadow-sm transition-all active:scale-[0.98] inline-flex items-center gap-1">
                              <UploadCloud size={13} className="text-[#006b7a]" />
                              <span>Tải logo lên</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                disabled={uploadingLogo}
                                className="hidden"
                              />
                            </label>
                            {companyDetails.logoUrl && (
                              <button
                                type="button"
                                onClick={() => setCompanyDetails((prev) => ({ ...prev, logoUrl: "" }))}
                                className="bg-red-50 hover:bg-red-100 text-red-650 px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all active:scale-[0.98] inline-flex items-center gap-1"
                              >
                                <Trash2 size={12} />
                                <span>Xóa</span>
                              </button>
                            )}
                          </div>
                          <p className="text-[9px] text-gray-400 font-light leading-none">
                            Hỗ trợ PNG, JPG, JPEG, WEBP. Dung lượng tối đa 5MB.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* District & Ward cascading selects */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-gray-500 uppercase tracking-wider block">
                          Quận / Huyện
                        </label>
                        <div className="relative">
                          <select
                            value={companyDetails.districtId || ""}
                            onChange={(e) => {
                              setCompanyDetails({
                                ...companyDetails,
                                districtId: e.target.value,
                                wardId: "", // reset ward when district changes
                              });
                            }}
                            className="w-full appearance-none bg-white border border-gray-200 focus:border-[#006b7a] focus:ring-1 focus:ring-[#006b7a] rounded-xl px-4 py-2.5 text-gray-700 outline-none transition-all pr-9 disabled:opacity-60"
                          >
                            <option value="">-- Chọn quận / huyện --</option>
                            {districts.map((d) => (
                              <option key={d.id} value={String(d.id)}>
                                {d.districtName}
                              </option>
                            ))}
                          </select>
                          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-gray-500 uppercase tracking-wider block">
                          Phường / Xã
                          {loadingWards && (
                            <span className="ml-2 inline-block h-3 w-3 animate-spin rounded-full border-2 border-[#006b7a] border-t-transparent align-middle" />
                          )}
                        </label>
                        <div className="relative">
                          <select
                            value={companyDetails.wardId || ""}
                            onChange={(e) => setCompanyDetails({ ...companyDetails, wardId: e.target.value })}
                            disabled={!companyDetails.districtId || loadingWards}
                            className="w-full appearance-none bg-white border border-gray-200 focus:border-[#006b7a] focus:ring-1 focus:ring-[#006b7a] rounded-xl px-4 py-2.5 text-gray-700 outline-none transition-all pr-9 disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            <option value="">
                              {!companyDetails.districtId
                                ? "-- Chọn quận/huyện trước --"
                                : loadingWards
                                  ? "Đang tải..."
                                  : "-- Chọn phường / xã --"}
                            </option>
                            {wards.map((w) => (
                              <option key={w.id} value={String(w.id)}>
                                {w.wardName}
                              </option>
                            ))}
                          </select>
                          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-gray-500 uppercase tracking-wider block">Số nhà / Tên đường <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        placeholder="Ví dụ: 254 Nguyễn Văn Linh, Đà Nẵng"
                        value={companyDetails.address || ""}
                        onChange={(e) => setCompanyDetails({ ...companyDetails, address: e.target.value })}
                        className="w-full bg-white border border-gray-200 focus:border-[#006b7a] focus:ring-1 focus:ring-[#006b7a] rounded-xl px-4 py-2.5 text-gray-700 outline-none transition-all"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-gray-500 uppercase tracking-wider block">Giới thiệu hoạt động công ty <span className="text-red-500">*</span></label>
                      <textarea
                        rows={4}
                        placeholder="Nhập thông tin giới thiệu ngắn về lĩnh vực kinh doanh và hoạt động của doanh nghiệp tại Đà Nẵng..."
                        value={companyDetails.about || ""}
                        onChange={(e) => setCompanyDetails({ ...companyDetails, about: e.target.value })}
                        className="w-full bg-white border border-gray-200 focus:border-[#006b7a] focus:ring-1 focus:ring-[#006b7a] rounded-xl px-4 py-2.5 text-gray-700 outline-none transition-all font-medium leading-relaxed"
                        required
                      />
                    </div>

                    <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100">
                      {(status === "APPROVED" || status === "PENDING") && (
                        <button
                          type="button"
                          onClick={() => router.push("/employer/dashboard")}
                          className="px-5 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl font-bold transition-all active:scale-[0.98] cursor-pointer"
                        >
                          Quay lại Dashboard
                        </button>
                      )}

                      <button
                        type="submit"
                        disabled={submitting}
                        className="bg-[#006b7a] hover:bg-[#005a66] disabled:bg-gray-300 text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98] flex items-center gap-1.5 cursor-pointer"
                      >
                        {submitting ? (
                          <>
                            <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                            <span>Đang xử lý...</span>
                          </>
                        ) : (
                          <>
                            <FileText size={15} />
                            <span>
                              {status === "APPROVED"
                                ? (hasLegalChanges ? "Gửi hồ sơ kiểm duyệt" : "Cập nhật trực tiếp")
                                : "Gửi hồ sơ kiểm duyệt"}
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  // Summary static display block
                  <div className="space-y-6 text-xs text-gray-600">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tên doanh nghiệp tuyển dụng</p>
                        <p className="font-extrabold text-gray-800 text-sm leading-tight flex items-center gap-1">
                          <Building size={16} className="text-[#006b7a]" />
                          {companyDetails.name}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Mã số thuế</p>
                        <p className="font-bold text-gray-800">{companyDetails.taxCode}</p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Số điện thoại liên hệ</p>
                        <p className="font-bold text-gray-800">{companyDetails.phoneNumber}</p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email liên hệ</p>
                        <p className="font-bold text-gray-800">{companyDetails.emailCompany || "—"}</p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tài liệu Giấy phép ĐKKD (PDF)</p>
                        {companyDetails.businessLicense && companyDetails.businessLicense.startsWith("http") ? (
                          <a
                            href={companyDetails.businessLicense}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-[#006b7a] hover:underline flex items-center gap-1.5 mt-0.5"
                          >
                            <FileText size={14} className="text-red-500" />
                            <span>Xem tài liệu PDF</span>
                          </a>
                        ) : (
                          <p className="font-bold text-gray-500 italic mt-0.5">{companyDetails.businessLicense || "Chưa tải lên"}</p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Website doanh nghiệp</p>
                        <p className="font-bold text-[#006b7a] text-sm">
                          {companyDetails.website ? (
                            <a
                              href={companyDetails.website.startsWith('http') ? companyDetails.website : `https://${companyDetails.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline inline-flex items-center gap-1 max-w-full"
                            >
                              <Globe size={13} className="flex-shrink-0" />
                              <span className="truncate max-w-[180px] sm:max-w-[240px] inline-block">
                                {companyDetails.website.replace(/^(https?:\/\/)?(www\.)?/, '')}
                              </span>
                            </a>
                          ) : (
                            <span className="text-gray-500 italic font-bold">Chưa có website</span>
                          )}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Quy mô nhân sự</p>
                        <p className="font-bold text-gray-800 flex items-center gap-1">
                          <Users size={13} className="text-gray-400" />
                          {companyDetails.size}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-gray-50">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Địa chỉ trụ sở chính</p>
                      <p className="font-bold text-gray-700 flex items-start gap-1">
                        <MapPin size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                        <span>
                          {companyDetails.address && <>{companyDetails.address}, </>}
                          {wards.find((w) => String(w.id) === companyDetails.wardId)?.wardName || companyDetails.wardId
                            ? (wards.find((w) => String(w.id) === companyDetails.wardId)?.wardName || "Phường/Xã") + ", "
                            : ""}
                          {districts.find((d) => String(d.id) === companyDetails.districtId)?.districtName || ""}
                          {!companyDetails.address && !companyDetails.districtId && "Chưa cập nhật"}
                        </span>
                      </p>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-gray-50">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Giới thiệu ngắn hoạt động</p>
                      <p className="font-medium text-gray-600 leading-relaxed bg-gray-50/50 p-3 rounded-lg border border-gray-100">
                        {companyDetails.about}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Instructions, SLA & FAQ */}
              <div className="space-y-6">

                {/* Visual business card preview */}
                <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-xs flex flex-col items-center text-center space-y-3">
                  <div className="h-16 w-16 rounded-2xl bg-[#006b7a]/10 border border-gray-150 text-[#006b7a] flex items-center justify-center font-extrabold text-2xl shadow-xs overflow-hidden">
                    {companyDetails.logoUrl ? (
                      <img src={companyDetails.logoUrl} alt="Logo" className="h-full w-full object-cover" />
                    ) : (
                      companyDetails.name ? companyDetails.name.slice(0, 2).toUpperCase() : "DN"
                    )}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-gray-800 truncate max-w-[220px]">{companyDetails.name || "Tên Doanh Nghiệp"}</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5 font-light truncate max-w-[180px] mx-auto">
                      {companyDetails.website ? companyDetails.website.replace(/^(https?:\/\/)?(www\.)?/, '') : "https://website.com"}
                    </p>
                  </div>
                  <div className="pt-2 flex flex-wrap justify-center gap-1">
                    <span className="text-[9px] bg-gray-100 text-gray-500 font-bold px-2 py-0.5 rounded">
                      MST: {companyDetails.taxCode || "Chưa có"}
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${status === "PENDING" ? "bg-amber-50 text-amber-600" :
                      status === "REJECTED" ? "bg-red-50 text-red-600" :
                        status === "APPROVED" ? "bg-green-500 text-white" :
                          "bg-gray-100 text-gray-400"
                      }`}>
                      {status === "PENDING" ? "Đang Chờ Duyệt" :
                        status === "REJECTED" ? "Bị Từ Chối" :
                          status === "APPROVED" ? "Đã Xác Minh" : "Mới Đăng Ký"}
                    </span>
                  </div>
                </div>

                {/* FAQ details card */}
                <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-sm space-y-4 text-xs">
                  <h4 className="font-extrabold text-gray-800 flex items-center gap-1.5 border-b border-gray-100 pb-2">
                    <Award size={15} className="text-amber-500" />
                    <span>Lợi ích khi doanh nghiệp được duyệt</span>
                  </h4>

                  <div className="space-y-3 font-medium text-gray-600">
                    <div className="flex gap-2">
                      <span className="h-4 w-4 bg-teal-50 text-[#006b7a] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">✓</span>
                      <p className="leading-normal">
                        <strong>Đăng tin tuyển dụng VIP</strong>: Xuất hiện nổi bật tại trang đầu, tiếp cận gấp 5 lần ứng viên.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <span className="h-4 w-4 bg-teal-50 text-[#006b7a] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">✓</span>
                      <p className="leading-normal">
                        <strong>Kích hoạt DNJ AI Core</strong>: Quét và chấm điểm độ tương thích hồ sơ ứng viên tự động.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <span className="h-4 w-4 bg-teal-50 text-[#006b7a] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">✓</span>
                      <p className="leading-normal">
                        <strong>Xác minh thương hiệu</strong>: Huy hiệu &ldquo;Đã Xác Minh&rdquo; cạnh tên công ty tăng độ tin cậy.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Helpful tip box */}
                <div className="p-4 rounded-2xl bg-teal-50/20 border border-teal-100/50 space-y-2 text-xs">
                  <h4 className="font-bold text-[#006b7a] flex items-center gap-1">
                    <Sparkles size={14} className="text-amber-500 animate-bounce" />
                    <span>Mẹo kiểm duyệt nhanh</span>
                  </h4>
                  <p className="text-gray-600 font-light leading-relaxed">
                    Vui lòng đối chiếu chính xác Mã số thuế và số Giấy phép đăng ký kinh doanh trùng khớp với Tổng cục Thuế để hệ thống AI phê duyệt tự động chỉ trong vòng 10 phút!
                  </p>
                </div>

              </div>

            </div>

          </div>
        )}

      </main>

      {/* Recruiter Footing */}
      <EmployerFooter />
    </div>
  );
}
