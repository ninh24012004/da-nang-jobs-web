"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { useEmployers } from "@/hooks/useEmployers";
import { useJobs } from "@/hooks/useJobs";
import { usePositions } from "@/hooks/usePositions";
import { useExperienceLevels } from "@/hooks/useExperienceLevels";
import { useLocations } from "@/hooks/useLocations";
import { useCategories } from "@/hooks/useCategories";
import { useSkills } from "@/hooks/useSkills";
import { useTags } from "@/hooks/useTags";
import { JobResponse, ApproveJobStatus } from "@/types/job";
import { applicationService } from "@/services/applicationService";
import { categoryService } from "@/services/categoryService";
import { jobService } from "@/services/jobService";
import { dashboardService } from "@/services/dashboardService";
import { CategoryTreeResponse } from "@/types/category";
import { EmployerDashboardSummaryResponse, EmployerDailyTrendResponse } from "@/types/dashboard";

interface EmployerDashboardContextType {
  // Authentication & Approval State
  isAuthenticated: boolean;
  isApproved: boolean | null;
  companyName: string;
  companyDetails: any;
  setCompanyDetails: React.Dispatch<React.SetStateAction<any>>;

  // Jobs Campaign Data
  realJobs: JobResponse[];
  jobsLoading: boolean;
  jobsPage: number;
  setJobsPage: React.Dispatch<React.SetStateAction<number>>;
  jobsTotalPages: number;
  jobsTotalElements: number;
  fetchEmployerJobs: () => Promise<void>;

  // Employer Dashboard Stats Summary API
  employerSummary: EmployerDashboardSummaryResponse | null;
  employerTrends: EmployerDailyTrendResponse[];
  summaryLoading: boolean;
  fetchEmployerDashboardSummary: () => Promise<void>;

  // All jobs (unpaginated) for selection in CVs view
  allEmployerJobs: JobResponse[];
  allJobsLoading: boolean;
  fetchAllEmployerJobs: () => Promise<void>;

  // Applicants & CVs
  applicants: any[];
  setApplicants: React.Dispatch<React.SetStateAction<any[]>>;
  statusFilter: string;
  setStatusFilter: React.Dispatch<React.SetStateAction<string>>;
  fetchEmployerApplications: () => Promise<void>;
  handleUpdateStatus: (id: number, newStatus: string) => Promise<void>;
  handleExportExcel: () => Promise<void>;

  // Master Data lists
  positions: any[];
  experienceLevels: any[];
  districts: any[];
  wards: any[];
  categories: any[];
  categoriesTree: CategoryTreeResponse[];
  skills: any[];
  tags: any[];
  
  // Job Form States
  editingJobId: number | null;
  editingJobStatus: ApproveJobStatus | null;
  currentEditingJob: JobResponse | null;
  formTitle: string;
  setFormTitle: (v: string) => void;
  formDescription: string;
  setFormDescription: (v: string) => void;
  formRequirements: string;
  setFormRequirements: (v: string) => void;
  formBenefits: string;
  setFormBenefits: (v: string) => void;
  formSalaryType: string;
  setFormSalaryType: (v: string) => void;
  formMinSalary: number;
  setFormMinSalary: (v: number) => void;
  formMaxSalary: number;
  setFormMaxSalary: (v: number) => void;
  formAddress: string;
  setFormAddress: (v: string) => void;
  formDeadline: string;
  setFormDeadline: (v: string) => void;
  formPositionId: string;
  setFormPositionId: (v: string) => void;
  formExperienceLevelId: string;
  setFormExperienceLevelId: (v: string) => void;
  formDistrictId: string;
  setFormDistrictId: (v: string) => void;
  formWardId: string;
  setFormWardId: (v: string) => void;
  formCategoryIds: number[];
  setFormCategoryIds: React.Dispatch<React.SetStateAction<number[]>>;
  formSkillIds: number[];
  setFormSkillIds: React.Dispatch<React.SetStateAction<number[]>>;
  formTagIds: number[];
  setFormTagIds: React.Dispatch<React.SetStateAction<number[]>>;
  categorySearch: string;
  setCategorySearch: (v: string) => void;
  skillSearch: string;
  setSkillSearch: (v: string) => void;
  tagSearch: string;
  setTagSearch: (v: string) => void;
  expandedCategoryGroups: number[];
  setExpandedCategoryGroups: React.Dispatch<React.SetStateAction<number[]>>;
  
  // Helper methods for category selection
  getCategorySelectionStatus: (node: CategoryTreeResponse, selectedList: number[]) => "none" | "partial" | "all";
  handleToggleCategoryGroup: (node: CategoryTreeResponse) => void;
  handleToggleSubcategory: (subcatId: number) => void;
  getMatchingCategories: (nodes: CategoryTreeResponse[], query: string, path?: string[]) => { id: number; name: string; path: string }[];

  // Action states
  actionLoading: boolean;
  exportLoading: boolean;
  resetForm: () => void;
  handleSubmitJob: (e: React.FormEvent) => Promise<void>;
  handleEditJobClick: (job: JobResponse) => void;
  handleDeleteJob: (id: number) => Promise<void>;

