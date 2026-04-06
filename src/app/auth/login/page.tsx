"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useLoginMutation } from "@/src/store/services/authApi";
import { useAppSelector } from "@/src/store/hooks";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Eye, EyeOff, Loader2, Dumbbell } from "lucide-react";
import { Role } from "@/src/types/type";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [login, { isLoading, error }] = useLoginMutation();

  const getLandingPath = (role?: Role) => {
    if (role === Role.CUSTOMER) return "/attendance";
    if (role === Role.CASHIER) return "/subscriptions";
    if (role === Role.TRAINER) return "/users";
    if (role === Role.OWNER) return "/users";
    return "/attendance";
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      router.push(getLandingPath(user.role));
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
      router.push(getLandingPath(response.user.role));
    } catch (err: any) {}
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
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Full-screen background image */}
      <Image
        src="https://ambit-gym.s3.ap-southeast-1.amazonaws.com/gym-login.jpg"
        alt="Gym background"
        fill
        priority
        className="object-cover object-center"
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Centered login box */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/10 shadow-2xl backdrop-blur-[2px] p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 shadow-lg shadow-emerald-900/50">
                <span className="text-2xl font-bold text-white">GM</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow">
              Welcome Back
            </h1>
            <p className="mt-2 text-white/70">Sign in to your gym account</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-lg border border-red-500/40 bg-red-950/60 p-4 backdrop-blur-sm">
              <p className="text-sm text-red-300">
                {(error as any)?.data?.message ||
                  "Login failed. Please check your credentials."}
              </p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-white/90"
              >
                Email Address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={handleChange}
                className={`bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-emerald-400 focus:bg-white/15 transition-colors ${validationErrors.email ? "border-red-500" : ""}`}
                disabled={isLoading}
                autoComplete="email"
              />
              {validationErrors.email && (
                <p className="text-sm text-red-400">{validationErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-white/90"
              >
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
                  className={`pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-emerald-400 focus:bg-white/15 transition-colors ${validationErrors.password ? "border-red-500" : ""}`}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-green-300 hover:text-green-400 transition-colors"
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
                <p className="text-sm text-red-400">
                  {validationErrors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full cursor-pointer bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-900/40 transition-all mt-2"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>Sign In</>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-transparent px-2 text-white/50">
                New to Gym Manager?
              </span>
            </div>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-sm text-white/60">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/register"
                className="font-semibold text-emerald-400 hover:text-emerald-300 underline-offset-4 hover:underline transition-colors"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
