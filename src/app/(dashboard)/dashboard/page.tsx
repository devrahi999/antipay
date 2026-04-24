import { Metadata } from "next";
import { DashboardHomeClient } from "@/components/dashboard/pages/home-client";

export const metadata: Metadata = {
  title: "Dashboard Overview",
  description: "Monitor your AntiPay volume, active sessions, and verification performance in real-time.",
};

export default function DashboardPage() {
  return <DashboardHomeClient />;
}
