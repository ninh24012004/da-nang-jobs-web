"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

// Import services and hooks
import { useCandidates } from "@/hooks/useCandidates";
import { useLocations } from "@/hooks/useLocations";
import { useCategories } from "@/hooks/useCategories";
import { useSkills } from "@/hooks/useSkills";
import { useCloudinary } from "@/hooks/useCloudinary";
import { useResumes } from "@/hooks/useResumes";
import { jobService } from "@/services/jobService";
import { categoryService } from "@/services/categoryService";
import { applicationService } from "@/services/applicationService";

// Import types
import { CandidateResponse } from "@/types/candidate";
import { SkillResponse } from "@/types/skill";
import { DistrictResponse, WardResponse } from "@/types/location";
import { JobResponse } from "@/types/job";
import { CategoryTreeResponse } from "@/types/category";
import { ResumeResponse } from "@/types/resume";
import { ApplicationResponse, ApplicationStatus } from "@/types/application";

type ActiveTabType = "profile" | "preferences" | "recommendations" | "resumes" | "applications";

interface CandidateProfileContextProps {
  // Navigation & UI States
  activeTab: ActiveTabType;
  setActiveTab: (tab: ActiveTabType) => void;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  loading: boolean;
  saving: boolean;

  // Auth & Session
  isAuthenticated: boolean;
  userSession: {
    fullName: string;
    avatar?: string;
    email?: string;
    roleName?: string;
  } | null;

  // Form & Completeness
  formData: {
    fullName: string;
    avatarUrl: string;
    districtId: string;
    wardId: string;
    address: string;
    categoryIds: number[];
    skillIds: number[];
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    fullName: string;
    avatarUrl: string;
    districtId: string;
    wardId: string;
    address: string;
    categoryIds: number[];
    skillIds: number[];
  }>>;
  completenessPercentage: number;
  isOnboardingNeeded: boolean;
  setIsOnboardingNeeded: (needed: boolean) => void;

  // Master Data
  districts: DistrictResponse[];
  wards: WardResponse[];
  loadingWards: boolean;
  categoriesTree: CategoryTreeResponse[];
  allCategories: any[];
  allSkills: SkillResponse[];

  // Preferences search filters
  categorySearch: string;
  setCategorySearch: (query: string) => void;
  skillSearch: string;
  setSkillSearch: (query: string) => void;
  expandedCategoryGroups: number[];
  setExpandedCategoryGroups: React.Dispatch<React.SetStateAction<number[]>>;

  // Recommendations
  recommendedJobs: Array<{
    job: JobResponse;
    score: number;
    matchedCategoriesCount: number;
    matchedSkillsCount: number;
  }>;
  loadingJobs: boolean;

  // Resumes
  resumes: ResumeResponse[];
  isLoadingResumes: boolean;
  isResumeActionSubmitting: boolean;
  isUploadingResume: boolean;
  fetchMyResumes: () => Promise<ResumeResponse[]>;
  createResume: (data: { title: string; description: string; fileUrl: string; isDefault: boolean }) => Promise<any>;
  setDefault: (id: number) => Promise<any>;
  deleteResume: (id: number) => Promise<any>;
  uploadResume: (file: File) => Promise<string>;

  // Applications (Applied Jobs)
  applications: ApplicationResponse[];
  loadingApplications: boolean;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  filteredApplications: ApplicationResponse[];
  cancelModalAppId: number | null;
  setCancelModalAppId: (id: number | null) => void;
  cancelling: boolean;
  handleCancelConfirm: () => Promise<void>;

  // Operations
  loadCandidateProfile: () => Promise<void>;
  handleAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleSaveProfile: (e: React.FormEvent) => Promise<string | number | undefined>;
  uploadingAvatar: boolean;
}

const CandidateProfileContext = createContext<CandidateProfileContextProps | undefined>(undefined);

