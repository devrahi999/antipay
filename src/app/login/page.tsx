import { Metadata } from "next";
import { LoginPageClient } from "@/components/auth/login-page-client";

export const metadata: Metadata = {
  title: "Login",
  description: "Access your AntiPay merchant console to manage brands, monitor transactions, and configure payment verification settings.",
};

export default function LoginPage() {
  return <LoginPageClient />;
}
