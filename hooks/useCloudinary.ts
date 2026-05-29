"use client";

import { useState, useCallback } from "react";
import { uploadLogoImage, uploadBusinessLicensePDF, uploadResumePDF } from "@/services/cloudinaryService";

export function useCloudinary() {
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingLicense, setIsUploadingLicense] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);

  const uploadLogo = useCallback(async (file: File) => {
    setIsUploadingLogo(true);
    try {
      const url = await uploadLogoImage(file);
      return url;
    } finally {
      setIsUploadingLogo(false);
    }
  }, []);

  const uploadLicense = useCallback(async (file: File) => {
    setIsUploadingLicense(true);
    try {
      const url = await uploadBusinessLicensePDF(file);
      return url;
    } finally {
      setIsUploadingLicense(false);
    }
  }, []);

  const uploadResume = useCallback(async (file: File) => {
    setIsUploadingResume(true);
    try {
      const url = await uploadResumePDF(file);
      return url;
    } finally {
      setIsUploadingResume(false);
    }
  }, []);

  return {
    isUploadingLogo,
    isUploadingLicense,
    isUploadingResume,
    uploadLogo,
    uploadLicense,
    uploadResume,
  };
}

