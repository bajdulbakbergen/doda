import type { Database } from "@/lib/supabase/types";
import { siteConfig } from "@/config/site";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Lot = Database["public"]["Tables"]["lots"]["Row"];
type Post = Database["public"]["Tables"]["posts"]["Row"];

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // JSON-LD по спецификации Schema.org. Безопасно: контент строго typed objects.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
  };
}

export function profileJsonLd(profile: Profile) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": profile.is_verified ? "Organization" : "Person",
      name: profile.display_name,
      identifier: profile.slug,
      ...(profile.bio ? { description: profile.bio } : {}),
      ...(profile.avatar_url ? { image: profile.avatar_url } : {}),
      ...(profile.city ? { address: { "@type": "PostalAddress", addressLocality: profile.city } } : {}),
      url: `${siteConfig.url}/u/${profile.slug}`,
    },
  };
}

export function lotJsonLd(lot: Lot, ownerName?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: lot.title,
    description: lot.description,
    datePosted: lot.created_at,
    validThrough: lot.deadline_at,
    employmentType: "OTHER",
    hiringOrganization: ownerName
      ? { "@type": "Organization", name: ownerName }
      : undefined,
    jobLocation: {
      "@type": "Place",
      address: { "@type": "PostalAddress", addressLocality: lot.region, addressCountry: "KZ" },
    },
    ...(lot.max_price != null
      ? {
          baseSalary: {
            "@type": "MonetaryAmount",
            currency: lot.currency,
            value: { "@type": "QuantitativeValue", maxValue: lot.max_price },
          },
        }
      : {}),
  };
}

export function postJsonLd(post: Post, authorName?: string) {
  if (post.type === "product" && post.price != null) {
    return {
      "@context": "https://schema.org",
      "@type": "Product",
      name: post.title,
      description: post.body ?? undefined,
      image: post.images.length > 0 ? post.images : undefined,
      offers: {
        "@type": "Offer",
        price: post.price,
        priceCurrency: post.currency,
        availability: "https://schema.org/InStock",
      },
    };
  }
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    articleBody: post.body ?? undefined,
    image: post.images.length > 0 ? post.images : undefined,
    datePublished: post.created_at,
    dateModified: post.updated_at,
    author: authorName ? { "@type": "Person", name: authorName } : undefined,
  };
}
