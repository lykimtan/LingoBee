"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";

const GoogleCallbackPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { googleLogin, isLoading, error: authError } = useAuthContext();
  const hasRunRef = useRef(false);
  const errorParam = searchParams.get("error");
  const code = searchParams.get("code");
  const oauthError = errorParam
    ? "Google login was cancelled."
    : !code
      ? "Missing authorization code."
      : "";
  const getRedirectPath = (role?: string) => {
    if (role === "admin") return "/admin";
    if (role === "teacher") return "/teacher";
    return "/";
  };

  useEffect(() => {
    if (hasRunRef.current) {
      return;
    }
    hasRunRef.current = true;

    if (oauthError || !code) {
      return;
    }

    void googleLogin({ code })
      .then((result) => {
        if (result) {
          const role = result.data?.user?.role;
          router.push(getRedirectPath(role));
        }
      })
      .catch(() => undefined);
  }, [code, googleLogin, oauthError, router]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-black px-6 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <h1 className="text-2xl font-semibold">Bạn đang đăng nhập ....</h1>
        <p className="mt-2 text-sm text-gray-400">
          Please wait while we complete your Google login.
        </p>
        {(oauthError || authError) && (
          <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-900/20 p-4 text-sm text-red-300">
            {oauthError || authError}
          </div>
        )}
        <div className="mt-6 text-sm text-gray-400">
          <Link href="/login" className="text-white hover:text-yellow-50 transition-colors">
            Back to login
          </Link>
        </div>
        {isLoading && (
          <div className="mt-4 text-xs uppercase tracking-widest text-gray-500">
            Authenticating...
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleCallbackPage;
