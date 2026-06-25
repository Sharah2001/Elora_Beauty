import App from "@/src/App";
import {client} from "@/sanity/lib/client";
import {branchesQuery, siteSettingsQuery} from "@/sanity/lib/contentQueries";
import type {Branch, SiteSettings} from "@/src/types";

export const revalidate = 300;

export default async function HomePage() {
  const [siteSettings, branches] = await Promise.all([
    client.fetch<SiteSettings | null>(siteSettingsQuery),
    client.fetch<Branch[]>(branchesQuery),
  ]);

  return (
    <App
      initialSiteSettings={siteSettings}
      initialBranches={Array.isArray(branches) ? branches : []}
    />
  );
}
