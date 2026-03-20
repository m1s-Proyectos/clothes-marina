import { Helmet } from "react-helmet-async";

interface SeoProps {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
  noindex?: boolean;
}

const SITE_NAME = "Marina's clothes";
const DEFAULT_SITE_URL = "https://clothes-marina.vercel.app";

function buildCanonicalUrl(path?: string): string {
  const origin = typeof window !== "undefined" ? window.location.origin : DEFAULT_SITE_URL;
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "/";
  const normalizedPath = path ?? currentPath;
  return new URL(normalizedPath, origin).toString();
}

export default function Seo({ title, description, path, image, type = "website", noindex = false }: SeoProps) {
  const canonicalUrl = buildCanonicalUrl(path);
  const fullTitle = `${title} | ${SITE_NAME}`;
  const robots = noindex ? "noindex, nofollow" : "index, follow";

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      {image && (
        <>
          <meta property="og:image" content={image} />
          <meta property="og:image:secure_url" content={image} />
          <meta property="og:image:alt" content={title} />
        </>
      )}

      <meta name="twitter:card" content={image ? "summary_large_image" : "summary"} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:url" content={canonicalUrl} />
      {image && <meta name="twitter:image" content={image} />}
    </Helmet>
  );
}
