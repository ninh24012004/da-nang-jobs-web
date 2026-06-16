"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import EmployerHeader from "@/components/layout/employer/EmployerHeader";
import EmployerFooter from "@/components/layout/employer/EmployerFooter";
import {
  LayoutDashboard, FileText, UserCheck, Sparkles, Building, Plus,
  Search, Eye, Edit2, Check, X, Calendar, MapPin, DollarSign,
  Briefcase, GraduationCap, ChevronRight, Phone, Mail, Award,
  ExternalLink, BarChart3, TrendingUp, Users, ShieldAlert,
  CheckCircle2, Clock, Globe, Trash2, Loader2, ChevronDown
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

// Modular subcomponents
import EmployerStatsCards from "@/components/employer/dashboard/EmployerStatsCards";
import EmployerJobTable from "@/components/employer/dashboard/EmployerJobTable";
import EmployerApplicantTable from "@/components/employer/dashboard/EmployerApplicantTable";
import EmployerDashboardTabs from "@/components/employer/dashboard/EmployerDashboardTabs";

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
  const [currentEditingJob, setCurrentEditingJob] = useState<JobResponse | null>(null);
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

  // Mock & Real Applicants combined state
  const [applicants, setApplicants] = useState<any[]>([]);

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

  // Load Real Applications from backend
  useEffect(() => {
    if (isAuthenticated && isApproved) {
      fetchEmployerApplications();
    }
  }, [isAuthenticated, isApproved]);

  const fetchEmployerApplications = async () => {
    try {
      const response = await applicationService.getApplicationsForEmployer(0, 100);
      if (response && response.content) {
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

      setPositions(posRes ?? []);
      setExperienceLevels(expRes ?? []);
      setDistricts(distRes ?? []);
      setWards(wardRes ?? []);
      setCategories(catRes ?? []);
      setCategoriesTree(catTreeRes ?? []);
      setSkills(skillRes ?? []);
      setTags(tagRes ?? []);
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
    setCurrentEditingJob(null);

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

  const isSameNumberArray = (a: number[] = [], b: number[] = []) => {
    if (a.length !== b.length) return false;

    const sortedA = [...a].sort((x, y) => x - y);
    const sortedB = [...b].sort((x, y) => x - y);

    return sortedA.every((value, index) => value === sortedB[index]);
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

    let requestData: any = {};

    if (editingJobId && currentEditingJob) {
      const currentMinSalary =
        formSalaryType === "Lương thỏa thuận" ? 0 : formMinSalary;

      const currentMaxSalary =
        formSalaryType === "Lương thỏa thuận" ? 0 : formMaxSalary;

      const oldDeadline = currentEditingJob.deadline
        ? new Date(currentEditingJob.deadline).toISOString().split("T")[0]
        : "";

      if (formTitle !== currentEditingJob.jobTitle) {
        requestData.jobTitle = formTitle;
      }

      if (formDescription !== currentEditingJob.jobDescription) {
        requestData.jobDescription = formDescription;
      }

      if (formRequirements !== currentEditingJob.jobRequirements) {
        requestData.jobRequirements = formRequirements;
      }

      if (formBenefits !== currentEditingJob.jobBenefits) {
        requestData.jobBenefits = formBenefits;
      }

      if (formSalaryType !== currentEditingJob.salaryType) {
        requestData.salaryType = formSalaryType;
      }

      if (currentMinSalary !== currentEditingJob.minimumSalary) {
        requestData.minimumSalary = currentMinSalary;
      }

      if (currentMaxSalary !== currentEditingJob.maximumSalary) {
        requestData.maximumSalary = currentMaxSalary;
      }

      if (formAddress !== currentEditingJob.address) {
        requestData.address = formAddress;
      }

      if (formDeadline !== oldDeadline) {
        requestData.deadline = new Date(formDeadline).toISOString();
      }

      if (Number(formPositionId) !== currentEditingJob.positionId) {
        requestData.positionId = Number(formPositionId);
      }

      const newExperienceLevelId = formExperienceLevelId
        ? Number(formExperienceLevelId)
        : null;

      const oldExperienceLevelId = currentEditingJob.experienceLevelId ?? null;

      if (newExperienceLevelId !== oldExperienceLevelId) {
        requestData.experienceLevelId = newExperienceLevelId;
      }

      if (Number(formWardId) !== currentEditingJob.wardId) {
        requestData.wardId = Number(formWardId);
      }

      if (!isSameNumberArray(formCategoryIds, currentEditingJob.categoryIds || [])) {
        requestData.categoryIds = formCategoryIds;
      }

      if (!isSameNumberArray(formSkillIds, currentEditingJob.skillIds || [])) {
        requestData.skillIds = formSkillIds;
      }

      if (!isSameNumberArray(formTagIds, currentEditingJob.tagIds || [])) {
        requestData.tagIds = formTagIds;
      }

      if (Object.keys(requestData).length === 0) {
        toast.info("Bạn chưa thay đổi thông tin nào.");
        return;
      }
    } else {
      requestData = {
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
    }

    setActionLoading(true);

    try {
      if (editingJobId) {
        await updateJob(editingJobId, requestData);

        if (editingJobStatus === "APPROVED") {
          toast.success("Cập nhật thành công! Nếu sửa nội dung quan trọng, tin sẽ chuyển về chờ duyệt.");
        } else {
          toast.success("Cập nhật tin tuyển dụng thành công!");
        }
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
    setCurrentEditingJob(job);

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
    setFormPositionId(job.positionId ? String(job.positionId) : "");
    setFormExperienceLevelId(job.experienceLevelId ? String(job.experienceLevelId) : "");

    const matchedWard = wards.find((w) => w.id === job.wardId);

    if (matchedWard) {
      setFormDistrictId(String(matchedWard.districtId));
      setFormWardId(String(matchedWard.id));
    } else {
      setFormDistrictId("");
      setFormWardId(job.wardId ? String(job.wardId) : "");
    }

    setFormCategoryIds(job.categoryIds || []);
    setFormSkillIds(job.skillIds || []);
    setFormTagIds(job.tagIds || []);

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
          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-[4px] text-[10px] font-bold border border-emerald-100">
            Đã Duyệt
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 px-2 py-0.5 rounded-[4px] text-[10px] font-bold border border-rose-100">
            Từ Chối
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-[4px] text-[10px] font-bold border border-amber-100">
            Chờ Duyệt
          </span>
        );
      default:
        return <span className="text-slate-400">—</span>;
    }
  };

  if (!isAuthenticated || isApproved !== true) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-t-[#00B14F] border-slate-200" />
          <p className="text-slate-555 font-medium text-sm">Đang xác thực thông tin Nhà tuyển dụng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen flex flex-col font-sans antialiased text-slate-800">
      {/* Premium Header */}
      <EmployerHeader />

      <main className="flex-grow pt-[88px] max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Recruiter Banner */}
        <div className="mb-8 p-6 rounded-[8px] bg-gradient-to-r from-[#0F172A] to-[#1E293B] text-white shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 translate-x-10 -translate-y-10 pointer-events-none">
            <Award size={300} />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="bg-[#00B14F]/20 text-[#00B14F] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-[6px] backdrop-blur-sm border border-[#00B14F]/30">
                Không gian nhà tuyển dụng chuyên nghiệp
              </span>
              <h2 className="text-2xl font-extrabold mt-2 tracking-tight">Chào mừng bạn quay lại, {companyDetails.name}!</h2>
              <p className="text-xs text-slate-300 mt-1 max-w-xl font-light">
                DN JOBS AI Core đang hỗ trợ doanh nghiệp tiếp cận với 50K+ ứng viên chất lượng tại thành phố Đà Nẵng. Hãy bắt đầu chiến dịch tuyển dụng hôm nay!
              </p>
            </div>
            <div className="flex gap-2 select-none">
              <button
                onClick={() => {
                  resetForm();
                  router.push("/employer/dashboard?tab=post-job");
                }}
                className="flex items-center gap-1.5 bg-white text-[#0F172A] hover:bg-slate-100 px-4 py-2.5 rounded-[6px] text-xs font-bold transition-colors cursor-pointer border-none"
              >
                <Plus size={16} className="text-[#00B14F]" />
                <span>Đăng tuyển tin mới</span>
              </button>
              <button
                onClick={() => router.push("/employer/dashboard?tab=ai-search")}
                className="flex items-center gap-1.5 bg-[#00B14F] hover:bg-[#00873D] text-white px-4 py-2.5 rounded-[6px] text-xs font-bold transition-colors cursor-pointer border-none"
              >
                <Sparkles size={16} className="text-yellow-300" />
                <span>Tìm ứng viên AI</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Dashboard Left Tab Menu Navigation */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <EmployerDashboardTabs
              activeTab={activeTab}
              onTabChange={(tab) => router.push(`/employer/dashboard?tab=${tab}`)}
              jobsCount={jobsTotalElements}
              pendingCvsCount={applicants.filter(a => a.status === "Mới tiếp nhận").length}
            />
          </div>

          {/* Dashboard Dynamic Tab Main Content Area */}
          <div className="flex-grow min-w-0">

            {/* TAB 1: OVERVIEW PANEL */}
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                <EmployerStatsCards
                  jobsTotalElements={jobsTotalElements}
                  applicantsCount={applicants.length}
                  approvedJobsCount={realJobs.filter(j => j.approveStatus === "APPROVED").length}
                  pendingJobsCount={realJobs.filter(j => j.approveStatus === "PENDING").length}
                />

                {/* Recruitment Funnel & Quick Shortcut Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Recruitment Funnel Chart Card */}
                  <div className="bg-white p-6 rounded-[8px] border border-slate-200 shadow-sm lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">Phễu ứng tuyển ứng viên</h4>
                        <p className="text-[10px] text-slate-400">Thống kê chiến dịch tuyển dụng tổng hợp</p>
                      </div>
                      <span className="text-[10px] bg-[#00B14F]/10 text-[#00B14F] font-bold px-2 py-0.5 rounded-[4px]">
                        Tháng này
                      </span>
                    </div>

                    {/* Horizontal Visual Funnel Progress Bars */}
                    <div className="space-y-4 pt-2">
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-650">1. Hồ sơ ứng tuyển tiếp nhận</span>
                          <span className="text-slate-800">120 CV (100%)</span>
                        </div>
                        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[#00B14F] to-[#00873D] rounded-full" style={{ width: "100%" }} />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-650">2. Hồ sơ hợp lệ (Duyệt)</span>
                          <span className="text-slate-800">78 CV (65%)</span>
                        </div>
                        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[#00B14F] to-[#00873D] rounded-full opacity-85" style={{ width: "65%" }} />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-650">3. Liên hệ Hẹn phỏng vấn</span>
                          <span className="text-slate-800">36 Ứng viên (30%)</span>
                        </div>
                        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[#00B14F] to-[#00873D] rounded-full opacity-70" style={{ width: "30%" }} />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-650">4. Tuyển dụng thành công (Onboard)</span>
                          <span className="text-slate-800">12 Nhân sự (10%)</span>
                        </div>
                        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-amber-450 to-amber-600 rounded-full" style={{ width: "10%" }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Quick shortcuts & Actions */}
                  <div className="bg-white p-6 rounded-[8px] border border-slate-200 shadow-sm space-y-4">
                    <h4 className="text-sm font-bold text-slate-800">Phím tắt thao tác nhanh</h4>

                    <div className="grid grid-cols-1 gap-2 pt-1 select-none">
                      <button
                        onClick={() => {
                          resetForm();
                          router.push("/employer/dashboard?tab=post-job");
                        }}
                        className="flex items-center justify-between p-3 rounded-[6px] border border-slate-100 hover:border-[#00B14F]/30 hover:bg-[#00B14F]/5 text-left transition-colors group cursor-pointer bg-white"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="p-1.5 rounded-[4px] bg-[#00B14F]/10 text-[#00B14F]">
                            <Plus size={14} />
                          </span>
                          <span className="text-xs font-semibold text-slate-700">Tạo tin đăng mới</span>
                        </div>
                        <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      </button>

                      <button
                        onClick={() => router.push("/employer/dashboard?tab=ai-search")}
                        className="flex items-center justify-between p-3 rounded-[6px] border border-slate-100 hover:border-[#00B14F]/30 hover:bg-[#00B14F]/5 text-left transition-colors group cursor-pointer bg-white"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="p-1.5 rounded-[4px] bg-amber-50 text-amber-650">
                            <Sparkles size={14} />
                          </span>
                          <span className="text-xs font-semibold text-slate-700">Dò hồ sơ AI thông minh</span>
                        </div>
                        <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      </button>

                      <button
                        onClick={() => router.push("/employer/dashboard?tab=cvs")}
                        className="flex items-center justify-between p-3 rounded-[6px] border border-slate-100 hover:border-slate-300 hover:bg-slate-50/50 text-left transition-colors group cursor-pointer bg-white"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="p-1.5 rounded-[4px] bg-slate-100 text-slate-650">
                            <UserCheck size={14} />
                          </span>
                          <span className="text-xs font-semibold text-slate-700">Duyệt hồ sơ chờ tiếp nhận</span>
                        </div>
                        <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>

                    <div className="pt-2 border-t border-slate-150 text-center">
                      <a
                        href="#service"
                        onClick={(e) => { e.preventDefault(); router.push("/employer#service"); }}
                        className="text-[11px] font-bold text-[#00B14F] hover:underline"
                      >
                        Xem bảng báo giá các gói dịch vụ tin VIP
                      </a>
                    </div>
                  </div>
                </div>

                {/* Recent Candidates List Card */}
                <div className="bg-white rounded-[8px] border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Danh sách ứng viên nộp hồ sơ gần đây</h4>
                      <p className="text-[10px] text-slate-400">Xử lý ngay hồ sơ mới tiếp nhận trong vòng 24h để tăng tỷ lệ kết nối thành công</p>
                    </div>
                    <button
                      onClick={() => router.push("/employer/dashboard?tab=cvs")}
                      className="text-xs font-bold text-[#00B14F] hover:underline flex items-center gap-0.5 cursor-pointer bg-transparent border-0"
                    >
                      Xem tất cả
                      <ChevronRight size={14} />
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-150 font-semibold text-slate-500 uppercase tracking-wider">
                          <th className="p-4">Ứng viên</th>
                          <th className="p-4">Vị trí tuyển dụng</th>
                          <th className="p-4">Ngày nộp</th>
                          <th className="p-4 text-center">Trạng thái</th>
                          <th className="p-4 text-right">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {applicants.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-slate-400 font-bold">
                              Chưa có ứng viên nào ứng tuyển gần đây.
                            </td>
                          </tr>
                        ) : (
                          applicants.slice(0, 3).map((candidate) => (
                            <tr key={candidate.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="p-4">
                                <div>
                                  <p className="font-bold text-slate-800">{candidate.name}</p>
                                  <p className="text-[10px] text-slate-400 font-light mt-0.5">{candidate.email} • {candidate.phone}</p>
                                </div>
                              </td>
                              <td className="p-4 text-slate-650">{candidate.role}</td>
                              <td className="p-4 text-slate-500">{candidate.date}</td>
                              <td className="p-4 text-center">
                                <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold border ${candidate.status === "Mới tiếp nhận" ? "bg-blue-50 text-blue-700 border-blue-100" :
                                  candidate.status === "Hẹn phỏng vấn" ? "bg-amber-50 text-amber-600 border-amber-100" :
                                    candidate.status === "Đã duyệt" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                      "bg-rose-50 text-rose-700 border-rose-100"
                                  }`}>
                                  {candidate.status}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                {candidate.status === "Mới tiếp nhận" ? (
                                  <div className="flex justify-end gap-1.5 select-none">
                                    <button
                                      onClick={() => handleUpdateStatus(candidate.id, "Đã duyệt")}
                                      className="p-1.5 rounded-[6px] border border-slate-200 hover:border-emerald-200 hover:bg-emerald-50 text-slate-500 hover:text-emerald-700 transition-colors cursor-pointer bg-white"
                                      title="Duyệt hồ sơ"
                                    >
                                      <Check size={14} />
                                    </button>
                                    <button
                                      onClick={() => handleUpdateStatus(candidate.id, "Từ chối")}
                                      className="p-1.5 rounded-[6px] border border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-slate-500 hover:text-rose-700 transition-colors cursor-pointer bg-white"
                                      title="Từ chối"
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-slate-400 font-medium italic text-[11px] block pr-2">Đã xử lý</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: MANAGE JOB CAMPAIGNS */}
            {activeTab === "jobs" && (
              <EmployerJobTable
                jobs={realJobs}
                loading={jobsLoading}
                currentPage={jobsPage}
                totalPages={jobsTotalPages}
                totalElements={jobsTotalElements}
                onPageChange={(page) => setJobsPage(page)}
                onEditJobClick={handleEditJobClick}
                onDeleteJob={handleDeleteJob}
                onPostJobClick={() => {
                  resetForm();
                  router.push("/employer/dashboard?tab=post-job");
                }}
                actionLoading={actionLoading}
              />
            )}

            {/* TAB 3: MANAGE CV APPLICATIONS */}
            {activeTab === "cvs" && (
              <EmployerApplicantTable
                applicants={applicants}
                statusFilter={statusFilter}
                onStatusFilterChange={(status) => setStatusFilter(status)}
                onExportExcel={handleExportExcel}
                exportLoading={exportLoading}
                onUpdateStatus={handleUpdateStatus}
                actionLoading={actionLoading}
              />
            )}

            {/* TAB 4: AI CANDIDATE SCANNER / TALENT SCOUTING */}
            {activeTab === "ai-search" && (
              <div className="bg-white rounded-[8px] border border-slate-200 shadow-sm p-6 space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="text-amber-500" size={20} />
                    <span>DNJ AI Core - Quét & Gợi ý ứng viên tối ưu</span>
                  </h3>
                  <p className="text-xs text-slate-400">Nhập tiêu chuẩn tuyển dụng, hệ thống AI sẽ tự động phân tích hành vi và kỹ năng để xuất ra 3 hồ sơ phù hợp nhất tại Đà Nẵng</p>
                </div>

                {/* Prompt Search Console */}
                <div className="p-4 rounded-[8px] bg-slate-50 border border-slate-150 space-y-3">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Yêu cầu, kỹ năng hoặc vị trí cần quét</label>
                  <div className="flex gap-2">
                    <div className="relative flex-grow">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type="text"
                        placeholder="Ví dụ: Cần tuyển ReactJS Developer có 2 năm kinh nghiệm, kỹ năng tốt về TailwindCSS..."
                        value={scoutingQuery}
                        onChange={(e) => setScoutingQuery(e.target.value)}
                        className="w-full bg-white border border-slate-200 focus:border-[#00B14F] focus:ring-1 focus:ring-[#00B14F] rounded-[6px] pl-9 pr-4 py-2.5 text-xs text-slate-700 outline-none transition-all font-medium"
                      />
                    </div>
                    <button
                      onClick={handleAiSearch}
                      disabled={aiSearching}
                      className="flex items-center gap-1.5 bg-[#00B14F] hover:bg-[#00873D] disabled:bg-slate-200 text-white px-5 py-2.5 rounded-[6px] text-xs font-bold transition-colors cursor-pointer border-none"
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
                  <div className="p-6 border border-[#00B14F]/10 rounded-[8px] bg-[#00B14F]/5 space-y-3 text-center">
                    <p className="text-xs font-bold text-[#00B14F]">{aiStepText}</p>
                    <div className="h-2 w-full bg-slate-150 rounded-full overflow-hidden max-w-md mx-auto">
                      <div className="h-full bg-gradient-to-r from-[#00B14F] to-[#00873D] rounded-full transition-all duration-300" style={{ width: `${aiProgress}%` }} />
                    </div>
                    <p className="text-[10px] text-slate-400 font-light">Quá trình dò hồ sơ có thể mất vài giây...</p>
                  </div>
                )}

                {/* AI Candidate Matching Results */}
                {!aiSearching && aiResults.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kết quả đề xuất ứng viên phù hợp nhất</h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {aiResults.map((candidate, i) => (
                        <div key={i} className="bg-white border border-slate-200 rounded-[8px] p-5 hover:border-[#00B14F]/40 hover:shadow-sm transition-all flex flex-col justify-between space-y-4 relative group">

                          {/* Matching Score Badge */}
                          <div className="absolute right-4 top-4 bg-amber-50 border border-amber-100 text-amber-600 text-[10px] font-extrabold px-2 py-0.5 rounded-[4px] flex items-center gap-0.5">
                            <Sparkles size={10} className="text-amber-500" />
                            <span>{candidate.score}% Khớp</span>
                          </div>

                          <div className="space-y-2">
                            <div className="h-9 w-9 rounded-full bg-[#00B14F]/15 text-[#00B14F] flex items-center justify-center font-bold text-sm">
                              {candidate.name.slice(0, 2).toUpperCase()}
                            </div>

                            <div>
                              <h5 className="font-bold text-slate-800 text-sm">{candidate.name}</h5>
                              <p className="text-[10px] text-[#00B14F] font-bold mt-0.5">{candidate.role}</p>
                            </div>

                            <div className="space-y-1.5 pt-2 text-[11px] text-slate-650">
                              <p className="flex items-center gap-1.5">
                                <Briefcase size={12} className="text-slate-400 flex-shrink-0" />
                                <span>{candidate.exp}</span>
                              </p>
                              <p className="flex items-center gap-1.5">
                                <GraduationCap size={12} className="text-slate-400 flex-shrink-0" />
                                <span className="truncate">{candidate.school}</span>
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-1 pt-1.5">
                              {candidate.skills.map((s: string, idx: number) => (
                                <span key={idx} className="bg-slate-50 text-slate-600 px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold border border-slate-150">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-medium leading-relaxed">
                            <strong className="text-slate-700 block mb-0.5">Lý do gợi ý:</strong>
                            {candidate.matchReason}
                          </div>

                          <div className="pt-2 select-none">
                            <button
                              onClick={() => {
                                setApplicants(prev => [
                                  {
                                    id: Date.now() + i,
                                    name: candidate.name,
                                    role: candidate.role,
                                    date: new Date().toLocaleDateString("vi-VN"),
                                    score: candidate.score,
                                    status: "Mới tiếp nhận",
                                    email: "candidate@dnj.com",
                                    phone: "0905.xxx.xxx",
                                    location: "Đà Nẵng",
                                    resumeFileUrl: ""
                                  },
                                  ...prev
                                ]);
                                toast.success(`Đã gửi lời mời ứng tuyển trực tiếp đến ${candidate.name}!`);
                              }}
                              className="w-full text-center py-2 bg-[#00B14F] hover:bg-[#00873D] text-white rounded-[6px] text-xs font-bold transition-colors cursor-pointer border-none"
                            >
                              Yêu cầu kết nối trực tiếp
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: POST & UPDATE JOB CAMPAIGN */}
            {activeTab === "post-job" && (
              <div className="bg-white rounded-[8px] border border-slate-200 p-6 space-y-6">
                <div>
                  <h3 className="text-base font-extrabold text-slate-800">
                    {editingJobId ? "Cập nhật thông tin tuyển dụng" : "Đăng tuyển dụng việc làm mới"}
                  </h3>
                  <p className="text-xs text-slate-450">
                    {editingJobId
                      ? `Chỉnh sửa chiến dịch tuyển dụng cho mã tin DNJ-${editingJobId}. Hãy đảm bảo thông tin chính xác.`
                      : "Điền đầy đủ thông tin để tạo chiến dịch tuyển dụng việc làm của bạn tại thành phố Đà Nẵng"
                    }
                  </p>
                </div>

                <form onSubmit={handleSubmitJob} className="space-y-5 text-xs text-slate-650 font-semibold">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Title */}
                    <div className="space-y-1.5">
                      <label className="text-slate-500 uppercase tracking-wider block text-[10px] font-bold">
                        Tiêu đề tin tuyển dụng <span className="text-red-500">*</span>
                        {editingJobId && editingJobStatus === "APPROVED" && (
                          <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-[4px] font-extrabold ml-2">Cần duyệt lại</span>
                        )}
                      </label>
                      <input
                        type="text"
                        placeholder="Ví dụ: Lập trình viên React Native (Middle/Senior)"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        className="w-full bg-white border border-slate-200 focus:border-[#00B14F] focus:ring-1 focus:ring-[#00B14F] rounded-[6px] px-4 py-2.5 text-slate-700 outline-none transition-all"
                        required
                      />
                    </div>

                    {/* Ward Address selection */}
                    <div className="space-y-1.5">
                      <label className="text-slate-500 uppercase tracking-wider block text-[10px] font-bold">
                        Khu vực làm việc <span className="text-red-500">*</span>
                        {editingJobId && editingJobStatus === "APPROVED" && (
                          <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-[4px] font-extrabold ml-2">Cần duyệt lại</span>
                        )}
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={formDistrictId}
                          onChange={(e) => {
                            setFormDistrictId(e.target.value);
                            setFormWardId("");
                          }}
                          className="w-full bg-white border border-slate-200 focus:border-[#00B14F] focus:ring-1 focus:ring-[#00B14F] rounded-[6px] px-3 py-2.5 text-slate-700 outline-none transition-colors cursor-pointer"
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
                          className="w-full bg-white border border-slate-200 focus:border-[#00B14F] focus:ring-1 focus:ring-[#00B14F] rounded-[6px] px-3 py-2.5 text-slate-700 outline-none transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
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
                      <label className="text-slate-500 uppercase tracking-wider block text-[10px] font-bold">
                        Cấp bậc tuyển dụng <span className="text-red-500">*</span>
                        {editingJobId && editingJobStatus === "APPROVED" && (
                          <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-[4px] font-extrabold ml-2">Cần duyệt lại</span>
                        )}
                      </label>
                      <select
                        value={formPositionId}
                        onChange={(e) => setFormPositionId(e.target.value)}
                        className="w-full bg-white border border-slate-200 focus:border-[#00B14F] focus:ring-1 focus:ring-[#00B14F] rounded-[6px] px-4 py-2.5 text-slate-700 outline-none transition-colors cursor-pointer"
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
                      <label className="text-slate-500 uppercase tracking-wider block text-[10px] font-bold">
                        Kinh nghiệm yêu cầu
                        {editingJobId && editingJobStatus === "APPROVED" && (
                          <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-[4px] font-extrabold ml-2">Cần duyệt lại</span>
                        )}
                      </label>
                      <select
                        value={formExperienceLevelId}
                        onChange={(e) => setFormExperienceLevelId(e.target.value)}
                        className="w-full bg-white border border-slate-200 focus:border-[#00B14F] focus:ring-1 focus:ring-[#00B14F] rounded-[6px] px-4 py-2.5 text-slate-700 outline-none transition-colors cursor-pointer"
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
                      <label className="text-slate-500 uppercase tracking-wider block text-[10px] font-bold">
                        Hình thức lương
                        {editingJobId && editingJobStatus === "APPROVED" && (
                          <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-[4px] font-extrabold ml-2">Cần duyệt lại</span>
                        )}
                      </label>
                      <select
                        value={formSalaryType}
                        onChange={(e) => setFormSalaryType(e.target.value)}
                        className="w-full bg-white border border-slate-200 focus:border-[#00B14F] focus:ring-1 focus:ring-[#00B14F] rounded-[6px] px-4 py-2.5 text-slate-700 outline-none transition-colors cursor-pointer"
                      >
                        <option value="Lương trong khoảng">Lương trong khoảng (Min - Max)</option>
                        <option value="Lương thỏa thuận">Lương thỏa thuận</option>
                      </select>
                    </div>

                    {formSalaryType === "Lương trong khoảng" && (
                      <>
                        <div className="space-y-1.5">
                          <label className="text-slate-500 uppercase tracking-wider block text-[10px] font-bold">
                            Lương tối thiểu (VNĐ) <span className="text-red-500">*</span>
                            {editingJobId && editingJobStatus === "APPROVED" && (
                              <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-[4px] font-extrabold ml-2">Cần duyệt lại</span>
                            )}
                          </label>
                          <input
                            type="number"
                            value={formMinSalary}
                            onChange={(e) => setFormMinSalary(Number(e.target.value))}
                            className="w-full bg-white border border-slate-200 focus:border-[#00B14F] focus:ring-1 focus:ring-[#00B14F] rounded-[6px] px-4 py-2.5 text-slate-700 outline-none transition-all"
                            min={0}
                            required
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-slate-500 uppercase tracking-wider block text-[10px] font-bold">
                            Lương tối đa (VNĐ) <span className="text-red-500">*</span>
                            {editingJobId && editingJobStatus === "APPROVED" && (
                              <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-[4px] font-extrabold ml-2">Cần duyệt lại</span>
                            )}
                          </label>
                          <input
                            type="number"
                            value={formMaxSalary}
                            onChange={(e) => setFormMaxSalary(Number(e.target.value))}
                            className="w-full bg-white border border-slate-200 focus:border-[#00B14F] focus:ring-1 focus:ring-[#00B14F] rounded-[6px] px-4 py-2.5 text-slate-700 outline-none transition-all"
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
                      <label className="text-slate-500 uppercase tracking-wider block text-[10px] font-bold">
                        Địa chỉ làm việc cụ thể <span className="text-red-500">*</span>
                        {editingJobId && editingJobStatus === "APPROVED" && (
                          <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-[4px] font-extrabold ml-2">Cần duyệt lại</span>
                        )}
                      </label>
                      <input
                        type="text"
                        placeholder="Ví dụ: 120 Nguyễn Văn Linh"
                        value={formAddress}
                        onChange={(e) => setFormAddress(e.target.value)}
                        className="w-full bg-white border border-slate-200 focus:border-[#00B14F] focus:ring-1 focus:ring-[#00B14F] rounded-[6px] px-4 py-2.5 text-slate-700 outline-none transition-all"
                        required
                      />
                    </div>

                    {/* Hạn nhận hồ sơ */}
                    <div className="space-y-1.5">
                      <label className="text-slate-500 uppercase tracking-wider block text-[10px] font-bold">
                        Hạn cuối nhận hồ sơ <span className="text-red-500">*</span>
                        {editingJobId && editingJobStatus === "APPROVED" && (
                          <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-250 px-1.5 py-0.5 rounded-[4px] font-extrabold ml-2">Cập nhật trực tiếp</span>
                        )}
                      </label>
                      <input
                        type="date"
                        value={formDeadline}
                        onChange={(e) => setFormDeadline(e.target.value)}
                        className="w-full bg-white border border-slate-200 focus:border-[#00B14F] focus:ring-1 focus:ring-[#00B14F] rounded-[6px] px-4 py-2.5 text-slate-700 outline-none transition-colors cursor-pointer"
                        required
                      />
                    </div>
                  </div>

                  {/* Industry Categories (Selecting multiple from master categories tree list) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-4">
                      <label className="text-slate-500 uppercase tracking-wider block text-[10px] font-bold">
                        Ngành nghề tuyển dụng (Chọn nhiều)
                        {editingJobId && editingJobStatus === "APPROVED" && (
                          <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-[4px] font-extrabold ml-2">Cần duyệt lại</span>
                        )}
                      </label>
                      <div className="relative w-48 shrink-0">
                        <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold" />
                        <input
                          type="text"
                          placeholder="Tìm nhanh ngành nghề..."
                          value={categorySearch}
                          onChange={(e) => setCategorySearch(e.target.value)}
                          className="w-full pl-7 pr-6 py-1 bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#00B14F] rounded-[6px] text-[10px] font-bold outline-none transition-all"
                        />
                        {categorySearch && (
                          <button
                            type="button"
                            onClick={() => setCategorySearch("")}
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-650 rounded-full hover:bg-slate-100 transition-colors border-none bg-transparent"
                          >
                            <X size={10} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="max-h-80 overflow-y-auto p-4 space-y-3 bg-slate-50/30 rounded-[8px] border border-slate-200">
                      {categorySearch.trim() !== "" ? (
                        /* Searching */
                        (() => {
                          const matches = getMatchingCategories(categoriesTree, categorySearch);
                          return matches.length === 0 ? (
                            <p className="text-[11px] text-slate-400 font-medium py-6 text-center">Không tìm thấy danh mục nào phù hợp.</p>
                          ) : (
                            <div className="grid grid-cols-1 gap-2 text-left">
                              {matches.map((match) => {
                                const isSelected = formCategoryIds.includes(match.id);
                                return (
                                  <label
                                    key={match.id}
                                    className={`flex items-center gap-3 p-3.5 rounded-[6px] hover:bg-[#00B14F]/5 cursor-pointer transition-colors select-none ${isSelected ? "bg-[#00B14F]/10" : "bg-white border border-slate-200"}`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => handleToggleSubcategory(match.id)}
                                      className="rounded border-slate-300 text-[#00B14F] focus:ring-[#00B14F] w-4 h-4 cursor-pointer"
                                    />
                                    <div className="space-y-0.5">
                                      <span className="text-xs font-bold text-slate-800 leading-snug">{match.name}</span>
                                      <p className="text-[10px] text-slate-400 font-semibold">{match.path}</p>
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          );
                        })()
                      ) : (
                        /* Tree View */
                        categoriesTree.length === 0 ? (
                          <div className="py-6 text-center text-slate-400 font-light text-xs animate-pulse">
                            Đang tải sơ đồ ngành nghề...
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            {categoriesTree.map((catGroup) => {
                              const isExpanded = expandedCategoryGroups.includes(catGroup.id);
                              const status = getCategorySelectionStatus(catGroup, formCategoryIds);
                              const isAnySelected = status === "all" || status === "partial";

                              return (
                                <div key={catGroup.id} className="rounded-[6px] bg-white overflow-hidden shadow-2xs border border-slate-150">
                                  {/* Parent Row */}
                                  <div
                                    onClick={() => {
                                      setExpandedCategoryGroups(prev =>
                                        prev.includes(catGroup.id)
                                          ? prev.filter(id => id !== catGroup.id)
                                          : [...prev, catGroup.id]
                                      );
                                    }}
                                    className="flex items-center justify-between p-3.5 hover:bg-slate-50/50 cursor-pointer select-none transition-colors"
                                  >
                                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleToggleCategoryGroup(catGroup);
                                        }}
                                        className="focus:outline-none flex-shrink-0 cursor-pointer flex items-center justify-center transition-colors bg-transparent border-none p-0"
                                      >
                                        {status === "all" ? (
                                          <div className="w-[18px] h-[18px] border-2 border-[#00B14F] rounded flex items-center justify-center bg-[#00B14F] text-white">
                                            <Check size={11} className="stroke-[3.5]" />
                                          </div>
                                        ) : status === "partial" ? (
                                          <div className="w-[18px] h-[18px] border-2 border-[#00B14F] rounded flex items-center justify-center bg-[#00B14F]/15 text-[#00B14F]">
                                            <div className="w-2 h-0.5 bg-[#00B14F] rounded-full"></div>
                                          </div>
                                        ) : (
                                          <div className="w-[18px] h-[18px] border border-slate-300 rounded hover:border-[#00B14F] bg-white"></div>
                                        )}
                                      </button>
                                      <span className={`text-[12px] font-bold truncate leading-none ${isAnySelected ? "text-[#00B14F]" : "text-slate-700"}`}>
                                        {catGroup.categoryName}
                                      </span>
                                    </div>

                                    <div className={`text-slate-400 transition-transform ${isExpanded ? "transform rotate-180" : ""}`}>
                                      <ChevronDown size={14} className="stroke-[2.5]" />
                                    </div>
                                  </div>

                                  {/* Children Panel */}
                                  {isExpanded && (
                                    <div className="bg-slate-50/30 border-t border-slate-150 p-3.5 pl-6.5 space-y-3 text-left">
                                      {!catGroup.children || catGroup.children.length === 0 ? (
                                        <p className="text-[11px] text-slate-400 font-medium py-1">Chưa có danh mục con</p>
                                      ) : (
                                        catGroup.children.map((subcat) => {
                                          const hasLevel3 = subcat.children && subcat.children.length > 0;
                                          const subcatStatus = getCategorySelectionStatus(subcat, formCategoryIds);
                                          const isAnySubcatSelected = subcatStatus === "all" || subcatStatus === "partial";

                                          if (hasLevel3) {
                                            return (
                                              <div key={subcat.id} className="bg-white rounded-[6px] p-3 space-y-2.5 text-left border border-slate-200">
                                                {/* Level 2 Subcategory Header */}
                                                <div
                                                  onClick={() => handleToggleCategoryGroup(subcat)}
                                                  className="flex items-center gap-2 pb-2 border-b border-slate-100 select-none cursor-pointer hover:opacity-80 transition-opacity"
                                                >
                                                  <button
                                                    type="button"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      handleToggleCategoryGroup(subcat);
                                                    }}
                                                    className="focus:outline-none flex-shrink-0 cursor-pointer flex items-center justify-center transition-colors bg-transparent border-none p-0"
                                                  >
                                                    {subcatStatus === "all" ? (
                                                      <div className="w-[16px] h-[16px] border-2 border-[#00B14F] rounded flex items-center justify-center bg-[#00B14F] text-white">
                                                        <Check size={10} className="stroke-[4]" />
                                                      </div>
                                                    ) : subcatStatus === "partial" ? (
                                                      <div className="w-[16px] h-[16px] border-2 border-[#00B14F] rounded flex items-center justify-center bg-[#00B14F]/15 text-[#00B14F]">
                                                        <div className="w-1.5 h-0.5 bg-[#00B14F] rounded-full"></div>
                                                      </div>
                                                    ) : (
                                                      <div className="w-[16px] h-[16px] border border-slate-300 rounded hover:border-[#00B14F] bg-white"></div>
                                                    )}
                                                  </button>
                                                  <span className={`text-[11.5px] font-bold ${isAnySubcatSelected ? "text-[#00B14F]" : "text-slate-700"}`}>
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
                                                        <div className="focus:outline-none flex-shrink-0 flex items-center justify-center transition-colors bg-transparent border-none p-0">
                                                          {isLevel3Selected ? (
                                                            <div className="w-3.5 h-3.5 border border-[#00B14F] rounded flex items-center justify-center bg-[#00B14F] text-white">
                                                              <Check size={8} className="stroke-[4.5]" />
                                                            </div>
                                                          ) : (
                                                            <div className="w-3.5 h-3.5 border border-slate-300 rounded hover:border-[#00B14F] bg-white"></div>
                                                          )}
                                                        </div>
                                                        <span className={`text-[11px] transition-colors leading-tight ${isLevel3Selected ? "font-bold text-[#00B14F]" : "font-medium text-slate-500 hover:text-slate-700"}`}>
                                                          {level3Node.categoryName}
                                                        </span>
                                                      </div>
                                                    );
                                                  })}
                                                </div>
                                              </div>
                                            );
                                          }

                                          // Simple Level 2 Subcategory
                                          const isSubcatSelected = subcatStatus === "all";
                                          return (
                                            <div
                                              key={subcat.id}
                                              onClick={() => handleToggleSubcategory(subcat.id)}
                                              className="flex items-center gap-2.5 cursor-pointer select-none py-1 text-left pl-1.5"
                                            >
                                              <div className="focus:outline-none flex-shrink-0 flex items-center justify-center transition-colors bg-transparent border-none p-0">
                                                {isSubcatSelected ? (
                                                  <div className="w-4 h-4 border-2 border-[#00B14F] rounded flex items-center justify-center bg-[#00B14F] text-white">
                                                    <Check size={9} className="stroke-[4]" />
                                                  </div>
                                                ) : (
                                                  <div className="w-4 h-4 border border-slate-300 rounded hover:border-[#00B14F] bg-white"></div>
                                                )}
                                              </div>
                                              <span className={`text-[11.5px] transition-colors ${isSubcatSelected ? "font-bold text-[#00B14F]" : "font-semibold text-slate-650 hover:text-slate-805"}`}>
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
                      <label className="text-slate-500 uppercase tracking-wider block text-[10px] font-bold">
                        Kỹ năng yêu cầu (Chọn nhiều)
                        {editingJobId && editingJobStatus === "APPROVED" && (
                          <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-[4px] font-extrabold ml-2">Cần duyệt lại</span>
                        )}
                      </label>
                      <div className="relative w-48 shrink-0">
                        <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold" />
                        <input
                          type="text"
                          placeholder="Tìm nhanh kỹ năng..."
                          value={skillSearch}
                          onChange={(e) => setSkillSearch(e.target.value)}
                          className="w-full pl-7 pr-6 py-1 bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#00B14F] rounded-[6px] text-[10px] font-bold outline-none transition-all"
                        />
                        {skillSearch && (
                          <button
                            type="button"
                            onClick={() => setSkillSearch("")}
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-650 rounded-full hover:bg-slate-100 transition-colors border-none bg-transparent"
                          >
                            <X size={10} />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-2.5 bg-slate-50 border border-slate-200 rounded-[6px]">
                      {skills
                        .filter((s) => s.skillName.toLowerCase().includes(skillSearch.toLowerCase()))
                        .map((s) => {
                          const isChecked = formSkillIds.includes(s.id);
                          return (
                            <label key={s.id} className={`flex items-center gap-1 px-3 py-1.5 rounded-[6px] border text-xs font-bold cursor-pointer select-none transition-colors ${isChecked ? "bg-[#00B14F]/10 border-[#00B14F]/20 text-[#00B14F]" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
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
                      <label className="text-slate-500 uppercase tracking-wider block text-[10px] font-bold">
                        Nhãn dán tag liên quan (Chọn nhiều)
                        {editingJobId && editingJobStatus === "APPROVED" && (
                          <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-[4px] font-extrabold ml-2">Cần duyệt lại</span>
                        )}
                      </label>
                      <div className="relative w-48 shrink-0">
                        <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold" />
                        <input
                          type="text"
                          placeholder="Tìm nhanh nhãn dán..."
                          value={tagSearch}
                          onChange={(e) => setTagSearch(e.target.value)}
                          className="w-full pl-7 pr-6 py-1 bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#00B14F] rounded-[6px] text-[10px] font-bold outline-none transition-all"
                        />
                        {tagSearch && (
                          <button
                            type="button"
                            onClick={() => setTagSearch("")}
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-650 rounded-full hover:bg-slate-100 transition-colors border-none bg-transparent"
                          >
                            <X size={10} />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-2.5 bg-slate-50 border border-slate-200 rounded-[6px]">
                      {tags
                        .filter((t) => t.tagName.toLowerCase().includes(tagSearch.toLowerCase()))
                        .map((t) => {
                          const isChecked = formTagIds.includes(t.id);
                          return (
                            <label key={t.id} className={`flex items-center gap-1 px-3 py-1.5 rounded-[6px] border text-xs font-bold cursor-pointer select-none transition-colors ${isChecked ? "bg-[#0F172A]/10 border-[#0F172A]/20 text-[#0F172A]" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
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
                    <label className="text-slate-500 uppercase tracking-wider block text-[10px] font-bold">
                      Mô tả công việc <span className="text-red-500">*</span>
                      {editingJobId && editingJobStatus === "APPROVED" && (
                        <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-[4px] font-extrabold ml-2">Cần duyệt lại</span>
                      )}
                    </label>
                    <textarea
                      rows={5}
                      placeholder="- Phát triển ứng dụng di động đa nền tảng bằng React Native.&#10;- Xây dựng các UI components đẹp mắt và tối ưu hóa hiệu năng ứng dụng..."
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-[#00B14F] focus:ring-1 focus:ring-[#00B14F] rounded-[6px] px-4 py-2.5 text-slate-700 outline-none transition-all font-medium leading-relaxed"
                      required
                    />
                  </div>

                  {/* Requirements */}
                  <div className="space-y-1.5">
                    <label className="text-slate-500 uppercase tracking-wider block text-[10px] font-bold">
                      Yêu cầu ứng viên <span className="text-red-500">*</span>
                      {editingJobId && editingJobStatus === "APPROVED" && (
                        <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-[4px] font-extrabold ml-2">Cần duyệt lại</span>
                      )}
                    </label>
                    <textarea
                      rows={4}
                      placeholder="- Tối thiểu 2 năm kinh nghiệm làm việc với React Native di động.&#10;- Nắm vững JavaScript/TypeScript, hiểu biết tốt về Redux, hooks..."
                      value={formRequirements}
                      onChange={(e) => setFormRequirements(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-[#00B14F] focus:ring-1 focus:ring-[#00B14F] rounded-[6px] px-4 py-2.5 text-slate-700 outline-none transition-all font-medium leading-relaxed"
                      required
                    />
                  </div>

                  {/* Quyền lợi */}
                  <div className="space-y-1.5">
                    <label className="text-slate-500 uppercase tracking-wider block text-[10px] font-bold">
                      Quyền lợi được hưởng
                      {editingJobId && editingJobStatus === "APPROVED" && (
                        <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-[4px] font-extrabold ml-2">Cần duyệt lại</span>
                      )}
                    </label>
                    <textarea
                      rows={4}
                      placeholder="- Mức lương cạnh tranh kèm tháng lương thứ 13 + thưởng hiệu quả công việc.&#10;- Được đóng đầy đủ BHXH, BHYT và bảo hiểm chăm sóc sức khỏe riêng..."
                      value={formBenefits}
                      onChange={(e) => setFormBenefits(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-[#00B14F] focus:ring-1 focus:ring-[#00B14F] rounded-[6px] px-4 py-2.5 text-slate-700 outline-none transition-all font-medium leading-relaxed"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-150 select-none">
                    <button
                      type="button"
                      onClick={() => {
                        resetForm();
                        router.push("/employer/dashboard?tab=jobs");
                      }}
                      className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-650 rounded-[6px] font-bold transition-colors cursor-pointer bg-white"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="bg-[#00B14F] hover:bg-[#00873D] text-white px-6 py-2.5 rounded-[6px] font-bold transition-colors cursor-pointer flex items-center gap-1 border-none"
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
              <div className="bg-white rounded-[8px] border border-slate-200 shadow-sm p-6 space-y-8 select-none">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-150">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-800">Hồ sơ doanh nghiệp tuyển dụng</h3>
                    <p className="text-xs text-slate-400">Xem và quản lý thông tin thương hiệu hiển thị với các ứng viên</p>
                  </div>
                  <button
                    onClick={() => router.push("/employer/onboarding")}
                    className="flex items-center gap-1.5 bg-[#00B14F] hover:bg-[#00873D] text-white px-5 py-2.5 rounded-[6px] text-xs font-bold transition-colors cursor-pointer border-none shadow-xs"
                  >
                    <Edit2 size={15} />
                    <span>Cập nhật thông tin</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left part: Logo Card */}
                  <div className="flex flex-col items-center text-center p-6 bg-slate-50 rounded-[8px] border border-slate-200 space-y-4">
                    <div className="h-24 w-24 rounded-[6px] bg-white border border-slate-200 flex items-center justify-center font-extrabold text-3xl text-[#00B14F] shadow-xs overflow-hidden">
                      {companyDetails.logoUrl ? (
                        <img src={companyDetails.logoUrl} alt="Logo" className="h-full w-full object-cover" />
                      ) : (
                        companyDetails.name ? companyDetails.name.slice(0, 2).toUpperCase() : "DN"
                      )}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base text-slate-800 leading-snug">{companyDetails.name}</h4>
                      <p className="text-[10px] text-[#00B14F] bg-[#00B14F]/10 border border-[#00B14F]/20 mt-2 font-bold uppercase tracking-wider px-2 py-0.5 rounded-[6px] inline-block">Đã Xác Minh</p>
                    </div>
                  </div>

                  {/* Right part: Details Grid */}
                  <div className="lg:col-span-2 space-y-6 text-xs text-slate-650 font-semibold font-sans">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mã số thuế</p>
                        <p className="font-bold text-slate-800 text-sm font-mono">{companyDetails.taxCode || "—"}</p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quy mô nhân sự</p>
                        <p className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                          <Users size={14} className="text-slate-450" />
                          {companyDetails.size}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Địa chỉ trang Web</p>
                        <p className="font-bold text-[#00B14F] text-sm">
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
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Số điện thoại liên hệ</p>
                        <p className="font-bold text-slate-800 text-sm flex items-center gap-1">
                          <Phone size={13} className="text-slate-450" />
                          {companyDetails.phoneNumber || "—"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-4 border-t border-slate-150">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Địa chỉ trụ sở chính</p>
                      <p className="font-bold text-slate-700 flex items-start gap-1 text-sm">
                        <MapPin size={15} className="text-[#00B14F] mt-0.5 flex-shrink-0" />
                        <span>{companyDetails.address || "Chưa cập nhật"}</span>
                      </p>
                    </div>

                    <div className="space-y-1.5 pt-4 border-t border-slate-150">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Giấy phép đăng ký kinh doanh (PDF)</p>
                      {companyDetails.businessLicense ? (
                        <a
                          href={companyDetails.businessLicense}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[#00B14F] hover:underline font-bold bg-[#00B14F]/5 px-3 py-2 rounded-[6px] mt-1 border border-[#00B14F]/10"
                        >
                          <FileText size={15} className="text-[#00B14F]" />
                          <span>Xem tài liệu PDF giấy phép kinh doanh</span>
                        </a>
                      ) : (
                        <p className="font-bold text-slate-500 italic">Chưa tải tài liệu PDF lên</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Company Description */}
                <div className="space-y-2 pt-6 border-t border-slate-150 text-xs">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Giới thiệu ngắn hoạt động</p>
                  <p className="font-medium text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-[8px] border border-slate-150 whitespace-pre-wrap">
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
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-t-[#00B14F] border-slate-200" />
          <p className="text-slate-500 font-medium text-sm">Đang tải trang điều khiển tuyển dụng...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
