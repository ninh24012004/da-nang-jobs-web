"use client";

import { useState, useCallback } from "react";
import { jobService } from "@/services/jobService";
import { JobResponse, ApproveJobStatus, VisibilityJobStatus, JobRequest, JobUpdateRequest } from "@/types/job";
import { toast } from "sonner";

export interface FetchJobsParams {
    statusFilter: "ALL" | ApproveJobStatus | "REAPPROVAL_NEEDED" | "HIDDEN";
    debouncedSearch: string;
    page: number;
    size: number;
}

export function useJobs() {
    const [jobs, setJobs] = useState<JobResponse[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState("");

    const [counts, setCounts] = useState({
        ALL: 0,
        PENDING: 0,
        REAPPROVAL_NEEDED: 0,
        APPROVED: 0,
        REJECTED: 0,
        HIDDEN: 0
    });

    const fetchCounts = useCallback(async () => {
        try {
            const [allRes, pendingRes, reapprovalRes, approvedRes, rejectedRes, hiddenRes] = await Promise.all([
                jobService.getAllJobs(0, 1).catch(() => ({ totalElements: 0 })),
                jobService.getPendingJobsForApproval(0, 1).catch(() => ({ totalElements: 0 })),
                jobService.getJobsNeedingReapproval(0, 1).catch(() => ({ totalElements: 0 })),
                jobService.getJobsByApproveStatus("APPROVED", 0, 1).catch(() => ({ totalElements: 0 })),
                jobService.getJobsByApproveStatus("REJECTED", 0, 1).catch(() => ({ totalElements: 0 })),
                jobService.getJobsByVisibilityStatus("HIDDEN", 0, 1).catch(() => ({ totalElements: 0 })),
            ]);

            setCounts({
                ALL: allRes.totalElements || 0,
                PENDING: pendingRes.totalElements || 0,
                REAPPROVAL_NEEDED: reapprovalRes.totalElements || 0,
                APPROVED: approvedRes.totalElements || 0,
                REJECTED: rejectedRes.totalElements || 0,
                HIDDEN: hiddenRes.totalElements || 0,
            });
        } catch (err) {
            console.warn("Lỗi khi tải số lượng thống kê tin tuyển dụng:", err);
        }
    }, []);

    const fetchJobs = useCallback(async (params: FetchJobsParams) => {
        const { statusFilter, debouncedSearch, page, size } = params;
        setIsLoading(true);
        setError("");
        try {
            let res;
            if (debouncedSearch && statusFilter === "ALL") {
                res = await jobService.searchJobs(debouncedSearch, page, size);
            } else {
                switch (statusFilter) {
                    case "PENDING":
                        res = await jobService.getPendingJobsForApproval(page, size);
                        break;
                    case "REAPPROVAL_NEEDED":
                        res = await jobService.getJobsNeedingReapproval(page, size);
                        break;
                    case "APPROVED":
                    case "REJECTED":
                        res = await jobService.getJobsByApproveStatus(statusFilter, page, size);
                        break;
                    case "HIDDEN":
                        res = await jobService.getJobsByVisibilityStatus("HIDDEN", page, size);
                        break;
                    default:
                        res = await jobService.getAllJobs(page, size);
                        break;
                }
            }

            setJobs(res.content || []);
            setTotalPages(res.totalPages || 1);
            setTotalElements(res.totalElements || 0);
            return res;
        } catch (err: any) {
            const msg = err.response?.data?.message || err.message || "Lỗi khi tải danh sách tin tuyển dụng";
            setError(msg);
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const approveJobs = useCallback(async (jobIds: number[], status: ApproveJobStatus, rejectionReason?: string) => {
        setActionLoading(true);
        try {
            await jobService.approveJobs({
                jobIds,
                status,
                rejectionReason
            });
            toast.success(
                status === "APPROVED" 
                    ? `Đã phê duyệt ${jobIds.length} tin tuyển dụng thành công!` 
                    : `Đã từ chối ${jobIds.length} tin tuyển dụng!`
            );
            return { success: true };
        } catch (err: any) {
            const msg = err.response?.data?.message || "Duyệt tin tuyển dụng thất bại";
            toast.error(msg);
            return { success: false, error: msg };
        } finally {
            setActionLoading(false);
        }
    }, []);

    const updateJobVisibility = useCallback(async (jobIds: number[], visibilityStatus: VisibilityJobStatus) => {
        setActionLoading(true);
        const actionText = visibilityStatus === "ACTIVE" ? "hiển thị lại" : "ẩn";
        try {
            await jobService.updateJobVisibility({
                jobIds,
                visibilityStatus
            });
            toast.success(`Đã ${actionText} thành công ${jobIds.length} tin tuyển dụng!`);
            return { success: true };
        } catch (err: any) {
            const msg = err.response?.data?.message || "Thay đổi trạng thái hiển thị thất bại";
            toast.error(msg);
            return { success: false, error: msg };
        } finally {
            setActionLoading(false);
        }
    }, []);

    const createJob = useCallback(async (request: JobRequest) => {
        setActionLoading(true);
        try {
            const data = await jobService.createJob(request);
            return data;
        } finally {
            setActionLoading(false);
        }
    }, []);

    const updateJob = useCallback(async (id: number, request: JobUpdateRequest) => {
        setActionLoading(true);
        try {
            const data = await jobService.updateJob(id, request);
            return data;
        } finally {
            setActionLoading(false);
        }
    }, []);

    const deleteJob = useCallback(async (id: number) => {
        setActionLoading(true);
        try {
            await jobService.deleteJob(id);
        } finally {
            setActionLoading(false);
        }
    }, []);

    const fetchJobsByEmployer = useCallback(async (page: number = 0, size: number = 10) => {
        setIsLoading(true);
        try {
            const res = await jobService.getJobsByEmployer(page, size);
            setJobs(res.content || []);
            setTotalPages(res.totalPages || 1);
            setTotalElements(res.totalElements || 0);
            return res;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchRecommendedJobs = useCallback(async (page: number = 0, size: number = 10) => {
        setIsLoading(true);
        setError("");
        try {
            const res = await jobService.getRecommendedJobs(page, size);
            setJobs(res.content || []);
            setTotalPages(res.totalPages || 1);
            setTotalElements(res.totalElements || 0);
            return res;
        } catch (err: any) {
            const msg = err.response?.data?.message || err.message || "Lỗi khi tải danh sách việc làm đề xuất";
            setError(msg);
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    }, []);


    return {
        jobs,
        totalPages,
        totalElements,
        isLoading,
        actionLoading,
        error,
        counts,
        fetchCounts,
        fetchJobs,
        approveJobs,
        updateJobVisibility,
        createJob,
        updateJob,
        deleteJob,
        fetchJobsByEmployer,
        fetchRecommendedJobs,
    };
}
