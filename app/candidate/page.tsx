"use client";

import CandidateHero from "@/components/candidate/CandidateHero";
import CandidateCategories from "@/components/candidate/CandidateCategories";
import CandidateRecommendedJobs from "@/components/candidate/CandidateRecommendedJobs";
import CandidateTopCompanies from "@/components/candidate/CandidateTopCompanies";
import CandidateAppBanner from "@/components/candidate/CandidateAppBanner";
import EmployerFooter from "@/components/layout/employer/EmployerFooter";

export default function CandidatePage() {
  return (
    <div className="bg-white min-h-screen flex flex-col font-sans antialiased text-gray-800">
      {/* Note: HeaderWrapper renders CandidateHeader automatically on all non-auth candidate routes */}

      <main className="flex-grow">
        {/* Hero Search Panel Section */}
        <CandidateHero />

        {/* Industry quick links section */}
        <CandidateCategories />

        {/* AI-Powered Smart Recommended Jobs (renders only if Candidate is logged in) */}
        <CandidateRecommendedJobs />

        {/* Top Employer Showcase */}
        <CandidateTopCompanies />

        {/* CTA Application download banner */}
        <CandidateAppBanner />
      </main>

      {/* Shared multi-column footer */}
      <EmployerFooter />
    </div>
  );
}