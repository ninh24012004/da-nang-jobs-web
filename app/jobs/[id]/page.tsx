"use client";

import { useEffect, useState, useMemo, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  DollarSign,
  MapPin,
  Building2,
  Briefcase,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Loader2,
  FileText,
  Clock,
  ExternalLink,
  Users,
  Compass,
  ArrowLeft,
  X,
  UploadCloud,
  CheckCircle2,
  Check,
  Bookmark
} from "lucide-react";
import { toast } from "sonner";
import { jobService } from "@/services/jobService";
import { employerService } from "@/services/employerService";
import { applicationService } from "@/services/applicationService";
import { useResumes } from "@/hooks/useResumes";
import { useCloudinary } from "@/hooks/useCloudinary";
import { JobResponse } from "@/types/job";
import { EmployerPublicResponse } from "@/types/employer";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function JobDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const jobId = Number(id);
  const router = useRouter();

  // Authentication & candidate state
  const [isCandidate, setIsCandidate] = useState(false);

  // States
  const [job, setJob] = useState<JobResponse | null>(null);
  const [company, setCompany] = useState<EmployerPublicResponse | null>(null);
  const [similarJobs, setSimilarJobs] = useState<JobResponse[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [loadingCompany, setLoadingCompany] = useState(false);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  
  // Custom interactive states
  const [isSaved, setIsSaved] = useState(false);
  const [isOpenApplyModal, setIsOpenApplyModal] = useState(false);
  const [submittingApplication, setSubmittingApplication] = useState(false);
  
  // Resumes hooks & local upload state
  const { resumes, fetchMyResumes, createResume, isSubmitting: isResumeSubmitting } = useResumes();
  const { uploadResume, isUploadingResume } = useCloudinary();
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadFileName, setUploadFileName] = useState("");
  const [uploadedResumeFile, setUploadedResumeFile] = useState<File | null>(null);

  // Form states for quick CV upload inside apply modal
  const [quickResumeTitle, setQuickResumeTitle] = useState("");
  const [quickResumeDesc, setQuickResumeDesc] = useState("");

  // Check role to verify application permissions
  useEffect(() => {
    const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.roleName === "CANDIDATE") {
          setIsCandidate(true);
        }
      } catch (e) {}
    }
  }, []);

  // 1. Fetch Job details on mount
  useEffect(() => {
    if (!jobId) return;
    
    const loadJobDetails = async () => {
      setLoading(true);
      try {
        const jobData = await jobService.getJobById(jobId);
        if (jobData) {
          setJob(jobData);
          
          // 2. Fetch Employer Info dynamically
          if (jobData.employerId) {
            fetchCompanyInfo(jobData.employerId);
          }
          
          // 3. Fetch Similar Jobs dynamically
          fetchSimilarJobs(jobData);
        }
      } catch (err) {
        console.error("Lỗi khi tải chi tiết công việc:", err);
        toast.error("Không tìm thấy thông tin công việc yêu cầu!");
        router.push("/jobs");
      } finally {
        setLoading(false);
      }
    };

    loadJobDetails();
  }, [jobId, router]);

  // Fetch company profile by ID
  const fetchCompanyInfo = async (employerId: number) => {
    setLoadingCompany(true);
    try {
      const compData = await employerService.getCompanyById(employerId);
      if (compData) {
        setCompany(compData);
      }
    } catch (err) {
      console.warn("Không thể tải thông tin chi tiết nhà tuyển dụng:", err);
    } finally {
      setLoadingCompany(false);
    }
  };

  // Fetch and rank similar jobs client-side
  const fetchSimilarJobs = async (currentJob: JobResponse) => {
    setLoadingSimilar(true);
    try {
      let allJobsRes = null;
      try {
        allJobsRes = await jobService.getAllJobs(0, 40);
      } catch (err) {
        console.warn("getAllJobs failed in JobDetails similar jobs. Trying advancedSearchJobs fallback...", err);
        try {
          allJobsRes = await jobService.advancedSearchJobs({}, 0, 40);
        } catch (searchErr) {
          console.error("Both getAllJobs and advancedSearchJobs failed:", searchErr);
        }
      }

      const activeJobs = (allJobsRes?.content || []).filter(
        (j: JobResponse) => 
          j.approveStatus === "APPROVED" && 
          j.visibilityStatus === "ACTIVE" && 
          j.id !== currentJob.id
      );

      // Score matching categories & skills
      const currentCats = new Set(currentJob.categoryNames || []);
      const currentSkills = new Set(currentJob.skillNames || []);

      const scored = activeJobs.map((j: JobResponse) => {
        let score = 0;
        
        // Category matching
        if (j.categoryNames) {
          j.categoryNames.forEach(cat => {
            if (currentCats.has(cat)) score += 30;
          });
        }
        
        // Skills matching
        if (j.skillNames) {
          j.skillNames.forEach(skill => {
            if (currentSkills.has(skill)) score += 15;
          });
        }

        // Location matching
        if (j.wardName && currentJob.wardName && j.wardName === currentJob.wardName) {
          score += 10;
        }

        return { job: j, score };
      });

      // Filter out zero matches if possible, sort and take top 3
      const sorted = scored
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(item => item.job)
        .slice(0, 3);

      setSimilarJobs(sorted);
    } catch (err) {
      console.warn("Không thể quét danh sách việc làm tương tự:", err);
    } finally {
      setLoadingSimilar(false);
    }
  };

  // Load candidate resumes when apply modal is opened
  const handleOpenApplyModal = async () => {
    if (!isCandidate) {
      toast.error("Vui lòng đăng nhập với vai trò Ứng viên để ứng tuyển công việc này!");
      router.push(`/candidate/login?redirect=/jobs/${jobId}`);
      return;
    }
    
    setIsOpenApplyModal(true);
    try {
      const userResumes = await fetchMyResumes();
      if (userResumes && userResumes.length > 0) {
        // Pre-select default CV if exists, else select first
        const defaultCV = userResumes.find(r => r.isDefault);
        setSelectedResumeId(defaultCV ? defaultCV.id : userResumes[0].id);
      }
    } catch (err) {
      console.warn("Lỗi tải danh sách CV trực tuyến:", err);
    }
  };

  // Submit application
  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedResumeId && !uploadedResumeFile) {
      return toast.error("Vui lòng chọn một CV trực tuyến hoặc tải lên CV mới!");
    }

    setSubmittingApplication(true);
    try {
      let finalResumeId = selectedResumeId;
      
      // If candidate uploads a new CV inside modal, push to Cloudinary first
      if (uploadedResumeFile) {
        if (!quickResumeTitle.trim()) {
          toast.error("Vui lòng điền tiêu đề cho tệp CV tải lên!");
          setSubmittingApplication(false);
          return;
        }
        
        toast.loading("Đang đẩy CV mới lên Cloudinary...", { id: "apply-upload" });
        const secureUrl = await uploadResume(uploadedResumeFile);
        
        // Save CV in database
        const savedCV = await createResume({
          title: quickResumeTitle.trim(),
          description: quickResumeDesc.trim() || `Tải lên nhanh lúc ứng tuyển việc ${job?.jobTitle}`,
          fileUrl: secureUrl,
          isDefault: false
        });
        
        finalResumeId = savedCV.id;
        toast.success("Đã lưu CV thành công vào hồ sơ trực tuyến!", { id: "apply-upload" });
      }

      if (!finalResumeId) {
        toast.error("Không tìm thấy CV hợp lệ để ứng tuyển!");
        setSubmittingApplication(false);
        return;
      }

      toast.loading("Đang gửi đơn ứng tuyển...", { id: "apply-submit" });
      
      // Submit actual application via API (falls back to mock elegantly)
      await applicationService.applyJob({
        jobId: jobId,
        resumeId: finalResumeId
      });
      
      toast.success("Nộp hồ sơ ứng tuyển thành công! Nhà tuyển dụng sẽ xem xét và liên hệ với bạn.", { id: "apply-submit" });
      setIsOpenApplyModal(false);
      
      // Reset form states
      setUploadedResumeFile(null);
      setUploadFileName("");
      setQuickResumeTitle("");
      setQuickResumeDesc("");

      // Redirect to applied jobs list
      router.push("/candidate/applications");
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Ứng tuyển thất bại. Vui lòng liên hệ hỗ trợ viên!";
      toast.error(msg, { id: "apply-submit" });
      
      // If already applied (existed), redirect to applied jobs list after toast display
      if (
        msg.toLowerCase().includes("tồn tại") || 
        msg.toLowerCase().includes("đã ứng tuyển") ||
        err.response?.status === 400
      ) {
        setIsOpenApplyModal(false);
        setTimeout(() => {
          router.push("/candidate/applications");
        }, 1500);
      }
    } finally {
      setSubmittingApplication(false);
    }
  };

  // Pre-load initials for fallback logo
  const getCompanyInitials = (name?: string) => {
    if (!name) return "CO";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-[#006B7A]" />
          <p className="text-gray-500 font-bold text-xs tracking-wide">Đang tải thông tin chi tiết tuyển dụng...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] p-4 text-center">
        <ShieldCheck size={48} className="text-red-500 mb-4 animate-bounce" />
        <h3 className="font-extrabold text-gray-800 text-lg">Không tìm thấy tin tuyển dụng</h3>
        <p className="text-gray-400 text-xs mt-1">Tin tuyển dụng này có thể đã bị ẩn hoặc gỡ bỏ.</p>
        <Link href="/jobs" className="mt-4 px-5 py-2.5 bg-[#006B7A] text-white font-bold rounded-xl text-xs shadow-md">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-20 font-sans text-gray-800">
      
      {/* 1. BREADCRUMBS BAR */}
      <div className="max-w-6xl mx-auto px-4 py-4 select-none">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
          <Link href="/candidate" className="hover:text-[#006B7A] transition-colors">Trang chủ</Link>
          <ChevronRight size={12} className="text-gray-300" />
          <Link href="/jobs" className="hover:text-[#006B7A] transition-colors">Tìm việc làm</Link>
          <ChevronRight size={12} className="text-gray-300" />
          <span className="text-gray-500 truncate max-w-[200px]">{job.jobTitle}</span>
        </div>
      </div>

      {/* 2. DYNAMIC HERO HEADER CARD */}
      <div className="max-w-6xl mx-auto px-4 mb-8 select-none">
        <div className="bg-white rounded-3xl border border-gray-150 shadow-xs p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start justify-between gap-6 relative overflow-hidden">
          {/* Top backdrop glow */}
          <div className="absolute right-0 bottom-0 w-80 h-80 bg-teal-50/10 rounded-full blur-3xl pointer-events-none -mr-20 -mb-20"></div>

          {/* Left section: Logo & Titles */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-5 text-center md:text-left relative z-10">
            <div className="h-20 w-20 rounded-2xl border border-gray-150 bg-gradient-to-br from-[#006B7A]/5 to-[#006B7A]/15 text-[#006B7A] flex items-center justify-center font-black text-2xl shadow-xs overflow-hidden flex-shrink-0">
              {company?.logoUrl ? (
                <img src={company.logoUrl} alt="Logo" className="h-full w-full object-cover" />
              ) : (
                <span>{getCompanyInitials(job.employerName)}</span>
              )}
            </div>

            <div className="space-y-2.5 max-w-xl text-left">
              <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
                <span className="bg-teal-50 text-[#006B7A] text-[10px] font-extrabold px-2.5 py-0.5 rounded border border-teal-150/40 uppercase">
                  {job.positionName || "Nhân viên"}
                </span>
                <span className="bg-gray-50 text-gray-500 text-[10px] font-bold px-2.5 py-0.5 rounded border border-gray-150">
                  Hạn nộp: {new Date(job.deadline).toLocaleDateString("vi-VN")}
                </span>
              </div>
              
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-gray-850 leading-snug">
                {job.jobTitle}
              </h1>

              <div className="flex items-center gap-1.5 font-semibold text-gray-500 text-xs sm:text-sm">
                <Building2 size={15} className="text-gray-300 flex-shrink-0" />
                <span className="hover:text-[#006B7A] transition-colors">{job.employerName || "Doanh nghiệp Đà Nẵng"}</span>
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase border border-emerald-150">
                  <ShieldCheck size={8} className="fill-emerald-500 text-white" />
                  Xác thực
                </span>
              </div>
            </div>
          </div>

          {/* Right section: Action Buttons */}
          <div className="flex flex-row md:flex-col items-center gap-3 w-full md:w-auto relative z-10 select-none justify-center">
            {/* Apply Button */}
            <button
              onClick={handleOpenApplyModal}
              className="flex-1 md:flex-none px-8 py-3 bg-[#006B7A] hover:bg-[#005a66] text-white font-extrabold rounded-2xl text-xs md:text-sm shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <FileText size={16} />
              <span>Ứng tuyển ngay</span>
            </button>

            {/* Save Job Button */}
            <button
              onClick={() => {
                setIsSaved(!isSaved);
                toast.success(!isSaved ? "Lưu tin tuyển dụng thành công!" : "Đã hủy lưu tin tuyển dụng.");
              }}
              className={`flex-1 md:flex-none px-6 py-3 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] ${
                isSaved 
                  ? "bg-teal-50 border-[#006B7A] text-[#006B7A] font-extrabold shadow-3xs" 
                  : "bg-white hover:bg-gray-50 border-gray-200 text-gray-500"
              }`}
            >
              <Bookmark size={15} className={isSaved ? "fill-[#006B7A]" : ""} />
              <span>{isSaved ? "Đã lưu tin" : "Lưu tin"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. MAIN DOUBLE COLUMN LAYOUT */}
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Main Details (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-150 p-6 md:p-8 shadow-xs space-y-8 text-left">
            
            {/* Section A: Job Description */}
            <div className="space-y-3.5">
              <h3 className="text-base sm:text-lg font-black tracking-tight text-gray-850 flex items-center gap-2 border-b border-gray-100 pb-3">
                <span className="h-5 w-1.5 bg-[#006B7A] rounded-full"></span>
                <span>Mô tả công việc</span>
              </h3>
              <p className="text-xs sm:text-sm text-gray-650 font-light leading-relaxed whitespace-pre-line">
                {job.jobDescription || "Đang cập nhật..."}
              </p>
            </div>

            {/* Section B: Job Requirements */}
            <div className="space-y-3.5">
              <h3 className="text-base sm:text-lg font-black tracking-tight text-gray-850 flex items-center gap-2 border-b border-gray-100 pb-3">
                <span className="h-5 w-1.5 bg-[#006B7A] rounded-full"></span>
                <span>Yêu cầu ứng viên</span>
              </h3>
              <p className="text-xs sm:text-sm text-gray-650 font-light leading-relaxed whitespace-pre-line">
                {job.jobRequirements || "Đang cập nhật..."}
              </p>
            </div>

            {/* Section C: Job Benefits */}
            <div className="space-y-3.5">
              <h3 className="text-base sm:text-lg font-black tracking-tight text-gray-850 flex items-center gap-2 border-b border-gray-100 pb-3">
                <span className="h-5 w-1.5 bg-[#006B7A] rounded-full"></span>
                <span>Quyền lợi được hưởng</span>
              </h3>
              <p className="text-xs sm:text-sm text-gray-650 font-light leading-relaxed whitespace-pre-line">
                {job.jobBenefits || "Đang cập nhật..."}
              </p>
            </div>

            {/* Section D: Required Skills and Tags */}
            {(job.skillNames && job.skillNames.length > 0) || (job.tagNames && job.tagNames.length > 0) ? (
              <div className="space-y-4 pt-4 border-t border-gray-100/80">
                {job.skillNames && job.skillNames.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Kỹ năng cốt lõi:</p>
                    <div className="flex flex-wrap gap-2">
                      {job.skillNames.map((sn) => (
                        <span key={sn} className="bg-teal-50/50 text-[#006B7A] text-[11px] font-extrabold px-3 py-1 rounded-xl border border-teal-150/45">
                          {sn}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {job.tagNames && job.tagNames.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Tags liên quan:</p>
                    <div className="flex flex-wrap gap-2">
                      {job.tagNames.map((tn) => (
                        <span key={tn} className="bg-gray-50 text-gray-500 text-[10px] font-bold px-3 py-1 rounded-xl border border-gray-150">
                          #{tn}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}

          </div>
        </div>

        {/* RIGHT COLUMN: Sidebar (1/3) */}
        <div className="space-y-6">
          
          {/* Box 1: General Info Card */}
          <div className="bg-white rounded-3xl border border-gray-150 p-5 md:p-6 shadow-xs text-left space-y-5">
            <h3 className="font-extrabold text-sm text-gray-800 pb-2 border-b border-gray-100 flex items-center gap-1.5">
              <Compass size={15} className="text-[#006B7A]" />
              <span>Thông tin chung</span>
            </h3>

            <div className="space-y-4 text-xs font-semibold text-gray-600">
              {/* Salary */}
              <div className="flex items-start gap-3">
                <span className="p-2.5 bg-teal-50 rounded-xl text-[#006B7A] flex-shrink-0"><DollarSign size={16} /></span>
                <div className="space-y-0.5">
                  <p className="text-[9px] text-gray-400 font-black uppercase tracking-wide">Mức lương</p>
                  <p className="text-sm font-extrabold text-[#006B7A]">
                    {job.salaryType === "NEGOTIABLE" 
                      ? "Thỏa thuận" 
                      : `${(job.minimumSalary / 1000000).toFixed(0)} - ${(job.maximumSalary / 1000000).toFixed(0)} Triệu VND`}
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-3">
                <span className="p-2.5 bg-gray-50 rounded-xl text-gray-400 flex-shrink-0"><MapPin size={16} /></span>
                <div className="space-y-0.5">
                  <p className="text-[9px] text-gray-400 font-black uppercase tracking-wide">Địa điểm</p>
                  <p className="text-xs font-bold text-gray-800 break-words">{job.address}</p>
                </div>
              </div>

              {/* Position */}
              <div className="flex items-start gap-3">
                <span className="p-2.5 bg-gray-50 rounded-xl text-gray-400 flex-shrink-0"><Briefcase size={16} /></span>
                <div className="space-y-0.5">
                  <p className="text-[9px] text-gray-400 font-black uppercase tracking-wide">Cấp bậc chức danh</p>
                  <p className="text-xs font-bold text-gray-800">{job.positionName || "Nhân viên"}</p>
                </div>
              </div>

              {/* Experience */}
              <div className="flex items-start gap-3">
                <span className="p-2.5 bg-gray-50 rounded-xl text-gray-400 flex-shrink-0"><Clock size={16} /></span>
                <div className="space-y-0.5">
                  <p className="text-[9px] text-gray-400 font-black uppercase tracking-wide">Kinh nghiệm tối thiểu</p>
                  <p className="text-xs font-bold text-gray-800">{job.experienceLevelName || "Không yêu cầu"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Box 2: Employer Info Card */}
          <div className="bg-white rounded-3xl border border-gray-150 p-5 md:p-6 shadow-xs text-left space-y-4">
            <h3 className="font-extrabold text-sm text-gray-800 pb-2 border-b border-gray-100 flex items-center gap-1.5">
              <Building2 size={15} className="text-[#006B7A]" />
              <span>Thông tin nhà tuyển dụng</span>
            </h3>

            {loadingCompany ? (
              <div className="py-8 flex justify-center"><Loader2 size={20} className="animate-spin text-[#006B7A]" /></div>
            ) : company ? (
              <div className="space-y-4 select-none">
                {/* Logo & Company Name */}
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl border border-gray-150 bg-gradient-to-br from-[#006B7A]/5 to-[#006B7A]/15 text-[#006B7A] flex items-center justify-center font-bold text-sm overflow-hidden flex-shrink-0 shadow-2xs">
                    {company.logoUrl ? (
                      <img src={company.logoUrl} alt="Logo" className="h-full w-full object-cover" />
                    ) : (
                      <span>{getCompanyInitials(company.companyName)}</span>
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-black text-gray-850 text-xs sm:text-sm line-clamp-2 leading-tight">
                      {company.companyName}
                    </p>
                    {company.website && (
                      <a
                        href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-bold text-[#006B7A] hover:underline flex items-center gap-0.5"
                      >
                        <span>Website công ty</span>
                        <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                </div>

                {/* Company details */}
                <div className="space-y-2.5 text-[11px] font-semibold text-gray-500 pt-1.5 border-t border-gray-100/70">
                  {company.companySize && (
                    <div className="flex justify-between items-center">
                      <span>Quy mô nhân sự:</span>
                      <span className="text-gray-700 flex items-center gap-1 font-bold"><Users size={11} /> {company.companySize} nhân viên</span>
                    </div>
                  )}
                  {company.address && (
                    <div className="space-y-1">
                      <span>Địa chỉ văn phòng:</span>
                      <p className="text-gray-700 font-bold leading-normal">{company.address}</p>
                    </div>
                  )}
                  {company.description && (
                    <div className="space-y-1 pt-1.5 border-t border-gray-50">
                      <span>Giới thiệu tóm tắt:</span>
                      <p className="text-gray-655 font-light leading-relaxed line-clamp-4 break-words">
                        {company.description}
                      </p>
                    </div>
                  )}
                </div>

                {/* Redirect company detail button */}
                <div className="pt-2 border-t border-gray-100">
                  <Link
                    href={`/candidate/companies/${company.id}`}
                    className="w-full text-center bg-gray-50 hover:bg-[#006B7A]/10 text-gray-650 hover:text-[#006B7A] py-2 border border-gray-200 hover:border-[#006B7A]/20 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Xem trang công ty</span>
                    <ChevronRight size={12} />
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400 font-medium py-4 text-center">Chưa có thông tin công ty chi tiết.</p>
            )}
          </div>

        </div>

      </div>

      {/* 4. BOTTOM SIMILAR JOBS SECTION */}
      <div className="max-w-6xl mx-auto px-4 mt-12 text-left space-y-6">
        <h3 className="text-lg sm:text-xl font-black tracking-tight text-gray-850 flex items-center gap-2 border-b border-gray-200/60 pb-3.5">
          <span className="p-1 bg-[#006B7A]/10 rounded-lg text-[#006B7A]"><Sparkles size={16} className="fill-amber-500 stroke-amber-500 animate-pulse" /></span>
          <span>Cơ hội việc làm tương tự đang mở tuyển</span>
        </h3>

        {loadingSimilar ? (
          <div className="py-12 flex justify-center"><Loader2 size={24} className="animate-spin text-[#006B7A]" /></div>
        ) : similarJobs.length === 0 ? (
          <div className="py-12 bg-white border border-gray-150 rounded-3xl p-6 text-center text-gray-400 font-light text-xs shadow-3xs">
            Chưa tìm thấy tin tuyển dụng tương tự tại thời điểm này.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {similarJobs.map((sj) => (
              <div
                key={sj.id}
                className="bg-white border border-gray-150 rounded-2xl p-5 hover:shadow-md hover:scale-[1.005] transition-all duration-300 flex flex-col justify-between group text-left"
              >
                <div className="space-y-4">
                  {/* Company Initials and date */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="h-11 w-11 rounded-xl border border-gray-150 bg-gradient-to-br from-[#006B7A]/5 to-[#006B7A]/15 text-[#006B7A] flex items-center justify-center font-extrabold text-xs shadow-3xs overflow-hidden select-none flex-shrink-0">
                      {getCompanyInitials(sj.employerName)}
                    </div>
                    <div className="text-right">
                      <span className="flex items-center gap-0.5 text-[9px] text-gray-400 font-light justify-end">
                        <Calendar size={9} />
                        Hạn: {new Date(sj.deadline).toLocaleDateString("vi-VN")}
                      </span>
                      <span className="inline-flex items-center gap-0.5 mt-1 px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 text-[8px] font-black uppercase tracking-wider border border-teal-150/40">
                        <ShieldCheck size={8} className="fill-teal-500 text-white" />
                        Xác thực
                      </span>
                    </div>
                  </div>

                  {/* Title & Employer */}
                  <div className="space-y-0.5">
                    <Link
                      href={`/jobs/${sj.id}`}
                      className="block font-extrabold text-gray-800 text-xs sm:text-sm hover:text-[#006B7A] transition-colors line-clamp-1 leading-snug cursor-pointer"
                    >
                      {sj.jobTitle}
                    </Link>
                    <p className="text-[10px] text-gray-400 font-semibold flex items-center gap-1 line-clamp-1">
                      <Building2 size={11} className="text-gray-300 flex-shrink-0" />
                      <span>{sj.employerName || "Doanh nghiệp tuyển dụng"}</span>
                    </p>
                  </div>

                  {/* Salary and Location */}
                  <div className="space-y-1.5 pt-2 border-t border-gray-50 text-xs text-gray-500 font-light">
                    <div className="flex items-center gap-1 text-teal-600 font-bold">
                      <DollarSign size={13} className="text-teal-600 flex-shrink-0" />
                      <span>
                        {sj.salaryType === "NEGOTIABLE" 
                          ? "Thỏa thuận" 
                          : `${(sj.minimumSalary / 1000000).toFixed(0)} - ${(sj.maximumSalary / 1000000).toFixed(0)} triệu`}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin size={13} className="text-gray-300 flex-shrink-0" />
                      <span className="line-clamp-1 text-[11px]">{sj.address}</span>
                    </div>
                  </div>
                </div>

                {/* View details */}
                <Link
                  href={`/jobs/${sj.id}`}
                  className="w-full py-2 mt-4 bg-gray-50 hover:bg-[#006B7A] border border-gray-150 hover:border-[#006B7A] text-gray-600 hover:text-white font-bold rounded-xl text-[11px] flex items-center justify-center gap-0.5 transition-all active:scale-[0.98] cursor-pointer"
                >
                  <span>Xem chi tiết tuyển dụng</span>
                  <ChevronRight size={12} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ==================== 5. PREMIUM APPLY CV MODAL ==================== */}
      {isOpenApplyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 transition-all duration-300 select-none">
          {/* Overlay backdrop */}
          <div className="fixed inset-0" onClick={() => !submittingApplication && !isResumeSubmitting && setIsOpenApplyModal(false)}></div>

          {/* Modal Box */}
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-gray-150 animate-in fade-in zoom-in-95 duration-200 flex flex-col text-gray-800 relative z-10">
            {/* Modal Header */}
            <div className="px-6 py-4.5 bg-gradient-to-r from-teal-50/55 to-white border-b border-gray-100 flex items-center justify-between">
              <div className="text-left space-y-0.5">
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#006B7A] bg-[#006B7A]/10 px-2 py-0.5 rounded">
                  Ứng tuyển trực tuyến
                </span>
                <h3 className="text-sm md:text-base font-extrabold text-gray-850">
                  Nộp hồ sơ ứng tuyển
                </h3>
              </div>
              <button
                type="button"
                disabled={submittingApplication || isResumeSubmitting}
                onClick={() => setIsOpenApplyModal(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-650 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleApplySubmit} className="p-6 space-y-5 text-xs font-semibold text-left max-h-[80vh] overflow-y-auto custom-scrollbar">
              
              {/* Brief Job overview inside modal */}
              <div className="p-3 bg-teal-50/20 border border-[#006B7A]/10 rounded-2xl flex items-center gap-3 text-left">
                <div className="h-9 w-9 rounded-lg bg-[#006B7A]/5 border border-teal-150/40 text-[#006B7A] flex items-center justify-center font-extrabold text-xs flex-shrink-0">
                  {getCompanyInitials(job.employerName)}
                </div>
                <div className="space-y-0.5 truncate leading-tight">
                  <p className="font-extrabold text-gray-800 text-[11px] line-clamp-1">{job.jobTitle}</p>
                  <p className="text-[10px] text-gray-400 font-semibold line-clamp-1">{job.employerName || "Doanh nghiệp Đà Nẵng"}</p>
                </div>
              </div>

              {/* List Online CVs */}
              <div className="space-y-2">
                <label className="text-gray-500 uppercase tracking-wider block">Chọn CV trực tuyến của bạn <span className="text-red-500">*</span></label>
                
                {resumes.length === 0 ? (
                  <p className="text-[11px] text-amber-600 font-bold bg-amber-50 border border-amber-100/50 p-3 rounded-2xl">
                    * Bạn chưa có CV trực tuyến nào trong hồ sơ cá nhân. Hãy kéo thả đính kèm file mới bên dưới để nộp hồ sơ!
                  </p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                    {resumes.map((resume) => {
                      const isSelected = selectedResumeId === resume.id && !uploadedResumeFile;
                      return (
                        <div
                          key={resume.id}
                          onClick={() => {
                            setUploadedResumeFile(null);
                            setUploadFileName("");
                            setSelectedResumeId(resume.id);
                          }}
                          className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all select-none ${
                            isSelected 
                              ? "bg-teal-50 border-[#006B7A] text-[#006B7A] font-bold" 
                              : "bg-white border-gray-200 text-gray-655 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 text-left">
                            <span className="p-1.5 bg-red-50 border border-red-100 text-red-500 rounded-lg flex-shrink-0"><FileText size={15} /></span>
                            <div className="space-y-0.5 truncate leading-tight">
                              <p className="text-xs font-bold text-gray-800 line-clamp-1">{resume.title}</p>
                              <p className="text-[10px] text-gray-400 font-medium">Phiên bản: {new Date(resume.createdAt).toLocaleDateString("vi-VN")}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            {resume.isDefault && (
                              <span className="text-[9px] bg-[#006B7A]/10 text-[#006B7A] font-extrabold px-1.5 py-0.5 rounded border border-[#006B7A]/20">Mặc định</span>
                            )}
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? "border-[#006B7A] bg-white" : "border-gray-300"}`}>
                              {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#006B7A]" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Divider option */}
              <div className="relative py-1 text-center select-none">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-150"></div></div>
                <span className="relative bg-white px-3.5 text-[10px] text-gray-400 font-bold uppercase tracking-wider">Hoặc nộp CV khác bằng cách tải lên</span>
              </div>

              {/* Upload quick CV component */}
              <div className="space-y-3">
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (!isUploadingResume && !submittingApplication) setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (isUploadingResume || submittingApplication) return;

                    const droppedFile = e.dataTransfer.files?.[0];
                    if (droppedFile) {
                      const fileExt = droppedFile.name.split(".").pop()?.toLowerCase();
                      if (fileExt !== "pdf" && fileExt !== "docx" && fileExt !== "doc") {
                        toast.error("Vui lòng tải lên file định dạng PDF, DOCX hoặc DOC!");
                        return;
                      }
                      setUploadedResumeFile(droppedFile);
                      setUploadFileName(droppedFile.name);
                      
                      // Auto-fill title
                      if (!quickResumeTitle) {
                        setQuickResumeTitle(droppedFile.name.substring(0, droppedFile.name.lastIndexOf(".")) || droppedFile.name);
                      }
                      
                      toast.success(`Đã chọn CV tải lên: ${droppedFile.name}`);
                    }
                  }}
                  className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all flex flex-col items-center justify-center gap-1.5 select-none ${
                    isDragging 
                      ? "border-[#006B7A] bg-teal-50/35 scale-[1.01]" 
                      : uploadFileName 
                        ? "border-emerald-300 bg-emerald-50/5" 
                        : "border-gray-200 hover:border-[#006B7A]/50 bg-gray-50/30"
                  }`}
                >
                  {isUploadingResume ? (
                    <div className="py-2 flex flex-col items-center gap-2 text-[#006B7A]">
                      <Loader2 size={24} className="animate-spin" />
                      <span className="font-bold text-[11px]">Đang đẩy file lên Cloudinary trực tiếp...</span>
                    </div>
                  ) : uploadFileName ? (
                    <div className="py-1 flex flex-col items-center gap-2">
                      <div className="p-2 bg-emerald-50 rounded-xl text-emerald-500">
                        <CheckCircle2 size={20} />
                      </div>
                      <div className="space-y-0.5">
                        <p className="font-bold text-gray-800 text-[10px] line-clamp-1">{uploadFileName}</p>
                        <p className="text-[9px] text-gray-400 font-medium">Bấm để thay đổi tệp tin tải lên</p>
                      </div>
                      <input
                        type="file"
                        id="resume-apply-file"
                        accept=".pdf,.docx,.doc"
                        onChange={(e) => {
                          const selectedFile = e.target.files?.[0];
                          if (selectedFile) {
                            setUploadedResumeFile(selectedFile);
                            setUploadFileName(selectedFile.name);
                            if (!quickResumeTitle) {
                              setQuickResumeTitle(selectedFile.name.substring(0, selectedFile.name.lastIndexOf(".")) || selectedFile.name);
                            }
                          }
                        }}
                        className="hidden"
                      />
                      <label htmlFor="resume-apply-file" className="px-2.5 py-1 bg-gray-50 hover:bg-gray-150 border border-gray-200 rounded-lg text-[9px] font-bold cursor-pointer transition-all">
                        Thay đổi
                      </label>
                    </div>
                  ) : (
                    <>
                      <UploadCloud size={24} className="text-[#006B7A]/75 animate-bounce" />
                      <div className="space-y-0.5">
                        <p className="font-bold text-gray-700">Kéo & thả file CV vào đây</p>
                        <p className="text-[10px] text-gray-400 font-light">Hoặc click để duyệt file trong máy tính</p>
                      </div>
                      
                      <input
                        type="file"
                        id="resume-apply-file-new"
                        accept=".pdf,.docx,.doc"
                        onChange={(e) => {
                          const selectedFile = e.target.files?.[0];
                          if (selectedFile) {
                            setUploadedResumeFile(selectedFile);
                            setUploadFileName(selectedFile.name);
                            if (!quickResumeTitle) {
                              setQuickResumeTitle(selectedFile.name.substring(0, selectedFile.name.lastIndexOf(".")) || selectedFile.name);
                            }
                          }
                        }}
                        className="hidden"
                      />
                      <label htmlFor="resume-apply-file-new" className="px-3 py-1 mt-1 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-[10px] font-bold cursor-pointer transition-all shadow-2xs">
                        Chọn tệp
                      </label>
                    </>
                  )}
                </div>

                {/* Form fields for new quick upload */}
                {uploadFileName && (
                  <div className="space-y-3 bg-gray-50/50 p-4 border border-gray-150/70 rounded-2xl animate-fadeIn">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-450 uppercase font-black tracking-wider block">Tiêu đề CV tải lên <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        placeholder="Đặt tiêu đề lưu lại CV (Ví dụ: CV Lập trình viên Nodejs - Nguyễn Văn A)"
                        value={quickResumeTitle}
                        onChange={(e) => setQuickResumeTitle(e.target.value)}
                        className="w-full bg-white border border-gray-200 focus:border-[#006B7A] focus:ring-1 focus:ring-[#006B7A] rounded-xl px-3 py-2 text-xs font-semibold outline-none transition-all"
                        required={!!uploadedResumeFile}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-450 uppercase font-black tracking-wider block">Mô tả tóm tắt</label>
                      <input
                        type="text"
                        placeholder="Nhập mô tả tóm tắt (Kinh nghiệm, thế mạnh bản thân...)"
                        value={quickResumeDesc}
                        onChange={(e) => setQuickResumeDesc(e.target.value)}
                        className="w-full bg-white border border-gray-200 focus:border-[#006B7A] focus:ring-1 focus:ring-[#006B7A] rounded-xl px-3 py-2 text-xs font-medium outline-none transition-all"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer actions */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100 select-none">
                <button
                  type="button"
                  disabled={submittingApplication || isResumeSubmitting || isUploadingResume}
                  onClick={() => setIsOpenApplyModal(false)}
                  className="px-5 py-2.5 border border-gray-250 hover:bg-gray-50 text-gray-600 rounded-xl font-bold transition-all active:scale-[0.98] cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submittingApplication || isResumeSubmitting || isUploadingResume}
                  className="bg-[#006B7A] hover:bg-[#005a66] disabled:bg-gray-350 text-white px-7 py-2.5 rounded-xl font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer active:scale-[0.98]"
                >
                  {submittingApplication || isResumeSubmitting || isUploadingResume ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <span>Nộp hồ sơ ngay</span>
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
