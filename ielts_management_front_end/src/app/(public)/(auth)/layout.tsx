"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";

export default function AuthLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === "admin") {
        router.replace("/admin");
      } else if (user.role === "teacher") {
        router.replace("/teacher");
      } else {
        router.replace("/");
      }
    }
  }, [isLoading, router, user]);

  return (
    <div className="min-h-screen flex overflow-hidden bg-black">
      {children}
    </div>
  );
}
