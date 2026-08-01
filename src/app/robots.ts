import type { MetadataRoute } from "next";

/**
 * Pre-launch phase: disallow all crawling until the public launch gate passes.
 * Kept in sync with the site-wide `robots: { index:false }` metadata.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
