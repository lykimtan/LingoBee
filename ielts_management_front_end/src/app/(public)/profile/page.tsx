/**
 * Student Profile Page
 * Main profile page showing student's academic progress and statistics
 */

"use client";

import Image from "next/image";
import { useAuthContext } from "@/context/AuthContext";
import { Navigation } from "@/components/Navigation";
import { TargetScoreMastery } from "@/components/profile/TargetScoreMastery";
import { PracticeStreak } from "@/components/profile/PracticeStreak";
import { SkillProficiency } from "@/components/profile/SkillProficiency";
import { RecentActivities } from "@/components/profile/RecentActivities";
import Loader from "@/components/Loader";

export default function ProfilePage() {
  const { user, isLoading } = useAuthContext();

  if (isLoading) {
    return <Loader />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Please log in</h1>
          <p className="text-muted-foreground">You need to log in to view your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navigation />

      {/* Page Content */}
      <main className="pt-24 max-w-6xl mx-auto px-8">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center justify-center mb-8">
            <div className="text-center">
              <p className="text-xl mb-2 font-[var(--font-plus-jakarta)]">WELCOME BACK</p>
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="relative w-80 h-80 rounded-full overflow-hidden border-2 border-white/20  flex items-center justify-center flex-shrink-0">
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.name}
                      fill
                      sizes="240px"
                      className="object-cover"
                      loading="eager"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <h1 className="text-4xl font-bold text-foreground">{user.name}</h1>
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex gap-6 text-sm">
            <div className="flex items-center gap-2">
               <Image
                      src={"/profile/target.gif"}
                      alt="Target Score"
                      width={40}
                      height={40}
                      unoptimized
                      sizes="40px"
                      className="object-contain rounded-md"
                    />
              <span className="text-foreground font-semibold">Target: 7.5</span>
            </div>
          </div>
        </div>

        {/* Main Grid - 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column */}
          <div className="lg:col-span-2">
            <TargetScoreMastery />
          </div>

          {/* Right Column */}
          <div>
            <PracticeStreak />
          </div>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <SkillProficiency />
          <RecentActivities />
        </div>
      </main>
    </div>
  );
}
