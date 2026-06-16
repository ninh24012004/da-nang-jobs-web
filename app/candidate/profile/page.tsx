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
  FileCheck,
  ChevronDown
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

import { categoryService } from "@/services/categoryService";
import { CategoryTreeResponse } from "@/types/category";

// Import types
import { CandidateResponse } from "@/types/candidate";
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

  // Category Tree states
  const [categoriesTree, setCategoriesTree] = useState<CategoryTreeResponse[]>([]);
  const [expandedCategoryGroups, setExpandedCategoryGroups] = useState<number[]>([]);

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
        const districtsData = await fetchDistricts();
        setDistricts(districtsData || []);

        const categoriesData = await fetchFlatCategories();
        setAllCategories(categoriesData || []);

        const catTreeData = await categoryService.getCategoryTree();
        if (catTreeData) setCategoriesTree(catTreeData);

        const skillsData = await fetchSkills();
        setAllSkills(skillsData || []);

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
        
        if (isProfileIncomplete) {
          setIsEditing(true);
          toast.warning("Hồ sơ của bạn chưa hoàn thiện. Vui lòng bổ sung Địa chỉ và Cài đặt gợi ý công việc!");
        }

        setFormData({
          fullName: data.user?.fullName || "",
          avatarUrl: data.user?.avatarUrl || "",
          districtId: "",
          wardId: data.ward?.id ? String(data.ward.id) : "",
          address: data.address || "",
          categoryIds: data.categories ? data.categories.map((c) => c.id) : [],
          skillIds: data.skills ? data.skills.map((s) => s.id) : [],
        });

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

        if (job.categoryNames && job.categoryNames.length > 0) {
          job.categoryNames.forEach((catName) => {
            if (candidateCategoriesSet.has(catName)) {
              score += 40;
              matchedCategoriesCount++;
            }
          });
        }

        if (job.skillNames && job.skillNames.length > 0) {
          job.skillNames.forEach((skillName) => {
            if (candidateSkillsSet.has(skillName)) {
              score += 15;
              matchedSkillsCount++;
            }
          });
        }

        return {
          job,
          score: Math.min(score, 100),
          matchedCategoriesCount,
          matchedSkillsCount
        };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score);
  }, [allJobs, formData.categoryIds, formData.skillIds, allCategories, allSkills]);

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

  // Category tree helper methods
  const getDescendantIds = (node: CategoryTreeResponse): number[] => {
    let ids = [node.id];
    if (node.children) {
      for (const child of node.children) {
        ids = [...ids, ...getDescendantIds(child)];
      }
    }
    return ids;
  };

  const getCategorySelectionStatus = (node: CategoryTreeResponse, selectedList: number[]): "none" | "partial" | "all" => {
    const descendantIds = getDescendantIds(node);
    const selectedCount = descendantIds.filter(id => selectedList.includes(id)).length;
    if (selectedCount === 0) return "none";
    if (selectedCount === descendantIds.length) return "all";
    return "partial";
  };

  const handleToggleCategoryGroup = (node: CategoryTreeResponse) => {
    if (!isEditing) return;
    const descendantIds = getDescendantIds(node);
    const status = getCategorySelectionStatus(node, formData.categoryIds);

    let updatedCats: number[];
    if (status === "all") {
      updatedCats = formData.categoryIds.filter(id => !descendantIds.includes(id));
    } else {
      const next = [...formData.categoryIds];
      descendantIds.forEach(id => {
        if (!next.includes(id)) next.push(id);
      });
      updatedCats = next;
    }
    setFormData(prev => ({ ...prev, categoryIds: updatedCats }));
  };

  const handleToggleSubcategory = (subcatId: number) => {
    if (!isEditing) return;
    let updatedCats: number[];
    if (formData.categoryIds.includes(subcatId)) {
      updatedCats = formData.categoryIds.filter(id => id !== subcatId);
    } else {
      updatedCats = [...formData.categoryIds, subcatId];
    }
    setFormData(prev => ({ ...prev, categoryIds: updatedCats }));
  };

  const getMatchingCategories = (nodes: CategoryTreeResponse[], query: string, path: string[] = []): { id: number; name: string; path: string }[] => {
    let matches: { id: number; name: string; path: string }[] = [];
    const lowerQuery = query.toLowerCase().trim();
    if (!lowerQuery) return [];

    for (const node of nodes) {
      const currentPath = [...path, node.categoryName];
      if (node.categoryName.toLowerCase().includes(lowerQuery)) {
        matches.push({
          id: node.id,
          name: node.categoryName,
          path: currentPath.join(" > ")
        });
      }
      if (node.children && node.children.length > 0) {
        matches = [...matches, ...getMatchingCategories(node.children, query, currentPath)];
      }
    }
    return matches;
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
      await updateProfile({
        fullName: formData.fullName,
        avatarUrl: formData.avatarUrl,
        wardId: Number(formData.wardId),
        address: formData.address,
        categoryIds: formData.categoryIds,
        skillIds: formData.skillIds,
      });

      const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
      if (userStr) {
        const userObj = JSON.parse(userStr);
        userObj.fullName = formData.fullName;
        if (formData.avatarUrl) {
          userObj.avatar = formData.avatarUrl;
        }
        const storage = localStorage.getItem("accessToken") ? localStorage : sessionStorage;
        storage.setItem("user", JSON.stringify(userObj));
        
        window.dispatchEvent(new CustomEvent("userUpdated", { detail: userObj }));
      }

      toast.success("Cập nhật hồ sơ thành công!");
      setIsOnboardingNeeded(false);
      setIsEditing(false);
      setActiveTab("recommendations");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi khi lưu thông tin. Vui lòng thử lại!");
    } finally {
      setSaving(false);
    }
  };

  // Compute profile completeness %
  const completenessPercentage = useMemo(() => {
    let score = 20;
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
          <Loader2 className="h-10 w-10 animate-spin text-[#00B14F]" />
          <p className="text-slate-500 font-bold text-xs tracking-wide">Đang tải thông tin hồ sơ ứng viên...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-16 font-sans">
      
      {/* Top Background Slate Banner */}
      <div className="w-full bg-[#0F172A] text-white py-10 px-4 md:px-8 relative overflow-hidden select-none border-b border-slate-800">
        <div className="absolute right-0 bottom-0 w-96 h-96 bg-[#00B14F]/5 rounded-full blur-3xl -mr-16 -mb-16"></div>

        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full border-2 border-slate-700 bg-slate-800 flex items-center justify-center relative overflow-hidden">
              {uploadingAvatar ? (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-[#00B14F]" />
                </div>
              ) : formData.avatarUrl ? (
                <img src={formData.avatarUrl} alt="Avatar" className="h-full w-full object-cover rounded-full" />
              ) : (
                <User className="h-8 w-8 text-slate-400" />
              )}
              {isEditing && (
                <label className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity text-[10px] font-bold">
                  <UploadCloud size={14} className="mb-0.5 text-[#00B14F]" />
                  Tải ảnh
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
              )}
            </div>

            <div className="space-y-1 text-left">
              <div className="flex items-center gap-2">
                <h1 className="text-lg md:text-xl font-extrabold tracking-tight">
                  {formData.fullName || "Ứng Viên"}
                </h1>
                <span className="bg-[#00B14F]/10 text-[#00B14F] text-[9px] font-bold px-2 py-0.5 rounded-[4px] border border-[#00B14F]/20 uppercase tracking-wider flex items-center gap-0.5">
                  <CheckCircle2 size={10} />
                  Đã xác thực
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <span>{userSession?.email}</span>
                {formData.wardId && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span className="flex items-center gap-0.5"><MapPin size={12} /> Đà Nẵng</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Right Area: Profile Completeness Score Card */}
          <div className="bg-slate-900/50 rounded-[8px] p-4 border border-slate-800 max-w-xs w-full">
            <div className="flex justify-between items-center text-xs font-bold text-slate-350 mb-1.5">
              <span>Độ hoàn thiện CV</span>
              <span className="text-[#00B14F]">{completenessPercentage}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#00B14F] rounded-full transition-all duration-350"
                style={{ width: `${completenessPercentage}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1.5 text-left leading-normal">
              * Hồ sơ đầy đủ giúp các nhà tuyển dụng dễ dàng tìm thấy bạn.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Onboarding alert */}
        {isOnboardingNeeded && (
          <div className="mb-6 p-4 rounded-[8px] bg-amber-50 border border-amber-250 text-amber-800 shadow-sm flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-[6px] text-amber-600 flex-shrink-0">
              <ShieldAlert size={18} />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-xs uppercase tracking-wider">Cập nhật hồ sơ & Cài đặt gợi ý công việc</h3>
              <p className="text-xs text-amber-700 mt-1">
                Chào mừng bạn đến với Đà Nẵng Jobs! Vui lòng hoàn thành địa chỉ sinh sống và cập nhật các ngành nghề quan tâm để bắt đầu nhận gợi ý việc làm.
              </p>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 border-b border-slate-200 pb-3 mb-6 overflow-x-auto select-none custom-scrollbar">
          <button
            onClick={() => {
              setActiveTab("profile");
              setIsEditing(false);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-[6px] text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === "profile"
                ? "bg-[#00B14F] text-white shadow-sm"
                : "bg-white text-slate-500 hover:text-slate-700 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            <User size={14} />
            <span>Hồ sơ cá nhân</span>
          </button>
          
          <button
            onClick={() => {
              setActiveTab("preferences");
              setIsEditing(false);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-[6px] text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === "preferences"
                ? "bg-[#00B14F] text-white shadow-sm"
                : "bg-white text-slate-500 hover:text-slate-700 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            <Sliders size={14} />
            <span>Cấu hình gợi ý</span>
            {formData.categoryIds.length > 0 && (
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === "preferences" ? "bg-white text-[#00B14F]" : "bg-[#00B14F]/10 text-[#00B14F]"}`}>
                {formData.categoryIds.length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab("recommendations");
              setIsEditing(false);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-[6px] text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === "recommendations"
                ? "bg-[#00B14F] text-white shadow-sm"
                : "bg-white text-slate-500 hover:text-slate-700 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            <Sparkles size={14} className={recommendedJobs.length > 0 ? "text-amber-500 fill-amber-500" : ""} />
            <span>Gợi ý việc làm</span>
            {recommendedJobs.length > 0 && (
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === "recommendations" ? "bg-white text-[#00B14F]" : "bg-amber-500 text-white"}`}>
                {recommendedJobs.length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab("resumes");
              setIsEditing(false);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-[6px] text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === "resumes"
                ? "bg-[#00B14F] text-white shadow-sm"
                : "bg-white text-slate-500 hover:text-slate-700 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            <FileCheck size={14} />
            <span>Hồ sơ CV của tôi</span>
            {resumes.length > 0 && (
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === "resumes" ? "bg-white text-[#00B14F]" : "bg-[#00B14F]/10 text-[#00B14F]"}`}>
                {resumes.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab 1: Profile Details */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 bg-white rounded-[8px] border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div className="text-left">
                  <h3 className="text-sm sm:text-base font-bold text-slate-800">Thông tin cơ bản</h3>
                  <p className="text-[10px] text-slate-450 mt-0.5">Địa chỉ liên lạc để nhận các công việc gần nhất</p>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-3 py-1.5 bg-[#00B14F]/10 text-[#00B14F] hover:bg-[#00B14F] hover:text-white rounded-[6px] text-xs font-bold transition-colors cursor-pointer border-none"
                  >
                    Chỉnh sửa
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-semibold text-left">
                  <div className="space-y-1">
                    <label className="text-slate-500 uppercase tracking-wider block">Họ và tên ứng viên <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Nguyễn Văn A"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full bg-white border border-slate-200 focus:border-[#00B14F] focus:ring-1 focus:ring-[#00B14F] rounded-[6px] px-3.5 py-2 text-slate-700 outline-none font-medium transition-colors"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-slate-500 uppercase tracking-wider block">Quận / Huyện Đà Nẵng <span className="text-red-500">*</span></label>
                      <select
                        value={formData.districtId}
                        onChange={(e) => setFormData({ ...formData, districtId: e.target.value, wardId: "" })}
                        className="w-full bg-white border border-slate-200 focus:border-[#00B14F] focus:ring-1 focus:ring-[#00B14F] rounded-[6px] px-3.5 py-2 text-slate-700 outline-none cursor-pointer transition-colors"
                        required
                      >
                        <option value="">-- Chọn Quận/Huyện --</option>
                        {districts.map((d) => (
                          <option key={d.id} value={String(d.id)}>{d.districtName}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-500 uppercase tracking-wider block">
                        Phường / Xã <span className="text-red-500">*</span>
                        {loadingWards && <Loader2 size={12} className="inline ml-1 animate-spin text-[#00B14F]" />}
                      </label>
                      <select
                        value={formData.wardId}
                        onChange={(e) => setFormData({ ...formData, wardId: e.target.value })}
                        disabled={!formData.districtId || loadingWards}
                        className="w-full bg-white border border-slate-200 focus:border-[#00B14F] focus:ring-1 focus:ring-[#00B14F] rounded-[6px] px-3.5 py-2 text-slate-700 outline-none disabled:opacity-55 cursor-pointer transition-colors"
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

                  <div className="space-y-1">
                    <label className="text-slate-500 uppercase tracking-wider block">Số nhà, Tên đường cụ thể <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      placeholder="Ví dụ: K10/24 Nguyễn Văn Linh"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full bg-white border border-slate-200 focus:border-[#00B14F] focus:ring-1 focus:ring-[#00B14F] rounded-[6px] px-3.5 py-2 text-slate-700 outline-none font-medium transition-colors"
                      required
                    />
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                    {!isOnboardingNeeded && (
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 border border-slate-250 hover:bg-slate-50 text-slate-600 rounded-[6px] font-semibold transition-colors cursor-pointer"
                      >
                        Hủy
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-[#00B14F] hover:bg-[#00873D] disabled:bg-slate-350 text-white px-5 py-2 rounded-[6px] font-bold shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer border-none"
                    >
                      {saving && <Loader2 size={13} className="animate-spin" />}
                      <Save size={13} />
                      <span>Lưu thông tin</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-5 text-xs text-left font-medium text-slate-600">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Họ và tên</p>
                      <p className="text-sm font-bold text-slate-800 mt-1">{formData.fullName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Email đăng ký</p>
                      <p className="text-sm font-bold text-slate-800 mt-1">{userSession?.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Địa chỉ sinh sống</p>
                      <p className="text-sm font-bold text-slate-800 mt-1">
                        {formData.address}
                        {districts.find(d => String(d.id) === formData.districtId) && `, Phường ${wards.find(w => String(w.id) === formData.wardId)?.wardName}, Quận ${districts.find(d => String(d.id) === formData.districtId)?.districtName}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Thành phố</p>
                      <p className="text-sm font-bold text-slate-800 mt-1">Đà Nẵng, Việt Nam</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right column: Summary sidebar */}
            <div className="bg-white rounded-[8px] border border-slate-200 p-5 shadow-sm text-left space-y-4">
              <h4 className="font-bold text-xs sm:text-sm text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-1.5">
                <FileText size={14} className="text-[#00B14F]" />
                <span>Trạng thái hồ sơ</span>
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-400">Họ tên:</span>
                  <span className="text-emerald-600 flex items-center gap-0.5"><Check size={12} /> Hoàn thành</span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-400">Ảnh đại diện:</span>
                  {formData.avatarUrl ? (
                    <span className="text-emerald-600 flex items-center gap-0.5"><Check size={12} /> Hoàn thành</span>
                  ) : (
                    <span className="text-amber-600 flex items-center gap-0.5"><Info size={12} /> Chưa tải</span>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-400">Địa chỉ cụ thể:</span>
                  {formData.wardId && formData.address ? (
                    <span className="text-emerald-600 flex items-center gap-0.5"><Check size={12} /> Hoàn thành</span>
                  ) : (
                    <span className="text-red-500 flex items-center gap-0.5"><X size={12} /> Chưa hoàn thiện</span>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-400">Ngành nghề gợi ý:</span>
                  {formData.categoryIds.length > 0 ? (
                    <span className="text-emerald-600 flex items-center gap-0.5"><Check size={12} /> {formData.categoryIds.length} đã chọn</span>
                  ) : (
                    <span className="text-amber-600 flex items-center gap-0.5"><Info size={12} /> Chưa thiết lập</span>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-400">Kỹ năng:</span>
                  {formData.skillIds.length > 0 ? (
                    <span className="text-emerald-600 flex items-center gap-0.5"><Check size={12} /> {formData.skillIds.length} đã chọn</span>
                  ) : (
                    <span className="text-amber-600 flex items-center gap-0.5"><Info size={12} /> Chưa thiết lập</span>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    setActiveTab("preferences");
                    setIsEditing(true);
                  }}
                  className="w-full text-center bg-[#00B14F] hover:bg-[#00873D] text-white py-2 rounded-[6px] text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer border-none"
                >
                  <Sliders size={13} />
                  <span>Cài đặt gợi ý công việc</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Job Preferences */}
        {activeTab === "preferences" && (
          <div className="bg-white rounded-[8px] border border-slate-200 p-6 shadow-sm space-y-6 text-left">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-800">Cấu hình việc làm gợi ý</h3>
                <p className="text-[10px] text-slate-450 mt-0.5">
                  Lựa chọn chính xác ngành nghề và kỹ năng để hệ thống lọc các vị trí phù hợp nhất
                </p>
              </div>
              
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-[#00B14F] hover:bg-[#00873D] text-white rounded-[6px] text-xs font-bold transition-colors cursor-pointer border-none shadow-sm"
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
                    className="px-3.5 py-2 border border-slate-250 hover:bg-slate-50 text-slate-650 rounded-[6px] text-xs font-semibold cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="px-4 py-2 bg-[#00B14F] hover:bg-[#00873D] text-white rounded-[6px] text-xs font-bold shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer border-none"
                  >
                    <Save size={13} />
                    Lưu cài đặt
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Categories selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs uppercase font-bold tracking-wider text-[#00B14F] flex items-center gap-1.5">
                    <Grid size={14} />
                    <span>Lĩnh vực & Ngành nghề</span>
                  </label>
                  <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-[4px]">
                    Đã chọn: {formData.categoryIds.length}
                  </span>
                </div>
                
                {isEditing && (
                  <input
                    type="text"
                    placeholder="Tìm nhanh ngành nghề (ví dụ: CNTT, Kinh doanh...)"
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-[#00B14F] focus:ring-1 focus:ring-[#00B14F] rounded-[6px] px-3.5 py-1.5 text-xs font-medium outline-none transition-colors"
                  />
                )}

                <div className="max-h-80 overflow-y-auto p-3.5 space-y-3.5 custom-scrollbar bg-slate-50/50 rounded-[8px] border border-slate-150">
                  {isEditing ? (
                    categorySearch.trim() !== "" ? (
                      (() => {
                        const matches = getMatchingCategories(categoriesTree, categorySearch);
                        return matches.length === 0 ? (
                          <p className="text-[10px] text-slate-400 font-medium py-6 text-center">Không tìm thấy danh mục nào phù hợp.</p>
                        ) : (
                          <div className="grid grid-cols-1 gap-2 text-left">
                            {matches.map((match) => {
                              const isSelected = formData.categoryIds.includes(match.id);
                              return (
                                <label
                                  key={match.id}
                                  className={`flex items-start gap-2.5 p-2.5 rounded-[6px] border border-slate-200 bg-white hover:border-[#00B14F]/20 cursor-pointer select-none transition-colors ${isSelected ? "bg-[#00B14F]/5 border-[#00B14F]/20" : ""}`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => handleToggleSubcategory(match.id)}
                                    className="rounded border-slate-350 text-[#00B14F] focus:ring-[#00B14F] w-3.5 h-3.5 mt-0.5 cursor-pointer"
                                  />
                                  <div className="space-y-0.5">
                                    <span className="text-xs font-semibold text-slate-800 leading-snug">{match.name}</span>
                                    <p className="text-[10px] text-slate-450 font-normal">{match.path}</p>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        );
                      })()
                    ) : (
                      categoriesTree.length === 0 ? (
                        <div className="py-6 text-center text-slate-400 font-medium text-xs">
                          Đang tải sơ đồ ngành nghề...
                        </div>
                      ) : (
                        <div className="space-y-2 animate-fadeIn">
                          {categoriesTree.map((catGroup) => {
                            const isExpanded = expandedCategoryGroups.includes(catGroup.id);
                            const status = getCategorySelectionStatus(catGroup, formData.categoryIds);
                            const isAnySelected = status === "all" || status === "partial";

                            return (
                              <div key={catGroup.id} className="rounded-[6px] bg-white border border-slate-150 overflow-hidden shadow-2xs">
                                <div
                                  onClick={() => {
                                    setExpandedCategoryGroups(prev =>
                                      prev.includes(catGroup.id)
                                        ? prev.filter(id => id !== catGroup.id)
                                        : [...prev, catGroup.id]
                                    );
                                  }}
                                  className="flex items-center justify-between p-2.5 hover:bg-slate-50 cursor-pointer select-none transition-colors"
                                >
                                  <div className="flex items-center gap-2 flex-grow min-w-0">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleCategoryGroup(catGroup);
                                      }}
                                      className="focus:outline-none flex-shrink-0 cursor-pointer flex items-center justify-center bg-transparent border-none p-0"
                                    >
                                      {status === "all" ? (
                                        <div className="w-4 h-4 border border-[#00B14F] rounded-[4px] flex items-center justify-center bg-[#00B14F] text-white">
                                          <Check size={10} className="stroke-[3.5]" />
                                        </div>
                                      ) : status === "partial" ? (
                                        <div className="w-4 h-4 border border-[#00B14F] rounded-[4px] flex items-center justify-center bg-[#00B14F]/10 text-[#00B14F]">
                                          <div className="w-1.5 h-0.5 bg-[#00B14F]"></div>
                                        </div>
                                      ) : (
                                        <div className="w-4 h-4 border border-slate-300 rounded-[4px] bg-white"></div>
                                      )}
                                    </button>
                                    <span className={`text-xs font-semibold truncate leading-none ${isAnySelected ? "text-[#00B14F]" : "text-slate-700"}`}>
                                      {catGroup.categoryName}
                                    </span>
                                  </div>

                                  <div className={`text-slate-400 transition-transform ${isExpanded ? "transform rotate-180" : ""}`}>
                                    <ChevronDown size={14} />
                                  </div>
                                </div>

                                {isExpanded && (
                                  <div className="bg-slate-50/20 border-t border-slate-100 p-2.5 pl-6 space-y-2">
                                    {!catGroup.children || catGroup.children.length === 0 ? (
                                      <p className="text-[10px] text-slate-400 font-medium py-1">Chưa có danh mục con</p>
                                    ) : (
                                      catGroup.children.map((subcat) => {
                                        const hasLevel3 = subcat.children && subcat.children.length > 0;
                                        const subcatStatus = getCategorySelectionStatus(subcat, formData.categoryIds);
                                        const isAnySubcatSelected = subcatStatus === "all" || subcatStatus === "partial";

                                        if (hasLevel3) {
                                          return (
                                            <div key={subcat.id} className="bg-white rounded-[6px] p-2.5 space-y-2 border border-slate-200">
                                              <div
                                                onClick={() => handleToggleCategoryGroup(subcat)}
                                                className="flex items-center gap-2 pb-1.5 border-b border-slate-100 select-none cursor-pointer"
                                              >
                                                <button
                                                  type="button"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleToggleCategoryGroup(subcat);
                                                  }}
                                                  className="focus:outline-none flex-shrink-0 cursor-pointer flex items-center justify-center bg-transparent border-none p-0"
                                                >
                                                  {subcatStatus === "all" ? (
                                                    <div className="w-[15px] h-[15px] border border-[#00B14F] rounded-[3px] flex items-center justify-center bg-[#00B14F] text-white">
                                                      <Check size={9} className="stroke-[4]" />
                                                    </div>
                                                  ) : subcatStatus === "partial" ? (
                                                    <div className="w-[15px] h-[15px] border border-[#00B14F] rounded-[3px] flex items-center justify-center bg-[#00B14F]/10 text-[#00B14F]">
                                                      <div className="w-1.5 h-0.5 bg-[#00B14F]"></div>
                                                    </div>
                                                  ) : (
                                                    <div className="w-[15px] h-[15px] border border-slate-300 rounded-[3px] bg-white"></div>
                                                  )}
                                                </button>
                                                <span className={`text-[11px] font-bold ${isAnySubcatSelected ? "text-[#00B14F]" : "text-slate-700"}`}>
                                                  {subcat.categoryName}
                                                </span>
                                              </div>

                                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-1.5">
                                                {subcat.children!.map((level3Node) => {
                                                  const isLevel3Selected = formData.categoryIds.includes(level3Node.id);
                                                  return (
                                                    <div
                                                      key={level3Node.id}
                                                      onClick={() => handleToggleSubcategory(level3Node.id)}
                                                      className="flex items-center gap-1.5 cursor-pointer select-none py-0.5 text-left"
                                                    >
                                                      <div className="focus:outline-none flex-shrink-0 flex items-center justify-center transition-all bg-transparent border-none p-0">
                                                        {isLevel3Selected ? (
                                                          <div className="w-3 h-3 border border-[#00B14F] rounded-[2px] flex items-center justify-center bg-[#00B14F] text-white">
                                                            <Check size={7} className="stroke-[5]" />
                                                          </div>
                                                        ) : (
                                                          <div className="w-3 h-3 border border-slate-350 rounded-[2px] bg-white"></div>
                                                        )}
                                                      </div>
                                                      <span className={`text-[10px] transition-colors leading-tight ${isLevel3Selected ? "font-bold text-[#00B14F]" : "font-medium text-slate-500"}`}>
                                                        {level3Node.categoryName}
                                                      </span>
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                            </div>
                                          );
                                        }

                                        const isSubcatSelected = subcatStatus === "all";
                                        return (
                                          <div
                                            key={subcat.id}
                                            onClick={() => handleToggleSubcategory(subcat.id)}
                                            className="flex items-center gap-2 cursor-pointer select-none py-1 text-left pl-1"
                                          >
                                            <div className="focus:outline-none flex-shrink-0 flex items-center justify-center bg-transparent border-none p-0">
                                              {isSubcatSelected ? (
                                                <div className="w-3.5 h-3.5 border border-[#00B14F] rounded-[3px] flex items-center justify-center bg-[#00B14F] text-white">
                                                  <Check size={8} className="stroke-[4]" />
                                                </div>
                                              ) : (
                                                <div className="w-3.5 h-3.5 border border-slate-300 rounded-[3px] bg-white"></div>
                                              )}
                                            </div>
                                            <span className={`text-xs transition-colors ${isSubcatSelected ? "font-bold text-[#00B14F]" : "font-semibold text-slate-650"}`}>
                                              {subcat.categoryName}
                                            </span>
                                          </div>
                                        );
                                      })
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )
                    )
                  ) : (
                    formData.categoryIds.length === 0 ? (
                      <p className="text-xs text-slate-400 font-light text-center py-6">
                        Chưa chọn ngành nghề nào quan tâm.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5 text-left">
                        {allCategories
                          .filter((c) => formData.categoryIds.includes(c.id))
                          .map((c) => (
                            <span
                              key={c.id}
                              className="px-2.5 py-1 rounded-[6px] bg-[#00B14F]/5 border border-[#00B14F]/10 text-[#00B14F] text-[11px] font-semibold"
                            >
                              {c.categoryName}
                            </span>
                          ))}
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Skills selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs uppercase font-bold tracking-wider text-[#00B14F] flex items-center gap-1.5">
                    <FileText size={14} />
                    <span>Kỹ năng của bạn</span>
                  </label>
                  <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-[4px]">
                    Đã chọn: {formData.skillIds.length}
                  </span>
                </div>

                {isEditing && (
                  <input
                    type="text"
                    placeholder="Tìm nhanh kỹ năng (ví dụ: Java, Photoshop...)"
                    value={skillSearch}
                    onChange={(e) => setSkillSearch(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-[#00B14F] focus:ring-1 focus:ring-[#00B14F] rounded-[6px] px-3.5 py-1.5 text-xs font-medium outline-none transition-colors"
                  />
                )}

                <div className="max-h-80 overflow-y-auto border border-slate-200 rounded-[8px] p-3.5 bg-slate-50/50 text-left">
                  {filteredSkills.length === 0 ? (
                    <p className="text-[10px] text-slate-400 font-medium py-6 text-center">Không tìm thấy kỹ năng nào.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {filteredSkills.map((s) => {
                        const isSelected = formData.skillIds.includes(s.id);
                        return (
                          <span
                            key={s.id}
                            onClick={() => handleToggleSkill(s.id)}
                            className={`px-2.5 py-1 rounded-[6px] border text-[11px] font-semibold transition-colors inline-flex items-center gap-1 ${
                              isEditing ? "cursor-pointer" : ""
                            } ${
                              isSelected
                                ? "bg-[#00B14F] text-white border-[#00B14F] font-bold"
                                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-55"
                            }`}
                          >
                            <span>{s.skillName}</span>
                            {isSelected && <Check size={10} />}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

            </div>

            {formData.categoryIds.length === 0 && (
              <div className="p-3 bg-amber-50 rounded-[6px] border border-amber-200 text-amber-700 text-xs font-semibold flex items-center gap-2">
                <Info size={14} className="text-amber-500 flex-shrink-0" />
                <span>Bạn chưa cấu hình ngành nghề. Hãy chọn để bắt đầu nhận gợi ý công việc.</span>
              </div>
            )}

            {isEditing && (
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    loadCandidateProfile();
                    setIsEditing(false);
                  }}
                  className="px-4 py-2 border border-slate-250 hover:bg-slate-50 text-slate-600 rounded-[6px] font-semibold transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="bg-[#00B14F] hover:bg-[#00873D] text-white px-5 py-2 rounded-[6px] font-bold shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer border-none"
                >
                  <Save size={13} />
                  <span>Lưu & Tìm việc gợi ý</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Recommended Jobs */}
        {activeTab === "recommendations" && (
          <div className="space-y-5 text-left">
            <div className="bg-white p-5 rounded-[8px] border border-slate-200 shadow-sm">
              <h3 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="text-amber-500 fill-amber-500" size={16} />
                <span>Việc làm tương thích với bạn</span>
              </h3>
              <p className="text-[10px] text-slate-450 mt-0.5 leading-normal">
                Sắp xếp dựa trên cấu hình ngành nghề ({formData.categoryIds.length}) và kỹ năng ({formData.skillIds.length}) của bạn.
              </p>
            </div>

            {loadingJobs ? (
              <div className="py-20 flex flex-col items-center justify-center gap-2 bg-white border border-slate-200 rounded-[8px]">
                <Loader2 className="h-8 w-8 animate-spin text-[#00B14F]" />
                <p className="text-xs text-slate-400 font-semibold">Đang phân tích tin tuyển dụng...</p>
              </div>
            ) : recommendedJobs.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-[8px] border border-slate-200 flex flex-col items-center justify-center space-y-4">
                <div className="h-12 w-12 bg-slate-50 border border-slate-200 rounded-[8px] flex items-center justify-center text-slate-400">
                  <Compass size={24} />
                </div>
                <div className="max-w-md">
                  <h4 className="font-bold text-slate-700 text-sm">Chưa tìm thấy công việc phù hợp lý tưởng</h4>
                  <p className="text-xs text-slate-450 mt-1 leading-normal">
                    Hệ thống chưa tìm thấy tin tuyển dụng nào trực tiếp trùng khớp với danh sách ngành nghề của bạn.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setActiveTab("preferences");
                    setIsEditing(true);
                  }}
                  className="px-4 py-2 bg-[#00B14F] hover:bg-[#00873D] text-white rounded-[6px] text-xs font-bold transition-colors cursor-pointer border-none"
                >
                  Điều chỉnh gợi ý
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendedJobs.map(({ job, score, matchedCategoriesCount, matchedSkillsCount }) => (
                  <div
                    key={job.id}
                    className="bg-white border border-slate-200 rounded-[8px] p-5 hover:shadow-md transition-all duration-150 flex flex-col justify-between group relative overflow-hidden text-left"
                  >
                    {/* Compatibility Badge */}
                    <div className="absolute right-0 top-0 bg-amber-500/10 text-amber-600 font-bold text-[10px] px-2.5 py-1.5 rounded-bl-[8px] flex items-center gap-0.5">
                      <Sparkles size={11} className="fill-amber-500 stroke-amber-500" />
                      <span>{score}% khớp</span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        {/* Categories tags */}
                        <div className="flex flex-wrap gap-1 mb-2 pr-20">
                          {job.categoryNames?.slice(0, 2).map((catName) => (
                            <span key={catName} className="bg-[#00B14F]/5 text-[#00B14F] text-[9px] font-bold px-1.5 py-0.5 rounded-[4px] border border-[#00B14F]/10">
                              {catName}
                            </span>
                          ))}
                        </div>

                        {/* Title */}
                        <h4 className="font-bold text-slate-800 text-sm hover:text-[#00B14F] transition-colors leading-tight line-clamp-1">
                          {job.jobTitle}
                        </h4>
                        
                        {/* Recruiter */}
                        <p className="text-[10px] text-slate-450 font-semibold mt-1 flex items-center gap-1">
                          <Building2 size={12} className="text-slate-350" />
                          <span className="truncate">{job.employerName || "Doanh nghiệp tuyển dụng"}</span>
                        </p>
                      </div>

                      {/* Location and Salary */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-500 border-t border-b border-slate-100 py-2">
                        <div className="flex items-center gap-1">
                          <MapPin size={12} className="text-slate-400" />
                          <span className="truncate">{job.wardName || "Đà Nẵng"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign size={12} className="text-slate-400" />
                          <span className="text-[#00B14F] font-bold">
                            {job.salaryType === "NEGOTIABLE" || job.salaryType === "Lương thỏa thuận"
                              ? "Thỏa thuận" 
                              : `${(job.minimumSalary / 1000000).toFixed(0)} - ${(job.maximumSalary / 1000000).toFixed(0)} Tr`}
                          </span>
                        </div>
                      </div>

                      {/* Technical skill tags */}
                      {job.skillNames && job.skillNames.length > 0 && (
                        <div className="space-y-1">
                          <div className="flex flex-wrap gap-1">
                            {job.skillNames.slice(0, 2).map((sn) => (
                              <span key={sn} className="bg-slate-50 border border-slate-200 text-slate-550 text-[9px] px-1.5 py-0.5 rounded-[4px] font-semibold">
                                {sn}
                              </span>
                            ))}
                            {job.skillNames.length > 2 && (
                              <span className="bg-slate-100 text-slate-500 text-[8px] px-1.5 py-0.5 rounded-[4px] font-bold">
                                +{job.skillNames.length - 2}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-4 mt-4 pt-3 border-t border-slate-100">
                      <div className="text-[9px] text-slate-400 font-semibold leading-tight">
                        {matchedCategoriesCount > 0 && <span className="block">• Khớp {matchedCategoriesCount} ngành</span>}
                        {matchedSkillsCount > 0 && <span className="block">• Khớp {matchedSkillsCount} kỹ năng</span>}
                      </div>

                      <Link
                        href={`/jobs/${job.id}`}
                        className="px-3 py-1.5 bg-[#00B14F]/10 hover:bg-[#00B14F] text-[#00B14F] hover:text-white rounded-[6px] text-xs font-bold transition-colors flex items-center gap-0.5"
                      >
                        <span>Chi tiết</span>
                        <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Resume Management */}
        {activeTab === "resumes" && (
          <div className="space-y-5 text-left animate-fadeIn">
            <div className="bg-white p-5 rounded-[8px] border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-0.5">
                <h3 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-1.5">
                  <FileText className="text-[#00B14F]" size={16} />
                  <span>Hồ sơ CV của tôi</span>
                </h3>
                <p className="text-[10px] text-slate-450 font-medium">
                  Tải lên và lưu các file CV trực tuyến để dễ dàng ứng tuyển việc làm
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
                className="bg-[#00B14F] hover:bg-[#00873D] text-white px-4 py-2 rounded-[6px] text-xs font-bold shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer border-none"
              >
                <Plus size={14} />
                <span>Tải lên CV mới</span>
              </button>
            </div>

            {isLoadingResumes ? (
              <div className="py-20 flex flex-col items-center justify-center gap-2 bg-white border border-slate-200 rounded-[8px]">
                <Loader2 className="h-8 w-8 animate-spin text-[#00B14F]" />
                <p className="text-xs text-slate-400 font-semibold">Đang tải danh sách CV...</p>
              </div>
            ) : resumes.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-[8px] border border-slate-200 flex flex-col items-center justify-center space-y-4 shadow-sm">
                <div className="h-12 w-12 bg-slate-50 border border-dashed border-slate-250 rounded-[8px] flex items-center justify-center text-slate-400">
                  <UploadCloud size={24} />
                </div>
                <div className="max-w-md space-y-1">
                  <h4 className="font-bold text-slate-700 text-sm">Bạn chưa tải lên CV nào</h4>
                  <p className="text-xs text-slate-500 leading-normal">
                    Hãy tải lên CV đầu tiên để bắt đầu kết nối trực tiếp với các nhà tuyển dụng tại Đà Nẵng.
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
                  className="px-4 py-2 bg-[#00B14F] hover:bg-[#00873D] text-white rounded-[6px] text-xs font-bold transition-colors cursor-pointer border-none"
                >
                  Tải lên CV ngay
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resumes.map((resume) => (
                  <div
                    key={resume.id}
                    className={`bg-white border rounded-[8px] p-5 hover:shadow-md transition-all duration-150 flex flex-col justify-between space-y-4 relative border-slate-200 ${
                      resume.isDefault ? "ring-2 ring-[#00B14F]/20 border-[#00B14F]/40 shadow-sm" : ""
                    }`}
                  >
                    {resume.isDefault && (
                      <div className="absolute right-0 top-0 bg-[#00B14F] text-white font-bold text-[9px] px-2.5 py-1 rounded-bl-[6px] uppercase tracking-wider flex items-center gap-0.5">
                        <Check size={10} className="stroke-[3]" />
                        <span>Mặc định</span>
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 bg-red-50 text-red-500 rounded-[6px] flex-shrink-0">
                          <FileText size={20} className="fill-red-50" />
                        </div>
                        <div className="space-y-0.5 select-none pr-8">
                          <h4 className="font-bold text-xs sm:text-sm text-slate-800 leading-snug break-words line-clamp-2" title={resume.title}>
                            {resume.title}
                          </h4>
                          <p className="text-[9px] text-slate-400 font-semibold">
                            Tải lên: {new Date(resume.createdAt).toLocaleDateString("vi-VN")}
                          </p>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 font-normal leading-relaxed line-clamp-2 bg-slate-50 p-2 rounded-[6px] border border-slate-100 break-words" title={resume.description}>
                        {resume.description || "Không có mô tả cho CV này."}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <a
                          href={resume.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-[6px] text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                        >
                          <Download size={13} />
                          <span>Tải xuống</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => setResumeToDelete(resume.id)}
                          className="p-1.5 border border-red-200 text-red-500 hover:bg-red-50 rounded-[6px] transition-colors cursor-pointer flex items-center justify-center"
                          title="Xóa CV"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      {!resume.isDefault && (
                        <button
                          type="button"
                          disabled={isResumeActionSubmitting}
                          onClick={() => {
                            toast.promise(setDefault(resume.id), {
                              loading: "Đang đặt CV mặc định...",
                              success: "Đã thiết lập CV mặc định thành công!",
                              error: "Thiết lập thất bại. Vui lòng thử lại!"
                            });
                          }}
                          className="w-full py-1.5 border border-dashed border-[#00B14F]/50 hover:border-[#00B14F] bg-[#00B14F]/5 text-[#00B14F] rounded-[6px] text-xs font-bold text-center transition-colors disabled:opacity-50 cursor-pointer"
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

        {/* ==================== UPLOAD CV MODAL ==================== */}
        {isOpenResumeModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 transition-all duration-150">
            <div className="fixed inset-0" onClick={() => !isUploadingResume && !isResumeActionSubmitting && setIsOpenResumeModal(false)}></div>

            <div className="bg-white w-full max-w-lg rounded-[8px] shadow-md overflow-hidden border border-slate-200 flex flex-col text-slate-800 relative z-10">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div className="text-left space-y-0.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#00B14F] bg-[#00B14F]/10 px-2 py-0.5 rounded-[4px] border border-[#00B14F]/20">
                    CV ứng viên
                  </span>
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-800">
                    Tải lên file CV mới
                  </h3>
                </div>
                <button
                  type="button"
                  disabled={isUploadingResume || isResumeActionSubmitting}
                  onClick={() => setIsOpenResumeModal(false)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-450 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

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

                    if (resumeFile) {
                      toast.loading("Đang tải tệp CV của bạn lên Cloudinary...", { id: "upload-cv" });
                      uploadedUrl = await uploadResume(resumeFile);
                      toast.success("Tải tệp CV lên Cloudinary thành công!", { id: "upload-cv" });
                    }

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
                <div className="space-y-1">
                  <label className="text-slate-500 uppercase tracking-wider block">Tiêu đề CV <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: CV Lập trình viên NodeJS - Nguyễn Văn A"
                    value={resumeForm.title}
                    onChange={(e) => setResumeForm((prev) => ({ ...prev, title: e.target.value }))}
                    disabled={isUploadingResume || isResumeActionSubmitting}
                    className="w-full bg-white border border-slate-200 focus:border-[#00B14F] focus:ring-1 focus:ring-[#00B14F] rounded-[6px] px-3.5 py-2 text-slate-705 font-medium outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 uppercase tracking-wider block">Mô tả tóm tắt CV <span className="text-red-500">*</span></label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Kinh nghiệm ngắn, điểm mạnh chuyên môn nổi bật..."
                    value={resumeForm.description}
                    onChange={(e) => setResumeForm((prev) => ({ ...prev, description: e.target.value }))}
                    disabled={isUploadingResume || isResumeActionSubmitting}
                    className="w-full bg-white border border-slate-200 focus:border-[#00B14F] focus:ring-1 focus:ring-[#00B14F] rounded-[6px] px-3.5 py-2 text-slate-705 font-medium outline-none transition-colors resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 uppercase tracking-wider block">File đính kèm (PDF, DOCX) <span className="text-red-500">*</span></label>
                  
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
                        toast.success(`Đã chọn file: ${droppedFile.name}`);
                      }
                    }}
                    className={`border border-dashed rounded-[8px] p-5 text-center transition-colors flex flex-col items-center justify-center gap-1.5 select-none ${
                      isDragging 
                        ? "border-[#00B14F] bg-[#00B14F]/5" 
                        : uploadFileName 
                          ? "border-emerald-300 bg-emerald-50/5" 
                          : "border-slate-350 hover:border-[#00B14F]/50 bg-slate-50/30"
                    }`}
                  >
                    {isUploadingResume ? (
                      <div className="py-2 flex flex-col items-center gap-1 text-[#00B14F]">
                        <Loader2 size={24} className="animate-spin" />
                        <span className="font-bold text-[10px]">Đang tải tệp lên Cloudinary...</span>
                      </div>
                    ) : uploadFileName ? (
                      <div className="py-1 flex flex-col items-center gap-1.5">
                        <div className="p-1.5 bg-emerald-50 rounded-[4px] text-emerald-500">
                          <CheckCircle2 size={16} />
                        </div>
                        <div className="space-y-0.5">
                          <p className="font-semibold text-slate-800 text-[10px] line-clamp-1">{uploadFileName}</p>
                          <p className="text-[9px] text-slate-400 font-normal">Bấm bên dưới để thay đổi tệp</p>
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
                        <label htmlFor="resume-file" className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-[6px] text-[9px] font-bold cursor-pointer transition-colors">
                          Thay đổi
                        </label>
                      </div>
                    ) : (
                      <>
                        <UploadCloud size={20} className="text-[#00B14F]/70" />
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-700">Kéo & thả file CV của bạn vào đây</p>
                          <p className="text-[10px] text-slate-400 font-normal">Hỗ trợ định dạng PDF, DOCX, DOC lên tới 5MB</p>
                        </div>
                        
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
                        <label htmlFor="resume-file-new" className="px-3 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-[6px] text-[10px] font-bold cursor-pointer transition-colors shadow-sm">
                          Chọn tệp
                        </label>
                      </>
                    )}
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer py-1 select-none w-fit">
                  <input
                    type="checkbox"
                    checked={resumeForm.isDefault}
                    onChange={(e) => setResumeForm((prev) => ({ ...prev, isDefault: e.target.checked }))}
                    disabled={isUploadingResume || isResumeActionSubmitting}
                    className="rounded border-slate-350 text-[#00B14F] focus:ring-[#00B14F] w-4 h-4 cursor-pointer"
                  />
                  <span className="text-slate-600 hover:text-slate-800 transition-colors">Đặt làm mặc định sau khi lưu</span>
                </label>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    disabled={isUploadingResume || isResumeActionSubmitting}
                    onClick={() => setIsOpenResumeModal(false)}
                    className="px-4 py-2 border border-slate-250 hover:bg-slate-50 text-slate-600 rounded-[6px] font-semibold transition-colors cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={isUploadingResume || isResumeActionSubmitting}
                    className="bg-[#00B14F] hover:bg-[#00873D] text-white px-5 py-2 rounded-[6px] font-bold shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer border-none"
                  >
                    {isUploadingResume || isResumeActionSubmitting ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Save size={13} />
                    )}
                    <span>Tải lên & Lưu</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ==================== DELETE CONFIRMATION MODAL ==================== */}
        {resumeToDelete !== null && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 transition-all duration-150">
            <div className="fixed inset-0" onClick={() => !isResumeActionSubmitting && setResumeToDelete(null)}></div>

            <div className="bg-white w-full max-w-sm rounded-[8px] shadow-md p-6 border border-slate-200 flex flex-col text-center space-y-4 text-slate-800 relative z-10">
              <div className="h-12 w-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto flex-shrink-0">
                <Trash2 size={20} />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-850 text-base">Xác nhận xóa tệp hồ sơ CV</h4>
                <p className="text-xs text-slate-450 leading-relaxed font-normal">
                  Hành động này không thể hoàn tác. File CV đính kèm sẽ bị xóa hoàn toàn khỏi hệ thống.
                </p>
              </div>
              
              <div className="flex items-center gap-2 justify-center text-xs font-bold pt-2">
                <button
                  type="button"
                  disabled={isResumeActionSubmitting}
                  onClick={() => setResumeToDelete(null)}
                  className="w-1/2 py-2 border border-slate-250 hover:bg-slate-50 text-slate-655 rounded-[6px] transition-colors cursor-pointer"
                >
                  Không, giữ lại
                </button>
                <button
                  type="button"
                  disabled={isResumeActionSubmitting}
                  onClick={async () => {
                    try {
                      if (resumeToDelete !== null) {
                        await deleteResume(resumeToDelete);
                      }
                      toast.success("Xóa hồ sơ CV thành công!");
                      setResumeToDelete(null);
                    } catch (err: any) {
                      toast.error("Xóa CV thất bại. Vui lòng thử lại!");
                    }
                  }}
                  className="w-1/2 py-2 bg-red-500 hover:bg-red-650 text-white rounded-[6px] shadow-sm transition-colors cursor-pointer border-none flex items-center justify-center gap-1"
                >
                  {isResumeActionSubmitting && <Loader2 size={13} className="animate-spin" />}
                  <span>Xóa CV</span>
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
          <Loader2 className="h-10 w-10 animate-spin text-[#00B14F]" />
          <p className="text-slate-500 font-bold text-xs tracking-wide">Đang tải thông tin hồ sơ ứng viên...</p>
        </div>
      </div>
    }>
      <CandidateProfileContent />
    </Suspense>
  );
}
