import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      departmentId: number | null;
    } & DefaultSession["user"];
  }
  interface User {
    role: string;
    departmentId: number | null;
  }
}