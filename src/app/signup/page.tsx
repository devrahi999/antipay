import { Metadata } from "next";
import { SignupPageClient } from "@/components/auth/signup-page-client";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create an AntiPay account today. Start automating your mobile banking payment verification and grow your online business in Bangladesh.",
};

export default function SignupPage() {
  return <SignupPageClient />;
}
