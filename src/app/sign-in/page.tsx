"use client";

import React, { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Leaf, Lock, Mail, User, ArrowRight, Shield } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { authClient } from "@/lib/auth-client";
import { useApp } from "@/components/Providers";

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
  const { showToast } = useApp();

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

  const quickLogin = async (demoEmail: string, demoPass: string, target: string) => {
    setError("");
    setLoading(true);
    try {
      const res = await authClient.signIn.email({
        email: demoEmail,
        password: demoPass,
      });
      if (res.error) {
        setError(res.error.message || "Demo sign in failed");
        return;
      }
      showToast("Signed in!");
      router.push(target);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md px-4 py-12">
      <div className="rounded-2xl border border-[#e7e2d8] bg-white p-7 sm:p-9">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#143624]">
          <Leaf className="h-3.5 w-3.5" />
          <span>sobji.com Account</span>
        </div>
        <h1 className="mt-2 font-display text-2xl font-medium text-[#112218] sm:text-3xl">
          {mode === "signin" ? "Sign in to your Bazar" : "Create your Sobji Account"}
        </h1>
        <p className="mt-1 text-xs text-[#526559]">
          Manage orders, Sobji Club free delivery, addresses & weekly schedules.
        </p>

        <div className="mt-5 grid grid-cols-2 rounded-full bg-[#f3efe6] p-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={`rounded-full py-2 transition cursor-pointer ${
              mode === "signin" ? "bg-white text-[#14532d] shadow-2xs" : "text-[#526559]"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`rounded-full py-2 transition cursor-pointer ${
              mode === "signup" ? "bg-white text-[#14532d] shadow-2xs" : "text-[#526559]"
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {mode === "signup" && (
            <div>
              <label className="block text-xs font-bold text-[#526559]">Full Name</label>
              <div className="relative mt-1">
                <User className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-[#7c8c82]" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full rounded-xl border border-[#dcd7c9] py-2.5 pl-10 pr-3 text-sm focus:border-[#166534] focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#526559]">Email Address</label>
            <div className="relative mt-1">
              <Mail className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-[#7c8c82]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-[#dcd7c9] py-2.5 pl-10 pr-3 text-sm focus:border-[#166534] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#526559]">Password</label>
            <div className="relative mt-1">
              <Lock className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-[#7c8c82]" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-[#dcd7c9] py-2.5 pl-10 pr-3 text-sm focus:border-[#166534] focus:outline-none"
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
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#14532d] py-3 text-sm font-bold text-white hover:bg-[#166534] disabled:opacity-60 transition cursor-pointer"
          >
            <span>
              {loading
                ? "Please wait..."
                : mode === "signin"
                  ? "Sign In"
                  : "Create Account"}
            </span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Demo Quick Access */}
        <div className="mt-6 border-t border-[#e4e0d5] pt-5 space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#526559]">
            Instant Demo Access
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() =>
                quickLogin("customer@sobji.com", "SobjiUser2026!", "/account")
              }
              className="rounded-xl border border-emerald-200 bg-emerald-50/70 px-3 py-2 text-xs font-bold text-[#14532d] hover:bg-emerald-100 cursor-pointer"
            >
              Demo Customer
            </button>
            <button
              type="button"
              onClick={() =>
                quickLogin("admin@sobji.com", "SobjiAdmin2026!", "/admin")
              }
              className="inline-flex items-center justify-center gap-1 rounded-xl border border-amber-200 bg-amber-50/80 px-3 py-2 text-xs font-bold text-amber-900 hover:bg-amber-100 cursor-pointer"
            >
              <Shield className="h-3.5 w-3.5" />
              Demo Admin
            </button>
          </div>
          <p className="text-center text-[11px] text-[#526559] pt-1">
            Or continue shopping as guest and{" "}
            <Link href="/checkout" className="font-bold text-[#14532d] underline">
              checkout directly
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
        <Suspense fallback={<div className="p-12 text-center text-sm">Loading...</div>}>
          <SignInInner />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
