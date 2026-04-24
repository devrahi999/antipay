import { Metadata } from "next";
import { ContactPageClient } from "@/components/landing/contact-page-client";

export const metadata: Metadata = {
  title: "Contact Merchant Support",
  description: "Get in touch with the AntiPay team for technical support, enterprise inquiries, or partnership opportunities.",
};

export default function ContactPage() {
  return <ContactPageClient />;
}
