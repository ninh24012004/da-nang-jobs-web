"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function CandidateApplicationsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/candidate/profile?tab=applications");
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
      <div className="flex flex-col items-center gap-3 bg-white p-8 rounded-[8px] border border-slate-200 shadow-sm">
        <Loader2 className="h-10 w-10 animate-spin text-[#00B14F]" />
        <p className="text-slate-500 font-bold text-xs tracking-wide">Đang chuyển hướng đến danh sách ứng tuyển...</p>
      </div>
    </div>
  );
}
