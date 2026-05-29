"use client";

import { useState, useCallback } from "react";
import { candidateService } from "@/services/candidateService";
import { CandidateResponse, UpdateCandidateRequest } from "@/types/candidate";

export function useCandidates() {
  const [profile, setProfile] = useState<CandidateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await candidateService.getCandidateProfile();
      setProfile(data);
      return data;
    } catch (err: any) {
      console.error("Error fetching candidate profile:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (request: UpdateCandidateRequest) => {
    setIsSubmitting(true);
    try {
      const data = await candidateService.updateCandidateProfile(request);
      setProfile(data);
      return data;
    } catch (err: any) {
      console.error("Error updating candidate profile:", err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return {
    profile,
    isLoading,
    isSubmitting,
    fetchProfile,
    updateProfile,
    setProfile,
  };
}
