"use client";

import EmployerHeader from "@/components/layout/employer/EmployerHeader";
import EmployerHero from "@/components/employer/EmployerHero";
import EmployerBigUpdate from "@/components/employer/EmployerBigUpdate";
import EmployerAiFuture from "@/components/employer/EmployerAiFuture";
import EmployerCoreFeatures from "@/components/employer/EmployerCoreFeatures";
import EmployerServices from "@/components/employer/EmployerServices";
import EmployerStats from "@/components/employer/EmployerStats";
import EmployerConsultationForm from "@/components/employer/EmployerConsultationForm";
import EmployerValues from "@/components/employer/EmployerValues";
import EmployerAwards from "@/components/employer/EmployerAwards";
import EmployerPartners from "@/components/employer/EmployerPartners";
import EmployerContact from "@/components/employer/EmployerContact";
import EmployerFooter from "@/components/layout/employer/EmployerFooter";

export default function EmployerPage() {
  return (
    <div className="bg-[#f4f5f5] min-h-screen flex flex-col font-sans antialiased text-gray-800">
      {/* Reusable Header */}
      <EmployerHeader />

      {/* Main visual sections */}
      <main className="flex-grow pt-[72px]">
        {/* Hero Landing */}
        <EmployerHero />

        {/* Big Update details */}
        <EmployerBigUpdate />

        {/* Toppy AI capabilities */}
        <EmployerAiFuture />

        {/* Core Functions grids */}
        <EmployerCoreFeatures />

        {/* Deep dive services details */}
        <EmployerServices />

        {/* Statistical figures */}
        <EmployerStats />

        {/* Main Consultation Form */}
        <EmployerConsultationForm />

        {/* Strategic values comparison */}
        <EmployerValues />

        {/* Company Awards and certificates */}
        <EmployerAwards />

        {/* Partners and Media outlets */}
        <EmployerPartners />

        {/* Geographical Hotlines directory */}
        <EmployerContact />
      </main>

      {/* Multi-column Footer */}
      <EmployerFooter />
    </div>
  );
}