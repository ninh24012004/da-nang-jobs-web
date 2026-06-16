import { Suspense } from "react";
import LoginForm from "@/components/forms/LoginForm";

export default function EmployerLoginPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-t-[#0F172A] border-slate-200" />
      </div>
    }>
      <LoginForm userType="employer" />
    </Suspense>
  );
}