import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PanelShell } from "@/components/panel/PanelShell";
import { requireAdmin } from "@/lib/auth";
import { panel } from "@/content/panel";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

// Every admin page depends on who is signed in, so it renders per request.
export const instant = false;

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const me = await requireAdmin();
  return (
    <PanelShell title="Admin" nav={panel.admin.nav} who={me.email}>
      {children}
    </PanelShell>
  );
}
