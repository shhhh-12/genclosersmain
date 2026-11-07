import { SITE_URL } from "@/lib/site-url";
import type { MetadataRoute } from "next";

const site = SITE_URL;

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/courses", "/courses/sales-is-all-you-need"].map((path) => ({ url: `${site}${path}` }));
}
