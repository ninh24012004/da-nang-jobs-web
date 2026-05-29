"use client";

import { useState, useCallback } from "react";
import employerService from "@/services/employerService";
import {
  EmployerResponse,
  EmployerUpdateResponse,
  UpdateEmployerRequest,
  UpdateEmployerNowRequest,
  RejectEmployerRequest,
  EmployerStatus,
} from "@/types/employer";
import { PageResponse } from "@/types/pageResponse";

export function useEmployers() {
  const [profile, setProfile] = useState<EmployerResponse | null>(null);
  const [companies, setCompanies] = useState<EmployerResponse[]>([]);
  const [pendingCompanies, setPendingCompanies] = useState<EmployerUpdateResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await employerService.getEmployerProfile();
      setProfile(data);
      return data;
    } catch (err: any) {
      console.error(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (request: UpdateEmployerRequest) => {
    setIsSubmitting(true);
    try {
      const data = await employerService.updateEmployerProfile(request);
      setProfile(data);
      return data;
    } catch (err: any) {
      console.error(err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const updateProfileNow = useCallback(async (request: UpdateEmployerNowRequest) => {
    setIsSubmitting(true);
    try {
      const data = await employerService.updateEmployerProfileNow(request);
      setProfile(data);
      return data;
    } catch (err: any) {
      console.error(err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const fetchUpdateFirstNew = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await employerService.getUpdateFirstNew();
      return data;
    } catch (err: any) {
      console.error(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAllCompanies = useCallback(async (page: number = 0, size: number = 10) => {
    setIsLoading(true);
    try {
      const res = await employerService.getAllCompanies(page, size);
      setCompanies(res.content || []);
      return res;
    } catch (err: any) {
      console.error(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPendingCompanies = useCallback(async (page: number = 0, size: number = 10) => {
    setIsLoading(true);
    try {
      const res = await employerService.getPendingCompanies(page, size);
      setPendingCompanies(res.content || []);
      return res;
    } catch (err: any) {
      console.error(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCompaniesByStatus = useCallback(async (status: EmployerStatus, page: number = 0, size: number = 10) => {
    setIsLoading(true);
    try {
      const res = await employerService.getCompaniesByStatus(status, page, size);
      setCompanies(res.content || []);
      return res;
    } catch (err: any) {
      console.error(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const approveEmployer = useCallback(async (employerId: number) => {
    setIsSubmitting(true);
    try {
      await employerService.approveEmployer(employerId);
    } catch (err: any) {
      console.error(err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const rejectEmployer = useCallback(async (employerId: number, request: RejectEmployerRequest) => {
    setIsSubmitting(true);
    try {
      await employerService.rejectEmployer(employerId, request);
    } catch (err: any) {
      console.error(err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const changeEmployerStatus = useCallback(async (employerId: number, newStatus: EmployerStatus) => {
    setIsSubmitting(true);
    try {
      await employerService.changeEmployerStatus(employerId, newStatus);
    } catch (err: any) {
      console.error(err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return {
    profile,
    companies,
    pendingCompanies,
    isLoading,
    isSubmitting,
    fetchProfile,
    updateProfile,
    updateProfileNow,
    fetchUpdateFirstNew,
    fetchAllCompanies,
    fetchPendingCompanies,
    fetchCompaniesByStatus,
    approveEmployer,
    rejectEmployer,
    changeEmployerStatus,
  };
}
