"use client";

import { useState, useCallback } from "react";
import { resumeService } from "@/services/resumeService";
import { ResumeRequest, ResumeResponse } from "@/types/resume";

export function useResumes() {
  const [resumes, setResumes] = useState<ResumeResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMyResumes = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await resumeService.getMyResumes();
      setResumes(data || []);
      return data;
    } catch (err: any) {
      console.error("Error fetching resumes:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createResume = useCallback(async (request: ResumeRequest) => {
    setIsSubmitting(true);
    try {
      const data = await resumeService.createResume(request);
      setResumes((prev) => {
        // If the new CV is set to default, we must make all other CVs non-default
        if (data.isDefault) {
          return prev.map((r) => ({ ...r, isDefault: false })).concat(data);
        }
        return [...prev, data];
      });
      return data;
    } catch (err: any) {
      console.error("Error creating resume:", err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const setDefault = useCallback(async (id: number) => {
    setIsSubmitting(true);
    try {
      const data = await resumeService.setDefaultResume(id);
      setResumes((prev) =>
        prev.map((r) => ({
          ...r,
          isDefault: r.id === id,
        }))
      );
      return data;
    } catch (err: any) {
      console.error("Error setting default resume:", err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const deleteResume = useCallback(async (id: number) => {
    setIsSubmitting(true);
    try {
      await resumeService.deleteResume(id);
      setResumes((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      console.error("Error deleting resume:", err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return {
    resumes,
    isLoading,
    isSubmitting,
    fetchMyResumes,
    createResume,
    setDefault,
    deleteResume,
    setResumes,
  };
}
export default useResumes;