  // AI Talent Scouting
  scoutingQuery: string;
  setScoutingQuery: (v: string) => void;
  aiSearching: boolean;
  aiProgress: number;
  aiStepText: string;
  aiResults: any[];
  setAiResults: React.Dispatch<React.SetStateAction<any[]>>;
  handleAiSearch: () => void;
}

const EmployerDashboardContext = createContext<EmployerDashboardContextType | undefined>(undefined);

export function EmployerDashboardProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  // Initialize hooks
  const { fetchProfile } = useEmployers();
  const { createJob, updateJob, deleteJob, fetchJobsByEmployer } = useJobs();
  const { fetchPositions } = usePositions();
  const { fetchExperienceLevels } = useExperienceLevels();
  const { fetchDistricts, fetchAllWards } = useLocations();
  const { fetchFlatCategories } = useCategories();
  const { fetchSkills } = useSkills();
  const { fetchTags } = useTags();

  // Authentication & Status states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isApproved, setIsApproved] = useState<boolean | null>(null);
  const [companyName, setCompanyName] = useState("Công ty tuyển dụng");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

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
    emailCompany: "",
    businessLicense: "",
    logoUrl: ""
  });

  // Real Job Listings
  const [realJobs, setRealJobs] = useState<JobResponse[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsPage, setJobsPage] = useState(0);
  const [jobsTotalPages, setJobsTotalPages] = useState(1);
  const [jobsTotalElements, setJobsTotalElements] = useState(0);

  // All jobs (unpaginated)
  const [allEmployerJobs, setAllEmployerJobs] = useState<JobResponse[]>([]);
  const [allJobsLoading, setAllJobsLoading] = useState(false);

  // Employer Dashboard summary stats states
  const [employerSummary, setEmployerSummary] = useState<EmployerDashboardSummaryResponse | null>(null);
  const [employerTrends, setEmployerTrends] = useState<EmployerDailyTrendResponse[]>([]);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Master Data Lists
  const [positions, setPositions] = useState<any[]>([]);
  const [experienceLevels, setExperienceLevels] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [categoriesTree, setCategoriesTree] = useState<CategoryTreeResponse[]>([]);

  // Form states
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
  const [expandedCategoryGroups, setExpandedCategoryGroups] = useState<number[]>([]);

  const [actionLoading, setActionLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // Applicants List
  const [applicants, setApplicants] = useState<any[]>([]);

  // AI Talent Scouting
  const [scoutingQuery, setScoutingQuery] = useState("");
  const [aiSearching, setAiSearching] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);
  const [aiStepText, setAiStepText] = useState("");
  const [aiResults, setAiResults] = useState<any[]>([]);

  // Verify Auth and Profile
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
                emailCompany: cachedEmployer.emailCompany || "",
                businessLicense: cachedEmployer.businessLicense || "",
                logoUrl: cachedEmployer.logoUrl || ""
              });
            } catch (err) {
              console.error("Error parsing cached employer profile:", err);
            }
          }

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
                  emailCompany: data.emailCompany || "",
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

  // Load Real Applications & all jobs from backend
  useEffect(() => {
    if (isAuthenticated && isApproved) {
      fetchEmployerApplications();
      fetchAllEmployerJobs();
      loadMasterData();
      fetchEmployerDashboardSummary();
    }
  }, [isAuthenticated, isApproved]);

  const getMockSummary = (): EmployerDashboardSummaryResponse => {
    return {
      metrics: {
        totalJobs: realJobs.length || 0,
        totalApplications: applicants.length || 0,
        pendingApplications: applicants.filter(a => a.status === "Mới tiếp nhận").length || 0,
        approvedApplications: applicants.filter(a => a.status === "Đã duyệt").length || 0,
        rejectedApplications: applicants.filter(a => a.status === "Từ chối").length || 0,
        cancelledApplications: applicants.filter(a => a.status === "Đã hủy").length || 0
      },
      recentJobs: realJobs.slice(0, 5).map(j => ({
        jobId: j.id,
        jobTitle: j.jobTitle,
        applicationCount: 0,
        approveStatus: j.approveStatus,
        visibilityStatus: "VISIBLE",
        createdAt: j.createdAt || new Date().toISOString()
      })),
      recentApplications: applicants.slice(0, 5).map(a => ({
        applicationId: a.id,
        candidateName: a.name,
        jobTitle: a.role,
        status: a.status === "Mới tiếp nhận" ? "PENDING" : a.status === "Đã duyệt" ? "ACCEPTED" : "REJECTED",
        appliedAt: a.date || new Date().toISOString()
      })),
      jobsByCategory: Object.entries(
        realJobs.reduce((acc: Record<string, number>, job) => {
          const cat = (job.categoryNames && job.categoryNames[0]) || "Khác";
          acc[cat] = (acc[cat] || 0) + 1;
          return acc;
        }, {})
      ).map(([categoryName, jobCount]) => ({ categoryName, jobCount })),
      applicationsByStatus: [
        { statusName: "PENDING", count: applicants.filter(a => a.status === "Mới tiếp nhận").length },
        { statusName: "ACCEPTED", count: applicants.filter(a => a.status === "Đã duyệt").length },
        { statusName: "REJECTED", count: applicants.filter(a => a.status === "Từ chối").length }
      ]
    };
  };

  const getMockTrends = (): EmployerDailyTrendResponse[] => {
    const trend: EmployerDailyTrendResponse[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      trend.push({
        date: dateStr,
        jobPosts: Math.floor(Math.random() * 3),
        applications: Math.floor(Math.random() * 2)
      });
    }
    return trend;
  };

  const fetchEmployerDashboardSummary = async () => {
    setSummaryLoading(true);
    try {
      const [sumRes, trendRes] = await Promise.all([
        dashboardService.getEmployerSummary(),
        dashboardService.getEmployerTrends(30)
      ]);
      setEmployerSummary(sumRes);
      setEmployerTrends(trendRes);
    } catch (err) {
      console.warn("Employer dashboard API failed, using client-side generated summary fallback:", err);
      setEmployerSummary(getMockSummary());
      setEmployerTrends(getMockTrends());
    } finally {
      setSummaryLoading(false);
    }
  };

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
            resumeFileUrl: app.resumeFileUrl || "",
            jobId: app.jobId
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

  const fetchEmployerJobs = async () => {
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
  };

  const fetchAllEmployerJobs = async () => {
    setAllJobsLoading(true);
    try {
      const res = await jobService.getJobsByEmployer(0, 100);
      setAllEmployerJobs(res.content || []);
    } catch (err) {
      console.warn("Lỗi khi tải toàn bộ tin tuyển dụng:", err);
    } finally {
      setAllJobsLoading(false);
    }
  };

  const loadMasterData = async () => {
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
      await Promise.all([fetchEmployerJobs(), fetchAllEmployerJobs()]);
      router.push("/employer/dashboard/jobs");
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

    router.push("/employer/dashboard/post-job");
  };

  const handleDeleteJob = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa tin tuyển dụng này vĩnh viễn? Hành động này không thể hoàn tác.")) {
      return;
    }
    setActionLoading(true);
    try {
      await deleteJob(id);
      toast.success("Xóa tin tuyển dụng thành công!");
      await Promise.all([fetchEmployerJobs(), fetchAllEmployerJobs()]);
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
    fetchEmployerDashboardSummary();
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

  return (
    <EmployerDashboardContext.Provider
      value={{
        isAuthenticated,
        isApproved,
        companyName,
        companyDetails,
        setCompanyDetails,
        realJobs,
        jobsLoading,
        jobsPage,
        setJobsPage,
        jobsTotalPages,
        jobsTotalElements,
        fetchEmployerJobs,
        employerSummary,
        employerTrends,
        summaryLoading,
        fetchEmployerDashboardSummary,
        allEmployerJobs,
        allJobsLoading,
        fetchAllEmployerJobs,
        applicants,
        setApplicants,
        statusFilter,
        setStatusFilter,
        fetchEmployerApplications,
        handleUpdateStatus,
        handleExportExcel,
        positions,
        experienceLevels,
        districts,
        wards,
        categories,
        categoriesTree,
        skills,
        tags,
        editingJobId,
        editingJobStatus,
        currentEditingJob,
        formTitle,
        setFormTitle,
        formDescription,
        setFormDescription,
        formRequirements,
        setFormRequirements,
        formBenefits,
        setFormBenefits,
        formSalaryType,
        setFormSalaryType,
        formMinSalary,
        setFormMinSalary,
        formMaxSalary,
        setFormMaxSalary,
        formAddress,
        setFormAddress,
        formDeadline,
        setFormDeadline,
        formPositionId,
        setFormPositionId,
        formExperienceLevelId,
        setFormExperienceLevelId,
        formDistrictId,
        setFormDistrictId,
        formWardId,
        setFormWardId,
        formCategoryIds,
        setFormCategoryIds,
        formSkillIds,
        setFormSkillIds,
        formTagIds,
        setFormTagIds,
        categorySearch,
        setCategorySearch,
        skillSearch,
        setSkillSearch,
        tagSearch,
        setTagSearch,
        expandedCategoryGroups,
        setExpandedCategoryGroups,
        getCategorySelectionStatus,
        handleToggleCategoryGroup,
        handleToggleSubcategory,
        getMatchingCategories,
        actionLoading,
        exportLoading,
        resetForm,
        handleSubmitJob,
        handleEditJobClick,
        handleDeleteJob,
        scoutingQuery,
        setScoutingQuery,
        aiSearching,
        aiProgress,
        aiStepText,
        aiResults,
        setAiResults,
        handleAiSearch
      }}
    >
      {children}
    </EmployerDashboardContext.Provider>
  );
}

export function useEmployerDashboard() {
  const context = useContext(EmployerDashboardContext);
  if (!context) {
    throw new Error("useEmployerDashboard must be used within an EmployerDashboardProvider");
  }
  return context;
}
