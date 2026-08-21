"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/Context/UserContext";

export default function Navbar() {
  const router = useRouter();
  const { user, setUser } = useUser();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    router.push("/auth?tab=login");
  };

  return (
    <header className=" flex justify-center relative z-50">
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 bg-gray-900 text-gray-300 px-6 md:px-10 py-3 rounded-full shadow-lg flex gap-8 items-center max-w-7xl">
        {/* Logo */}
        <div className="w-[50px] h-[50px] flex-shrink-0">
          <Image
            src="/images/logo.png"
            alt="AnubisPaws Logo"
            width={50}
            height={50}
            className="rounded-full object-contain transition-transform duration-300 ease-in-out hover:scale-110"
          />
        </div>

        {/* Nav Links */}
        <div className="hidden md:flex gap-8">
          {[
            ["Home", "/"],
            ["Adoption", "/adoption"],
            ["Marketplace", "/marketplace"],
          ].map(([label, href]) => (
            <Link
              key={label}
              href={href}
              className="relative block h-6 overflow-hidden group"
            >
              <span className="block group-hover:-translate-y-1 group-hover:opacity-0 transition duration-300">
                {label}
              </span>
              <span className="block text-white absolute left-0 top-6 transition-transform duration-300 group-hover:-translate-y-6">
                {label}
              </span>
            </Link>
          ))}
        </div>

        {/* User Info or Login/Signup */}
        <div className="ml-1 flex gap-4 items-center">
          {user ? (
            <div className="flex items-center gap-2">
              {/* Show Admin link only for admin */}
              {user.role === "admin" && (
                <Link
                  href="/admin"
                  className="gap-3 text-white rounded-full object-contain transition-transform duration-300 ease-in-out hover:scale-110 font-semibold mr-4"
                >
                  Admin
                </Link>
              )}

              {/* <img
                src={user.image || "/images/logo.png"}
                alt={user.name || user.email}
                className="w-10 h-10 rounded-full object-cover cursor-pointer"
                onClick={() => router.push("/dashboard")} // Redirect when clicking avatar
              /> */}

              {/* Name clickable */}
              <span
                className="text-white font-semibold cursor-pointer hover:underline"
                onClick={() => router.push("/dashboard")}
              >
                {user.name?.split(" ")[0] || user.email}
              </span>

              <button
                onClick={handleLogout}
                className="ml-2 px-3 mr-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <button
                className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
                onClick={() => router.push("/auth?tab=login")}
              >
                <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                <span className="inline-flex h-full w-[100px] cursor-pointer items-center justify-center rounded-full bg-slate-950 px-6 text-sm font-medium text-white backdrop-blur-3xl">
                  Login
                </span>
              </button>

              <button
                className="relative inline-flex h-12 items-center justify-center rounded-full px-6 text-sm font-medium text-black bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] hover:shadow-[0_0_25px_rgba(255,255,255,1)] transition duration-300 whitespace-nowrap"
                onClick={() => router.push("/auth?tab=signup")}
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
