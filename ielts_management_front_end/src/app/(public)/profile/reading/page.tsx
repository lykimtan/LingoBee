"use client";

import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SkillProfileView } from "@/components/profile/SkillProfileView";

export default function ReadingProfilePage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden flex flex-col justify-between">
      <Navigation />

      <main className="pt-28 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <SkillProfileView skill="reading" />
      </main>

      <Footer />
    </div>
  );
}
