import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard } from "@/components/panel/AuthCard";
import { LoginForm } from "./LoginForm";
import { panel } from "@/content/panel";

export const metadata: Metadata = { title: panel.login.title, robots: { index: false } };

export default function LoginPage() {
  return (
    <AuthCard title={panel.login.title} intro={panel.login.intro}>
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
