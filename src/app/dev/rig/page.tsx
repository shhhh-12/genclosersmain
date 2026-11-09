import { notFound } from "next/navigation";
import { RigPreview } from "./RigPreview";

/** Dev-only preview of the comic-ink rig v2. Never linked; 404 in production. */
export default function RigDevPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <RigPreview />;
}
