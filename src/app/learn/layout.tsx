import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PanelShell } from "@/components/panel/PanelShell";
import { requireStudent } from "@/lib/auth";

export const metadata: Metadata = { title: "Student", robots: { index: false } };

// Depends on who is signed in, so it renders per request.
export const instant = false;

export default async function LearnLayout({ children }: { children: ReactNode }) {
  const me = await requireStudent();
  const nav = [{ label: "Dashboard", href: "/learn" }, ...(me.role === "admin" ? [{ label: "Admin", href: "/admin" }] : [])];
  return (
    <PanelShell title="Student" nav={nav} who={me.email}>
      {children}
    </PanelShell>
  );
}
