import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard } from "@/components/panel/AuthCard";
import { SetPasswordForm } from "./SetPasswordForm";
import { panel } from "@/content/panel";

export const metadata: Metadata = { title: panel.setPassword.title, robots: { index: false } };

export default function SetPasswordPage() {
  return (
    <AuthCard title={panel.setPassword.title} intro={panel.setPassword.intro}>
      <Suspense>
        <SetPasswordForm />
      </Suspense>
    </AuthCard>
  );
}
