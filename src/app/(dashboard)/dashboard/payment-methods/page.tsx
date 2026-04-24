import { Metadata } from "next";
import { PaymentMethodsPageClient } from "@/components/dashboard/pages/payment-methods-client";

export const metadata: Metadata = {
  title: "Payment Methods",
  description: "Configure your bKash, Nagad, and Rocket receiver accounts to enable automated verification.",
};

export default function PaymentMethodsPage() {
  return <PaymentMethodsPageClient />;
}
