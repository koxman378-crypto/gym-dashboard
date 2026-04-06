"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/src/store/hooks";
import { Role } from "@/src/types/type";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAppSelector(
    (state) => state.auth,
  );

  const getLandingPath = (role?: Role) => {
    if (role === Role.CUSTOMER) return "/attendance";
    if (role === Role.CASHIER) return "/subscriptions";
    if (role === Role.TRAINER) return "/users";
    if (role === Role.OWNER) return "/users";
    return "/attendance";
  };

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user) {
        router.push(getLandingPath(user.role));
      } else {
        // Redirect unauthenticated users to login
        router.push("/auth/login");
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0F172B]">
      <div className="text-center">
        <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600"></div>
        <p className="text-lg font-medium text-slate-300">
          Loading...
        </p>
      </div>
    </div>
  );
}

