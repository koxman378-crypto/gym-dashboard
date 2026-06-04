"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/src/store/hooks";

type Props = {
  allowedRoles: string[];
  children: React.ReactNode;
  redirectTo?: string;
};

export default function RequireRole({
  allowedRoles,
  children,
  redirectTo = "/",
}: Props) {
  const router = useRouter();
  const user = useAppSelector((s) => s.auth.user);
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    const role = user?.role ?? null;
    if (!role) {
      window.alert("You are not permitted to view this page. Please login.");
      router.push("/auth/login");
      setAllowed(false);
      return;
    }

    if (!allowedRoles.includes(role)) {
      window.alert("You are not permitted to view this page.");
      router.push(redirectTo);
      setAllowed(false);
      return;
    }

    setAllowed(true);
  }, [user, allowedRoles, router, redirectTo]);

  if (allowed === null) return null;
  if (!allowed) return null;
  return <>{children}</>;
}
