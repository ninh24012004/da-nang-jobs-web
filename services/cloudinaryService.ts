/**
 * Cloudinary Upload Service
 * Uses unsigned upload presets for direct browser uploads
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export type CloudinaryResourceType = "image" | "raw" | "auto";

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  resource_type: string;
  format: string;
  bytes: number;
  original_filename: string;
}

/**
 * Upload a file to Cloudinary via unsigned upload preset
 * @param file - The file to upload
 * @param resourceType - "image" for images, "raw" for PDFs/documents
 * @param folder - Optional subfolder in Cloudinary (e.g. "employer-logos", "business-licenses")
 */
export async function uploadToCloudinary(
  file: File,
  resourceType: CloudinaryResourceType = "auto",
  folder?: string
): Promise<CloudinaryUploadResult> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      "Cloudinary chưa được cấu hình. Vui lòng thêm NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME và NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET vào .env.local"
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  if (folder) {
    formData.append("folder", folder);
  }

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData?.error?.message || `Upload thất bại: ${response.statusText}`
    );
  }

  return response.json() as Promise<CloudinaryUploadResult>;
}

/**
 * Upload a logo image (jpg, png, webp, svg)
 */
export async function uploadLogoImage(file: File): Promise<string> {
  const result = await uploadToCloudinary(file, "image", "employer-logos");
  return result.secure_url;
}

/**
 * Upload a business license PDF
 */
export async function uploadBusinessLicensePDF(file: File): Promise<string> {
  const result = await uploadToCloudinary(file, "auto", "business-licenses");
  return result.secure_url;
}

/**
 * Upload a candidate resume file (PDF, Docx, Doc)
 */
export async function uploadResumePDF(file: File): Promise<string> {
  const result = await uploadToCloudinary(file, "auto", "candidate-resumes");
  return result.secure_url;
}

