import type { MetadataRoute } from "next";

/**
 * Experimental (demo) phase: disallow all crawling until a real commercial
 * launch. Kept in sync with the site-wide `robots: { index:false }` metadata.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
