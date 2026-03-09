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

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user) {
        // Redirect based on user role
        if (user.role === Role.CUSTOMER) {
          router.push("/attendance");
        } else {
          router.push("/users");
        }
      } else {
        // Redirect unauthenticated users to login
        router.push("/auth/login");
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600"></div>
        <p className="text-lg font-medium text-slate-700">
          Loading...
        </p>
      </div>
    </div>
  );
}