export function CandidateProfileProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  // Navigation & UI States
  const [activeTab, setActiveTab] = useState<ActiveTabType>("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Sync activeTab with URL search parameters
  useEffect(() => {
    if (
      tabParam === "profile" ||
      tabParam === "preferences" ||
      tabParam === "recommendations" ||
      tabParam === "resumes" ||
      tabParam === "applications"
    ) {
      setActiveTab(tabParam as ActiveTabType);
    } else if (!tabParam) {
      setActiveTab("profile");
    }
  }, [tabParam]);

  // Auth & Session
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userSession, setUserSession] = useState<any | null>(null);

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

  const [isOnboardingNeeded, setIsOnboardingNeeded] = useState(false);

  // Master Data States
  const [districts, setDistricts] = useState<DistrictResponse[]>([]);
  const [wards, setWards] = useState<WardResponse[]>([]);
  const [loadingWards, setLoadingWards] = useState(false);
  const [categoriesTree, setCategoriesTree] = useState<CategoryTreeResponse[]>([]);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [allSkills, setAllSkills] = useState<SkillResponse[]>([]);
  const [recommendedJobsRaw, setRecommendedJobsRaw] = useState<JobResponse[]>([]);

  // Search & Filter
  const [categorySearch, setCategorySearch] = useState("");
  const [skillSearch, setSkillSearch] = useState("");
  const [expandedCategoryGroups, setExpandedCategoryGroups] = useState<number[]>([]);

  // Loading states
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(false);

  // Resumes States
  const {
    resumes,
    fetchMyResumes,
    createResume,
    setDefault,
    deleteResume,
    isSubmitting: isResumeActionSubmitting,
    isLoading: isLoadingResumes,
  } = useResumes();
  const { uploadResume, isUploadingResume } = useCloudinary();

  // Applications (Applied Jobs) States
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [cancelModalAppId, setCancelModalAppId] = useState<number | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // Hooks
  const { fetchProfile, updateProfile } = useCandidates();
  const { fetchDistricts, fetchWards, fetchWardById } = useLocations();
  const { fetchFlatCategories } = useCategories();
  const { fetchSkills } = useSkills();
  const { uploadLogo } = useCloudinary();

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

  // Load Resumes & Applications once authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchMyResumes().catch((err) => console.warn("Lỗi khi tải CV của tôi:", err));

    const loadApplications = async () => {
      setLoadingApplications(true);
      try {
        const response = await applicationService.getMyApplications(0, 100);
        setApplications(response.content || []);
      } catch (err) {
        console.error("Lỗi khi tải lịch sử ứng tuyển:", err);
      } finally {
        setLoadingApplications(false);
      }
    };
    loadApplications();
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

  // Load recommended jobs from API
  const loadRecommendedJobs = useCallback(async () => {
    setLoadingJobs(true);
    try {
      const res = await jobService.getRecommendedJobs(0, 100);
      setRecommendedJobsRaw(res?.content || []);
    } catch (err) {
      console.warn("Không thể tải danh sách tin tuyển dụng gợi ý từ API:", err);
    } finally {
      setLoadingJobs(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    loadRecommendedJobs();
  }, [isAuthenticated, loadRecommendedJobs]);

  // Recommendation Match Algorithm
  const recommendedJobs = useMemo(() => {
    if (recommendedJobsRaw.length === 0) {
      return [];
    }
    if (formData.categoryIds.length === 0 && formData.skillIds.length === 0) {
      return [];
    }

    const candidateCategoriesSet = new Set(
      allCategories
        .filter((c) => formData.categoryIds.includes(c.id))
        .map((c) => c.categoryName)
    );

    const candidateSkillsSet = new Set(
      allSkills.filter((s) => formData.skillIds.includes(s.id)).map((s) => s.skillName)
    );

    return recommendedJobsRaw
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
          matchedSkillsCount,
        };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score);
  }, [recommendedJobsRaw, formData.categoryIds, formData.skillIds, allCategories, allSkills]);

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

      // Instantly dispatch to sync avatar in visual views
      const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
      if (userStr) {
        const userObj = JSON.parse(userStr);
        userObj.avatar = secureUrl;
        const storage = localStorage.getItem("accessToken") ? localStorage : sessionStorage;
        storage.setItem("user", JSON.stringify(userObj));
        window.dispatchEvent(new CustomEvent("userUpdated", { detail: userObj }));
      }

      toast.success("Tải ảnh đại diện lên thành công!");
    } catch (err: any) {
      toast.error("Tải hình ảnh lên thất bại. Vui lòng kiểm tra lại!");
    } finally {
      setUploadingAvatar(false);
    }
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
      await loadRecommendedJobs();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi khi lưu thông tin. Vui lòng thử lại!");
    } finally {
      setSaving(false);
    }
  };

  // Filtered applications list
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      if (statusFilter === "ALL") return true;
      return app.status === statusFilter;
    });
  }, [applications, statusFilter]);

  // Handle Cancel application
  const handleCancelConfirm = async () => {
    if (!cancelModalAppId) return;
    setCancelling(true);
    try {
      await applicationService.cancelApplication(cancelModalAppId);
      toast.success("Hủy đơn ứng tuyển thành công!");

      setApplications((prev) =>
        prev.map((app) =>
          app.id === cancelModalAppId ? { ...app, status: "CANCELED" as ApplicationStatus } : app
        )
      );
      setCancelModalAppId(null);
    } catch (err) {
      toast.error("Hủy đơn ứng tuyển thất bại. Vui lòng liên hệ nhà tuyển dụng!");
    } finally {
      setCancelling(false);
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

  const value = {
    activeTab,
    setActiveTab,
    isEditing,
    setIsEditing,
    loading,
    saving,
    isAuthenticated,
    userSession,
    formData,
    setFormData,
    completenessPercentage,
    isOnboardingNeeded,
    setIsOnboardingNeeded,
    districts,
    wards,
    loadingWards,
    categoriesTree,
    allCategories,
    allSkills,
    categorySearch,
    setCategorySearch,
    skillSearch,
    setSkillSearch,
    expandedCategoryGroups,
    setExpandedCategoryGroups,
    recommendedJobs,
    loadingJobs,
    resumes,
    isLoadingResumes,
    isResumeActionSubmitting,
    isUploadingResume,
    fetchMyResumes,
    createResume,
    setDefault,
    deleteResume,
    uploadResume,
    applications,
    loadingApplications,
    statusFilter,
    setStatusFilter,
    filteredApplications,
    cancelModalAppId,
    setCancelModalAppId,
    cancelling,
    handleCancelConfirm,
    loadCandidateProfile,
    handleAvatarChange,
    handleSaveProfile,
    uploadingAvatar,
  };

  return <CandidateProfileContext.Provider value={value}>{children}</CandidateProfileContext.Provider>;
}

export function useCandidateProfile() {
  const context = useContext(CandidateProfileContext);
  if (context === undefined) {
    throw new Error("useCandidateProfile must be used within a CandidateProfileProvider");
  }
  return context;
}
