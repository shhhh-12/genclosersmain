import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";
import { legal } from "@/content/legal";

export const metadata: Metadata = { title: legal.refund.title, robots: { index: false } };

export default function RefundPage() {
  return <LegalPage {...legal.refund} />;
}
