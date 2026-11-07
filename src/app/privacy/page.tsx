import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";
import { legal } from "@/content/legal";

export const metadata: Metadata = { title: legal.privacy.title, robots: { index: false } };

export default function PrivacyPage() {
  return <LegalPage {...legal.privacy} />;
}
