"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  User,
  MapPin,
  Briefcase,
  Sparkles,
  FileText,
  Check,
  X,
  UploadCloud,
  Loader2,
  ChevronRight,
  ShieldAlert,
  Save,
  Grid,
  CheckCircle2,
  Info,
  Sliders,
  DollarSign,
  Building2,
  ArrowRight,
  Compass,
  Plus,
  Trash2,
  Download,
  ExternalLink,
  FileCheck
} from "lucide-react";
import { toast } from "sonner";

// Import hooks
import { useCandidates } from "@/hooks/useCandidates";
import { useLocations } from "@/hooks/useLocations";
import { useCategories } from "@/hooks/useCategories";
import { useSkills } from "@/hooks/useSkills";
import { useCloudinary } from "@/hooks/useCloudinary";
import { useJobs } from "@/hooks/useJobs";
import { useResumes } from "@/hooks/useResumes";

// Import types
import { CandidateResponse } from "@/types/candidate";
import { Category } from "@/types/category";
import { SkillResponse } from "@/types/skill";
import { DistrictResponse, WardResponse } from "@/types/location";
import { JobResponse } from "@/types/job";

function CandidateProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  // Authentication & authorization check
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userSession, setUserSession] = useState<{
    fullName: string;
    avatar?: string;
    email?: string;
    roleName?: string;
  } | null>(null);

  // States
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "preferences" | "recommendations" | "resumes">("profile");

  // Sync activeTab with URL search parameters
  useEffect(() => {
    if (tabParam === "profile" || tabParam === "preferences" || tabParam === "recommendations" || tabParam === "resumes") {
      setActiveTab(tabParam);
    } else if (!tabParam) {
      setActiveTab("profile");
    }
  }, [tabParam]);

  // Resumes Integration Hooks & States
  const { resumes, fetchMyResumes, createResume, setDefault, deleteResume, isSubmitting: isResumeActionSubmitting, isLoading: isLoadingResumes } = useResumes();
  const { uploadResume, isUploadingResume } = useCloudinary();

  const [isOpenResumeModal, setIsOpenResumeModal] = useState(false);
  const [resumeForm, setResumeForm] = useState({
    title: "",
    description: "",
    fileUrl: "",
    isDefault: false
  });
  const [isDragging, setIsDragging] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploadFileName, setUploadFileName] = useState("");
  const [resumeToDelete, setResumeToDelete] = useState<number | null>(null);


  // Onboarding Alert
  const [isOnboardingNeeded, setIsOnboardingNeeded] = useState(false);

  // Hooks
  const { fetchProfile, updateProfile } = useCandidates();
  const { fetchDistricts, fetchWards, fetchWardById } = useLocations();
  const { fetchFlatCategories } = useCategories();
  const { fetchSkills } = useSkills();
  const { uploadLogo } = useCloudinary();
  const { fetchJobs } = useJobs();

  // Master Data States
  const [districts, setDistricts] = useState<DistrictResponse[]>([]);
  const [wards, setWards] = useState<WardResponse[]>([]);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [allSkills, setAllSkills] = useState<SkillResponse[]>([]);
  const [allJobs, setAllJobs] = useState<JobResponse[]>([]);

  // Search filters inside settings
  const [categorySearch, setCategorySearch] = useState("");
  const [skillSearch, setSkillSearch] = useState("");

  // Loading indicator states
  const [loadingWards, setLoadingWards] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(false);

  // Form States
  const [formData, setFormData] = useState({
    fullName: "",
    avatarUrl: "",
    districtId: "",
    wardId: "",
    address: "",
    categoryIds: [] as number[],
    skillIds: [] as number[],
  });

  // Check login and retrieve initial session data
  useEffect(() => {
    const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");

    if (!token || !userStr) {
      toast.error("Vui lòng đăng nhập để truy cập thông tin cá nhân!");
      router.push("/candidate/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(userStr);
      if (parsedUser.roleName !== "CANDIDATE") {
        toast.error("Tài khoản của bạn không có quyền truy cập trang này!");
        router.push("/candidate/login");
        return;
      }
      setIsAuthenticated(true);
      setUserSession(parsedUser);
    } catch (e) {
      console.error(e);
      router.push("/candidate/login");
    }
  }, [router]);

  // Fetch Resumes once authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchMyResumes().catch((err) => console.warn("Lỗi khi tải CV của tôi:", err));
  }, [isAuthenticated, fetchMyResumes]);

  // Load master data once authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadMasterData = async () => {
      try {
        // Load Districts
        const districtsData = await fetchDistricts();
        setDistricts(districtsData || []);

        // Load Categories
        const categoriesData = await fetchFlatCategories();
        setAllCategories(categoriesData || []);

        // Load Skills
        const skillsData = await fetchSkills();
        setAllSkills(skillsData || []);

        // Load Candidate Profile
        await loadCandidateProfile();
      } catch (err) {
        console.error("Error loading master data:", err);
      }
    };

    loadMasterData();
  }, [isAuthenticated, fetchDistricts, fetchFlatCategories, fetchSkills]);

  // Helper to load candidate profile details
  const loadCandidateProfile = async () => {
    setLoading(true);
    try {
      const data: CandidateResponse = await fetchProfile();

      if (data) {
        const isProfileIncomplete = !data.ward || !data.address || data.address.trim() === "";
        setIsOnboardingNeeded(isProfileIncomplete);
        
        // If incomplete profile, default to edit mode
        if (isProfileIncomplete) {
          setIsEditing(true);
          toast.warning("Hồ sơ của bạn chưa hoàn thiện. Vui lòng bổ sung Địa chỉ và Cài đặt gợi ý công việc!");
        }

        // Setup form data
        setFormData({
          fullName: data.user?.fullName || "",
          avatarUrl: data.user?.avatarUrl || "",
          districtId: "",
          wardId: data.ward?.id ? String(data.ward.id) : "",
          address: data.address || "",
          categoryIds: data.categories ? data.categories.map((c) => c.id) : [],
          skillIds: data.skills ? data.skills.map((s) => s.id) : [],
        });

        // If wardId is present, fetch the full ward and set districtId
        if (data.ward?.id) {
          const wardDetails = await fetchWardById(data.ward.id);
          if (wardDetails) {
            setFormData((prev) => ({
              ...prev,
              districtId: String(wardDetails.districtId),
              wardId: String(wardDetails.id),
            }));
          }
        }
      }
    } catch (err) {
      console.error("Error loading profile:", err);
      setIsOnboardingNeeded(true);
      setIsEditing(true);
    } finally {
      setLoading(false);
    }
  };

  // Load wards whenever selected district changes
  useEffect(() => {
    const districtIdNum = Number(formData.districtId);
    if (!districtIdNum) {
      setWards([]);
      return;
    }

    setLoadingWards(true);
    fetchWards(districtIdNum)
      .then((res) => setWards(res || []))
      .catch((err) => console.warn("Lỗi khi tải phường xã:", err))
      .finally(() => setLoadingWards(false));
  }, [formData.districtId, fetchWards]);

  // Load active jobs for recommendation filtering
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const loadJobsForRecommendation = async () => {
      setLoadingJobs(true);
      try {
        const res = await fetchJobs({
          statusFilter: "ALL",
          debouncedSearch: "",
          page: 0,
          size: 100
        });
        
        // Keep only active approved jobs
        const activeApprovedJobs = (res?.content || []).filter(
          (j: JobResponse) => j.approveStatus === "APPROVED" && j.visibilityStatus === "ACTIVE"
        );
        
        setAllJobs(activeApprovedJobs);
      } catch (err) {
        console.warn("Không thể tải danh sách tin tuyển dụng cho gợi ý:", err);
      } finally {
        setLoadingJobs(false);
      }
    };

    loadJobsForRecommendation();
  }, [isAuthenticated, fetchJobs]);

  // Filter Categories and Skills by search keywords
  const filteredCategories = useMemo(() => {
    return allCategories.filter((c) =>
      c.categoryName.toLowerCase().includes(categorySearch.toLowerCase())
    );
  }, [allCategories, categorySearch]);

  const filteredSkills = useMemo(() => {
    return allSkills.filter((s) =>
      s.skillName.toLowerCase().includes(skillSearch.toLowerCase())
    );
  }, [allSkills, skillSearch]);

  // Recommendation Match Algorithm
  const recommendedJobs = useMemo(() => {
    if (formData.categoryIds.length === 0 && formData.skillIds.length === 0) {
      return [];
    }

    const candidateCategoriesSet = new Set(
      allCategories
        .filter((c) => formData.categoryIds.includes(c.id))
        .map((c) => c.categoryName)
    );

    const candidateSkillsSet = new Set(
      allSkills
        .filter((s) => formData.skillIds.includes(s.id))
        .map((s) => s.skillName)
    );

    return allJobs
      .map((job) => {
        let score = 0;
        let matchedCategoriesCount = 0;
        let matchedSkillsCount = 0;

        // Intersection count on Categories
        if (job.categoryNames && job.categoryNames.length > 0) {
          job.categoryNames.forEach((catName) => {
            if (candidateCategoriesSet.has(catName)) {
              score += 40; // High priority for category match
              matchedCategoriesCount++;
            }
          });
        }

        // Intersection count on Skills
        if (job.skillNames && job.skillNames.length > 0) {
          job.skillNames.forEach((skillName) => {
            if (candidateSkillsSet.has(skillName)) {
              score += 15; // Skill match priority
              matchedSkillsCount++;
            }
          });
        }

        // Optional Location match bonus
        const matchedWard = formData.wardId && job.wardName; // simpler location score

        return {
          job,
          score: Math.min(score, 100),
          matchedCategoriesCount,
          matchedSkillsCount
        };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score);
  }, [allJobs, formData.categoryIds, formData.skillIds, allCategories, allSkills, formData.wardId]);

  // Handle image upload to Cloudinary
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      toast.error("Kích thước hình ảnh tối đa là 3MB!");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn tệp hình ảnh hợp lệ!");
      return;
    }

    setUploadingAvatar(true);
    try {
      const secureUrl = await uploadLogo(file);
      setFormData((prev) => ({ ...prev, avatarUrl: secureUrl }));
      toast.success("Tải ảnh đại diện lên thành công!");
    } catch (err: any) {
      toast.error("Tải hình ảnh lên thất bại. Vui lòng kiểm tra lại!");
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Toggle Category selection
  const handleToggleCategory = (catId: number) => {
    if (!isEditing) return;
    setFormData((prev) => {
      const isSelected = prev.categoryIds.includes(catId);
      const newCategoryIds = isSelected
        ? prev.categoryIds.filter((id) => id !== catId)
        : [...prev.categoryIds, catId];
      return { ...prev, categoryIds: newCategoryIds };
    });
  };

  // Toggle Skill selection
  const handleToggleSkill = (skillId: number) => {
    if (!isEditing) return;
    setFormData((prev) => {
      const isSelected = prev.skillIds.includes(skillId);
      const newSkillIds = isSelected
        ? prev.skillIds.filter((id) => id !== skillId)
        : [...prev.skillIds, skillId];
      return { ...prev, skillIds: newSkillIds };
    });
  };

  // Form submit profile updates
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      return toast.error("Vui lòng nhập họ và tên ứng viên!");
    }
    if (!formData.wardId) {
      return toast.error("Vui lòng chọn Phường / Xã sinh sống tại Đà Nẵng!");
    }
    if (!formData.address.trim()) {
      return toast.error("Vui lòng nhập địa chỉ liên hệ cụ thể!");
    }

    setSaving(true);
    try {
      const updatedProfile = await updateProfile({
        fullName: formData.fullName,
        avatarUrl: formData.avatarUrl,
        wardId: Number(formData.wardId),
        address: formData.address,
        categoryIds: formData.categoryIds,
        skillIds: formData.skillIds,
      });

      // Update basic cached user profile info in local storage
      const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
      if (userStr) {
        const userObj = JSON.parse(userStr);
        userObj.fullName = formData.fullName;
        if (formData.avatarUrl) {
          userObj.avatar = formData.avatarUrl;
        }
        const storage = localStorage.getItem("accessToken") ? localStorage : sessionStorage;
        storage.setItem("user", JSON.stringify(userObj));
        
        // Dispatch custom event to notify Header about user profile changes
        window.dispatchEvent(new CustomEvent("userUpdated", { detail: userObj }));
      }

      toast.success("Cập nhật hồ sơ và cài đặt gợi ý công việc thành công!");
      setIsOnboardingNeeded(false);
      setIsEditing(false);
      setActiveTab("recommendations"); // Switch tab to show recommendations
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi khi lưu thông tin. Vui lòng liên hệ quản trị viên!");
    } finally {
      setSaving(false);
    }
  };

  // Compute profile completeness %
  const completenessPercentage = useMemo(() => {
    let score = 20; // default active account
    if (formData.fullName.trim() !== "") score += 20;
    if (formData.avatarUrl !== "") score += 15;
    if (formData.wardId !== "") score += 15;
    if (formData.address.trim() !== "") score += 10;
    if (formData.categoryIds.length > 0) score += 10;
    if (formData.skillIds.length > 0) score += 10;
    return score;
  }, [formData]);

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-[#006B7A]" />
          <p className="text-gray-500 font-bold text-xs tracking-wide">Đang tải thông tin hồ sơ ứng viên...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-16 font-sans">
      
      {/* Top Background Gradient Banner */}
      <div className="w-full bg-gradient-to-r from-[#006B7A] via-[#008899] to-[#009fb2] text-white py-10 px-4 md:px-8 relative overflow-hidden select-none">
        <div className="absolute right-0 bottom-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-16 -mb-16"></div>
        <div className="absolute left-1/4 top-0 w-48 h-48 bg-white/5 rounded-full blur-2xl -mt-16"></div>

        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4.5">
            <div className="h-20 w-20 rounded-full border-4 border-white/20 bg-white/10 flex items-center justify-center relative group overflow-hidden">
              {uploadingAvatar ? (
                <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
              ) : formData.avatarUrl ? (
                <img src={formData.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <User className="h-10 w-10 text-white" />
              )}
              {isEditing && (
                <label className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity duration-300 text-[10px] font-bold">
                  <UploadCloud size={16} className="mb-0.5 text-teal-300" />
                  Tải lên
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
              )}
            </div>

            <div className="space-y-1 text-left">
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">
                  {formData.fullName || "Ứng Viên"}
                </h1>
                <span className="bg-emerald-500/20 text-emerald-100 text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                  <CheckCircle2 size={10} />
                  Xác thực
                </span>
              </div>
              <p className="text-xs text-teal-50 font-light flex items-center gap-1.5">
                <span>{userSession?.email}</span>
                {formData.wardId && (
                  <>
                    <span className="text-teal-200">•</span>
                    <span className="flex items-center gap-0.5"><MapPin size={12} /> Đà Nẵng</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Right Area: Profile Completeness Score Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 max-w-xs w-full">
            <div className="flex justify-between items-center text-xs font-bold text-teal-100 mb-1.5">
              <span>Độ hoàn thiện thông tin CV</span>
              <span>{completenessPercentage}%</span>
            </div>
            <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${completenessPercentage}%` }}
              />
            </div>
            <p className="text-[10px] text-teal-100/80 font-light mt-1.5 text-left leading-normal">
              * Hoàn thành 100% hồ sơ giúp bạn nhận được nhiều tin tuyển dụng phù hợp hơn.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Onboarding needed alert banner */}
        {isOnboardingNeeded && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 shadow-sm flex items-start gap-3.5 animate-fadeIn">
            <div className="p-2.5 bg-amber-100 rounded-xl text-amber-600 flex-shrink-0 animate-bounce">
              <ShieldAlert size={20} />
            </div>
            <div className="text-left">
              <h3 className="font-extrabold text-sm uppercase tracking-wide">Cập nhật hồ sơ pháp lý & Cài đặt gợi ý công việc</h3>
              <p className="text-xs text-amber-700 mt-1 font-medium leading-relaxed">
                Chào mừng bạn đến với <strong>Đà Nẵng Jobs</strong>! Vui lòng điền đầy đủ các trường thông tin cơ bản (Phường/Xã sinh sống, địa chỉ cụ thể) và chọn các Ngành nghề/Kỹ năng quan tâm để nhận các gợi ý công việc phù hợp nhất.
              </p>
            </div>
          </div>
        )}

        {/* Dynamic Tabs Navigation Bar */}
        <div className="flex items-center gap-1.5 border-b border-gray-200 pb-3 mb-6 overflow-x-auto select-none custom-scrollbar">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "profile"
                ? "bg-[#006B7A] text-white shadow-sm"
                : "bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            <User size={15} />
            <span>Hồ sơ cá nhân</span>
          </button>
          
          <button
            onClick={() => setActiveTab("preferences")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "preferences"
                ? "bg-[#006B7A] text-white shadow-sm"
                : "bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            <Sliders size={15} />
            <span>Cài đặt gợi ý việc làm</span>
            {formData.categoryIds.length > 0 && (
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-extrabold ${activeTab === "preferences" ? "bg-white text-[#006B7A]" : "bg-[#006B7A]/10 text-[#006B7A]"}`}>
                {formData.categoryIds.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("recommendations")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === "recommendations"
                ? "bg-[#006B7A] text-white shadow-sm"
                : "bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            <Sparkles size={15} className={recommendedJobs.length > 0 ? "text-amber-500 fill-amber-500" : ""} />
            <span>Gợi ý việc làm</span>
            {recommendedJobs.length > 0 && (
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-extrabold ${activeTab === "recommendations" ? "bg-white text-[#006B7A]" : "bg-amber-500 text-white animate-pulse"}`}>
                {recommendedJobs.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("resumes")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "resumes"
                ? "bg-[#006B7A] text-white shadow-sm"
                : "bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            <FileCheck size={15} />
            <span>CV của tôi</span>
            {resumes.length > 0 && (
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-extrabold ${activeTab === "resumes" ? "bg-white text-[#006B7A]" : "bg-[#006B7A]/10 text-[#006B7A]"}`}>
                {resumes.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab 1 Content: Candidate Profile Details */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Left Box: Form fields or static details */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-150 p-6 shadow-xs space-y-6">
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <div className="text-left">
                  <h3 className="text-base font-extrabold text-gray-800">Thông tin liên lạc & Địa chỉ</h3>
                  <p className="text-[11px] text-gray-400 font-light mt-0.5">Cung cấp địa chỉ tại Đà Nẵng để lọc việc làm gần bạn nhất</p>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-3.5 py-2 bg-[#006B7A]/10 text-[#006B7A] hover:bg-[#006B7A]/25 hover:scale-[1.01] rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Chỉnh sửa hồ sơ
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSaveProfile} className="space-y-5 text-xs font-semibold text-left">
                  <div className="space-y-1.5">
                    <label className="text-gray-500 uppercase tracking-wider block">Họ và tên ứng viên <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Nguyễn Văn A"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full bg-white border border-gray-200 focus:border-[#006B7A] focus:ring-1 focus:ring-[#006B7A] rounded-xl px-4 py-2.5 text-gray-700 outline-none font-medium transition-all"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-gray-500 uppercase tracking-wider block">Quận / Huyện sinh sống <span className="text-red-500">*</span></label>
                      <select
                        value={formData.districtId}
                        onChange={(e) => setFormData({ ...formData, districtId: e.target.value, wardId: "" })}
                        className="w-full bg-white border border-gray-200 focus:border-[#006B7A] focus:ring-1 focus:ring-[#006B7A] rounded-xl px-4 py-2.5 text-gray-700 outline-none transition-all cursor-pointer"
                        required
                      >
                        <option value="">-- Chọn Quận/Huyện Đà Nẵng --</option>
                        {districts.map((d) => (
                          <option key={d.id} value={String(d.id)}>{d.districtName}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-gray-500 uppercase tracking-wider block">
                        Phường / Xã sinh sống <span className="text-red-500">*</span>
                        {loadingWards && <Loader2 size={12} className="inline ml-1 animate-spin text-[#006B7A]" />}
                      </label>
                      <select
                        value={formData.wardId}
                        onChange={(e) => setFormData({ ...formData, wardId: e.target.value })}
                        disabled={!formData.districtId || loadingWards}
                        className="w-full bg-white border border-gray-200 focus:border-[#006B7A] focus:ring-1 focus:ring-[#006B7A] rounded-xl px-4 py-2.5 text-gray-700 outline-none transition-all disabled:opacity-60 cursor-pointer"
                        required
                      >
                        <option value="">
                          {!formData.districtId ? "Chọn Quận/Huyện trước" : "Chọn Phường/Xã"}
                        </option>
                        {wards.map((w) => (
                          <option key={w.id} value={String(w.id)}>{w.wardName}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-gray-500 uppercase tracking-wider block">Số nhà, Tên đường cụ thể <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      placeholder="Ví dụ: K10/24 Nguyễn Văn Linh"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full bg-white border border-gray-200 focus:border-[#006B7A] focus:ring-1 focus:ring-[#006B7A] rounded-xl px-4 py-2.5 text-gray-700 outline-none font-medium transition-all"
                      required
                    />
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100">
                    {!isOnboardingNeeded && (
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-5 py-2.5 border border-gray-250 hover:bg-gray-50 text-gray-600 rounded-xl font-bold transition-all active:scale-[0.98] cursor-pointer"
                      >
                        Hủy bỏ
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-[#006B7A] hover:bg-[#005a66] disabled:bg-gray-300 text-white px-6 py-2.5 rounded-xl font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer active:scale-[0.98]"
                    >
                      {saving ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Save size={14} />
                      )}
                      <span>Lưu thông tin</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-5 text-xs text-left font-medium text-gray-600">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Họ và tên</p>
                      <p className="text-sm font-bold text-gray-800 mt-1">{formData.fullName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Email</p>
                      <p className="text-sm font-bold text-gray-800 mt-1">{userSession?.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Địa chỉ sinh sống</p>
                      <p className="text-sm font-bold text-gray-800 mt-1">
                        {formData.address}
                        {districts.find(d => String(d.id) === formData.districtId) && `, Phường ${wards.find(w => String(w.id) === formData.wardId)?.wardName}, Quận ${districts.find(d => String(d.id) === formData.districtId)?.districtName}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Thành phố</p>
                      <p className="text-sm font-bold text-gray-800 mt-1">Đà Nẵng, Việt Nam</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right column: Summary sidebar */}
            <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-xs text-left space-y-4">
              <h4 className="font-extrabold text-sm text-gray-800 pb-2 border-b border-gray-100 flex items-center gap-1.5">
                <FileText size={15} className="text-[#006B7A]" />
                <span>Trạng thái CV trực tuyến</span>
              </h4>
              
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-gray-400">Họ tên:</span>
                  <span className="text-emerald-600 flex items-center gap-0.5"><Check size={13} /> Hoàn thành</span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-gray-400">Ảnh đại diện:</span>
                  {formData.avatarUrl ? (
                    <span className="text-emerald-600 flex items-center gap-0.5"><Check size={13} /> Hoàn thành</span>
                  ) : (
                    <span className="text-amber-500 flex items-center gap-0.5"><Info size={13} /> Chưa tải</span>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-gray-400">Địa chỉ liên hệ:</span>
                  {formData.wardId && formData.address ? (
                    <span className="text-emerald-600 flex items-center gap-0.5"><Check size={13} /> Hoàn thành</span>
                  ) : (
                    <span className="text-red-500 flex items-center gap-0.5"><X size={13} /> Chưa hoàn thiện</span>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-gray-400">Ngành nghề gợi ý:</span>
                  {formData.categoryIds.length > 0 ? (
                    <span className="text-emerald-600 flex items-center gap-0.5"><Check size={13} /> {formData.categoryIds.length} đã chọn</span>
                  ) : (
                    <span className="text-amber-500 flex items-center gap-0.5"><Info size={13} /> Chưa cài đặt</span>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-gray-400">Kỹ năng chuyên môn:</span>
                  {formData.skillIds.length > 0 ? (
                    <span className="text-emerald-600 flex items-center gap-0.5"><Check size={13} /> {formData.skillIds.length} đã chọn</span>
                  ) : (
                    <span className="text-amber-500 flex items-center gap-0.5"><Info size={13} /> Chưa cài đặt</span>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <button
                  onClick={() => {
                    setActiveTab("preferences");
                    setIsEditing(true);
                  }}
                  className="w-full text-center bg-[#006B7A] hover:bg-[#005a66] text-white py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Sliders size={13} />
                  <span>Cài đặt gợi ý công việc</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* Tab 2 Content: Job Recommendation Preferences (Categories & Skills) */}
        {activeTab === "preferences" && (
          <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-xs space-y-8 text-left">
            
            {/* Top Intro and control box */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-base font-extrabold text-gray-800">Cấu hình thuật toán gợi ý công việc</h3>
                <p className="text-[11px] text-gray-400 font-light mt-0.5">
                  Lựa chọn chính xác các lĩnh vực chuyên môn và kỹ năng thực tế sẽ kích hoạt thuật toán khớp tin tuyển dụng VIP của chúng tôi.
                </p>
              </div>
              
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-[#006B7A] hover:bg-[#005a66] text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Chỉnh sửa cài đặt
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      loadCandidateProfile();
                      setIsEditing(false);
                    }}
                    className="px-3.5 py-2 border border-gray-250 hover:bg-gray-50 text-gray-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Hủy thay đổi
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="px-4 py-2 bg-[#006B7A] hover:bg-[#005a66] text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Save size={13} />
                    Lưu cài đặt
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Category list box */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs uppercase font-extrabold tracking-wider text-[#006B7A] flex items-center gap-1.5">
                    <Grid size={14} />
                    <span>Lĩnh vực & Ngành nghề quan tâm</span>
                  </label>
                  <span className="text-[10px] text-gray-400 font-mono font-bold bg-gray-100 px-2 py-0.5 rounded-md">
                    Đã chọn: {formData.categoryIds.length}
                  </span>
                </div>
                
                {isEditing && (
                  <input
                    type="text"
                    placeholder="Tìm nhanh ngành nghề (ví dụ: Công nghệ thông tin, Thiết kế...)"
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    className="w-full bg-white border border-gray-200 focus:border-[#006B7A] focus:ring-1 focus:ring-[#006B7A] rounded-xl px-3 py-2 text-xs font-medium outline-none transition-all"
                  />
                )}

                <div className="max-h-80 overflow-y-auto border border-gray-150 rounded-2xl p-3.5 space-y-1.5 custom-scrollbar bg-gray-50/20">
                  {filteredCategories.length === 0 ? (
                    <p className="text-[11px] text-gray-400 font-medium py-6 text-center">Không tìm thấy danh mục nào phù hợp.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {filteredCategories.map((c) => {
                        const isSelected = formData.categoryIds.includes(c.id);
                        return (
                          <div
                            key={c.id}
                            onClick={() => handleToggleCategory(c.id)}
                            className={`p-2.5 rounded-xl border text-xs font-semibold transition-all select-none flex items-center justify-between gap-1.5 ${
                              isEditing ? "cursor-pointer active:scale-97" : ""
                            } ${
                              isSelected
                                ? "bg-teal-50 border-[#006B7A] text-[#006B7A] font-bold"
                                : "bg-white border-gray-200 text-gray-650 hover:bg-gray-50"
                            }`}
                          >
                            <span className="truncate">{c.categoryName}</span>
                            {isSelected && <Check size={12} className="text-[#006B7A] flex-shrink-0" />}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Skills list box */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs uppercase font-extrabold tracking-wider text-[#006B7A] flex items-center gap-1.5">
                    <FileText size={14} />
                    <span>Kỹ năng & Chuyên môn sở hữu</span>
                  </label>
                  <span className="text-[10px] text-gray-400 font-mono font-bold bg-gray-100 px-2 py-0.5 rounded-md">
                    Đã chọn: {formData.skillIds.length}
                  </span>
                </div>

                {isEditing && (
                  <input
                    type="text"
                    placeholder="Tìm nhanh kỹ năng (ví dụ: Java, Photoshop, Marketing...)"
                    value={skillSearch}
                    onChange={(e) => setSkillSearch(e.target.value)}
                    className="w-full bg-white border border-gray-200 focus:border-[#006B7A] focus:ring-1 focus:ring-[#006B7A] rounded-xl px-3 py-2 text-xs font-medium outline-none transition-all"
                  />
                )}

                <div className="max-h-80 overflow-y-auto border border-gray-150 rounded-2xl p-4 custom-scrollbar bg-gray-50/20 text-left">
                  {filteredSkills.length === 0 ? (
                    <p className="text-[11px] text-gray-400 font-medium py-6 text-center">Không tìm thấy kỹ năng nào phù hợp.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {filteredSkills.map((s) => {
                        const isSelected = formData.skillIds.includes(s.id);
                        return (
                          <span
                            key={s.id}
                            onClick={() => handleToggleSkill(s.id)}
                            className={`px-3 py-1.5 rounded-xl border text-[11px] font-semibold transition-all select-none inline-flex items-center gap-1 ${
                              isEditing ? "cursor-pointer active:scale-95" : ""
                            } ${
                              isSelected
                                ? "bg-[#006B7A] text-white border-[#006B7A] font-bold"
                                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-100"
                            }`}
                          >
                            <span>{s.skillName}</span>
                            {isSelected && <Check size={10} className="text-white" />}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Warning when no setup is complete */}
            {formData.categoryIds.length === 0 && (
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100 text-amber-700 text-xs font-semibold flex items-center gap-2">
                <Info size={14} className="text-amber-500 flex-shrink-0 animate-pulse" />
                <span>Bạn chưa chọn ngành nghề nào. Chúng tôi sẽ không thể đưa ra các gợi ý việc làm chính xác cho bạn.</span>
              </div>
            )}

            {isEditing && (
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    loadCandidateProfile();
                    setIsEditing(false);
                  }}
                  className="px-5 py-2.5 border border-gray-250 hover:bg-gray-50 text-gray-600 rounded-xl font-bold transition-all active:scale-[0.98] cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="bg-[#006B7A] hover:bg-[#005a66] text-white px-6 py-2.5 rounded-xl font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer active:scale-[0.98]"
                >
                  <Save size={14} />
                  Lưu & Lọc việc làm gợi ý
                </button>
              </div>
            )}

          </div>
        )}

        {/* Tab 3 Content: Recommended Jobs based on user target categories & skills */}
        {activeTab === "recommendations" && (
          <div className="space-y-6 text-left">
            
            <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs">
              <h3 className="text-base font-extrabold text-gray-800 flex items-center gap-2">
                <Sparkles className="text-amber-500 fill-amber-500 animate-spin" size={18} />
                <span>Việc làm khớp với hồ sơ của bạn</span>
              </h3>
              <p className="text-[11px] text-gray-400 mt-1 font-light leading-normal">
                Dưới đây là các tin tuyển dụng đang hoạt động tại Đà Nẵng, được sắp xếp tự động dựa trên độ tương thích của Ngành nghề ({formData.categoryIds.length}) và Kỹ năng ({formData.skillIds.length}) của bạn.
              </p>
            </div>

            {loadingJobs ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-[#006B7A]" />
                <p className="text-xs text-gray-400 font-bold">Đang phân tích cơ sở dữ liệu việc làm tại Đà Nẵng...</p>
              </div>
            ) : recommendedJobs.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-gray-150 flex flex-col items-center justify-center space-y-4">
                <div className="h-16 w-16 bg-gray-50 border border-dashed border-gray-200 rounded-full flex items-center justify-center text-gray-400">
                  <Compass size={28} />
                </div>
                <div className="max-w-md">
                  <h4 className="font-extrabold text-sm text-gray-700">Chưa tìm thấy công việc phù hợp lý tưởng</h4>
                  <p className="text-xs text-gray-450 mt-1 leading-normal font-light">
                    Hệ thống chưa tìm thấy tin tuyển dụng nào trực tiếp trùng khớp với danh sách ngành nghề hoặc kỹ năng hiện tại của bạn.
                  </p>
                  <p className="text-[11px] text-gray-400 font-medium mt-2">
                    * Mẹo: Hãy mở rộng <strong>Cài đặt gợi ý việc làm</strong> để bổ sung thêm nhiều ngành nghề hoặc kỹ năng liên quan!
                  </p>
                </div>
                <button
                  onClick={() => {
                    setActiveTab("preferences");
                    setIsEditing(true);
                  }}
                  className="px-4 py-2.5 bg-[#006B7A] hover:bg-[#005a66] text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Điều chỉnh cài đặt ngay
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendedJobs.map(({ job, score, matchedCategoriesCount, matchedSkillsCount }) => (
                  <div
                    key={job.id}
                    className="bg-white border border-gray-150 rounded-2xl p-5 hover:shadow-md hover:scale-[1.005] transition-all duration-300 flex flex-col justify-between group relative overflow-hidden text-left"
                  >
                    {/* Top decoration matching score badge */}
                    <div className="absolute right-0 top-0 bg-amber-500/10 text-amber-600 font-mono font-extrabold text-[10px] px-3.5 py-1.5 rounded-bl-2xl flex items-center gap-0.5">
                      <Sparkles size={11} className="fill-amber-500 stroke-amber-500" />
                      <span>{score}% tương thích</span>
                    </div>

                    <div className="space-y-3.5">
                      <div>
                        {/* Categories */}
                        <div className="flex flex-wrap gap-1 mb-2 pr-28">
                          {job.categoryNames?.slice(0, 2).map((catName) => (
                            <span key={catName} className="bg-teal-50 text-[#006B7A] text-[9px] font-extrabold px-2 py-0.5 rounded-md">
                              {catName}
                            </span>
                          ))}
                        </div>

                        {/* Job Title */}
                        <h4 className="font-extrabold text-sm text-gray-850 group-hover:text-[#006B7A] transition-colors leading-tight line-clamp-1">
                          {job.jobTitle}
                        </h4>
                        
                        {/* Recruiter company name */}
                        <p className="text-[11px] text-gray-400 font-semibold mt-1 flex items-center gap-1">
                          <Building2 size={12} className="text-gray-300" />
                          <span className="truncate">{job.employerName || "Doanh nghiệp tuyển dụng"}</span>
                        </p>
                      </div>

                      {/* Info line details: Location and Salary */}
                      <div className="grid grid-cols-2 gap-3 text-[11px] font-semibold text-gray-550 border-t border-b border-gray-50 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className="p-1 bg-gray-100 rounded-md text-gray-400 flex-shrink-0"><MapPin size={11} /></span>
                          <span className="truncate">{job.wardName || "Đà Nẵng"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="p-1 bg-gray-100 rounded-md text-gray-400 flex-shrink-0"><DollarSign size={11} /></span>
                          <span className="text-[#006B7A] font-bold">
                            {job.salaryType === "NEGOTIABLE" 
                              ? "Thỏa thuận" 
                              : `${(job.minimumSalary / 1000000).toFixed(0)} - ${(job.maximumSalary / 1000000).toFixed(0)} Tr VND`}
                          </span>
                        </div>
                      </div>

                      {/* Technical skill tags */}
                      {job.skillNames && job.skillNames.length > 0 && (
                        <div className="space-y-1.5 text-left">
                          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Yêu cầu kỹ năng:</p>
                          <div className="flex flex-wrap gap-1">
                            {job.skillNames.slice(0, 3).map((sn) => (
                              <span key={sn} className="bg-gray-50 border border-gray-150 text-gray-600 text-[9px] px-2 py-0.5 rounded-md font-medium">
                                {sn}
                              </span>
                            ))}
                            {job.skillNames.length > 3 && (
                              <span className="bg-gray-100 text-gray-500 text-[8px] px-1.5 py-0.5 rounded-md font-bold">
                                +{job.skillNames.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer match analytics & view detail button */}
                    <div className="flex items-center justify-between gap-4 mt-5 pt-3.5 border-t border-gray-100">
                      <div className="text-[9px] text-gray-400 font-medium">
                        {matchedCategoriesCount > 0 && <span className="block">• Trùng {matchedCategoriesCount} ngành quan tâm</span>}
                        {matchedSkillsCount > 0 && <span className="block">• Trùng {matchedSkillsCount} kỹ năng chuyên môn</span>}
                      </div>

                      <Link
                        href={`/jobs/${job.id}`}
                        className="px-3.5 py-2 bg-[#006B7A]/10 text-[#006B7A] group-hover:bg-[#006B7A] group-hover:text-white rounded-xl text-xs font-bold flex items-center gap-0.5 shadow-xs transition-all active:scale-[0.97]"
                      >
                        <span>Chi tiết</span>
                        <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4 Content: Candidate CV (Resume) Management */}
        {activeTab === "resumes" && (
          <div className="space-y-6 text-left animate-fadeIn">
            {/* Header intro box */}
            <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-gray-800 flex items-center gap-2">
                  <FileText className="text-[#006B7A]" size={18} />
                  <span>Quản lý hồ sơ CV trực tuyến</span>
                </h3>
                <p className="text-[11px] text-gray-400 font-light leading-normal">
                  Tải lên nhiều phiên bản CV (PDF, Docx) để dễ dàng ứng tuyển các vị trí công việc khác nhau tại Đà Nẵng.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setResumeForm({ title: "", description: "", fileUrl: "", isDefault: false });
                  setResumeFile(null);
                  setUploadFileName("");
                  setIsOpenResumeModal(true);
                }}
                className="bg-[#006B7A] hover:bg-[#005a66] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer active:scale-[0.98] self-start sm:self-center"
              >
                <Plus size={14} />
                <span>Tải lên CV mới</span>
              </button>
            </div>

            {/* Resume content grid */}
            {isLoadingResumes ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3 bg-white border border-gray-150 rounded-2xl">
                <Loader2 className="h-8 w-8 animate-spin text-[#006B7A]" />
                <p className="text-xs text-gray-400 font-bold">Đang tải danh sách CV của bạn...</p>
              </div>
            ) : resumes.length === 0 ? (
              /* High-fidelity empty state */
              <div className="p-12 text-center bg-white rounded-2xl border border-gray-150 flex flex-col items-center justify-center space-y-4 shadow-3xs">
                <div className="h-16 w-16 bg-[#006B7A]/5 border border-dashed border-[#006B7A]/25 rounded-2xl flex items-center justify-center text-[#006B7A]">
                  <UploadCloud size={28} className="animate-pulse" />
                </div>
                <div className="max-w-md space-y-1">
                  <h4 className="font-extrabold text-sm text-gray-800">Bạn chưa tải lên CV nào</h4>
                  <p className="text-xs text-gray-500 leading-normal font-light">
                    Hồ sơ của bạn chưa có file CV trực tuyến. Hãy tải lên ngay phiên bản CV của bạn dưới dạng PDF để bắt đầu kết nối với các doanh nghiệp Đà Nẵng!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setResumeForm({ title: "", description: "", fileUrl: "", isDefault: false });
                    setResumeFile(null);
                    setUploadFileName("");
                    setIsOpenResumeModal(true);
                  }}
                  className="px-5 py-2.5 bg-[#006B7A] hover:bg-[#005a66] text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer active:scale-[0.97]"
                >
                  Tải lên CV đầu tiên
                </button>
              </div>
            ) : (
              /* Premium cards grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resumes.map((resume) => (
                  <div
                    key={resume.id}
                    className={`bg-white border rounded-2xl p-5 hover:shadow-md hover:scale-[1.005] transition-all duration-300 flex flex-col justify-between space-y-5 relative overflow-hidden group border-gray-150 ${
                      resume.isDefault ? "ring-2 ring-[#006B7A]/25 border-[#006B7A]/40 shadow-xs" : ""
                    }`}
                  >
                    {/* Top decoration matching default status */}
                    {resume.isDefault && (
                      <div className="absolute right-0 top-0 bg-[#006B7A] text-white font-extrabold text-[9px] px-3.5 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-0.5 animate-pulse shadow-sm">
                        <Check size={10} className="stroke-[3]" />
                        <span>Mặc định</span>
                      </div>
                    )}

                    <div className="space-y-4">
                      {/* CV Icon & Title */}
                      <div className="flex items-start gap-3.5">
                        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-500 flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                          <FileText size={24} className="fill-red-50" />
                        </div>
                        <div className="space-y-1 select-none pr-8">
                          <h4 className="font-extrabold text-sm text-gray-800 leading-snug break-words line-clamp-2" title={resume.title}>
                            {resume.title}
                          </h4>
                          <p className="text-[10px] text-gray-400 font-medium">
                            Tải lên ngày: {new Date(resume.createdAt).toLocaleDateString("vi-VN")}
                          </p>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-gray-500 font-light leading-relaxed line-clamp-3 bg-gray-50/50 p-2.5 rounded-xl border border-gray-100/50 break-words" title={resume.description}>
                        {resume.description || "Không có mô tả cho CV này."}
                      </p>
                    </div>

                    {/* Actions panel */}
                    <div className="flex flex-col gap-2 pt-3 border-t border-gray-50">
                      <div className="flex items-center gap-2">
                        {/* Open/Download PDF */}
                        <a
                          href={resume.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all active:scale-[0.98]"
                        >
                          <Download size={13} />
                          <span>Tải xuống / Xem</span>
                        </a>

                        {/* Delete CV */}
                        <button
                          type="button"
                          onClick={() => setResumeToDelete(resume.id)}
                          className="p-2 border border-red-200 text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer active:scale-[0.95] flex items-center justify-center"
                          title="Xóa CV"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {/* Default action toggle */}
                      {!resume.isDefault && (
                        <button
                          type="button"
                          disabled={isResumeActionSubmitting}
                          onClick={() => {
                            toast.promise(setDefault(resume.id), {
                              loading: "Đang cập nhật CV mặc định...",
                              success: "Đã cài đặt CV mặc định thành công!",
                              error: "Thiết lập thất bại. Vui lòng thử lại!"
                            });
                          }}
                          className="w-full py-2 border border-dashed border-[#006B7A]/50 hover:border-[#006B7A] bg-teal-50/5 hover:bg-teal-50/30 text-[#006B7A] rounded-xl text-xs font-extrabold text-center transition-all disabled:opacity-50 cursor-pointer active:scale-[0.98]"
                        >
                          Đặt làm CV mặc định
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================== PREMIUM UPLOAD CV MODAL ==================== */}
        {isOpenResumeModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 transition-all duration-300">
            {/* Overlay backdrop */}
            <div className="fixed inset-0" onClick={() => !isUploadingResume && !isResumeActionSubmitting && setIsOpenResumeModal(false)}></div>

            {/* Modal Box */}
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-gray-150 animate-in fade-in zoom-in-95 duration-200 flex flex-col text-gray-800 relative z-10">
              {/* Modal Header */}
              <div className="px-6 py-4.5 bg-gradient-to-r from-teal-50/55 to-white border-b border-gray-100 flex items-center justify-between">
                <div className="text-left space-y-0.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#006B7A] bg-[#006B7A]/10 px-2 py-0.5 rounded">
                    Thêm hồ sơ ứng viên
                  </span>
                  <h3 className="text-sm md:text-base font-extrabold text-gray-800">
                    Tải lên Hồ sơ CV trực tuyến
                  </h3>
                </div>
                <button
                  type="button"
                  disabled={isUploadingResume || isResumeActionSubmitting}
                  onClick={() => setIsOpenResumeModal(false)}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-655 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Form */}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!resumeForm.title.trim()) {
                    return toast.error("Vui lòng nhập tiêu đề hồ sơ CV!");
                  }
                  if (!resumeForm.description.trim()) {
                    return toast.error("Vui lòng cung cấp mô tả tóm tắt CV!");
                  }
                  if (!resumeForm.fileUrl && !resumeFile) {
                    return toast.error("Vui lòng chọn file CV hoặc kéo thả file vào khung tải lên!");
                  }

                  try {
                    let uploadedUrl = resumeForm.fileUrl;

                    // If a file is selected locally, upload it to Cloudinary first
                    if (resumeFile) {
                      toast.loading("Đang tải tệp CV của bạn lên Cloudinary...", { id: "upload-cv" });
                      uploadedUrl = await uploadResume(resumeFile);
                      toast.success("Tải tệp CV lên Cloudinary thành công!", { id: "upload-cv" });
                    }

                    // Create CV request
                    await createResume({
                      title: resumeForm.title.trim(),
                      description: resumeForm.description.trim(),
                      fileUrl: uploadedUrl,
                      isDefault: resumeForm.isDefault
                    });

                    toast.success("Tải lên và lưu CV thành công!");
                    setIsOpenResumeModal(false);
                  } catch (err: any) {
                    toast.error(err.message || "Tải lên CV thất bại. Vui lòng thử lại!");
                  }
                }}
                className="p-6 space-y-4 text-xs font-semibold text-left"
              >
                {/* 1. CV Title */}
                <div className="space-y-1.5">
                  <label className="text-gray-500 uppercase tracking-wider block">Tiêu đề CV <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: CV Lập trình viên ReactJS - Nguyễn Văn A"
                    value={resumeForm.title}
                    onChange={(e) => setResumeForm((prev) => ({ ...prev, title: e.target.value }))}
                    disabled={isUploadingResume || isResumeActionSubmitting}
                    className="w-full bg-white border border-gray-200 focus:border-[#006B7A] focus:ring-1 focus:ring-[#006B7A] rounded-xl px-4 py-2.5 text-gray-700 font-medium outline-none transition-all disabled:opacity-60"
                  />
                </div>

                {/* 2. CV Description */}
                <div className="space-y-1.5">
                  <label className="text-gray-500 uppercase tracking-wider block">Mô tả tóm tắt <span className="text-red-500">*</span></label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Ví dụ: Kinh nghiệm 2 năm, thế mạnh phát triển ứng dụng SPA sử dụng ReactJS, Next.js, có khả năng viết CSS tốt với Tailwindcss..."
                    value={resumeForm.description}
                    onChange={(e) => setResumeForm((prev) => ({ ...prev, description: e.target.value }))}
                    disabled={isUploadingResume || isResumeActionSubmitting}
                    className="w-full bg-white border border-gray-200 focus:border-[#006B7A] focus:ring-1 focus:ring-[#006B7A] rounded-xl px-4 py-2.5 text-gray-700 font-medium outline-none transition-all disabled:opacity-60 resize-none"
                  />
                </div>

                {/* 3. Drag & Drop File Zone */}
                <div className="space-y-1.5">
                  <label className="text-gray-500 uppercase tracking-wider block">Tệp tin đính kèm (PDF, DOCX) <span className="text-red-500">*</span></label>
                  
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (!isUploadingResume && !isResumeActionSubmitting) setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      if (isUploadingResume || isResumeActionSubmitting) return;

                      const droppedFile = e.dataTransfer.files?.[0];
                      if (droppedFile) {
                        const fileExt = droppedFile.name.split(".").pop()?.toLowerCase();
                        if (fileExt !== "pdf" && fileExt !== "docx" && fileExt !== "doc") {
                          toast.error("Vui lòng tải lên file PDF, DOCX hoặc DOC!");
                          return;
                        }
                        if (droppedFile.size > 5 * 1024 * 1024) {
                          toast.error("Dung lượng file tối đa là 5MB!");
                          return;
                        }
                        setResumeFile(droppedFile);
                        setUploadFileName(droppedFile.name);
                        toast.success(`Đã nhận file: ${droppedFile.name}`);
                      }
                    }}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all flex flex-col items-center justify-center gap-2 select-none ${
                      isDragging 
                        ? "border-[#006B7A] bg-teal-50/35 scale-[1.01]" 
                        : uploadFileName 
                          ? "border-emerald-300 bg-emerald-50/5" 
                          : "border-gray-200 hover:border-[#006B7A]/50 bg-gray-50/30"
                    }`}
                  >
                    {isUploadingResume ? (
                      <div className="py-2 flex flex-col items-center gap-2 text-[#006B7A]">
                        <Loader2 size={32} className="animate-spin" />
                        <span className="font-bold">Đang tải file lên Cloudinary trực tiếp...</span>
                      </div>
                    ) : uploadFileName ? (
                      <div className="py-1 flex flex-col items-center gap-2">
                        <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-505">
                          <CheckCircle2 size={24} />
                        </div>
                        <div className="space-y-0.5">
                          <p className="font-bold text-gray-800 text-[11px] line-clamp-1">{uploadFileName}</p>
                          <p className="text-[10px] text-gray-400 font-medium">Kéo thả hoặc click để thay đổi file</p>
                        </div>
                        <input
                          type="file"
                          id="resume-file"
                          accept=".pdf,.docx,.doc"
                          onChange={(e) => {
                            const selectedFile = e.target.files?.[0];
                            if (selectedFile) {
                              setResumeFile(selectedFile);
                              setUploadFileName(selectedFile.name);
                            }
                          }}
                          className="hidden"
                        />
                        <label htmlFor="resume-file" className="px-3 py-1.5 bg-gray-50 hover:bg-gray-150 border border-gray-200 rounded-lg text-[10px] font-bold cursor-pointer transition-all">
                          Chọn file khác
                        </label>
                      </div>
                    ) : (
                      <>
                        <UploadCloud size={30} className="text-[#006B7A]/75 animate-bounce" />
                        <div className="space-y-0.5">
                          <p className="font-bold text-gray-700">Kéo & thả file CV vào đây</p>
                          <p className="text-[10px] text-gray-400 font-medium">Hoặc nhấp để duyệt file trong máy tính</p>
                        </div>
                        <p className="text-[9px] text-gray-450 font-normal">Hỗ trợ định dạng PDF, DOC, DOCX. Tối đa 5MB.</p>
                        
                        <input
                          type="file"
                          id="resume-file-new"
                          accept=".pdf,.docx,.doc"
                          onChange={(e) => {
                            const selectedFile = e.target.files?.[0];
                            if (selectedFile) {
                              if (selectedFile.size > 5 * 1024 * 1024) {
                                toast.error("Dung lượng file tối đa là 5MB!");
                                return;
                              }
                              setResumeFile(selectedFile);
                              setUploadFileName(selectedFile.name);
                            }
                          }}
                          className="hidden"
                        />
                        <label htmlFor="resume-file-new" className="px-3.5 py-1.5 mt-1 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-[10px] font-bold cursor-pointer transition-all shadow-2xs">
                          Chọn tệp
                        </label>
                      </>
                    )}
                  </div>
                </div>

                {/* 4. Default Checkbox Option */}
                <label className="flex items-center gap-2 cursor-pointer py-1.5 select-none w-fit">
                  <input
                    type="checkbox"
                    checked={resumeForm.isDefault}
                    onChange={(e) => setResumeForm((prev) => ({ ...prev, isDefault: e.target.checked }))}
                    disabled={isUploadingResume || isResumeActionSubmitting}
                    className="rounded border-gray-300 text-[#006B7A] focus:ring-[#006B7A] w-4 h-4 cursor-pointer"
                  />
                  <span className="text-gray-650 hover:text-gray-800 transition-colors">Đặt làm CV mặc định ngay sau khi lưu</span>
                </label>

                {/* 5. Modal Footer Action Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    disabled={isUploadingResume || isResumeActionSubmitting}
                    onClick={() => setIsOpenResumeModal(false)}
                    className="px-5 py-2.5 border border-gray-250 hover:bg-gray-50 text-gray-600 rounded-xl font-bold transition-all active:scale-[0.98] cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={isUploadingResume || isResumeActionSubmitting}
                    className="bg-[#006B7A] hover:bg-[#005a66] disabled:bg-gray-350 text-white px-6 py-2.5 rounded-xl font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer active:scale-[0.98]"
                  >
                    {isUploadingResume || isResumeActionSubmitting ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Save size={14} />
                    )}
                    <span>Tải lên & Lưu hồ sơ</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ==================== PREMIUM DELETE CONFIRMATION MODAL ==================== */}
        {resumeToDelete !== null && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 transition-all duration-300">
            {/* Overlay backdrop */}
            <div className="fixed inset-0" onClick={() => !isResumeActionSubmitting && setResumeToDelete(null)}></div>

            <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 border border-gray-150 animate-in fade-in zoom-in-95 duration-200 flex flex-col text-center space-y-5 text-gray-800 relative z-10">
              <div className="h-14 w-14 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto flex-shrink-0 animate-bounce">
                <Trash2 size={24} />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-extrabold text-gray-800 text-base">Xác nhận xóa tệp hồ sơ CV</h4>
                <p className="text-xs text-gray-400 font-light leading-relaxed">
                  Hành động này không thể hoàn tác. File CV đính kèm sẽ bị xóa hoàn toàn khỏi hệ thống tuyển dụng. Bạn có chắc chắn muốn tiếp tục?
                </p>
              </div>
              
              <div className="flex items-center gap-3 justify-center select-none text-xs font-bold">
                <button
                  type="button"
                  disabled={isResumeActionSubmitting}
                  onClick={() => setResumeToDelete(null)}
                  className="w-full py-2.5 border border-gray-250 hover:bg-gray-50 text-gray-655 rounded-xl transition-all active:scale-[0.98]"
                >
                  Không, giữ lại
                </button>
                <button
                  type="button"
                  disabled={isResumeActionSubmitting}
                  onClick={async () => {
                    try {
                      await deleteResume(resumeToDelete);
                      toast.success("Xóa hồ sơ CV thành công!");
                      setResumeToDelete(null);
                    } catch (err: any) {
                      toast.error("Xóa CV thất bại. Vui lòng thử lại!");
                    }
                  }}
                  className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-1"
                >
                  {isResumeActionSubmitting ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <span>Chắc chắn, xóa CV</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function CandidateProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-[#006B7A]" />
          <p className="text-gray-500 font-bold text-xs tracking-wide">Đang tải thông tin hồ sơ ứng viên...</p>
        </div>
      </div>
    }>
      <CandidateProfileContent />
    </Suspense>
  );
}
