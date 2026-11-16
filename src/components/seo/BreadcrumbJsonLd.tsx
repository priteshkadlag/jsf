import { breadcrumbJsonLd, jsonLd } from "@/lib/cms/schema";

/** Breadcrumb structured data (Home › … › this page), shown by Google under the result title. */
export default async function BreadcrumbJsonLd({ trail }: { trail: { name: string; path: string }[] }) {
  const data = await breadcrumbJsonLd(trail);
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(data) }} />;
}
