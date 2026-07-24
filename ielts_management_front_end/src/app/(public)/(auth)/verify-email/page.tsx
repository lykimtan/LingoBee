"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { API_BASE_URL } from "@/constants";

type VerificationStatus = "loading" | "success" | "error";

interface VerifyEmailApiResponse {
  success?: boolean;
  message?: string;
}

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const hasRequestedRef = useRef(false);
  const [status, setStatus] = useState<VerificationStatus>("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing or invalid.");
      return;
    }

    // Guard against double request in development strict mode.
    if (hasRequestedRef.current) {
      return;
    }
    hasRequestedRef.current = true;

    const verifyEmail = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/verify-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const data = (await response.json()) as VerifyEmailApiResponse;

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Email verification failed.");
        }

        setStatus("success");
        setMessage(data.message || "Your email has been verified successfully.");
      } catch (error) {
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Email verification failed.");
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex items-center justify-center p-6 sm:p-8 md:p-12">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-8 sm:p-10 text-center animate-fade-in">
        <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-4">LingoBee</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">Email Verification</h1>

        <p
          className={`text-sm sm:text-base leading-relaxed mb-8 ${status === "success"
              ? "text-emerald-300"
              : status === "error"
                ? "text-rose-300"
                : "text-gray-300"
            }`}
        >
          {message}
        </p>

        {status === "loading" && (
          <div className="mx-auto mb-8 h-10 w-10 rounded-full border-2 border-white/20 border-t-white animate-spin" />
        )}

        {status !== "loading" && (
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link
              href="/login"
              className="px-6 py-3 rounded-full bg-yellow-50 text-slate-900 font-semibold uppercase tracking-wide text-sm hover:bg-white transition-all duration-200"
            >
              Go to Login
            </Link>
            <Link
              href="/register"
              className="px-6 py-3 rounded-full border border-white/20 text-white font-semibold uppercase tracking-wide text-sm hover:bg-white/5 transition-all duration-200"
            >
              Back to Register
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
