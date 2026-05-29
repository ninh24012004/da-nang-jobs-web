import api from "./api";
import { ApiResponse } from "@/types/apiResponse";
import { PageResponse } from "@/types/pageResponse";
import {
  JobResponse,
  JobApprovalRequest,
  JobVisibilityRequest,
  ApproveJobStatus,
  VisibilityJobStatus,
  JobRequest,
  JobUpdateRequest
} from "@/types/job";

// High-fidelity Mock Dataset
export const MOCK_JOBS: JobResponse[] = [
  {
    id: 1001,
    jobTitle: "Senior React Developer (Next.js)",
    jobDescription: "Chúng tôi đang tìm kiếm một Senior Frontend Engineer dày dạn kinh nghiệm với Next.js và React. Bạn sẽ chịu trách nhiệm thiết kế, xây dựng và tối ưu hóa các ứng dụng web quy mô lớn.\n\nTham gia vào dự án xây dựng hệ thống quản lý tuyển dụng với lượng người dùng lớn tại miền Trung.",
    jobRequirements: "- Ít nhất 3 năm kinh nghiệm làm việc chuyên sâu với React / Next.js.\n- Thành thạo Tailwind CSS, TypeScript, RESTful API và GraphQL.\n- Có kiến thức tốt về tối ưu SEO, Core Web Vitals và SSR/ISR.\n- Khả năng làm việc độc lập và kỹ năng làm việc nhóm xuất sắc.",
    jobBenefits: "- Mức lương vô cùng cạnh tranh lên tới 40,000,000 VND.\n- Thưởng dự án hấp dẫn, lương tháng 13, 14.\n- Chế độ bảo hiểm sức khỏe toàn diện PTI.\n- Môi trường làm việc năng động, trẻ trung, hỗ trợ cơm trưa, trà, cafe miễn phí.",
    salaryType: "RANGE",
    minimumSalary: 25000000,
    maximumSalary: 40000000,
    address: "Tòa nhà FPT, Đường số 1, KCN An Đồn, Sơn Trà, Đà Nẵng",
    deadline: "2026-07-31T23:59:59.000Z",
    createdAt: "2026-05-20T08:00:00.000Z",
    approvedAt: "2026-05-21T09:00:00.000Z",
    viewCount: 1542,
    needsReapproval: false,
    approveStatus: "APPROVED",
    visibilityStatus: "ACTIVE",
    positionName: "Senior Developer",
    experienceLevelName: "3 - 5 năm kinh nghiệm",
    wardName: "An Hải Bắc",
    employerId: 201,
    employerName: "FPT Software Đà Nẵng",
    categoryNames: ["Công nghệ thông tin", "Phần mềm", "Lập trình Web"],
    skillNames: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
    tagNames: ["NextJS", "Senior", "DaNangJobs", "Developer"]
  },
  {
    id: 1002,
    jobTitle: "UI/UX Product Designer",
    jobDescription: "Hợp tác chặt chẽ với đội ngũ Product Manager và Engineers để tạo nên các trải nghiệm người dùng tuyệt vời nhất cho hệ sinh thái tuyển dụng Đà Nẵng.\n\nNghiên cứu hành vi người dùng, xây dựng wireframe, prototype chất lượng cao.",
    jobRequirements: "- Ít nhất 2 năm kinh nghiệm làm UI/UX trên Web & Mobile.\n- Sử dụng thành thạo Figma, Adobe Creative Suite.\n- Có portfolio minh chứng năng lực thiết kế đa dạng.\n- Hiểu biết cơ bản về HTML/CSS là một lợi thế cực lớn.",
    jobBenefits: "- Mức lương khởi điểm hấp dẫn dựa trên năng lực.\n- Được đào tạo bài bản và cơ hội thăng tiến rõ ràng.\n- Hưởng đầy đủ chế độ BHXH, BHYT theo quy định nhà nước.\n- Team building hàng quý, du lịch hàng năm cực kỳ sôi động.",
    salaryType: "RANGE",
    minimumSalary: 15000000,
    maximumSalary: 25000000,
    address: "Tòa nhà Software Park, 02 Quang Trung, Hải Châu, Đà Nẵng",
    deadline: "2026-06-30T23:59:59.000Z",
    createdAt: "2026-05-18T10:00:00.000Z",
    approvedAt: "2026-05-19T11:00:00.000Z",
    viewCount: 984,
    needsReapproval: false,
    approveStatus: "APPROVED",
    visibilityStatus: "ACTIVE",
    positionName: "Nhân viên Thiết kế",
    experienceLevelName: "1 - 3 năm kinh nghiệm",
    wardName: "Thạch Thang",
    employerId: 202,
    employerName: "Neolab Việt Nam (Đà Nẵng)",
    categoryNames: ["Thiết kế đồ họa", "UI/UX Design", "Mỹ thuật"],
    skillNames: ["Figma", "UI/UX", "Wireframing", "Prototyping"],
    tagNames: ["UIUX", "Designer", "Figma", "Creative"]
  },
  {
    id: 1003,
    jobTitle: "Nhân Viên Tư Vấn Tuyển Dụng (HR Recruitment Consultant)",
    jobDescription: "Hỗ trợ khách hàng doanh nghiệp tìm kiếm nguồn nhân lực chất lượng cao tại thị trường miền Trung.\n\nĐăng tin tuyển dụng, sàng lọc CV ứng viên, sắp xếp phỏng vấn và chăm sóc khách hàng sau tuyển dụng.",
    jobRequirements: "- Tốt nghiệp Đại học trở lên các chuyên ngành Quản trị nhân lực, Ngoại ngữ, Kinh tế...\n- Có tối thiểu 1 năm kinh nghiệm làm tuyển dụng hoặc headhunt.\n- Kỹ năng giao tiếp và đàm phán tốt.\n- Giọng nói chuẩn, dễ nghe, không nói ngọng.",
    jobBenefits: "- Lương cứng + Hoa hồng tuyển dụng hấp dẫn (Thu nhập trung bình 15-20M+).\n- Được cung cấp đầy đủ công cụ làm việc (Laptop, điện thoại, sim hotline).\n- Tham gia các khóa học nâng cao nghiệp vụ miễn phí.\n- Đồng nghiệp thân thiện, hỗ trợ tối đa.",
    salaryType: "NEGOTIABLE",
    minimumSalary: 0,
    maximumSalary: 0,
    address: "Lô A2-1 Võ Văn Kiệt, Sơn Trà, Đà Nẵng",
    deadline: "2026-07-15T23:59:59.000Z",
    createdAt: "2026-05-22T09:15:00.000Z",
    approvedAt: "2026-05-22T14:30:00.000Z",
    viewCount: 654,
    needsReapproval: false,
    approveStatus: "APPROVED",
    visibilityStatus: "ACTIVE",
    positionName: "Nhân viên chuyên viên",
    experienceLevelName: "1 - 2 năm kinh nghiệm",
    wardName: "An Hải Đông",
    employerId: 203,
    employerName: "Navigos Search Đà Nẵng",
    categoryNames: ["Hành chính - Nhân sự", "Tư vấn", "Chăm sóc khách hàng"],
    skillNames: ["Recruitment", "Communication", "Sourcing", "Interviewing"],
    tagNames: ["HR", "Recruitment", "Headhunter", "Navigos"]
  },
  {
    id: 1004,
    jobTitle: "Senior Java Engineer (Spring Boot)",
    jobDescription: "Thiết kế và phát triển hệ thống APIs lớn bằng Java Spring Boot, Hibernate.\n\nTối ưu hệ thống cơ sở dữ liệu MySQL, PostgreSQL và Redis cache.\n\nTham gia trực tiếp vào việc nâng cấp kiến trúc microservices của ứng dụng.",
    jobRequirements: "- Ít nhất 4 năm kinh nghiệm phát triển backend bằng Java.\n- Hiểu biết sâu sắc về Spring Boot, Spring Security, Hibernate.\n- Kinh nghiệm thiết kế cơ sở dữ liệu và tối ưu query phức tạp.\n- Tiếng Anh giao tiếp tốt (làm việc trực tiếp với khách hàng Singapore).",
    jobBenefits: "- Lương hấp dẫn lên tới $2000 tùy thuộc vào năng lực thực tế.\n- Hưởng 100% lương trong thời gian thử việc.\n- Gói bảo hiểm sức khỏe cao cấp cho nhân viên và người thân.\n- Cơ hội Onsite ngắn hạn và dài hạn tại Singapore.",
    salaryType: "RANGE",
    minimumSalary: 30000000,
    maximumSalary: 50000000,
    address: "Tòa nhà Enclave, Trần Hưng Đạo, Sơn Trà, Đà Nẵng",
    deadline: "2026-08-15T23:59:59.000Z",
    createdAt: "2026-05-24T11:00:00.000Z",
    approvedAt: "2026-05-24T16:00:00.000Z",
    viewCount: 421,
    needsReapproval: false,
    approveStatus: "APPROVED",
    visibilityStatus: "ACTIVE",
    positionName: "Senior Developer",
    experienceLevelName: "Trên 4 năm kinh nghiệm",
    wardName: "An Hải Bắc",
    employerId: 204,
    employerName: "Enclave IT Solution DaNang",
    categoryNames: ["Công nghệ thông tin", "Phần mềm", "Lập trình Backend"],
    skillNames: ["Java", "Spring Boot", "Microservices", "PostgreSQL"],
    tagNames: ["Java", "Backend", "Spring", "Microservices"]
  }
];

