/**
 * Profile Layout Component
 * Layout wrapper for profile pages with sidebar
 */

import { ReactNode } from "react";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <ProfileSidebar />

      {/* Main Content */}
      <main className="ml-64 pt-6 pb-12 px-8">
        {children}
      </main>
    </div>
  );
}
