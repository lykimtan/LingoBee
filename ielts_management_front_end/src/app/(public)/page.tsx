import { VideoBackground } from "@/components/VideoBackground";
import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { ProgramStats } from "@/components/ProgramStats";
import { TeacherShowcase } from "@/components/TeacherShowcase";
import { PromoSection } from "@/components/PromoSection";
import { MissionSection } from "@/components/MissionSection";
import { Footer } from "@/components/Footer";

export default async function Home() {

  return (
    <div className="relative w-full overflow-hidden">
      {/* Hero Section with Background Video */}
      <div className="relative w-full h-screen overflow-hidden">
        {/* Background Video */}
        <VideoBackground />

        {/* Content Layer */}
        <div className="relative z-100 w-full h-full flex flex-col">
          {/* Navigation */}
          <Navigation />

          {/* Hero Section */}
          <HeroSection />
        </div>

        {/* Gradient Transition Overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-background pointer-events-none" />
      </div>

      {/* Program Stats Section */}
      <ProgramStats />

      {/* Soft blur transition */}
      <div className="relative -mt-12 h-24 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[color:var(--background)] to-[#efece6] blur-2xl opacity-80" />
      </div>



      {/* Teacher Showcase Section */}
      <TeacherShowcase />


      {/* Mission Section */}
      <MissionSection />

      {/* Promo Section for new users */}
      <PromoSection />

      {/* Footer */}
      <Footer />
    </div>
  );
}
