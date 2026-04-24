import { Metadata } from "next";
import { DocsPageClient } from "@/components/landing/docs-page-client";

export const metadata: Metadata = {
  title: "API Documentation",
  description: "Comprehensive developer guide for integrating AntiPay. Learn how to create payment sessions and verify transactions programmatically using our REST API.",
};

export default function DocsPage() {
  return <DocsPageClient />;
}
