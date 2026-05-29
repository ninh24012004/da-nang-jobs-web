"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import EmployerHeader from "@/components/layout/employer/EmployerHeader";
import EmployerFooter from "@/components/layout/employer/EmployerFooter";
import {
  LayoutDashboard, FileText, UserCheck, Sparkles, Building, Plus,
  Search, Eye, Edit2, Check, X, Calendar, MapPin, DollarSign,
  Briefcase, GraduationCap, ChevronRight, Phone, Mail, Award,
  ExternalLink, BarChart3, TrendingUp, Users, ShieldAlert, Award as AwardIcon,
  CheckCircle2, Clock, Globe, Trash2, Loader2, ChevronDown, Grid
} from "lucide-react";
import { toast } from "sonner";
import { useEmployers } from "@/hooks/useEmployers";
import { useJobs } from "@/hooks/useJobs";
import { usePositions } from "@/hooks/usePositions";
import { useExperienceLevels } from "@/hooks/useExperienceLevels";
import { useLocations } from "@/hooks/useLocations";
import { useCategories } from "@/hooks/useCategories";
import { useSkills } from "@/hooks/useSkills";
import { useTags } from "@/hooks/useTags";
import { JobResponse, ApproveJobStatus, VisibilityJobStatus } from "@/types/job";
import { applicationService } from "@/services/applicationService";
import { categoryService } from "@/services/categoryService";
import { CategoryTreeResponse } from "@/types/category";

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTabParam = searchParams.get("tab") || "dashboard";

  // Initialize hooks
  const { fetchProfile } = useEmployers();
  const { createJob, updateJob, deleteJob, fetchJobsByEmployer } = useJobs();
  const { fetchPositions } = usePositions();
  const { fetchExperienceLevels } = useExperienceLevels();
  const { fetchDistricts, fetchWards, fetchAllWards } = useLocations();
  const { fetchFlatCategories } = useCategories();
  const { fetchSkills } = useSkills();
  const { fetchTags } = useTags();

  // 1. React States
  const [activeTab, setActiveTab] = useState(activeTabParam);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isApproved, setIsApproved] = useState<boolean | null>(null);
  const [companyName, setCompanyName] = useState("Công ty tuyển dụng");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Company info state
  const [companyDetails, setCompanyDetails] = useState({
    name: "Công ty tuyển dụng",
    taxCode: "",
    website: "",
    size: "Chưa cập nhật",
    districtId: "",
    wardId: "",
    address: "",
    about: "",
    phoneNumber: "",
    businessLicense: "",
    logoUrl: ""
  });

  // REAL Job Listings loaded from Backend
  const [realJobs, setRealJobs] = useState<JobResponse[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsPage, setJobsPage] = useState(0);
  const [jobsTotalPages, setJobsTotalPages] = useState(1);
  const [jobsTotalElements, setJobsTotalElements] = useState(0);

  // Master Data Lists for Select Form
  const [positions, setPositions] = useState<any[]>([]);
  const [experienceLevels, setExperienceLevels] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);

  // Form states for creating & updating jobs
  const [editingJobId, setEditingJobId] = useState<number | null>(null);
  const [editingJobStatus, setEditingJobStatus] = useState<ApproveJobStatus | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formRequirements, setFormRequirements] = useState("");
  const [formBenefits, setFormBenefits] = useState("");
  const [formSalaryType, setFormSalaryType] = useState("Lương trong khoảng");
  const [formMinSalary, setFormMinSalary] = useState<number>(5000000);
  const [formMaxSalary, setFormMaxSalary] = useState<number>(15000000);
  const [formAddress, setFormAddress] = useState("");
  const [formDeadline, setFormDeadline] = useState("");
  const [formPositionId, setFormPositionId] = useState("");
  const [formExperienceLevelId, setFormExperienceLevelId] = useState("");
  const [formDistrictId, setFormDistrictId] = useState("");
  const [formWardId, setFormWardId] = useState("");
  const [formCategoryIds, setFormCategoryIds] = useState<number[]>([]);
  const [formSkillIds, setFormSkillIds] = useState<number[]>([]);
  const [formTagIds, setFormTagIds] = useState<number[]>([]);
  const [categorySearch, setCategorySearch] = useState("");
  const [skillSearch, setSkillSearch] = useState("");
  const [tagSearch, setTagSearch] = useState("");
  const [categoriesTree, setCategoriesTree] = useState<CategoryTreeResponse[]>([]);
  const [expandedCategoryGroups, setExpandedCategoryGroups] = useState<number[]>([]);

  const [actionLoading, setActionLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // Mock Applicants
  const [applicants, setApplicants] = useState<any[]>([]);

  // Computed filtered applicants for filtering in CVS list
  const filteredApplicants = applicants.filter(app => {
    if (statusFilter === "ALL") return true;
    if (statusFilter === "PENDING") return app.status === "Mới tiếp nhận";
    if (statusFilter === "ACCEPTED") return app.status === "Đã duyệt";
    if (statusFilter === "REJECTED") return app.status === "Từ chối";
    if (statusFilter === "CANCELED") return app.status === "Đã hủy";
    return true;
  });

  // AI scouting scanner state
  const [scoutingQuery, setScoutingQuery] = useState("");
  const [aiSearching, setAiSearching] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);
  const [aiStepText, setAiStepText] = useState("");
  const [aiResults, setAiResults] = useState<any[]>([]);

  // 2. React Effect Hooks
  useEffect(() => {
    setActiveTab(activeTabParam);
    if (activeTabParam !== "post-job" && !editingJobId) {
      resetForm();
    }
  }, [activeTabParam]);

  useEffect(() => {
    const localToken = localStorage.getItem("accessToken");
    const sessionToken = sessionStorage.getItem("accessToken");
    const token = localToken || sessionToken;

    if (!token) {
      toast.error("Vui lòng đăng nhập tài khoản Nhà tuyển dụng để truy cập!");
      router.push("/employer/login");
      return;
    }

    const localUser = localStorage.getItem("user");
    const sessionUser = sessionStorage.getItem("user");
    const userDataStr = localUser || sessionUser;

    const localEmployer = localStorage.getItem("employer");
    const sessionEmployer = sessionStorage.getItem("employer");
    const employerDataStr = localEmployer || sessionEmployer;

    if (userDataStr) {
      try {
        const parsed = JSON.parse(userDataStr);
        if (parsed.roleName !== "EMPLOYER") {
          toast.error("Tài khoản của bạn không có quyền truy cập Nhà tuyển dụng!");
          router.push("/employer/login");
        } else {
          setIsAuthenticated(true);

          if (employerDataStr) {
            try {
              const cachedEmployer = JSON.parse(employerDataStr);
              if (cachedEmployer.status && cachedEmployer.status !== "APPROVED") {
                toast.warning("Hồ sơ của bạn đang chờ phê duyệt. Đang chuyển hướng...");
                router.push("/employer/onboarding");
                return;
              }

              if (cachedEmployer.status === "APPROVED") {
                setIsApproved(true);
              }

              setCompanyName(cachedEmployer.companyName || "Công ty tuyển dụng");
              setCompanyDetails({
                name: cachedEmployer.companyName || "Công ty tuyển dụng",
                taxCode: cachedEmployer.taxCode || "",
                website: cachedEmployer.website || "",
                size: cachedEmployer.companySize || "Chưa cập nhật",
                districtId: cachedEmployer.districtId || "",
                wardId: cachedEmployer.wardId || "",
                address: cachedEmployer.address || "",
                about: cachedEmployer.description || "",
                phoneNumber: cachedEmployer.phoneNumber || "",
                businessLicense: cachedEmployer.businessLicense || "",
                logoUrl: cachedEmployer.logoUrl || ""
              });
            } catch (err) {
              console.error("Error parsing cached employer profile:", err);
            }
          }

          // Fetch company profile details dynamically from Backend
          fetchProfile()
            .then((data) => {
              if (data) {
                if (data.status !== "APPROVED") {
                  const storage = localToken ? localStorage : sessionStorage;
                  storage.setItem("employer", JSON.stringify(data));
                  toast.warning("Hồ sơ doanh nghiệp đang chờ kiểm duyệt. Đang chuyển hướng...");
                  router.push("/employer/onboarding");
                  return;
                }

                setIsApproved(true);
                setCompanyName(data.companyName || "Công ty tuyển dụng");
                setCompanyDetails({
                  name: data.companyName || "Công ty tuyển dụng",
                  taxCode: data.taxCode || "",
                  website: data.website || "",
                  size: data.companySize || "Chưa cập nhật",
                  districtId: "",
                  wardId: "",
                  address: data.address || "",
                  about: data.description || "",
                  phoneNumber: data.phoneNumber || "",
                  businessLicense: data.businessLicense || "",
                  logoUrl: data.logoUrl || ""
                });

                const storage = localToken ? localStorage : sessionStorage;
                storage.setItem("employer", JSON.stringify(data));
              }
            })
            .catch((err) => {
              console.warn("Using cached / fallback details. Backend connection failed:", err);
              const message = err?.response?.data?.message || "";
              if (message.includes("EMPLOYER_NOT_FOUND") || err?.response?.status === 404) {
                toast.info("Tài khoản doanh nghiệp mới! Vui lòng hoàn thành hồ sơ doanh nghiệp.");
                router.push("/employer/onboarding");
              } else {
                setIsApproved(true);
              }
            });
        }
      } catch (err) {
        console.error("Error verifying dashboard user:", err);
      }
    }
  }, [router]);

  // Load Real Jobs from backend
  useEffect(() => {
    if (isAuthenticated && isApproved) {
      fetchEmployerJobs();
    }
  }, [jobsPage, isAuthenticated, isApproved]);

  // Load Real Applications from backend & map to dashboard schema
  useEffect(() => {
    if (isAuthenticated && isApproved) {
      fetchEmployerApplications();
    }
  }, [isAuthenticated, isApproved]);

  const fetchEmployerApplications = async () => {
    try {
      const response = await applicationService.getApplicationsForEmployer(0, 100);
      if (response && response.content) {
        // Map ApplicationResponse[] to applicants structure
        const mapped = response.content.map((app: any) => {
          let statusText = "Mới tiếp nhận";
          if (app.status === "ACCEPTED") statusText = "Đã duyệt";
          else if (app.status === "REJECTED") statusText = "Từ chối";
          else if (app.status === "CANCELED") statusText = "Đã hủy";

          return {
            id: app.id,
            name: app.candidateName || "Ứng viên Đà Nẵng",
            role: app.jobTitle || "Lập trình viên",
            date: new Date(app.appliedAt).toLocaleDateString("vi-VN"),
            score: 95,
            status: statusText,
            email: app.candidateEmail || "candidate@dnj.com",
            phone: "0905.123.456",
            location: app.candidateAddress || "Liên Chiểu, Đà Nẵng",
            resumeFileUrl: app.resumeFileUrl || ""
          };
        });

        // Filter out duplicates (if mock IDs conflict with DB IDs, we prioritize DB applications)
        setApplicants(prev => {
          const dbIds = new Set(mapped.map(m => m.id));
          const filteredPrev = prev.filter(p => !dbIds.has(p.id) && p.id < 5000);
          return [...mapped, ...filteredPrev];
        });
      }
    } catch (err) {
      console.warn("Lỗi khi tải đơn ứng tuyển của nhà tuyển dụng:", err);
    }
  };

  // Load Master Data Lists for the Form
  useEffect(() => {
    if (isAuthenticated && isApproved) {
      loadMasterData();
    }
  }, [isAuthenticated, isApproved]);

  async function loadMasterData() {
    try {
      let cachedData: any = null;
      if (typeof window !== "undefined") {
        try {
          const cached = sessionStorage.getItem("employerMasterData");
          if (cached) cachedData = JSON.parse(cached);
        } catch (e) {
          console.warn("Failed to parse cached master data:", e);
        }
      }

      if (cachedData && cachedData.categoriesTree && cachedData.categoriesTree.length > 0) {
        setPositions(cachedData.positions || []);
        setExperienceLevels(cachedData.experienceLevels || []);
        setDistricts(cachedData.districts || []);
        setWards(cachedData.wards || []);
        setCategories(cachedData.categories || []);
        setCategoriesTree(cachedData.categoriesTree || []);
        setSkills(cachedData.skills || []);
        setTags(cachedData.tags || []);
        return;
      }

      const [posRes, expRes, distRes, wardRes, catRes, catTreeRes, skillRes, tagRes] = await Promise.all([
        fetchPositions().catch(() => []),
        fetchExperienceLevels().catch(() => []),
        fetchDistricts().catch(() => []),
        fetchAllWards().catch(() => []),
        fetchFlatCategories().catch(() => []),
        categoryService.getCategoryTree().catch(() => []),
        fetchSkills().catch(() => []),
        fetchTags().catch(() => []),
      ]);

      const masterObj = {
        positions: posRes ?? [],
        experienceLevels: expRes ?? [],
        districts: distRes ?? [],
        wards: wardRes ?? [],
        categories: catRes ?? [],
        categoriesTree: catTreeRes ?? [],
        skills: skillRes ?? [],
        tags: tagRes ?? [],
      };

      setPositions(masterObj.positions);
      setExperienceLevels(masterObj.experienceLevels);
      setDistricts(masterObj.districts);
      setWards(masterObj.wards);
      setCategories(masterObj.categories);
      setCategoriesTree(masterObj.categoriesTree);
      setSkills(masterObj.skills);
      setTags(masterObj.tags);

      if (typeof window !== "undefined") {
        sessionStorage.setItem("employerMasterData", JSON.stringify(masterObj));
      }
    } catch (error) {
      console.warn("Lỗi khi tải danh sách master-data:", error);
    }
  }

  async function fetchEmployerJobs() {
    setJobsLoading(true);
    try {
      const res = await fetchJobsByEmployer(jobsPage, 10);
      setRealJobs(res.content || []);
      setJobsTotalPages(res.totalPages || 1);
      setJobsTotalElements(res.totalElements || 0);
    } catch (err) {
      console.warn("Lỗi khi tải tin tuyển dụng của doanh nghiệp:", err);
    } finally {
      setJobsLoading(false);
    }
  }

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
    const descendantIds = getDescendantIds(node);
    const status = getCategorySelectionStatus(node, formCategoryIds);

    let updatedCats: number[];
    if (status === "all") {
      updatedCats = formCategoryIds.filter(id => !descendantIds.includes(id));
    } else {
      const next = [...formCategoryIds];
      descendantIds.forEach(id => {
        if (!next.includes(id)) next.push(id);
      });
      updatedCats = next;
    }
    setFormCategoryIds(updatedCats);
  };

  const handleToggleSubcategory = (subcatId: number) => {
    let updatedCats: number[];
    if (formCategoryIds.includes(subcatId)) {
      updatedCats = formCategoryIds.filter(id => id !== subcatId);
    } else {
      updatedCats = [...formCategoryIds, subcatId];
    }
    setFormCategoryIds(updatedCats);
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

  const resetForm = () => {
    setEditingJobId(null);
    setEditingJobStatus(null);
    setFormTitle("");
    setFormDescription("");
    setFormRequirements("");
    setFormBenefits("");
    setFormSalaryType("Lương trong khoảng");
    setFormMinSalary(5000000);
    setFormMaxSalary(15000000);
    setFormAddress("");
    setFormDeadline("");
    setFormPositionId("");
    setFormExperienceLevelId("");
    setFormDistrictId("");
    setFormWardId("");
    setFormCategoryIds([]);
    setFormSkillIds([]);
    setFormTagIds([]);
    setCategorySearch("");
    setSkillSearch("");
    setTagSearch("");
  };

  const handleSubmitJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      toast.error("Vui lòng nhập tiêu đề tuyển dụng!");
      return;
    }
    if (!formWardId) {
      toast.error("Vui lòng chọn Phường/Xã nơi làm việc!");
      return;
    }
    if (!formPositionId) {
      toast.error("Vui lòng chọn Cấp bậc tuyển dụng!");
      return;
    }

    const requestData: any = {
      jobTitle: formTitle,
      jobDescription: formDescription,
      jobRequirements: formRequirements,
      jobBenefits: formBenefits,
      salaryType: formSalaryType,
      minimumSalary: formSalaryType === "Lương thỏa thuận" ? 0 : formMinSalary,
      maximumSalary: formSalaryType === "Lương thỏa thuận" ? 0 : formMaxSalary,
      address: formAddress,
      deadline: formDeadline ? new Date(formDeadline).toISOString() : new Date().toISOString(),
      positionId: Number(formPositionId),
      experienceLevelId: formExperienceLevelId ? Number(formExperienceLevelId) : undefined,
      wardId: Number(formWardId),
      categoryIds: formCategoryIds,
      skillIds: formSkillIds,
      tagIds: formTagIds,
    };

    setActionLoading(true);
    try {
      if (editingJobId) {
        await updateJob(editingJobId, requestData);
        toast.success("Cập nhật tin tuyển dụng thành công!");
      } else {
        await createJob(requestData);
        toast.success("Đăng tuyển tin thành công! Tin đăng đang chờ hệ thống kiểm duyệt.");
      }

      resetForm();
      await fetchEmployerJobs();
      router.push("/employer/dashboard?tab=jobs");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Đăng/Cập nhật tin tuyển dụng thất bại!");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditJobClick = (job: JobResponse) => {
    setEditingJobId(job.id);
    setEditingJobStatus(job.approveStatus);
    setFormTitle(job.jobTitle || "");
    setFormDescription(job.jobDescription || "");
    setFormRequirements(job.jobRequirements || "");
    setFormBenefits(job.jobBenefits || "");
    setFormSalaryType(job.salaryType || "Lương trong khoảng");
    setFormMinSalary(job.minimumSalary || 0);
    setFormMaxSalary(job.maximumSalary || 0);
    setFormAddress(job.address || "");

    if (job.deadline) {
      setFormDeadline(new Date(job.deadline).toISOString().split("T")[0]);
    } else {
      setFormDeadline("");
    }

    // Resolve Names in DTO back to IDs in Master Data lists
    const matchedPos = positions.find((p) => p.positionName === job.positionName);
    setFormPositionId(matchedPos ? String(matchedPos.id) : "");

    const matchedExp = experienceLevels.find((el) => el.levelName === job.experienceLevelName);
    setFormExperienceLevelId(matchedExp ? String(matchedExp.id) : "");

    const matchedWard = wards.find((w) => w.wardName === job.wardName);
    if (matchedWard) {
      setFormDistrictId(String(matchedWard.districtId));
      setFormWardId(String(matchedWard.id));
    } else {
      setFormDistrictId("");
      setFormWardId("");
    }

    if (job.categoryNames && categories.length > 0) {
      const catIds = categories
        .filter((c) => job.categoryNames?.includes(c.categoryName))
        .map((c) => c.id);
      setFormCategoryIds(catIds);
    } else {
      setFormCategoryIds([]);
    }

    if (job.skillNames && skills.length > 0) {
      const skIds = skills
        .filter((s) => job.skillNames?.includes(s.skillName))
        .map((s) => s.id);
      setFormSkillIds(skIds);
    } else {
      setFormSkillIds([]);
    }

    if (job.tagNames && tags.length > 0) {
      const tgIds = tags
        .filter((t) => job.tagNames?.includes(t.tagName))
        .map((t) => t.id);
      setFormTagIds(tgIds);
    } else {
      setFormTagIds([]);
    }

    router.push("/employer/dashboard?tab=post-job");
  };

  const handleDeleteJob = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa tin tuyển dụng này vĩnh viễn? Hành động này không thể hoàn tác.")) {
      return;
    }
    setActionLoading(true);
    try {
      await deleteJob(id);
      toast.success("Xóa tin tuyển dụng thành công!");
      await fetchEmployerJobs();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Xóa tin tuyển dụng thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    setActionLoading(true);
    try {
      let apiStatus: "ACCEPTED" | "REJECTED" | "PENDING" | "CANCELED" = "PENDING";
      if (newStatus === "Đã duyệt") {
        apiStatus = "ACCEPTED";
      } else if (newStatus === "Từ chối") {
        apiStatus = "REJECTED";
      }
      
      await applicationService.updateStatus(id, { status: apiStatus });
      toast.success(`Đã cập nhật trạng thái ứng viên thành công!`);
    } catch (e) {
      console.warn("Real status update failed, fallback to local state update", e);
    } finally {
      setActionLoading(false);
    }

    setApplicants(applicants.map(a => a.id === id ? { ...a, status: newStatus } : a));
  };

  const handleExportExcel = async () => {
    setExportLoading(true);
    try {
      let apiStatus: string | undefined = undefined;
      if (statusFilter === "PENDING") apiStatus = "PENDING";
      else if (statusFilter === "ACCEPTED") apiStatus = "ACCEPTED";
      else if (statusFilter === "REJECTED") apiStatus = "REJECTED";
      else if (statusFilter === "CANCELED") apiStatus = "CANCELED";

      const blob = await applicationService.exportApplicationsToExcel(apiStatus);
      
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      
      const fileSuffix = statusFilter.toLowerCase();
      link.setAttribute("download", `Danh_sach_ung_vien_${fileSuffix}.xlsx`);
      document.body.appendChild(link);
      link.click();
      
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("Xuất file Excel danh sách ứng viên thành công!");
    } catch (err: any) {
      console.error("Lỗi khi xuất file Excel:", err);
      toast.error(err.response?.data?.message || "Lỗi khi xuất file Excel!");
    } finally {
      setExportLoading(false);
    }
  };

  const handleAiSearch = () => {
    if (!scoutingQuery.trim()) {
      toast.error("Vui lòng nhập vị trí hoặc kỹ năng cần quét!");
      return;
    }

    setAiSearching(true);
    setAiProgress(0);
    setAiResults([]);

    const steps = [
      { text: "Khởi tạo hệ thống DNJ AI Core...", duration: 500 },
      { text: "Đang quét 52,400 hồ sơ ứng viên tại Đà Nẵng...", duration: 700 },
      { text: "Đang so khớp từ khóa và chấm điểm độ tương thích kinh nghiệm...", duration: 800 },
      { text: "Đang phân tích chỉ số ổn định và kỹ năng mềm...", duration: 600 },
      { text: "Lọc kết quả tương thích tối ưu (>85%)...", duration: 400 },
      { text: "Hoàn tất phân tích!", duration: 300 }
    ];

    let currentStep = 0;
    const runStep = () => {
      if (currentStep < steps.length) {
        setAiStepText(steps[currentStep].text);
        setAiProgress(prev => Math.min(prev + 18, 100));
        setTimeout(() => {
          currentStep++;
          runStep();
        }, steps[currentStep].duration);
      } else {
        setAiSearching(false);
        setAiProgress(100);
        setAiResults([
          { name: "Lê Hoàng Long", role: "Frontend Developer (ReactJS)", score: 99, exp: "3 năm kinh nghiệm", skills: ["ReactJS", "TypeScript", "Tailwind CSS"], school: "Đại học Bách Khoa Đà Nẵng", matchReason: "Sở hữu 3 năm kinh nghiệm ReactJS, sinh sống tại Hải Châu phù hợp địa điểm tuyển dụng." },
          { name: "Phan Văn Nam", role: "NodeJS Developer", score: 94, exp: "2 năm kinh nghiệm", skills: ["Node.js", "Express", "MongoDB", "AWS"], school: "Đại học Sư phạm Kỹ thuật Đà Nẵng", matchReason: "Sở hữu chứng chỉ AWS Cloud Practitioner, phù hợp cho tin tuyển dụng hạ tầng backend." },
          { name: "Nguyễn Hoàng Minh Trí", role: "Fullstack JavaScript Developer", score: 88, exp: "4 năm kinh nghiệm", skills: ["Next.js", "Node.js", "PostgreSQL", "Docker"], school: "Đại học Duy Tân", matchReason: "Có kinh nghiệm thực chiến dự án lớn, khả năng làm việc độc lập tốt." }
        ]);
        toast.success("DNJ AI Core đã tìm thấy 3 hồ sơ ứng viên tương thích tốt nhất!");
      }
    };
    runStep();
  };

  const getApproveStatusBadge = (status: ApproveJobStatus) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-100">
            Đã Duyệt
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 px-2 py-0.5 rounded text-[10px] font-bold border border-rose-100">
            Từ Chối
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-100 animate-pulse">
            Chờ Duyệt
          </span>
        );
      default:
        return <span className="text-gray-400">—</span>;
    }
  };

  if (!isAuthenticated || isApproved !== true) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-t-[#006b7a] border-gray-200" />
          <p className="text-gray-500 font-medium text-sm">Đang xác thực thông tin Nhà tuyển dụng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f4f5f5] min-h-screen flex flex-col font-sans antialiased text-gray-800">
      {/* Premium Header */}
      <EmployerHeader />

      <main className="flex-grow pt-[88px] max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Recruiter Grid */}
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-[#006b7a] to-[#005a66] text-white shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 translate-x-10 -translate-y-10 pointer-events-none">
            <AwardIcon size={300} />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full backdrop-blur-sm">
                Không gian nhà tuyển dụng chuyên nghiệp
              </span>
              <h2 className="text-2xl font-extrabold mt-2 tracking-tight">Chào mừng bạn quay lại, {companyDetails.name}!</h2>
              <p className="text-xs text-teal-50 mt-1 max-w-xl font-light">
                DN JOBS AI Core đang hỗ trợ doanh nghiệp tiếp cận với 50K+ ứng viên chất lượng tại thành phố Đà Nẵng. Hãy bắt đầu chiến dịch tuyển dụng hôm nay!
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  resetForm();
                  router.push("/employer/dashboard?tab=post-job");
                }}
                className="flex items-center gap-1.5 bg-white text-[#006b7a] hover:bg-teal-50 px-4 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all active:scale-[0.98] cursor-pointer"
              >
                <Plus size={16} />
                <span>Đăng tin tuyển dụng mới</span>
              </button>
              <button
                onClick={() => router.push("/employer/dashboard?tab=ai-search")}
                className="flex items-center gap-1.5 bg-teal-850 hover:bg-teal-900 text-white px-4 py-2.5 rounded-xl text-xs font-bold border border-teal-700/50 shadow-md transition-all active:scale-[0.98] cursor-pointer"
              >
                <Sparkles size={16} className="text-yellow-400" />
                <span>Tìm ứng viên AI</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Dashboard Left Tab Menu Navigation */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-150 p-4 shadow-sm sticky top-24 space-y-1.5 select-none">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">Chuyên mục</p>

              <button
                onClick={() => router.push("/employer/dashboard?tab=dashboard")}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${activeTab === "dashboard"
                  ? "bg-[#006b7a]/10 text-[#006b7a]"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                  }`}
              >
                <LayoutDashboard size={16} />
                <span>Bảng tin tổng quan</span>
              </button>

              <button
                onClick={() => router.push("/employer/dashboard?tab=jobs")}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${activeTab === "jobs"
                  ? "bg-[#006b7a]/10 text-[#006b7a]"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Briefcase size={16} />
                  <span>Quản lý tin đăng</span>
                </div>
                <span className="bg-[#006b7a]/10 text-[#006b7a] text-[10px] px-1.5 py-0.5 rounded font-bold">
                  {jobsTotalElements}
                </span>
              </button>

              <button
                onClick={() => router.push("/employer/dashboard?tab=cvs")}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${activeTab === "cvs"
                  ? "bg-[#006b7a]/10 text-[#006b7a]"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <UserCheck size={16} />
                  <span>Quản lý hồ sơ CV</span>
                </div>
                <span className="bg-teal-50 text-[#006b7a] text-[10px] px-1.5 py-0.5 rounded font-bold">
                  {applicants.filter(a => a.status === "Mới tiếp nhận").length}
                </span>
              </button>

              <button
                onClick={() => router.push("/employer/dashboard?tab=ai-search")}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${activeTab === "ai-search"
                  ? "bg-[#006b7a]/10 text-[#006b7a]"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                  }`}
              >
                <Sparkles size={16} className={activeTab === "ai-search" ? "text-[#006b7a]" : "text-amber-500"} />
                <span>Tìm hồ sơ AI Core</span>
              </button>

              <button
                onClick={() => router.push("/employer/dashboard?tab=company")}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${activeTab === "company"
                  ? "bg-[#006b7a]/10 text-[#006b7a]"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                  }`}
              >
                <Building size={16} />
                <span>Hồ sơ công ty</span>
              </button>

              <div className="h-px bg-gray-100 my-4" />

              {/* Specialized consultant card in sidebar */}
              <div className="p-3 bg-teal-50/40 border border-teal-100/50 rounded-xl">
                <p className="text-[9px] font-bold text-[#006b7a] uppercase tracking-wider">Hỗ trợ riêng của bạn</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="h-8 w-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs select-none">
                    MA
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-800">Mai Anh Trần</p>
                    <p className="text-[8px] text-gray-400">CSKH DN JOBS</p>
                  </div>
                </div>
                <a
                  href="tel:0905789123"
                  className="mt-2.5 flex items-center justify-center gap-1 w-full bg-white border border-teal-100 hover:bg-teal-50 text-[10px] font-bold text-[#006b7a] py-1.5 rounded-lg transition-colors"
                >
                  <Phone size={10} />
                  <span>0905.789.123</span>
                </a>
              </div>
            </div>
          </div>

          {/* Dashboard Dynamic Tab Main Content Area */}
          <div className="flex-grow min-w-0">

            {/* TAB 1: OVERVIEW PANEL */}
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                {/* 4 Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tổng số tin đăng</p>
                      <h3 className="text-2xl font-extrabold text-gray-800 group-hover:text-[#006b7a] transition-colors">
                        {jobsTotalElements}
                      </h3>
                      <p className="text-[10px] text-emerald-600 flex items-center gap-1 font-semibold">
                        <TrendingUp size={12} />
                        <span>Tổng chiến dịch tuyển dụng</span>
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-teal-50 text-[#006b7a] group-hover:scale-110 transition-transform">
                      <Briefcase size={22} />
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">CV mới nhận (24h)</p>
                      <h3 className="text-2xl font-extrabold text-gray-800">
                        {applicants.length}
                      </h3>
                      <p className="text-[10px] text-emerald-600 flex items-center gap-1 font-semibold">
                        <TrendingUp size={12} />
                        <span>+28% so với tuần trước</span>
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform">
                      <UserCheck size={22} />
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tổng tin đã duyệt</p>
                      <h3 className="text-2xl font-extrabold text-emerald-600">
                        {realJobs.filter(j => j.approveStatus === "APPROVED").length}
                      </h3>
                      <p className="text-[10px] text-emerald-600 flex items-center gap-1 font-semibold">
                        <CheckCircle2 size={12} />
                        <span>Tin hoạt động nhận CV</span>
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-sky-50 text-[#006b7a] group-hover:scale-110 transition-transform">
                      <Eye size={22} />
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tin chờ duyệt</p>
                      <h3 className="text-2xl font-extrabold text-amber-600">
                        {realJobs.filter(j => j.approveStatus === "PENDING").length}
                      </h3>
                      <p className="text-[10px] text-amber-600 font-semibold flex items-center gap-1">
                        <Clock size={12} className="animate-pulse" />
                        <span>Chờ hệ thống kiểm duyệt</span>
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
                      <Sparkles size={22} />
                    </div>
                  </div>
                </div>

                {/* Recruitment Funnel & Quick Shortcut Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Recruitment Funnel Chart Card */}
                  <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-gray-800">Phễu ứng tuyển ứng viên</h4>
                        <p className="text-[10px] text-gray-400">Thống kê chiến dịch tuyển dụng tổng hợp</p>
                      </div>
                      <span className="text-[10px] bg-teal-50 text-[#006b7a] font-bold px-2 py-0.5 rounded">
                        Tháng này
                      </span>
                    </div>

                    {/* Horizontal Visual Funnel Progress Bars */}
                    <div className="space-y-4 pt-2">
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-gray-600">1. Hồ sơ ứng tuyển tiếp nhận</span>
                          <span className="text-gray-800">120 CV (100%)</span>
                        </div>
                        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-teal-500 to-[#006b7a] rounded-full" style={{ width: "100%" }} />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-gray-600">2. Hồ sơ hợp lệ (Duyệt)</span>
                          <span className="text-gray-800">78 CV (65%)</span>
                        </div>
                        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-teal-500 to-[#006b7a] rounded-full opacity-85" style={{ width: "65%" }} />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-gray-600">3. Liên hệ Hẹn phỏng vấn</span>
                          <span className="text-gray-800">36 Ứng viên (30%)</span>
                        </div>
                        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-teal-500 to-[#006b7a] rounded-full opacity-70" style={{ width: "30%" }} />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-gray-600">4. Tuyển dụng thành công (Onboard)</span>
                          <span className="text-gray-800">12 Nhân sự (10%)</span>
                        </div>
                        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full" style={{ width: "10%" }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Quick shortcuts & Actions */}
                  <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-4">
                    <h4 className="text-sm font-bold text-gray-800">Phím tắt thao tác nhanh</h4>

                    <div className="grid grid-cols-1 gap-2 pt-1">
                      <button
                        onClick={() => {
                          resetForm();
                          router.push("/employer/dashboard?tab=post-job");
                        }}
                        className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-[#006b7a]/30 hover:bg-teal-50/10 text-left transition-all group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="p-1.5 rounded-lg bg-teal-50 text-[#006b7a]">
                            <Plus size={14} />
                          </span>
                          <span className="text-xs font-semibold text-gray-700">Tạo tin đăng mới</span>
                        </div>
                        <ChevronRight size={14} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                      </button>

                      <button
                        onClick={() => router.push("/employer/dashboard?tab=ai-search")}
                        className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-amber-200 hover:bg-amber-50/10 text-left transition-all group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                            <Sparkles size={14} />
                          </span>
                          <span className="text-xs font-semibold text-gray-700">Dò hồ sơ AI thông minh</span>
                        </div>
                        <ChevronRight size={14} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                      </button>

                      <button
                        onClick={() => router.push("/employer/dashboard?tab=cvs")}
                        className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 text-left transition-all group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="p-1.5 rounded-lg bg-gray-100 text-gray-600">
                            <UserCheck size={14} />
                          </span>
                          <span className="text-xs font-semibold text-gray-700">Duyệt hồ sơ chờ tiếp nhận</span>
                        </div>
                        <ChevronRight size={14} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>

                    <div className="pt-2 border-t border-gray-50 text-center">
                      <a
                        href="#service"
                        onClick={(e) => { e.preventDefault(); router.push("/employer#service"); }}
                        className="text-[11px] font-bold text-[#006b7a] hover:underline"
                      >
                        Xem bảng báo giá các gói dịch vụ tin VIP
                      </a>
                    </div>
                  </div>
                </div>

                {/* Recent Candidates List Card */}
                <div className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-gray-800">Danh sách ứng viên nộp hồ sơ gần đây</h4>
                      <p className="text-[10px] text-gray-400">Xử lý ngay hồ sơ mới tiếp nhận trong vòng 24h để tăng tỷ lệ kết nối thành công</p>
                    </div>
                    <button
                      onClick={() => router.push("/employer/dashboard?tab=cvs")}
                      className="text-xs font-bold text-[#006b7a] hover:underline flex items-center gap-0.5 cursor-pointer bg-transparent border-0"
                    >
                      Xem tất cả
                      <ChevronRight size={14} />
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 font-semibold text-gray-500 uppercase tracking-wider">
                          <th className="p-4">Ứng viên</th>
                          <th className="p-4">Vị trí tuyển dụng</th>
                          <th className="p-4">Ngày nộp</th>
                          <th className="p-4 text-center">Trạng thái</th>
                          <th className="p-4 text-right">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-medium">
                        {applicants.slice(0, 3).map((candidate) => (
                          <tr key={candidate.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="p-4">
                              <div>
                                <p className="font-bold text-gray-800">{candidate.name}</p>
                                <p className="text-[10px] text-gray-400 font-light mt-0.5">{candidate.email} • {candidate.phone}</p>
                              </div>
                            </td>
                            <td className="p-4 text-gray-600">{candidate.role}</td>
                            <td className="p-4 text-gray-500">{candidate.date}</td>
                            <td className="p-4 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${candidate.status === "Mới tiếp nhận" ? "bg-teal-50 text-[#006b7a]" :
                                candidate.status === "Hẹn phỏng vấn" ? "bg-amber-50 text-amber-600" :
                                  candidate.status === "Đã duyệt" ? "bg-emerald-50 text-emerald-600" :
                                    "bg-red-50 text-red-650"
                                }`}>
                                {candidate.status}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              {candidate.status === "Mới tiếp nhận" ? (
                                <div className="flex justify-end gap-1.5">
                                  <button
                                    onClick={() => handleUpdateStatus(candidate.id, "Đã duyệt")}
                                    className="p-1.5 rounded-lg border border-gray-200 hover:border-emerald-250 hover:bg-emerald-50 text-gray-500 hover:text-emerald-600 transition-colors cursor-pointer"
                                    title="Duyệt hồ sơ"
                                  >
                                    <Check size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleUpdateStatus(candidate.id, "Từ chối")}
                                    className="p-1.5 rounded-lg border border-gray-200 hover:border-red-250 hover:bg-red-50 text-gray-500 hover:text-red-650 transition-colors cursor-pointer"
                                    title="Từ chối"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              ) : (
                                <span className="text-gray-400 font-medium italic text-[11px] block pr-2">Đã xử lý</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: MANAGE JOB CAMPAIGNS */}
            {activeTab === "jobs" && (
              <div className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden space-y-4 p-6 select-none">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                  <div>
                    <h3 className="text-base font-bold text-gray-800">Quản lý danh sách tin tuyển dụng</h3>
                    <p className="text-xs text-gray-400">Xem, chỉnh sửa hoặc xóa chiến dịch tuyển dụng thực tế của doanh nghiệp</p>
                  </div>
                  <button
                    onClick={() => {
                      resetForm();
                      router.push("/employer/dashboard?tab=post-job");
                    }}
                    className="flex items-center gap-1.5 bg-[#006b7a] hover:bg-[#005a66] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all active:scale-[0.98] cursor-pointer border-0"
                  >
                    <Plus size={16} />
                    <span>Đăng tuyển tin mới</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 font-semibold text-gray-500 uppercase tracking-wider">
                        <th className="p-4">Tiêu đề tin tuyển</th>
                        <th className="p-4">Địa điểm</th>
                        <th className="p-4">Mức lương</th>
                        <th className="p-4">Hạn nộp</th>
                        <th className="p-4 text-center">Trạng thái duyệt</th>
                        <th className="p-4 text-center">Hiển thị</th>
                        <th className="p-4 text-center">Lượt xem</th>
                        <th className="p-4 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium">
                      {jobsLoading ? (
                        <tr>
                          <td colSpan={8} className="p-12 text-center text-gray-400">
                            <div className="flex flex-col items-center gap-2">
                              <Loader2 className="h-8 w-8 animate-spin text-[#006b7a]" />
                              <span className="text-[10px] font-bold">Đang tải danh sách tin...</span>
                            </div>
                          </td>
                        </tr>
                      ) : realJobs.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-12 text-center text-gray-400 font-semibold">
                            Bạn chưa đăng tuyển tin tuyển dụng nào! Hãy tạo tin đăng đầu tiên ngay.
                          </td>
                        </tr>
                      ) : (
                        realJobs.map((job) => (
                          <tr key={job.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="p-4">
                              <p className="font-bold text-gray-850 hover:text-[#006b7a] cursor-pointer transition-colors" onClick={() => handleEditJobClick(job)}>{job.jobTitle}</p>
                              <p className="text-[10px] text-gray-400 font-mono mt-1">Mã tin: DNJ-{job.id}</p>
                            </td>
                            <td className="p-4 text-gray-600">
                              <span className="flex items-center gap-1">
                                <MapPin size={12} className="text-[#006b7a]" />
                                {job.wardName ? `${job.wardName}, Đà Nẵng` : "Đà Nẵng"}
                              </span>
                            </td>
                            <td className="p-4 text-gray-805 font-bold">
                              {job.salaryType === "Lương thỏa thuận" || job.salaryType === "NEGOTIABLE" ? (
                                "Thỏa thuận"
                              ) : (
                                `${job.minimumSalary?.toLocaleString()} - ${job.maximumSalary?.toLocaleString()}đ`
                              )}
                            </td>
                            <td className="p-4 text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar size={12} />
                                {job.deadline ? new Date(job.deadline).toLocaleDateString("vi-VN") : "—"}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              {getApproveStatusBadge(job.approveStatus)}
                            </td>
                            <td className="p-4 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${job.visibilityStatus === "ACTIVE" ? "bg-emerald-50 text-emerald-650" : "bg-gray-100 text-gray-500"
                                }`}>
                                {job.visibilityStatus === "ACTIVE" ? "Hiển thị" : "Đang ẩn"}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <span className="font-bold text-gray-700">{job.viewCount ?? 0} views</span>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex justify-end gap-1.5">
                                <button
                                  onClick={() => handleEditJobClick(job)}
                                  className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                                  title="Chỉnh sửa tin đăng"
                                >
                                  <Edit2 size={13} />
                                </button>
                                <button
                                  onClick={() => handleDeleteJob(job.id)}
                                  disabled={actionLoading}
                                  className="p-1.5 rounded-lg border border-rose-100 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                                  title="Xóa vĩnh viễn"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between pt-4 px-2 text-xs font-semibold border-t border-gray-100">
                  <div className="text-gray-500">
                    Hiển thị trang {jobsPage + 1} / {jobsTotalPages} (Tổng cộng: {jobsTotalElements} tin tuyển dụng)
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setJobsPage((p) => Math.max(0, p - 1))}
                      disabled={jobsPage === 0 || jobsLoading}
                      className="px-3.5 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 rounded-xl shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Trang trước
                    </button>

                    <button
                      onClick={() => setJobsPage((p) => Math.min(jobsTotalPages - 1, p + 1))}
                      disabled={jobsPage >= jobsTotalPages - 1 || jobsLoading}
                      className="px-3.5 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 rounded-xl shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Trang sau
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: MANAGE CV APPLICATIONS */}
            {activeTab === "cvs" && (
              <div className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden space-y-4 p-6 select-none">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                  <div>
                    <h3 className="text-base font-bold text-gray-800">Quản lý hồ sơ ứng viên ứng tuyển</h3>
                    <p className="text-xs text-gray-400">Xem chi tiết thông tin và tải hồ sơ CV trực tuyến của ứng viên tại Đà Nẵng</p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-semibold text-gray-500 flex items-center bg-gray-50 px-3.5 py-2 rounded-xl border border-gray-150">
                      Tổng số: <strong className="text-gray-850 ml-1">{applicants.length} CV</strong>
                    </span>
                    <button
                      type="button"
                      onClick={handleExportExcel}
                      disabled={exportLoading || applicants.length === 0}
                      className="flex items-center gap-1.5 bg-[#006b7a] hover:bg-[#005a66] disabled:bg-gray-300 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer border-0"
                    >
                      {exportLoading ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                           <span>Đang xuất...</span>
                        </>
                      ) : (
                        <>
                          <FileText size={14} />
                          <span>Xuất File Excel</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Premium Segment Filters for CVs */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-gray-100 select-none text-left">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {[
                      { label: "Tất cả", value: "ALL" },
                      { label: "Mới tiếp nhận", value: "PENDING" },
                      { label: "Đã duyệt", value: "ACCEPTED" },
                      { label: "Từ chối", value: "REJECTED" },
                      { label: "Đã hủy", value: "CANCELED" }
                    ].map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setStatusFilter(item.value)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          statusFilter === item.value
                            ? "bg-[#006B7A] border-[#006B7A] text-white shadow-xs"
                            : "bg-white border-gray-200 text-gray-600 hover:text-gray-855 hover:bg-gray-50"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-150">
                    Hiển thị: <strong className="text-[#006b7a]">{filteredApplicants.length} / {applicants.length} CV</strong>
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 font-semibold text-gray-500 uppercase tracking-wider">
                        <th className="p-4">Ứng viên</th>
                        <th className="p-4">Thông tin liên lạc</th>
                        <th className="p-4">Vị trí ứng tuyển</th>
                        <th className="p-4">Ngày nộp CV</th>
                        <th className="p-4 text-center">Trạng thái</th>
                        <th className="p-4 text-right">Cập nhật trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium">
                      {filteredApplicants.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-12 text-center text-gray-400 font-bold">
                            Chưa nhận được hồ sơ CV nào thuộc danh mục này!
                          </td>
                        </tr>
                      ) : (
                        filteredApplicants.map((candidate) => (
                          <tr key={candidate.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="p-4">
                              <p className="font-bold text-gray-850">{candidate.name}</p>
                              <p className="text-[10px] text-gray-400 font-light mt-0.5">{candidate.location}</p>
                            </td>
                            <td className="p-4">
                              <div className="space-y-0.5">
                                <span className="flex items-center gap-1 text-gray-600">
                                  <Mail size={11} className="text-gray-400" />
                                  {candidate.email}
                                </span>
                                <span className="flex items-center gap-1 text-gray-600">
                                  <Phone size={11} className="text-gray-400" />
                                  {candidate.phone}
                                </span>
                              </div>
                            </td>
                            <td className="p-4 text-gray-700 font-semibold">
                              <p>{candidate.role}</p>
                              {/* If there is a resume URL, render a link */}
                              {(candidate as any).resumeFileUrl && (
                                <a
                                  href={(candidate as any).resumeFileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#006b7a] hover:underline mt-1"
                                >
                                  <FileText size={10} />
                                  <span>Xem CV đính kèm</span>
                                  <ExternalLink size={8} />
                                </a>
                              )}
                            </td>
                            <td className="p-4 text-gray-500">{candidate.date}</td>
                            <td className="p-4 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${candidate.status === "Mới tiếp nhận" ? "bg-teal-50 text-[#006b7a]" :
                                  candidate.status === "Đã duyệt" ? "bg-emerald-50 text-emerald-600" :
                                    "bg-red-50 text-red-650"
                                }`}>
                                {candidate.status}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              {candidate.status === "Mới tiếp nhận" ? (
                                <div className="flex justify-end gap-1.5 select-none">
                                  <button
                                    onClick={() => handleUpdateStatus(candidate.id, "Đã duyệt")}
                                    className="px-3.5 py-1.5 rounded-xl border border-emerald-100 hover:bg-emerald-50 text-[10px] font-bold text-emerald-650 transition-colors cursor-pointer"
                                  >
                                    Duyệt
                                  </button>
                                  <button
                                    onClick={() => handleUpdateStatus(candidate.id, "Từ chối")}
                                    className="px-3.5 py-1.5 rounded-xl border border-red-100 hover:bg-red-50 text-[10px] font-bold text-red-650 transition-colors cursor-pointer"
                                  >
                                    Từ chối
                                  </button>
                                </div>
                              ) : (
                                <span className="text-gray-400 font-medium italic text-[11px] block pr-4">Không thể chỉnh sửa</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 4: AI CANDIDATE SCANNER / TALENT SCOUTING */}
            {activeTab === "ai-search" && (
              <div className="bg-white rounded-2xl border border-gray-150 shadow-sm p-6 space-y-6">
                <div>
                  <h3 className="text-base font-bold text-gray-800 flex items-center gap-1.5">
                    <Sparkles className="text-amber-500 animate-pulse" size={20} />
                    <span>DNJ AI Core - Quét & Gợi ý ứng viên tối ưu</span>
                  </h3>
                  <p className="text-xs text-gray-400">Nhập tiêu chuẩn tuyển dụng, hệ thống AI sẽ tự động phân tích hành vi và kỹ năng để xuất ra 3 hồ sơ phù hợp nhất tại Đà Nẵng</p>
                </div>

                {/* Prompt Search Console */}
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-3">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Yêu cầu, kỹ năng hoặc vị trí cần quét</label>
                  <div className="flex gap-2">
                    <div className="relative flex-grow">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        placeholder="Ví dụ: Cần tuyển ReactJS Developer có 2 năm kinh nghiệm, kỹ năng tốt về TailwindCSS..."
                        value={scoutingQuery}
                        onChange={(e) => setScoutingQuery(e.target.value)}
                        className="w-full bg-white border border-gray-200 focus:border-[#006b7a] focus:ring-1 focus:ring-[#006b7a] rounded-xl pl-9 pr-4 py-2.5 text-xs text-gray-700 outline-none transition-all font-medium"
                      />
                    </div>
                    <button
                      onClick={handleAiSearch}
                      disabled={aiSearching}
                      className="flex items-center gap-1.5 bg-[#006b7a] hover:bg-[#005a66] disabled:bg-gray-300 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer border-0"
                    >
                      {aiSearching ? (
                        <>
                          <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                          <span>Đang phân tích...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={14} className="text-yellow-300" />
                          <span>Tìm ứng viên AI</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Progress bar loader during scan */}
                {aiSearching && (
                  <div className="p-6 border border-teal-100 rounded-xl bg-teal-50/20 space-y-3 text-center animate-pulse">
                    <p className="text-xs font-bold text-[#006b7a]">{aiStepText}</p>
                    <div className="h-2 w-full bg-gray-150 rounded-full overflow-hidden max-w-md mx-auto">
                      <div className="h-full bg-gradient-to-r from-teal-500 to-[#006b7a] rounded-full transition-all duration-300" style={{ width: `${aiProgress}%` }} />
                    </div>
                    <p className="text-[10px] text-gray-400 font-light">Quá trình dò hồ sơ có thể mất vài giây...</p>
                  </div>
                )}

                {/* AI Candidate Matching Results */}
                {!aiSearching && aiResults.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Kết quả đề xuất ứng viên phù hợp nhất</h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {aiResults.map((candidate, i) => (
                        <div key={i} className="bg-white border border-gray-150 rounded-xl p-5 hover:border-amber-250/50 hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative group">

                          {/* Matching Score Badge */}
                          <div className="absolute right-4 top-4 bg-amber-50 border border-amber-100 text-amber-600 text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-0.5">
                            <Sparkles size={10} className="text-amber-500 animate-bounce" />
                            <span>{candidate.score}% Khớp</span>
                          </div>

                          <div className="space-y-2">
                            <div className="h-9 w-9 rounded-full bg-[#006b7a]/15 text-[#006b7a] flex items-center justify-center font-bold text-sm">
                              {candidate.name.slice(0, 2).toUpperCase()}
                            </div>

                            <div>
                              <h5 className="font-bold text-gray-800 text-sm">{candidate.name}</h5>
                              <p className="text-[10px] text-[#006b7a] font-bold mt-0.5">{candidate.role}</p>
                            </div>

                            <div className="space-y-1.5 pt-2 text-[11px] text-gray-600">
                              <p className="flex items-center gap-1.5">
                                <Briefcase size={12} className="text-gray-400" />
                                <span>{candidate.exp}</span>
                              </p>
                              <p className="flex items-center gap-1.5">
                                <GraduationCap size={12} className="text-gray-400" />
                                <span className="truncate">{candidate.school}</span>
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-1 pt-2">
                              {candidate.skills.map((skill: string, index: number) => (
                                <span key={index} className="text-[9px] bg-gray-150 text-gray-600 font-bold px-1.5 py-0.5 rounded">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="pt-4 border-t border-gray-50 space-y-2.5">
                            <p className="text-[10px] text-gray-500 leading-normal italic font-light">
                              &ldquo;{candidate.matchReason}&rdquo;
                            </p>

                            <button
                              onClick={() => toast.success(`Đã gửi lời mời ứng tuyển thành công tới ứng viên ${candidate.name}`)}
                              className="w-full bg-[#006b7a] hover:bg-[#005a66] text-white text-[10px] font-bold py-2 rounded-lg transition-all active:scale-[0.98] cursor-pointer"
                            >
                              Gửi thư mời nhận việc / CV
                            </button>
                          </div>

                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: POST A NEW JOB CAMPAIGN / EDIT CAMPAIGN */}
            {activeTab === "post-job" && (
              <div className="bg-white rounded-2xl border border-gray-150 shadow-sm p-6 space-y-6 select-none">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div>
                    <h3 className="text-base font-bold text-gray-800">
                      {editingJobId ? `Chỉnh sửa chiến dịch tuyển dụng (Mã: DNJ-${editingJobId})` : "Tạo chiến dịch tuyển dụng & Đăng tuyển mới"}
                    </h3>
                    <p className="text-xs text-gray-400">Kết nối trực tuyến với hàng ngàn ứng viên Đà Nẵng chất lượng cao</p>
                  </div>
                  {editingJobId && (
                    <button
                      onClick={resetForm}
                      className="px-3.5 py-1.5 text-xs font-bold text-[#006b7a] hover:bg-teal-50 border border-teal-100 rounded-xl transition-all cursor-pointer bg-white"
                    >
                      Tạo tin mới thay thế
                    </button>
                  )}
                </div>

                <form onSubmit={handleSubmitJob} className="space-y-6 text-xs font-semibold">
                  {editingJobId && editingJobStatus === "APPROVED" && (
                    <div className="p-4.5 bg-amber-50 border border-amber-200 rounded-2xl flex gap-3 text-amber-800 text-xs font-semibold leading-relaxed mb-6 animate-in fade-in slide-in-from-top-3 duration-300">
                      <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-extrabold text-amber-900 text-sm">⚠️ Cơ chế kiểm duyệt tin đăng khi chỉnh sửa</p>
                        <p className="mt-1 text-gray-600 font-medium">
                          Tin tuyển dụng này của bạn hiện đang ở trạng thái <strong>Đã duyệt (APPROVED)</strong>. Theo quy trình hệ thống:
                        </p>
                        <ul className="list-disc pl-5 mt-1.5 space-y-1 text-gray-600 font-medium">
                          <li>Nếu bạn thay đổi các trường <span className="text-amber-800 font-extrabold underline">Tiêu đề tin</span>, <span className="text-amber-800 font-extrabold underline">Mô tả công việc</span>, <span className="text-amber-800 font-extrabold underline">Yêu cầu ứng viên</span>, <span className="text-amber-800 font-extrabold underline">Cấp bậc</span> hoặc <span className="text-amber-800 font-extrabold underline">Thông tin lương</span> (được đánh dấu <span className="bg-amber-100/80 text-amber-800 border border-amber-200 px-1 rounded text-[10px]">Cần duyệt lại</span>), tin đăng sẽ <strong>tạm thời ẩn đi (HIDDEN)</strong> và chuyển sang trạng thái <strong>Chờ duyệt lại (PENDING)</strong>.</li>
                          <li>Nếu bạn chỉ chỉnh sửa các trường khác (được đánh dấu <span className="bg-emerald-100/80 text-emerald-800 border border-emerald-200 px-1 rounded text-[10px]">Cập nhật trực tiếp</span>), các thay đổi sẽ được lưu và áp dụng công khai ngay lập tức.</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Job Title */}
                    <div className="space-y-1.5">
                      <label className="text-gray-500 uppercase tracking-wider block text-[10px] font-bold">
                        Tiêu đề tin tuyển dụng <span className="text-red-500">*</span>
                        {editingJobId && editingJobStatus === "APPROVED" && (
                          <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded font-extrabold ml-2">Cần duyệt lại</span>
                        )}
                      </label>
                      <input
                        type="text"
                        placeholder="Ví dụ: Lập trình viên React Native (Middle/Senior)"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        className="w-full bg-white border border-gray-200 focus:border-[#006b7a] focus:ring-1 focus:ring-[#006b7a] rounded-xl px-4 py-2.5 text-gray-700 outline-none transition-all"
                        required
                      />
                    </div>

                    {/* Ward Address selection */}
                    <div className="space-y-1.5">
                      <label className="text-gray-500 uppercase tracking-wider block text-[10px] font-bold">
                        Khu vực làm việc <span className="text-red-500">*</span>
                        {editingJobId && editingJobStatus === "APPROVED" && (
                          <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-250 px-1.5 py-0.5 rounded font-extrabold ml-2">Cập nhật trực tiếp</span>
                        )}
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={formDistrictId}
                          onChange={(e) => {
                            setFormDistrictId(e.target.value);
                            setFormWardId("");
                          }}
                          className="w-full bg-white border border-gray-200 focus:border-[#006b7a] focus:ring-1 focus:ring-[#006b7a] rounded-xl px-3 py-2.5 text-gray-700 outline-none transition-all cursor-pointer"
                          required
                        >
                          <option value="">-- Chọn Quận/Huyện --</option>
                          {districts.map((d) => (
                            <option key={d.id} value={d.id}>{d.districtName}</option>
                          ))}
                        </select>

                        <select
                          value={formWardId}
                          onChange={(e) => setFormWardId(e.target.value)}
                          className="w-full bg-white border border-gray-200 focus:border-[#006b7a] focus:ring-1 focus:ring-[#006b7a] rounded-xl px-3 py-2.5 text-gray-700 outline-none transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                          required
                          disabled={!formDistrictId}
                        >
                          <option value="">-- Chọn Phường/Xã --</option>
                          {wards
                            .filter((w) => w.districtId === Number(formDistrictId))
                            .map((w) => (
                              <option key={w.id} value={w.id}>{w.wardName}</option>
                            ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Position level selection */}
                    <div className="space-y-1.5">
                      <label className="text-gray-500 uppercase tracking-wider block text-[10px] font-bold">
                        Cấp bậc tuyển dụng <span className="text-red-500">*</span>
                        {editingJobId && editingJobStatus === "APPROVED" && (
                          <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded font-extrabold ml-2">Cần duyệt lại</span>
                        )}
                      </label>
                      <select
                        value={formPositionId}
                        onChange={(e) => setFormPositionId(e.target.value)}
                        className="w-full bg-white border border-gray-200 focus:border-[#006b7a] focus:ring-1 focus:ring-[#006b7a] rounded-xl px-4 py-2.5 text-gray-700 outline-none transition-all cursor-pointer"
                        required
                      >
                        <option value="">-- Chọn Cấp bậc --</option>
                        {positions.map((p) => (
                          <option key={p.id} value={p.id}>{p.positionName}</option>
                        ))}
                      </select>
                    </div>

                    {/* Experience Level selection */}
                    <div className="space-y-1.5">
                      <label className="text-gray-500 uppercase tracking-wider block text-[10px] font-bold">
                        Kinh nghiệm yêu cầu
                        {editingJobId && editingJobStatus === "APPROVED" && (
                          <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-250 px-1.5 py-0.5 rounded font-extrabold ml-2">Cập nhật trực tiếp</span>
                        )}
                      </label>
                      <select
                        value={formExperienceLevelId}
                        onChange={(e) => setFormExperienceLevelId(e.target.value)}
                        className="w-full bg-white border border-gray-200 focus:border-[#006b7a] focus:ring-1 focus:ring-[#006b7a] rounded-xl px-4 py-2.5 text-gray-700 outline-none transition-all cursor-pointer"
                      >
                        <option value="">Không yêu cầu kinh nghiệm</option>
                        {experienceLevels.map((el) => (
                          <option key={el.id} value={el.id}>{el.levelName}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Salaries form section */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-gray-500 uppercase tracking-wider block text-[10px] font-bold">
                        Hình thức lương
                        {editingJobId && editingJobStatus === "APPROVED" && (
                          <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded font-extrabold ml-2">Cần duyệt lại</span>
                        )}
                      </label>
                      <select
                        value={formSalaryType}
                        onChange={(e) => setFormSalaryType(e.target.value)}
                        className="w-full bg-white border border-gray-200 focus:border-[#006b7a] focus:ring-1 focus:ring-[#006b7a] rounded-xl px-4 py-2.5 text-gray-750 outline-none transition-all cursor-pointer"
                      >
                        <option value="Lương trong khoảng">Lương trong khoảng (Min - Max)</option>
                        <option value="Lương thỏa thuận">Lương thỏa thuận</option>
                      </select>
                    </div>

                    {formSalaryType === "Lương trong khoảng" && (
                      <>
                        <div className="space-y-1.5">
                          <label className="text-gray-500 uppercase tracking-wider block text-[10px] font-bold">
                            Lương tối thiểu (VNĐ) <span className="text-red-500">*</span>
                            {editingJobId && editingJobStatus === "APPROVED" && (
                              <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded font-extrabold ml-2">Cần duyệt lại</span>
                            )}
                          </label>
                          <input
                            type="number"
                            value={formMinSalary}
                            onChange={(e) => setFormMinSalary(Number(e.target.value))}
                            className="w-full bg-white border border-gray-200 focus:border-[#006b7a] focus:ring-1 focus:ring-[#006b7a] rounded-xl px-4 py-2.5 text-gray-700 outline-none transition-all"
                            min={0}
                            required
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-gray-500 uppercase tracking-wider block text-[10px] font-bold">
                            Lương tối đa (VNĐ) <span className="text-red-500">*</span>
                            {editingJobId && editingJobStatus === "APPROVED" && (
                              <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded font-extrabold ml-2">Cần duyệt lại</span>
                            )}
                          </label>
                          <input
                            type="number"
                            value={formMaxSalary}
                            onChange={(e) => setFormMaxSalary(Number(e.target.value))}
                            className="w-full bg-white border border-gray-200 focus:border-[#006b7a] focus:ring-1 focus:ring-[#006b7a] rounded-xl px-4 py-2.5 text-gray-700 outline-none transition-all"
                            min={0}
                            required
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Specific address street */}
                    <div className="space-y-1.5">
                      <label className="text-gray-500 uppercase tracking-wider block text-[10px] font-bold">
                        Địa chỉ làm việc cụ thể <span className="text-red-500">*</span>
                        {editingJobId && editingJobStatus === "APPROVED" && (
                          <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-250 px-1.5 py-0.5 rounded font-extrabold ml-2">Cập nhật trực tiếp</span>
                        )}
                      </label>
                      <input
                        type="text"
                        placeholder="Ví dụ: 120 Nguyễn Văn Linh"
                        value={formAddress}
                        onChange={(e) => setFormAddress(e.target.value)}
                        className="w-full bg-white border border-gray-200 focus:border-[#006b7a] focus:ring-1 focus:ring-[#006b7a] rounded-xl px-4 py-2.5 text-gray-700 outline-none transition-all"
                        required
                      />
                    </div>

                    {/* Hạn nhận hồ sơ */}
                    <div className="space-y-1.5">
                      <label className="text-gray-500 uppercase tracking-wider block text-[10px] font-bold">
                        Hạn cuối nhận hồ sơ <span className="text-red-500">*</span>
                        {editingJobId && editingJobStatus === "APPROVED" && (
                          <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-250 px-1.5 py-0.5 rounded font-extrabold ml-2">Cập nhật trực tiếp</span>
                        )}
                      </label>
                      <input
                        type="date"
                        value={formDeadline}
                        onChange={(e) => setFormDeadline(e.target.value)}
                        className="w-full bg-white border border-gray-200 focus:border-[#006b7a] focus:ring-1 focus:ring-[#006b7a] rounded-xl px-4 py-2.5 text-gray-700 outline-none transition-all cursor-pointer"
                        required
                      />
                    </div>
                  </div>

                  {/* Multi-select check tags for Categories */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-4">
                      <label className="text-gray-500 uppercase tracking-wider block text-[10px] font-bold">
                        Ngành nghề tuyển dụng (Chọn nhiều)
                        {editingJobId && editingJobStatus === "APPROVED" && (
                          <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-250 px-1.5 py-0.5 rounded font-extrabold ml-2">Cập nhật trực tiếp</span>
                        )}
                      </label>
                      <div className="relative w-48 shrink-0">
                        <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold" />
                        <input
                          type="text"
                          placeholder="Tìm nhanh ngành nghề..."
                          value={categorySearch}
                          onChange={(e) => setCategorySearch(e.target.value)}
                          className="w-full pl-7 pr-6 py-1 bg-gray-55 focus:bg-white border border-gray-200 focus:border-[#006b7a] rounded-lg text-[10px] font-bold outline-none transition-all"
                        />
                        {categorySearch && (
                          <button
                            type="button"
                            onClick={() => setCategorySearch("")}
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                          >
                            <X size={10} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="max-h-80 overflow-y-auto p-4 space-y-3.5 custom-scrollbar bg-gray-50/20 rounded-2xl">
                      {categorySearch.trim() !== "" ? (
                        /* Searching: Show flat filtered categories with hierarchical paths */
                        (() => {
                          const matches = getMatchingCategories(categoriesTree, categorySearch);
                          return matches.length === 0 ? (
                            <p className="text-[11px] text-gray-400 font-medium py-6 text-center">Không tìm thấy danh mục nào phù hợp.</p>
                          ) : (
                            <div className="grid grid-cols-1 gap-2 text-left">
                              {matches.map((match) => {
                                const isSelected = formCategoryIds.includes(match.id);
                                return (
                                  <label
                                    key={match.id}
                                    className={`flex items-center gap-3 p-3.5 rounded-xl hover:bg-teal-50/10 cursor-pointer transition-all select-none ${isSelected ? "bg-teal-50/30" : "bg-white"}`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => handleToggleSubcategory(match.id)}
                                      className="rounded border-gray-300 text-[#006B7A] focus:ring-[#006B7A] w-4 h-4 cursor-pointer"
                                    />
                                    <div className="space-y-0.5">
                                      <span className="text-xs font-bold text-gray-800 leading-snug">{match.name}</span>
                                      <p className="text-[10px] text-gray-400 font-semibold">{match.path}</p>
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          );
                        })()
                      ) : (
                        /* Not searching: Show Tree with Collapsible Groups & Checkboxes (Supports 3 levels) */
                        categoriesTree.length === 0 ? (
                          <div className="py-6 text-center text-gray-400 font-light text-xs animate-pulse">
                            Đang tải sơ đồ ngành nghề...
                          </div>
                        ) : (
                          <div className="space-y-2.5 animate-fadeIn">
                            {categoriesTree.map((catGroup) => {
                              const isExpanded = expandedCategoryGroups.includes(catGroup.id);
                              const status = getCategorySelectionStatus(catGroup, formCategoryIds);
                              const isAnySelected = status === "all" || status === "partial";

                              return (
                                <div key={catGroup.id} className="rounded-2xl bg-white overflow-hidden shadow-2xs">
                                  {/* Parent Row - Level 1 */}
                                  <div
                                    onClick={() => {
                                      setExpandedCategoryGroups(prev =>
                                        prev.includes(catGroup.id)
                                          ? prev.filter(id => id !== catGroup.id)
                                          : [...prev, catGroup.id]
                                      );
                                    }}
                                    className="flex items-center justify-between p-3.5 hover:bg-gray-50/50 cursor-pointer select-none transition-colors"
                                  >
                                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                      {/* Green Custom Checkbox */}
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleToggleCategoryGroup(catGroup);
                                        }}
                                        className="focus:outline-none flex-shrink-0 cursor-pointer flex items-center justify-center transition-all bg-transparent border-none p-0"
                                      >
                                        {status === "all" ? (
                                          <div className="w-[18px] h-[18px] border-2 border-[#006B7A] rounded flex items-center justify-center bg-[#006B7A] text-white shadow-3xs">
                                            <Check size={11} className="stroke-[3.5]" />
                                          </div>
                                        ) : status === "partial" ? (
                                          <div className="w-[18px] h-[18px] border-2 border-[#006B7A] rounded flex items-center justify-center bg-[#006B7A]/15 text-[#006B7A]">
                                            <div className="w-2 h-0.5 bg-[#006B7A] rounded-full"></div>
                                          </div>
                                        ) : (
                                          <div className="w-[18px] h-[18px] border border-gray-300 rounded hover:border-[#006B7A] bg-white"></div>
                                        )}
                                      </button>
                                      <span className={`text-[12px] font-bold truncate leading-none ${isAnySelected ? "text-[#006B7A]" : "text-gray-700"}`}>
                                        {catGroup.categoryName}
                                      </span>
                                    </div>

                                    <div className={`text-gray-400 transition-transform ${isExpanded ? "transform rotate-180" : ""}`}>
                                      <ChevronDown size={14} className="stroke-[2.5]" />
                                    </div>
                                  </div>

                                  {/* Children Panel - Level 2 & Level 3 */}
                                  {isExpanded && (
                                    <div className="bg-gray-50/30 border-t border-gray-100 p-3.5 pl-6.5 space-y-3 animate-fadeIn">
                                      {!catGroup.children || catGroup.children.length === 0 ? (
                                        <p className="text-[11px] text-gray-400 font-medium py-1">Chưa có danh mục con</p>
                                      ) : (
                                        catGroup.children.map((subcat) => {
                                          const hasLevel3 = subcat.children && subcat.children.length > 0;
                                          const subcatStatus = getCategorySelectionStatus(subcat, formCategoryIds);
                                          const isAnySubcatSelected = subcatStatus === "all" || subcatStatus === "partial";

                                          if (hasLevel3) {
                                            return (
                                              <div key={subcat.id} className="bg-white rounded-xl p-3 space-y-2.5 text-left shadow-3xs">
                                                {/* Level 2 Subcategory Header */}
                                                <div
                                                  onClick={() => handleToggleCategoryGroup(subcat)}
                                                  className="flex items-center gap-2 pb-2 border-b border-gray-100 select-none cursor-pointer hover:opacity-80 transition-opacity"
                                                >
                                                  <button
                                                    type="button"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      handleToggleCategoryGroup(subcat);
                                                    }}
                                                    className="focus:outline-none flex-shrink-0 cursor-pointer flex items-center justify-center transition-all bg-transparent border-none p-0"
                                                  >
                                                    {subcatStatus === "all" ? (
                                                      <div className="w-[16px] h-[16px] border-2 border-[#006B7A] rounded flex items-center justify-center bg-[#006B7A] text-white shadow-3xs">
                                                        <Check size={10} className="stroke-[4]" />
                                                      </div>
                                                    ) : subcatStatus === "partial" ? (
                                                      <div className="w-[16px] h-[16px] border-2 border-[#006B7A] rounded flex items-center justify-center bg-[#006B7A]/15 text-[#006B7A]">
                                                        <div className="w-1.5 h-0.5 bg-[#006B7A] rounded-full"></div>
                                                      </div>
                                                    ) : (
                                                      <div className="w-[16px] h-[16px] border border-gray-300 rounded hover:border-[#006B7A] bg-white"></div>
                                                    )}
                                                  </button>
                                                  <span className={`text-[11.5px] font-bold ${isAnySubcatSelected ? "text-[#006B7A]" : "text-gray-700"}`}>
                                                    {subcat.categoryName}
                                                  </span>
                                                </div>

                                                {/* Level 3 Leaves grid */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-1.5">
                                                  {subcat.children!.map((level3Node) => {
                                                    const isLevel3Selected = formCategoryIds.includes(level3Node.id);
                                                    return (
                                                      <div
                                                        key={level3Node.id}
                                                        onClick={() => handleToggleSubcategory(level3Node.id)}
                                                        className="flex items-center gap-2 cursor-pointer select-none py-0.5 text-left"
                                                      >
                                                        <div className="focus:outline-none flex-shrink-0 flex items-center justify-center transition-all bg-transparent border-none p-0">
                                                          {isLevel3Selected ? (
                                                            <div className="w-3.5 h-3.5 border border-[#006B7A] rounded flex items-center justify-center bg-[#006B7A] text-white shadow-3xs">
                                                              <Check size={8} className="stroke-[4.5]" />
                                                            </div>
                                                          ) : (
                                                            <div className="w-3.5 h-3.5 border border-gray-300 rounded hover:border-[#006B7A] bg-white"></div>
                                                          )}
                                                        </div>
                                                        <span className={`text-[11px] transition-colors leading-tight ${isLevel3Selected ? "font-bold text-[#006B7A]" : "font-medium text-gray-500 hover:text-gray-700"}`}>
                                                          {level3Node.categoryName}
                                                        </span>
                                                      </div>
                                                    );
                                                  })}
                                                </div>
                                              </div>
                                            );
                                          }

                                          // If no level 3, render simple leaf subcategory (Level 2)
                                          const isSubcatSelected = subcatStatus === "all";
                                          return (
                                            <div
                                              key={subcat.id}
                                              onClick={() => handleToggleSubcategory(subcat.id)}
                                              className="flex items-center gap-2.5 cursor-pointer select-none py-1 text-left pl-1.5"
                                            >
                                              <div className="focus:outline-none flex-shrink-0 flex items-center justify-center transition-all bg-transparent border-none p-0">
                                                {isSubcatSelected ? (
                                                  <div className="w-4 h-4 border-2 border-[#006B7A] rounded flex items-center justify-center bg-[#006B7A] text-white shadow-3xs">
                                                    <Check size={9} className="stroke-[4]" />
                                                  </div>
                                                ) : (
                                                  <div className="w-4 h-4 border border-gray-300 rounded hover:border-[#006B7A] bg-white"></div>
                                                )}
                                              </div>
                                              <span className={`text-[11.5px] transition-colors ${isSubcatSelected ? "font-bold text-[#006B7A]" : "font-semibold text-gray-600 hover:text-gray-800"}`}>
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
                      )}
                    </div>
                  </div>

                  {/* Multi-select check tags for Skills */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-4">
                      <label className="text-gray-500 uppercase tracking-wider block text-[10px] font-bold">
                        Kỹ năng yêu cầu (Chọn nhiều)
                        {editingJobId && editingJobStatus === "APPROVED" && (
                          <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-250 px-1.5 py-0.5 rounded font-extrabold ml-2">Cập nhật trực tiếp</span>
                        )}
                      </label>
                      <div className="relative w-48 shrink-0">
                        <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold" />
                        <input
                          type="text"
                          placeholder="Tìm nhanh kỹ năng..."
                          value={skillSearch}
                          onChange={(e) => setSkillSearch(e.target.value)}
                          className="w-full pl-7 pr-6 py-1 bg-gray-55 focus:bg-white border border-gray-200 focus:border-[#006b7a] rounded-lg text-[10px] font-bold outline-none transition-all"
                        />
                        {skillSearch && (
                          <button
                            type="button"
                            onClick={() => setSkillSearch("")}
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                          >
                            <X size={10} />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-2.5 bg-gray-50 border border-gray-200 rounded-2xl custom-scrollbar">
                      {skills
                        .filter((s) => s.skillName.toLowerCase().includes(skillSearch.toLowerCase()))
                        .map((s) => {
                          const isChecked = formSkillIds.includes(s.id);
                        return (
                          <label key={s.id} className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer select-none transition-all active:scale-[0.97] ${
                            isChecked ? "bg-sky-50 border-sky-200 text-sky-700" : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                          }`}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormSkillIds(prev => [...prev, s.id]);
                                } else {
                                  setFormSkillIds(prev => prev.filter(id => id !== s.id));
                                }
                              }}
                              className="sr-only"
                            />
                            <span>{s.skillName}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Multi-select check tags for Tags */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-4">
                      <label className="text-gray-500 uppercase tracking-wider block text-[10px] font-bold">
                        Nhãn dán tag liên quan (Chọn nhiều)
                        {editingJobId && editingJobStatus === "APPROVED" && (
                          <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-250 px-1.5 py-0.5 rounded font-extrabold ml-2">Cập nhật trực tiếp</span>
                        )}
                      </label>
                      <div className="relative w-48 shrink-0">
                        <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold" />
                        <input
                          type="text"
                          placeholder="Tìm nhanh nhãn dán..."
                          value={tagSearch}
                          onChange={(e) => setTagSearch(e.target.value)}
                          className="w-full pl-7 pr-6 py-1 bg-gray-55 focus:bg-white border border-gray-200 focus:border-[#006b7a] rounded-lg text-[10px] font-bold outline-none transition-all"
                        />
                        {tagSearch && (
                          <button
                            type="button"
                            onClick={() => setTagSearch("")}
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                          >
                            <X size={10} />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-2.5 bg-gray-50 border border-gray-200 rounded-2xl custom-scrollbar">
                      {tags
                        .filter((t) => t.tagName.toLowerCase().includes(tagSearch.toLowerCase()))
                        .map((t) => {
                          const isChecked = formTagIds.includes(t.id);
                        return (
                          <label key={t.id} className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer select-none transition-all active:scale-[0.97] ${
                            isChecked ? "bg-purple-50 border-purple-200 text-purple-700" : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                          }`}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormTagIds(prev => [...prev, t.id]);
                                } else {
                                  setFormTagIds(prev => prev.filter(id => id !== t.id));
                                }
                              }}
                              className="sr-only"
                            />
                            <span>#{t.tagName}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <label className="text-gray-500 uppercase tracking-wider block text-[10px] font-bold">
                      Mô tả công việc <span className="text-red-500">*</span>
                      {editingJobId && editingJobStatus === "APPROVED" && (
                        <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded font-extrabold ml-2">Cần duyệt lại</span>
                      )}
                    </label>
                    <textarea
                      rows={5}
                      placeholder="- Phát triển ứng dụng di động đa nền tảng bằng React Native.&#10;- Xây dựng các UI components đẹp mắt và tối ưu hóa hiệu năng ứng dụng..."
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      className="w-full bg-white border border-gray-200 focus:border-[#006b7a] focus:ring-1 focus:ring-[#006b7a] rounded-xl px-4 py-2.5 text-gray-700 outline-none transition-all font-medium leading-relaxed"
                      required
                    />
                  </div>

                  {/* Requirements */}
                  <div className="space-y-1.5">
                    <label className="text-gray-500 uppercase tracking-wider block text-[10px] font-bold">
                      Yêu cầu ứng viên <span className="text-red-500">*</span>
                      {editingJobId && editingJobStatus === "APPROVED" && (
                        <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded font-extrabold ml-2">Cần duyệt lại</span>
                      )}
                    </label>
                    <textarea
                      rows={4}
                      placeholder="- Tối thiểu 2 năm kinh nghiệm làm việc với React Native di động.&#10;- Nắm vững JavaScript/TypeScript, hiểu biết tốt về Redux, hooks..."
                      value={formRequirements}
                      onChange={(e) => setFormRequirements(e.target.value)}
                      className="w-full bg-white border border-gray-200 focus:border-[#006b7a] focus:ring-1 focus:ring-[#006b7a] rounded-xl px-4 py-2.5 text-gray-700 outline-none transition-all font-medium leading-relaxed"
                      required
                    />
                  </div>

                  {/* Quyền lợi */}
                  <div className="space-y-1.5">
                    <label className="text-gray-500 uppercase tracking-wider block text-[10px] font-bold">
                      Quyền lợi được hưởng
                      {editingJobId && editingJobStatus === "APPROVED" && (
                        <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-250 px-1.5 py-0.5 rounded font-extrabold ml-2">Cập nhật trực tiếp</span>
                      )}
                    </label>
                    <textarea
                      rows={4}
                      placeholder="- Mức lương cạnh tranh kèm tháng lương thứ 13 + thưởng hiệu quả công việc.&#10;- Được đóng đầy đủ BHXH, BHYT và bảo hiểm chăm sóc sức khỏe riêng..."
                      value={formBenefits}
                      onChange={(e) => setFormBenefits(e.target.value)}
                      className="w-full bg-white border border-gray-200 focus:border-[#006b7a] focus:ring-1 focus:ring-[#006b7a] rounded-xl px-4 py-2.5 text-gray-700 outline-none transition-all font-medium leading-relaxed"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-end gap-2 pt-2 border-t border-gray-50 select-none">
                    <button
                      type="button"
                      onClick={() => {
                        resetForm();
                        router.push("/employer/dashboard?tab=jobs");
                      }}
                      className="px-5 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl font-bold transition-all active:scale-[0.98] cursor-pointer"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="bg-[#006b7a] hover:bg-[#005a66] text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer flex items-center gap-1 border-0"
                    >
                      {actionLoading ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          <span>Đang xử lý...</span>
                        </>
                      ) : (
                        <span>{editingJobId ? "Cập nhật tin đăng" : "Đăng tuyển ngay"}</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 6: COMPANY PROFILE SHOWCASE */}
            {activeTab === "company" && (
              <div className="bg-white rounded-2xl border border-gray-150 shadow-sm p-6 space-y-8 select-none">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                  <div>
                    <h3 className="text-base font-extrabold text-gray-800">Hồ sơ doanh nghiệp tuyển dụng</h3>
                    <p className="text-xs text-gray-400">Xem và quản lý thông tin thương hiệu hiển thị với các ứng viên</p>
                  </div>
                  <button
                    onClick={() => router.push("/employer/onboarding")}
                    className="flex items-center gap-1.5 bg-[#006b7a] hover:bg-[#005a66] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer border-0"
                  >
                    <Edit2 size={15} />
                    <span>Cập nhật thông tin</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left part: Logo Card */}
                  <div className="flex flex-col items-center text-center p-6 bg-gray-50/50 rounded-2xl border border-gray-150/50 space-y-4">
                    <div className="h-24 w-24 rounded-2xl bg-white border border-gray-150 flex items-center justify-center font-extrabold text-3xl text-[#006b7a] shadow-xs overflow-hidden">
                      {companyDetails.logoUrl ? (
                        <img src={companyDetails.logoUrl} alt="Logo" className="h-full w-full object-cover" />
                      ) : (
                        companyDetails.name ? companyDetails.name.slice(0, 2).toUpperCase() : "DN"
                      )}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base text-gray-800 leading-snug">{companyDetails.name}</h4>
                      <p className="text-[10px] text-teal-600 bg-teal-50 border border-teal-150 mt-2 font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block">Đã Xác Minh</p>
                    </div>
                  </div>

                  {/* Right part: Details Grid */}
                  <div className="lg:col-span-2 space-y-6 text-xs text-gray-600 font-semibold font-sans">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Mã số thuế</p>
                        <p className="font-bold text-gray-800 text-sm font-mono">{companyDetails.taxCode || "—"}</p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Quy mô nhân sự</p>
                        <p className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                          <Users size={14} className="text-gray-400" />
                          {companyDetails.size}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Địa chỉ trang Web</p>
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
                            "Chưa có website"
                          )}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Số điện thoại liên hệ</p>
                        <p className="font-bold text-gray-800 text-sm flex items-center gap-1">
                          <Phone size={13} className="text-gray-400" />
                          {companyDetails.phoneNumber || "—"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-4 border-t border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Địa chỉ trụ sở chính</p>
                      <p className="font-bold text-gray-700 flex items-start gap-1 text-sm">
                        <MapPin size={15} className="text-red-500 mt-0.5 flex-shrink-0" />
                        <span>{companyDetails.address || "Chưa cập nhật"}</span>
                      </p>
                    </div>

                    <div className="space-y-1.5 pt-4 border-t border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Giấy phép đăng ký kinh doanh (PDF)</p>
                      {companyDetails.businessLicense ? (
                        <a
                          href={companyDetails.businessLicense}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[#006b7a] hover:underline font-bold bg-[#006b7a]/5 px-3 py-2 rounded-xl mt-1"
                        >
                          <FileText size={15} className="text-red-500" />
                          <span>Xem tài liệu PDF giấy phép kinh doanh</span>
                        </a>
                      ) : (
                        <p className="font-bold text-gray-500 italic">Chưa tải tài liệu PDF lên</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Company Description */}
                <div className="space-y-2 pt-6 border-t border-gray-100 text-xs">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Giới thiệu ngắn hoạt động</p>
                  <p className="font-medium text-gray-600 leading-relaxed bg-gray-50/50 p-4 rounded-xl border border-gray-100 whitespace-pre-wrap">
                    {companyDetails.about || "Chưa có thông tin giới thiệu công ty."}
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* Recruiter Footing */}
      <EmployerFooter />
    </div>
  );
}

export default function EmployerDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-t-[#006b7a] border-gray-200" />
          <p className="text-gray-500 font-medium text-sm">Đang tải trang điều khiển tuyển dụng...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
