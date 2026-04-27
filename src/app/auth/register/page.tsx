"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useRegisterMutation } from "@/src/store/services/authApi";
import { useAppSelector } from "@/src/store/hooks";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Eye, EyeOff, Loader2, Dumbbell } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [register, { isLoading, error }] = useRegisterMutation();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/users");
    }
  }, [isAuthenticated, router]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    age: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name) {
      errors.name = "Name is required";
    }

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

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (
      formData.age &&
      (isNaN(Number(formData.age)) || Number(formData.age) < 1)
    ) {
      errors.age = "Please enter a valid age";
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
      const { confirmPassword, age, ...dataToSend } = formData;
      await register({
        ...dataToSend,
        ...(age && { age: Number(age) }),
      }).unwrap();
      // Redirect to users page after successful registration
      router.push("/users");
    } catch (err: any) {}
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear validation error for this field
    if (validationErrors[name]) {
      const newErrors = { ...validationErrors };
      delete newErrors[name];
      setValidationErrors(newErrors);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Full-screen background image */}
      <Image
        src="https://ambit-gym.s3.ap-southeast-1.amazonaws.com/gym-reg.jpg"
        alt="Gym background"
        fill
        priority
        className="object-cover object-center"
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Centered register box */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4 py-10">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-background/10 shadow-2xl backdrop-blur-[2px] p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 shadow-lg shadow-emerald-900/50">
                <span className="text-2xl font-bold text-white">GM</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow">
              Create Account
            </h1>
            <p className="mt-2 text-white/70">Join our gym management system</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-lg border border-red-500/40 bg-red-950/60 p-4 backdrop-blur-sm">
              <p className="text-sm text-red-300">
                {(error as any)?.data?.message ||
                  "Registration failed. Please try again."}
              </p>
            </div>
          )}

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium text-white/90"
              >
                Full Name
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                className={`bg-background/10 border-white/20 text-white placeholder:text-white/40 focus:border-emerald-400 transition-colors ${validationErrors.name ? "border-red-500" : ""}`}
                disabled={isLoading}
                autoComplete="name"
              />
              {validationErrors.name && (
                <p className="text-sm text-red-400">{validationErrors.name}</p>
              )}
            </div>

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
                className={`bg-background/10 border-white/20 text-white placeholder:text-white/40 focus:border-emerald-400 focus:bg-background/15 transition-colors ${validationErrors.email ? "border-red-500" : ""}`}
                disabled={isLoading}
                autoComplete="email"
              />
              {validationErrors.email && (
                <p className="text-sm text-red-400">{validationErrors.email}</p>
              )}
            </div>

            {/* Phone and Age in a row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Phone Field */}
              <div className="space-y-2">
                <label
                  htmlFor="phone"
                  className="text-sm font-medium text-white/90"
                >
                  Phone{" "}
                  <span className="text-white/50 text-xs">(optional)</span>
                </label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+1234567890"
                  value={formData.phone}
                  onChange={handleChange}
                  className="bg-background/10 border-white/20 text-white placeholder:text-white/40 focus:border-emerald-400 focus:bg-background/15 transition-colors"
                  disabled={isLoading}
                  autoComplete="tel"
                />
              </div>

              {/* Age Field */}
              <div className="space-y-2">
                <label
                  htmlFor="age"
                  className="text-sm font-medium text-white/90"
                >
                  Age <span className="text-white/50 text-xs">(optional)</span>
                </label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                placeholder="0000"
                  value={formData.age}
                  onChange={handleChange}
                  className={`bg-background/10 border-white/20 text-white placeholder:text-white/40 focus:border-emerald-400 focus:bg-background/15 transition-colors ${validationErrors.age ? "border-red-500" : ""}`}
                  disabled={isLoading}
                  min="1"
                  max="120"
                />
              </div>
            </div>
            {validationErrors.age && (
              <p className="text-sm text-red-400">{validationErrors.age}</p>
            )}

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
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`pr-10 bg-background/10 border-white/20 text-white placeholder:text-white/40 focus:border-emerald-400 focus:bg-background/15 transition-colors ${validationErrors.password ? "border-red-500" : ""}`}
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
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

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-white/90"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`pr-10 bg-background/10 border-white/20 text-white placeholder:text-white/40 focus:border-emerald-400 focus:bg-background/15 transition-colors ${validationErrors.confirmPassword ? "border-red-500" : ""}`}
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <p className="text-sm text-red-400">
                  {validationErrors.confirmPassword}
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
                  Creating account...
                </>
              ) : (
                <>Create Account</>
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
                Already have an account?
              </span>
            </div>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-sm text-white/60">
              Already registered?{" "}
              <Link
                href="/auth/login"
                className="font-semibold text-emerald-400 hover:text-emerald-300 underline-offset-4 hover:underline transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
