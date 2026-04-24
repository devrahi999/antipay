import { Metadata } from "next";
import { SettingsPageClient } from "@/components/dashboard/pages/settings-client";

export const metadata: Metadata = {
  title: "Account Settings",
  description: "Manage your merchant profile, update display name, and configure security settings for your AntiPay account.",
};

export default function SettingsPage() {
  return <SettingsPageClient />;
}
