import { SITE_URL } from "@/lib/site-url";
import type { MetadataRoute } from "next";

const site = SITE_URL;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/learn", "/admin", "/login", "/set-password", "/api", "/access-expired"] },
    sitemap: `${site}/sitemap.xml`,
  };
}
