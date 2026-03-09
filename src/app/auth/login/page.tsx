"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLoginMutation } from "@/src/store/services/authApi";
import { useAppSelector } from "@/src/store/hooks";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Role } from "@/src/types/type";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [login, { isLoading, error }] = useLoginMutation();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === Role.CUSTOMER) {
        router.push("/attendance");
      } else {
        router.push("/users");
      }
    }
  }, [isAuthenticated, user, router]);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const validateForm = () => {
    const errors: { email?: string; password?: string } = {};

    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const response = await login(formData).unwrap();
      // Redirect based on user role
      if (response.user.role === Role.CUSTOMER) {
        router.push("/attendance");
      } else {
        router.push("/users");
      }
    } catch (err: any) {
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear validation error for this field
    if (validationErrors[name as keyof typeof validationErrors]) {
      const newErrors = { ...validationErrors };
      delete newErrors[name as keyof typeof validationErrors];
      setValidationErrors(newErrors);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0F172B] p-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-700 bg-slate-800 shadow-sm p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg">
                <span className="text-2xl font-bold">GM</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Welcome Back</h1>
            <p className="text-slate-400 mt-2">
              Sign in to your gym account
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-lg bg-red-950 border border-red-800 p-4">
              <p className="text-sm text-red-400">
                {(error as any)?.data?.message ||
                  "Login failed. Please check your credentials."}
              </p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email Address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={handleChange}
                className={validationErrors.email ? "border-red-500" : ""}
                disabled={isLoading}
                autoComplete="email"
              />
              {validationErrors.email && (
                <p className="text-sm text-red-500">{validationErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`pr-10 ${validationErrors.password ? "border-red-500" : ""}`}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {validationErrors.password && (
                <p className="text-sm text-red-500">
                  {validationErrors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full cursor-pointer bg-slate-100 text-slate-900 hover:bg-white"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-800 px-2 text-slate-400">
                New to Gym Manager?
              </span>
            </div>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-sm text-slate-400">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/register"
                className="font-medium text-white hover:text-slate-300 hover:underline underline-offset-4"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>

        {/* Demo Credentials */}
        {/* <div className="mt-4 rounded-lg border bg-card/50 backdrop-blur-sm p-4">
          <p className="text-xs font-semibold text-muted-foreground mb-2 text-center">
            Demo Credentials
          </p>
          <div className="text-xs space-y-1.5 bg-muted/50 rounded p-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Email:</span>
              <span className="font-mono font-semibold">owner@gym.com</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Password:</span>
              <span className="font-mono font-semibold">password123</span>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}

