"use client";

import React from "react";
import EmployerApplicantTable from "@/components/employer/dashboard/EmployerApplicantTable";
import { useEmployerDashboard } from "../EmployerDashboardContext";

export default function CvsPage() {
  const {
    allEmployerJobs,
    applicants,
    statusFilter,
    setStatusFilter,
    handleExportExcel,
    exportLoading,
    handleUpdateStatus,
    actionLoading
  } = useEmployerDashboard();

  return (
    <EmployerApplicantTable
      jobs={allEmployerJobs}
      applicants={applicants}
      statusFilter={statusFilter}
      onStatusFilterChange={(status) => setStatusFilter(status)}
      onExportExcel={handleExportExcel}
      exportLoading={exportLoading}
      onUpdateStatus={handleUpdateStatus}
      actionLoading={actionLoading}
    />
  );
}
