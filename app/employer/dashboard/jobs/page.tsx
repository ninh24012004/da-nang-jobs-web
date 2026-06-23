"use client";

import React from "react";
import EmployerJobTable from "@/components/employer/dashboard/EmployerJobTable";
import { useEmployerDashboard } from "../EmployerDashboardContext";
import { useRouter } from "next/navigation";

export default function JobsPage() {
  const router = useRouter();
  const {
    realJobs,
    jobsLoading,
    jobsPage,
    setJobsPage,
    jobsTotalPages,
    jobsTotalElements,
    handleEditJobClick,
    handleDeleteJob,
    actionLoading,
    resetForm
  } = useEmployerDashboard();

  return (
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
        router.push("/employer/dashboard/post-job");
      }}
      actionLoading={actionLoading}
    />
  );
}
