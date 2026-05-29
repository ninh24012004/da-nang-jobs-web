"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminEmployerPendingPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/employer");
  }, [router]);
  return null;
}
