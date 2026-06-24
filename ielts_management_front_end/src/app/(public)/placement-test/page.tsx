"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { placementTestService } from "@/services/placementTestService";
import { toast } from "react-toastify";
import { useAuth } from "@/hooks/useAuth";

import HeroSection from "@/components/PlacementTest/HeroSection"
import FeaturesSection from "@/components/PlacementTest/FeaturesSection"

import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

export default function PlacementTestLandingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleStartTest = async () => {
    if (!user) {
      toast.warning("Vui lòng đăng nhập để làm bài kiểm tra");
      router.push("/login?redirect=/placement-test");
      return;
    }

    setIsLoading(true);
    try {
      const response = await placementTestService.startTest();
      if (response.success && response.data) {
        toast.success(response.message || "Bắt đầu làm bài!");
        router.push(`/placement-test/${response.data._id}/take`);
      }
    } catch (error: any) {
      toast.error(error.message || "Không thể bắt đầu bài kiểm tra");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen relative w-full overflow-hidden">
      <Navigation />
      <HeroSection onStart={handleStartTest} isLoading={isLoading} />
      <FeaturesSection />

      <Footer />
    </div>
  );
}
