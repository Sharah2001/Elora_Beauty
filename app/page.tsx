import App from "@/src/App";
import {client} from "@/sanity/lib/client";
import {branchesQuery, siteSettingsQuery} from "@/sanity/lib/contentQueries";
import type {Branch, SiteSettings} from "@/src/types";
import type {Metadata} from "next";
import {cache} from "react";

export const revalidate = 300;

const getSiteSettings = cache(() =>
  client.fetch<SiteSettings | null>(siteSettingsQuery),
);

export async function generateMetadata(): Promise<Metadata> {
  const siteSettings = await getSiteSettings();

  return {
    title:
      siteSettings?.seoTitle ||
      "Elora Beauty | Colombo Premium Multi-Branch Hair, Nails & Bridal Parlour",
    description:
      siteSettings?.seoDescription ||
      "Elora Beauty Parlour Colombo. Professional hair, nails, makeup, skin care, and bridal styling.",
  };
}

export default async function HomePage() {
  const [siteSettings, branches] = await Promise.all([
    getSiteSettings(),
    client.fetch<Branch[]>(branchesQuery),
  ]);

  return (
    <App
      initialSiteSettings={siteSettings}
      initialBranches={Array.isArray(branches) ? branches : []}
    />
  );
}
