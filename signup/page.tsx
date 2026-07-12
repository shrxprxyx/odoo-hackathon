"use client";

import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { SignupForm } from "@/components/auth-forms";
import { authApi, ApiError } from "@/lib/api-client";
import type { SignupInput } from "@/lib/schemas";

export default function SignupPage() {
  const router = useRouter();

  async function handleSignup(data: SignupInput) {
    // Create the account. The API always creates role=EMPLOYEE regardless of
    // what's submitted - this form has no role field, matching the problem
    // statement's "signup creates an Employee account only" requirement.
    await authApi.signup(data);

    // Auto-login right after signup so the person lands on the dashboard
    // instead of being bounced back to a login form they just filled out.
    const res = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (res?.error) {
      // Account was created but auto-login failed for some reason - send
      // them to login instead of leaving them stuck on this page.
      router.push("/login");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="max-w-sm mx-auto mt-20">
      <h1 className="text-xl font-semibold text-white mb-6">Create your account</h1>
      <SignupForm onSubmit={handleSignup} />
    </div>
  );
}
