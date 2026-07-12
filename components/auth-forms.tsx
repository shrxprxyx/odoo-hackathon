"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { LoginSchema, SignupSchema, type LoginInput, type SignupInput } from "@/lib/schemas";

interface LoginFormProps {
  onSubmit: (data: LoginInput) => Promise<void>;
  isLoading?: boolean;
}

export function LoginForm({ onSubmit, isLoading = false }: LoginFormProps) {
  const [apiError, setApiError] = useState<string>("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmitForm = async (data: LoginInput) => {
    try {
      setApiError("");
      await onSubmit(data);
    } catch (err: any) {
      setApiError(err.message || "Login failed");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
      {apiError && (
        <div className="p-3 rounded-lg bg-red-900/20 border border-red-700 text-red-200 text-sm">
          {apiError}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-200 mb-2">
          Email
        </label>
        <input
          {...register("email")}
          type="email"
          placeholder="your@email.com"
          className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
        />
        {errors.email && (
          <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-200 mb-2">
          Password
        </label>
        <input
          {...register("password")}
          type="password"
          placeholder="••••••••"
          className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
        />
        {errors.password && (
          <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold transition-colors"
      >
        {isLoading ? "Logging in..." : "Login"}
      </button>

      <p className="text-center text-sm text-slate-400">
        Don't have an account?{" "}
        <Link href="/signup" className="text-blue-400 hover:text-blue-300">
          Sign up
        </Link>
      </p>
    </form>
  );
}

interface SignupFormProps {
  onSubmit: (data: SignupInput) => Promise<void>;
  isLoading?: boolean;
}

export function SignupForm({ onSubmit, isLoading = false }: SignupFormProps) {
  const [apiError, setApiError] = useState<string>("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(SignupSchema),
  });

  const onSubmitForm = async (data: SignupInput) => {
    try {
      setApiError("");
      await onSubmit(data);
    } catch (err: any) {
      setApiError(err.message || "Signup failed");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
      {apiError && (
        <div className="p-3 rounded-lg bg-red-900/20 border border-red-700 text-red-200 text-sm">
          {apiError}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            First Name
          </label>
          <input
            {...register("firstName")}
            type="text"
            placeholder="John"
            className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
          {errors.firstName && (
            <p className="text-red-400 text-xs mt-1">{errors.firstName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Last Name
          </label>
          <input
            {...register("lastName")}
            type="text"
            placeholder="Doe"
            className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
          {errors.lastName && (
            <p className="text-red-400 text-xs mt-1">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-200 mb-2">
          Email
        </label>
        <input
          {...register("email")}
          type="email"
          placeholder="your@email.com"
          className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
        />
        {errors.email && (
          <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-200 mb-2">
          Password
        </label>
        <input
          {...register("password")}
          type="password"
          placeholder="••••••••"
          className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
        />
        {errors.password && (
          <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold transition-colors"
      >
        {isLoading ? "Creating account..." : "Sign Up"}
      </button>

      <p className="text-center text-sm text-slate-400">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-400 hover:text-blue-300">
          Login
        </Link>
      </p>
    </form>
  );
}