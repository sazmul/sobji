"use client";

import React, { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Leaf, Lock, Mail, User, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { authClient } from "@/lib/auth-client";
import { useApp } from "@/components/Providers";
import { CardRowSkeleton } from "@/components/Skeletons";

function SignInInner() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/account";
  const { lang, showToast } = useApp();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "signin") {
        const res = await authClient.signIn.email({
          email,
          password,
        });
        if (res.error) {
          setError(res.error.message || "Invalid email or password");
          return;
        }
        showToast("Welcome back to sobji.com!");
        router.push(redirect);
        router.refresh();
      } else {
        const res = await authClient.signUp.email({
          name,
          email,
          password,
        });
        if (res.error) {
          setError(res.error.message || "Could not create account");
          return;
        }
        showToast("Account created! Welcome to sobji.com.");
        router.push(redirect);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md px-4 py-12">
      <div className="rounded-2xl border border-[#e5e7eb] bg-white p-7 sm:p-9">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0f7b3f]">
          <Leaf className="h-3.5 w-3.5" />
          <span>{lang === "bn" ? "sobji.com অ্যাকাউন্ট" : "sobji.com Account"}</span>
        </div>
        <h1 className="mt-2 text-2xl font-semibold text-[#111827] sm:text-3xl">
          {mode === "signin"
            ? lang === "bn"
              ? "আপনার বাজারে সাইন ইন করুন"
              : "Sign in to your Bazar"
            : lang === "bn"
              ? "নতুন সবজি অ্যাকাউন্ট খুলুন"
              : "Create your Sobji Account"}
        </h1>
        <p className="mt-1 text-xs text-[#6b7280]">
          {lang === "bn"
            ? "অর্ডার, সবজি ক্লাব ফ্রি ডেলিভারি, ঠিকানা ও সাপ্তাহিক বাজার পরিচালনা করুন।"
            : "Manage orders, Sobji Club free delivery, addresses & weekly schedules."}
        </p>

        <div className="mt-5 grid grid-cols-2 rounded-xl bg-[#f3f4f6] p-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={`rounded-lg py-2 transition cursor-pointer ${
              mode === "signin" ? "bg-white text-[#0f7b3f] shadow-2xs" : "text-[#6b7280]"
            }`}
          >
            {lang === "bn" ? "সাইন ইন" : "Sign In"}
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`rounded-lg py-2 transition cursor-pointer ${
              mode === "signup" ? "bg-white text-[#0f7b3f] shadow-2xs" : "text-[#6b7280]"
            }`}
          >
            {lang === "bn" ? "নতুন অ্যাকাউন্ট" : "Sign Up"}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {mode === "signup" && (
            <div>
              <label className="block text-xs font-bold text-[#6b7280]">
                {lang === "bn" ? "পূর্ণ নাম" : "Full Name"}
              </label>
              <div className="relative mt-1">
                <User className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-[#7c8c82]" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={lang === "bn" ? "আপনার নাম লিখুন" : "Your full name"}
                  className="w-full rounded-xl border border-[#d1d5db] py-2.5 pl-10 pr-3 text-sm focus:border-[#0b5e30] focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#6b7280]">
              {lang === "bn" ? "ইমেইল ঠিকানা" : "Email Address"}
            </label>
            <div className="relative mt-1">
              <Mail className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-[#7c8c82]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-[#d1d5db] py-2.5 pl-10 pr-3 text-sm focus:border-[#0b5e30] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#6b7280]">
              {lang === "bn" ? "পাসওয়ার্ড" : "Password"}
            </label>
            <div className="relative mt-1">
              <Lock className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-[#7c8c82]" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-[#d1d5db] py-2.5 pl-10 pr-3 text-sm focus:border-[#0b5e30] focus:outline-none"
              />
            </div>
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0f7b3f] py-3 text-sm font-bold text-white hover:bg-[#0b5e30] disabled:opacity-60 transition cursor-pointer"
          >
            <span>
              {loading
                ? lang === "bn"
                  ? "অপেক্ষা করুন..."
                  : "Please wait..."
                : mode === "signin"
                  ? lang === "bn"
                    ? "সাইন ইন করুন"
                    : "Sign In"
                  : lang === "bn"
                    ? "অ্যাকাউন্ট তৈরি করুন"
                    : "Create Account"}
            </span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-6 border-t border-[#e5e7eb] pt-4">
          <p className="text-center text-[11px] text-[#6b7280]">
            {lang === "bn" ? "অথবা গেস্ট হিসেবে " : "Or continue shopping as guest and "}
            <Link href="/checkout" className="font-bold text-[#0f7b3f] underline">
              {lang === "bn" ? "সরাসরি চেকআউট করুন" : "checkout directly"}
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="mx-auto max-w-md px-4 py-12">
              <CardRowSkeleton rows={2} />
            </div>
          }
        >
          <SignInInner />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
