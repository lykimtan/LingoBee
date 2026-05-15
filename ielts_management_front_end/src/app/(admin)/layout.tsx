import { AdminHeader } from "@/components/admin/AdminHeader";
import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0b1d20] text-white font-sans selection:bg-[#1f6f5e]/50 selection:text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col p-2 md:p-2 lg:p-2">
        <div className="flex h-full w-full flex-col overflow-hidden rounded-[2.5rem] bg-[#0f2326] shadow-[0_20px_50px_-40px_rgba(0,0,0,0.7)] border border-white/10">
          <AdminHeader />
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
