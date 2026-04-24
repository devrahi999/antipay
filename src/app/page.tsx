import { LandingPageClient } from "@/components/landing/landing-page-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AntiPay - Automate bKash, Nagad & Rocket Verification",
  description: "The leading payment verification infrastructure in Bangladesh. Automate your mobile banking receipts with a simple API. Works with personal and merchant accounts.",
};

export default function LandingPage() {
  return <LandingPageClient />;
}
