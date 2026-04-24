import { Metadata } from "next";
import { BrandsPageClient } from "@/components/dashboard/pages/brands-client";

export const metadata: Metadata = {
  title: "Brand Identities",
  description: "Create and manage your AntiPay brand identities and API keys. Configure redirects and merchant contact details.",
};

export default function BrandsPage() {
  return <BrandsPageClient />;
}
