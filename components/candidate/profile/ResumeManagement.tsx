"use client";

import React, { useState } from "react";
import { FileText, Plus, Loader2, UploadCloud, Download, Trash2, Check, CheckCircle2, X, Save } from "lucide-react";
import { toast } from "sonner";
import { useCandidateProfile } from "@/app/candidate/profile/CandidateProfileContext";

export default function ResumeManagement() {
  const {
    resumes,
    isLoadingResumes,
    isResumeActionSubmitting,
    isUploadingResume,
    createResume,
    setDefault,
    deleteResume,
    uploadResume,
  } = useCandidateProfile();

  // Local UI States for CV Management
  const [isOpenResumeModal, setIsOpenResumeModal] = useState(false);
  const [resumeForm, setResumeForm] = useState({
    title: "",
    description: "",
    fileUrl: "",
    isDefault: false,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploadFileName, setUploadFileName] = useState("");
  const [resumeToDelete, setResumeToDelete] = useState<number | null>(null);

  return (
    <div className="space-y-5 text-left animate-fadeIn">
      <div className="bg-white p-5 rounded-[8px] border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-0.5">
          <h3 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-1.5">
            <FileText className="text-[#00B14F]" size={16} />
            <span>Hồ sơ CV của tôi</span>
          </h3>
          <p className="text-[10px] text-slate-455 font-medium">
            Tải lên và lưu các file CV trực tuyến để dễ dàng ứng tuyển việc làm
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setResumeForm({ title: "", description: "", fileUrl: "", isDefault: false });
            setResumeFile(null);
            setUploadFileName("");
            setIsOpenResumeModal(true);
          }}
          className="bg-[#00B14F] hover:bg-[#00873D] text-white px-4 py-2 rounded-[6px] text-xs font-bold shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer border-none"
        >
          <Plus size={14} />
          <span>Tải lên CV mới</span>
        </button>
      </div>

      {isLoadingResumes ? (
        <div className="py-20 flex flex-col items-center justify-center gap-2 bg-white border border-slate-200 rounded-[8px]">
          <Loader2 className="h-8 w-8 animate-spin text-[#00B14F]" />
          <p className="text-xs text-slate-400 font-semibold">Đang tải danh sách CV...</p>
        </div>
      ) : resumes.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-[8px] border border-slate-200 flex flex-col items-center justify-center space-y-4 shadow-sm">
          <div className="h-12 w-12 bg-slate-50 border border-dashed border-slate-250 rounded-[8px] flex items-center justify-center text-slate-400">
            <UploadCloud size={24} />
          </div>
          <div className="max-w-md space-y-1">
            <h4 className="font-bold text-slate-700 text-sm">Bạn chưa tải lên CV nào</h4>
            <p className="text-xs text-slate-500 leading-normal">
              Hãy tải lên CV đầu tiên để bắt đầu kết nối trực tiếp với các nhà tuyển dụng tại Đà Nẵng.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setResumeForm({ title: "", description: "", fileUrl: "", isDefault: false });
              setResumeFile(null);
              setUploadFileName("");
              setIsOpenResumeModal(true);
            }}
            className="px-4 py-2 bg-[#00B14F] hover:bg-[#00873D] text-white rounded-[6px] text-xs font-bold transition-colors cursor-pointer border-none"
          >
            Tải lên CV ngay
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((resume) => (
            <div
              key={resume.id}
              className={`bg-white border rounded-[8px] p-5 hover:shadow-md transition-all duration-150 flex flex-col justify-between space-y-4 relative border-slate-200 ${
                resume.isDefault ? "ring-2 ring-[#00B14F]/20 border-[#00B14F]/40 shadow-sm" : ""
              }`}
            >
              {resume.isDefault && (
                <div className="absolute right-0 top-0 bg-[#00B14F] text-white font-bold text-[9px] px-2.5 py-1 rounded-bl-[6px] uppercase tracking-wider flex items-center gap-0.5">
                  <Check size={10} className="stroke-[3]" />
                  <span>Mặc định</span>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-red-50 text-red-500 rounded-[6px] flex-shrink-0">
                    <FileText size={20} className="fill-red-50" />
                  </div>
                  <div className="space-y-0.5 select-none pr-8">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-800 leading-snug break-words line-clamp-2" title={resume.title}>
                      {resume.title}
                    </h4>
                    <p className="text-[9px] text-slate-400 font-semibold">
                      Tải lên: {new Date(resume.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 font-normal leading-relaxed line-clamp-2 bg-slate-50 p-2 rounded-[6px] border border-slate-100 break-words" title={resume.description}>
                  {resume.description || "Không có mô tả cho CV này."}
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <a
                    href={resume.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-[6px] text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                  >
                    <Download size={13} />
                    <span>Tải xuống</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setResumeToDelete(resume.id)}
                    className="p-1.5 border border-red-200 text-red-500 hover:bg-red-55 rounded-[6px] transition-colors cursor-pointer flex items-center justify-center bg-white"
                    title="Xóa CV"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                {!resume.isDefault && (
                  <button
                    type="button"
                    disabled={isResumeActionSubmitting}
                    onClick={() => {
                      toast.promise(setDefault(resume.id), {
                        loading: "Đang đặt CV mặc định...",
                        success: "Đã thiết lập CV mặc định thành công!",
                        error: "Thiết lập thất bại. Vui lòng thử lại!"
                      });
                    }}
                    className="w-full py-1.5 border border-dashed border-[#00B14F]/50 hover:border-[#00B14F] bg-[#00B14F]/5 text-[#00B14F] rounded-[6px] text-xs font-bold text-center transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Đặt làm CV mặc định
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ==================== UPLOAD CV MODAL ==================== */}
      {isOpenResumeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 transition-all duration-150">
          <div className="fixed inset-0" onClick={() => !isUploadingResume && !isResumeActionSubmitting && setIsOpenResumeModal(false)}></div>

          <div className="bg-white w-full max-w-lg rounded-[8px] shadow-md overflow-hidden border border-slate-200 flex flex-col text-slate-800 relative z-10">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="text-left space-y-0.5">
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#00B14F] bg-[#00B14F]/10 px-2 py-0.5 rounded-[4px] border border-[#00B14F]/20">
                  CV ứng viên
                </span>
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-800">
                  Tải lên file CV mới
                </h3>
              </div>
              <button
                type="button"
                disabled={isUploadingResume || isResumeActionSubmitting}
                onClick={() => setIsOpenResumeModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-450 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!resumeForm.title.trim()) {
                  return toast.error("Vui lòng nhập tiêu đề hồ sơ CV!");
                }
                if (!resumeForm.description.trim()) {
                  return toast.error("Vui lòng cung cấp mô tả tóm tắt CV!");
                }
                if (!resumeForm.fileUrl && !resumeFile) {
                  return toast.error("Vui lòng chọn file CV hoặc kéo thả file vào khung tải lên!");
                }

                try {
                  let uploadedUrl = resumeForm.fileUrl;

                  if (resumeFile) {
                    toast.loading("Đang tải tệp CV của bạn lên Cloudinary...", { id: "upload-cv" });
                    uploadedUrl = await uploadResume(resumeFile);
                    toast.success("Tải tệp CV lên Cloudinary thành công!", { id: "upload-cv" });
                  }

                  await createResume({
                    title: resumeForm.title.trim(),
                    description: resumeForm.description.trim(),
                    fileUrl: uploadedUrl,
                    isDefault: resumeForm.isDefault
                  });

                  toast.success("Tải lên và lưu CV thành công!");
                  setIsOpenResumeModal(false);
                } catch (err: any) {
                  toast.error(err.message || "Tải lên CV thất bại. Vui lòng thử lại!");
                }
              }}
              className="p-6 space-y-4 text-xs font-semibold text-left"
            >
              <div className="space-y-1">
                <label className="text-slate-500 uppercase tracking-wider block">Tiêu đề CV <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: CV Lập trình viên NodeJS - Nguyễn Văn A"
                  value={resumeForm.title}
                  onChange={(e) => setResumeForm((prev) => ({ ...prev, title: e.target.value }))}
                  disabled={isUploadingResume || isResumeActionSubmitting}
                  className="w-full bg-white border border-slate-200 focus:border-[#00B14F] focus:ring-1 focus:ring-[#00B14F] rounded-[6px] px-3.5 py-2 text-slate-705 font-medium outline-none transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 uppercase tracking-wider block">Mô tả tóm tắt CV <span className="text-red-500">*</span></label>
                <textarea
                  required
                  rows={3}
                  placeholder="Kinh nghiệm ngắn, điểm mạnh chuyên môn nổi bật..."
                  value={resumeForm.description}
                  onChange={(e) => setResumeForm((prev) => ({ ...prev, description: e.target.value }))}
                  disabled={isUploadingResume || isResumeActionSubmitting}
                  className="w-full bg-white border border-slate-200 focus:border-[#00B14F] focus:ring-1 focus:ring-[#00B14F] rounded-[6px] px-3.5 py-2 text-slate-705 font-medium outline-none transition-colors resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 uppercase tracking-wider block">File đính kèm (PDF, DOCX) <span className="text-red-500">*</span></label>
                
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (!isUploadingResume && !isResumeActionSubmitting) setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (isUploadingResume || isResumeActionSubmitting) return;

                    const droppedFile = e.dataTransfer.files?.[0];
                    if (droppedFile) {
                      const fileExt = droppedFile.name.split(".").pop()?.toLowerCase();
                      if (fileExt !== "pdf" && fileExt !== "docx" && fileExt !== "doc") {
                        toast.error("Vui lòng tải lên file PDF, DOCX hoặc DOC!");
                        return;
                      }
                      if (droppedFile.size > 5 * 1024 * 1024) {
                        toast.error("Dung lượng file tối đa là 5MB!");
                        return;
                      }
                      setResumeFile(droppedFile);
                      setUploadFileName(droppedFile.name);
                      toast.success(`Đã chọn file: ${droppedFile.name}`);
                    }
                  }}
                  className={`border border-dashed rounded-[8px] p-5 text-center transition-colors flex flex-col items-center justify-center gap-1.5 select-none ${
                    isDragging 
                      ? "border-[#00B14F] bg-[#00B14F]/5" 
                      : uploadFileName 
                        ? "border-emerald-300 bg-emerald-50/5" 
                        : "border-slate-350 hover:border-[#00B14F]/50 bg-slate-55/30"
                  }`}
                >
                  {isUploadingResume ? (
                    <div className="py-2 flex flex-col items-center gap-1 text-[#00B14F]">
                      <Loader2 size={24} className="animate-spin" />
                      <span className="font-bold text-[10px]">Đang tải tệp lên Cloudinary...</span>
                    </div>
                  ) : uploadFileName ? (
                    <div className="py-1 flex flex-col items-center gap-1.5">
                      <div className="p-1.5 bg-emerald-50 rounded-[4px] text-emerald-500">
                        <CheckCircle2 size={16} />
                      </div>
                      <div className="space-y-0.5">
                        <p className="font-semibold text-slate-800 text-[10px] line-clamp-1">{uploadFileName}</p>
                        <p className="text-[9px] text-slate-400 font-normal">Bấm bên dưới để thay đổi tệp</p>
                      </div>
                      <input
                        type="file"
                        id="resume-file"
                        accept=".pdf,.docx,.doc"
                        onChange={(e) => {
                          const selectedFile = e.target.files?.[0];
                          if (selectedFile) {
                            setResumeFile(selectedFile);
                            setUploadFileName(selectedFile.name);
                          }
                        }}
                        className="hidden"
                      />
                      <label htmlFor="resume-file" className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-[6px] text-[9px] font-bold cursor-pointer transition-colors">
                        Thay đổi
                      </label>
                    </div>
                  ) : (
                    <>
                      <UploadCloud size={20} className="text-[#00B14F]/70" />
                      <div className="space-y-0.5">
                        <p className="font-bold text-slate-700">Kéo & thả file CV của bạn vào đây</p>
                        <p className="text-[10px] text-slate-400 font-normal">Hỗ trợ định dạng PDF, DOCX, DOC lên tới 5MB</p>
                      </div>
                      
                      <input
                        type="file"
                        id="resume-file-new"
                        accept=".pdf,.docx,.doc"
                        onChange={(e) => {
                          const selectedFile = e.target.files?.[0];
                          if (selectedFile) {
                            if (selectedFile.size > 5 * 1024 * 1024) {
                              toast.error("Dung lượng file tối đa là 5MB!");
                              return;
                            }
                            setResumeFile(selectedFile);
                            setUploadFileName(selectedFile.name);
                          }
                        }}
                        className="hidden"
                      />
                      <label htmlFor="resume-file-new" className="px-3 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-[6px] text-[10px] font-bold cursor-pointer transition-colors shadow-sm">
                        Chọn tệp
                      </label>
                    </>
                  )}
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer py-1 select-none w-fit">
                <input
                  type="checkbox"
                  checked={resumeForm.isDefault}
                  onChange={(e) => setResumeForm((prev) => ({ ...prev, isDefault: e.target.checked }))}
                  disabled={isUploadingResume || isResumeActionSubmitting}
                  className="rounded border-slate-350 text-[#00B14F] focus:ring-[#00B14F] w-4 h-4 cursor-pointer"
                />
                <span className="text-slate-655 hover:text-slate-800 transition-colors font-medium">Đặt làm mặc định sau khi lưu</span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isUploadingResume || isResumeActionSubmitting}
                  onClick={() => setIsOpenResumeModal(false)}
                  className="px-4 py-2 border border-slate-250 hover:bg-slate-50 text-slate-655 rounded-[6px] font-semibold transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isUploadingResume || isResumeActionSubmitting}
                  className="bg-[#00B14F] hover:bg-[#00873D] text-white px-5 py-2 rounded-[6px] font-bold shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer border-none"
                >
                  {isUploadingResume || isResumeActionSubmitting ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Save size={13} />
                  )}
                  <span>Tải lên & Lưu</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== DELETE CONFIRMATION MODAL ==================== */}
      {resumeToDelete !== null && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 transition-all duration-150">
          <div className="fixed inset-0" onClick={() => !isResumeActionSubmitting && setResumeToDelete(null)}></div>

          <div className="bg-white w-full max-w-sm rounded-[8px] shadow-md p-6 border border-slate-200 flex flex-col text-center space-y-4 text-slate-800 relative z-10">
            <div className="h-12 w-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto flex-shrink-0">
              <Trash2 size={20} />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-850 text-base">Xác nhận xóa tệp hồ sơ CV</h4>
              <p className="text-xs text-slate-455 leading-relaxed font-normal">
                Hành động này không thể hoàn tác. File CV đính kèm sẽ bị xóa hoàn toàn khỏi hệ thống.
              </p>
            </div>
            
            <div className="flex items-center gap-2 justify-center text-xs font-bold pt-2">
              <button
                type="button"
                disabled={isResumeActionSubmitting}
                onClick={() => setResumeToDelete(null)}
                className="w-1/2 py-2 border border-slate-250 hover:bg-slate-50 text-slate-655 rounded-[6px] transition-colors cursor-pointer"
              >
                Không, giữ lại
              </button>
              <button
                type="button"
                disabled={isResumeActionSubmitting}
                onClick={async () => {
                  try {
                    if (resumeToDelete !== null) {
                      await deleteResume(resumeToDelete);
                    }
                    toast.success("Xóa hồ sơ CV thành công!");
                    setResumeToDelete(null);
                  } catch (err: any) {
                    toast.error("Xóa CV thất bại. Vui lòng thử lại!");
                  }
                }}
                className="w-1/2 py-2 bg-red-500 hover:bg-red-600 text-white rounded-[6px] shadow-sm transition-colors cursor-pointer border-none flex items-center justify-center gap-1"
              >
                {isResumeActionSubmitting && <Loader2 size={13} className="animate-spin" />}
                <span>Xóa CV</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
