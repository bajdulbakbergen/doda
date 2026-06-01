import { termsMeta, TermsRu, TermsKk } from "./documents/terms";
import { privacyMeta, PrivacyRu, PrivacyKk } from "./documents/privacy";
import { personalDataMeta, PersonalDataRu, PersonalDataKk } from "./documents/personal-data";
import { offerMeta, OfferRu, OfferKk } from "./documents/offer";
import { tendersRulesMeta, TendersRulesRu, TendersRulesKk } from "./documents/tenders-rules";
import { disputesMeta, DisputesRu, DisputesKk } from "./documents/disputes";
import { contentRulesMeta, ContentRulesRu, ContentRulesKk } from "./documents/content-rules";
import { cookiesMeta, CookiesRu, CookiesKk } from "./documents/cookies";

export type LegalDoc = {
  slug: string;
  version: string;
  publishedAt: string;
  titleRu: string;
  titleKk: string;
  Ru: React.FC;
  Kk: React.FC;
};

export const legalDocs: Record<string, LegalDoc> = {
  terms: { ...termsMeta, Ru: TermsRu, Kk: TermsKk },
  privacy: { ...privacyMeta, Ru: PrivacyRu, Kk: PrivacyKk },
  "personal-data": { ...personalDataMeta, Ru: PersonalDataRu, Kk: PersonalDataKk },
  offer: { ...offerMeta, Ru: OfferRu, Kk: OfferKk },
  "tenders-rules": { ...tendersRulesMeta, Ru: TendersRulesRu, Kk: TendersRulesKk },
  disputes: { ...disputesMeta, Ru: DisputesRu, Kk: DisputesKk },
  "content-rules": { ...contentRulesMeta, Ru: ContentRulesRu, Kk: ContentRulesKk },
  cookies: { ...cookiesMeta, Ru: CookiesRu, Kk: CookiesKk },
};

export const REGISTRABLE_CONSENTS = ["terms", "personal-data"] as const;
export type RegistrableConsentSlug = (typeof REGISTRABLE_CONSENTS)[number];

export function getConsentVersion(slug: RegistrableConsentSlug): string {
  return legalDocs[slug].version;
}