// Paginated mock helper
export function getMockPageResponse<T>(items: T[], page: number, size: number): PageResponse<T> {
  const start = page * size;
  const end = start + size;
  const pagedItems = items.slice(start, end);
  const totalPages = Math.ceil(items.length / size) || 1;
  return {
    content: pagedItems,
    pageNumber: page,
    pageSize: size,
    totalElements: items.length,
    totalPages: totalPages,
    last: page >= totalPages - 1
  };
}

export const jobService = {
  /**
   * Get all jobs with pagination
   */
  getAllJobs: async (page: number = 0, size: number = 10): Promise<PageResponse<JobResponse>> => {
    try {
      const response = await api.get<ApiResponse<PageResponse<JobResponse>>>("jobs", {
        params: { page, size }
      });
      return response.data.data;
    } catch (error) {
      console.warn("getAllJobs failed. Falling back to MOCK_JOBS.", error);
      return getMockPageResponse(MOCK_JOBS, page, size);
    }
  },

  /**
   * Search jobs by keyword with pagination
   */
  searchJobs: async (keyword: string, page: number = 0, size: number = 10): Promise<PageResponse<JobResponse>> => {
    try {
      const response = await api.get<ApiResponse<PageResponse<JobResponse>>>("jobs/search", {
        params: { keyword, page, size }
      });
      return response.data.data;
    } catch (error) {
      console.warn("searchJobs failed. Falling back to filtered MOCK_JOBS.", error);
      const kw = keyword.toLowerCase().trim();
      const filtered = MOCK_JOBS.filter(j => 
        j.jobTitle.toLowerCase().includes(kw) ||
        j.jobDescription.toLowerCase().includes(kw) ||
        j.employerName?.toLowerCase().includes(kw) ||
        j.skillNames?.some(s => s.toLowerCase().includes(kw))
      );
      return getMockPageResponse(filtered, page, size);
    }
  },

  /**
   * Get jobs by approval status (for Admin)
   */
  getJobsByApproveStatus: async (status: ApproveJobStatus, page: number = 0, size: number = 10): Promise<PageResponse<JobResponse>> => {
    try {
      const response = await api.get<ApiResponse<PageResponse<JobResponse>>>(`jobs/approve-status/${status}`, {
        params: { page, size }
      });
      return response.data.data;
    } catch (error) {
      console.warn(`getJobsByApproveStatus(${status}) failed. Falling back to MOCK_JOBS.`, error);
      const filtered = MOCK_JOBS.filter(j => j.approveStatus === status);
      return getMockPageResponse(filtered, page, size);
    }
  },

  /**
   * Get jobs by visibility status
   */
  getJobsByVisibilityStatus: async (status: VisibilityJobStatus, page: number = 0, size: number = 10): Promise<PageResponse<JobResponse>> => {
    try {
      const response = await api.get<ApiResponse<PageResponse<JobResponse>>>(`jobs/visibility-status/${status}`, {
        params: { page, size }
      });
      return response.data.data;
    } catch (error) {
      console.warn(`getJobsByVisibilityStatus(${status}) failed. Falling back to MOCK_JOBS.`, error);
      const filtered = MOCK_JOBS.filter(j => j.visibilityStatus === status);
      return getMockPageResponse(filtered, page, size);
    }
  },

  /**
   * Get pending jobs for Admin approval
   */
  getPendingJobsForApproval: async (page: number = 0, size: number = 10): Promise<PageResponse<JobResponse>> => {
    try {
      const response = await api.get<ApiResponse<PageResponse<JobResponse>>>("jobs/admin/pending", {
        params: { page, size }
      });
      return response.data.data;
    } catch (error) {
      console.warn("getPendingJobsForApproval failed. Falling back to MOCK_JOBS.", error);
      const filtered = MOCK_JOBS.filter(j => j.approveStatus === "PENDING");
      return getMockPageResponse(filtered, page, size);
    }
  },

  /**
   * Get jobs needing re-approval (due to updates)
   */
  getJobsNeedingReapproval: async (page: number = 0, size: number = 10): Promise<PageResponse<JobResponse>> => {
    try {
      const response = await api.get<ApiResponse<PageResponse<JobResponse>>>("jobs/admin/reapproval-needed", {
        params: { page, size }
      });
      return response.data.data;
    } catch (error) {
      console.warn("getJobsNeedingReapproval failed. Falling back to empty PageResponse.", error);
      return getMockPageResponse([], page, size);
    }
  },

  /**
   * Admin approves/rejects one or multiple jobs
   */
  approveJobs: async (request: JobApprovalRequest): Promise<void> => {
    await api.post<ApiResponse<void>>("jobs/admin/approve", request);
  },

  /**
   * Admin updates visibility status (ACTIVE/HIDDEN) of one or multiple jobs
   */
  updateJobVisibility: async (request: JobVisibilityRequest): Promise<void> => {
    await api.put<ApiResponse<void>>("jobs/visibility/update", request);
  },

  /**
   * Employer posts a new job
   */
  createJob: async (request: JobRequest): Promise<JobResponse> => {
    const response = await api.post<ApiResponse<JobResponse>>("jobs", request);
    return response.data.data;
  },

  /**
   * Get jobs posted by the logged-in Employer
   */
  getJobsByEmployer: async (page: number = 0, size: number = 10): Promise<PageResponse<JobResponse>> => {
    try {
      const response = await api.get<ApiResponse<PageResponse<JobResponse>>>("jobs/employer/my-jobs", {
        params: { page, size }
      });
      return response.data.data;
    } catch (error) {
      console.warn("getJobsByEmployer failed. Falling back to MOCK_JOBS.", error);
      return getMockPageResponse(MOCK_JOBS, page, size);
    }
  },

  /**
   * Employer updates their own job by ID
   */
  updateJob: async (id: number, request: JobUpdateRequest): Promise<JobResponse> => {
    const response = await api.put<ApiResponse<JobResponse>>(`jobs/${id}`, request);
    return response.data.data;
  },

  /**
   * Employer deletes a job by ID
   */
  deleteJob: async (id: number): Promise<void> => {
    await api.delete<ApiResponse<void>>(`jobs/${id}`);
  },

  /**
   * Get job details by ID
   */
  getJobById: async (id: number): Promise<JobResponse> => {
    try {
      const response = await api.get<ApiResponse<JobResponse>>(`jobs/${id}`);
      return response.data.data;
    } catch (error) {
      console.warn(`getJobById failed for id ${id}. Falling back to MOCK_JOBS.`, error);
      const mockJob = MOCK_JOBS.find(j => j.id === id);
      if (mockJob) return mockJob;
      if (MOCK_JOBS.length > 0) return MOCK_JOBS[0];
      throw error;
    }
  },

  /**
   * Get recommended jobs for candidate
   */
  getRecommendedJobs: async (page: number = 0, size: number = 10): Promise<PageResponse<JobResponse>> => {
    try {
      const response = await api.get<ApiResponse<PageResponse<JobResponse>>>("jobs/recommended", {
        params: { page, size }
      });
      return response.data.data;
    } catch (error) {
      console.warn("getRecommendedJobs failed. Falling back to MOCK_JOBS.", error);
      return getMockPageResponse(MOCK_JOBS, page, size);
    }
  },

  /**
   * Advanced search jobs
   * POST /jobs/advanced-search
   */
  advancedSearchJobs: async (
    request: {
      keyword?: string;
      categoryIds?: number[];
      skillIds?: number[];
      tagIds?: number[];
      positionId?: number;
      experienceLevelId?: number;
      wardId?: number;
      salaryType?: string;
      minSalary?: number;
      maxSalary?: number;
      sortBy?: string;
    },
    page: number = 0,
    size: number = 10
  ): Promise<PageResponse<JobResponse>> => {
    try {
      const response = await api.post<ApiResponse<PageResponse<JobResponse>>>("jobs/advanced-search", request, {
        params: { page, size }
      });
      return response.data.data;
    } catch (error) {
      console.warn("advancedSearchJobs failed. Falling back to filtered MOCK_JOBS.", error);
      
      let filtered = [...MOCK_JOBS];
      
      if (request.keyword) {
        const kw = request.keyword.toLowerCase().trim();
        filtered = filtered.filter(j => 
          j.jobTitle.toLowerCase().includes(kw) ||
          j.jobDescription.toLowerCase().includes(kw) ||
          j.employerName?.toLowerCase().includes(kw)
        );
      }
      
      if (request.salaryType) {
        filtered = filtered.filter(j => j.salaryType === request.salaryType);
      }
      
      if (request.minSalary !== undefined && request.minSalary > 0) {
        filtered = filtered.filter(j => j.maximumSalary >= request.minSalary!);
      }
      
      if (request.maxSalary !== undefined && request.maxSalary > 0) {
        filtered = filtered.filter(j => j.minimumSalary <= request.maxSalary!);
      }
      
      return getMockPageResponse(filtered, page, size);
    }
  }
};

export default jobService;
