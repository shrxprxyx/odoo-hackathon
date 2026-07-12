"use client";

import { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { Sidebar } from "@/components/sidebar";
import { LoadingState } from "@/components/ui";

interface LayoutProps {
  children: ReactNode;
}

export default function ProtectedLayout({ children }: LayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <LoadingState message="Loading..." />;
  }

  if (status === "unauthenticated") {
    return null; // redirect is already firing above
  }

  const userRole = session?.user?.role ?? "EMPLOYEE";
  const userName = session?.user?.name ?? "User";

  return (
    <div className="flex bg-background min-h-screen">
      <Sidebar userRole={userRole} userName={userName} />
      <main className="flex-1 md:ml-0 p-4 md:p-8 mt-16 md:mt-0">
        {children}
      </main>
    </div>
  );
}