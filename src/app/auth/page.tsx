"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { LoginForm } from "@/components/forms/LoginForm";
import { SignupForm } from "@/components/forms/SignupForm";
import { Spotlight } from "@/components/ui/spolight-new";

function AuthContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<"login" | "signup">(
    tabParam === "signup" ? "signup" : "login"
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("/api/auth/session", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          router.replace("/");
        } else {
          localStorage.removeItem("token");
        }
      })
      .catch(() => {
        localStorage.removeItem("token");
      });
  }, [router]);

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md bg-white/20 backdrop-blur-lg rounded-2xl p-9 mt-15">
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setActiveTab("login")}
            className={activeTab === "login" ? "font-bold" : ""}
          >
            Login
          </button>
          <button
            onClick={() => setActiveTab("signup")}
            className={activeTab === "signup" ? "font-bold" : ""}
          >
            Sign Up
          </button>
        </div>

        {activeTab === "login" ? <LoginForm /> : <SignupForm />}
      </div>
      <Spotlight />
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthContent />
    </Suspense>
  );
}