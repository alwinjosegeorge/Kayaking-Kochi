// ============================================================
// visitkadambrayar.com — JSON-LD Structured Data
// /src/utils/structured-data.ts
//
// Used by: src/utils/injectSEO.ts (injected into <head> on load)
// ============================================================

import { siteConfig } from "./seo.config";

type Schema = Record<string, unknown>;

// ── 1. LocalBusiness + TouristAttraction ──────────────────
export const localBusinessSchema: Schema = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "TouristAttraction"],
  "@id": `${siteConfig.url}/#business`,
  name: siteConfig.name,
  alternateName: [siteConfig.shortName, "Visit Kadambrayar"],
  description:
    "Guided backwater kayaking tours on the Kadambrayar river and riverside seafood dining near Kakkanad, Kochi, Kerala.",
  url: siteConfig.url,
  logo: `${siteConfig.url}/logo.webp`,
  image: `${siteConfig.url}${siteConfig.ogImage}`,
  telephone: siteConfig.phone,
  email: siteConfig.email,
  priceRange: "450-900 INR per person for kayaking tours",
  currenciesAccepted: "INR",
  paymentAccepted: "Cash, Credit Card, Debit Card, UPI",
  address: {
    "@type": "PostalAddress",
    streetAddress: siteConfig.address.street,
    addressLocality: siteConfig.address.locality,
    addressRegion: siteConfig.address.region,
    postalCode: siteConfig.address.postalCode,
    addressCountry: siteConfig.address.country,
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: siteConfig.geo.latitude,
    longitude: siteConfig.geo.longitude,
  },
  hasMap: siteConfig.social.googleMaps,
  areaServed: [
    { "@type": "City", name: "Kochi" },
    { "@type": "City", name: "Kakkanad" },
    { "@type": "City", name: "Ernakulam" },
    { "@type": "City", name: "Alleppey" },
    { "@type": "City", name: "Kottayam" },
    { "@type": "AdministrativeArea", name: "Kerala" },
  ],
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "20:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Saturday", "Sunday"],
      opens: "07:00",
      closes: "21:00",
    },
  ],
  // ← FIX: removed siteConfig.social.tripadvisor — was undefined, broke JSON-LD
  sameAs: [
    siteConfig.social.instagram,
    siteConfig.social.facebook,
    siteConfig.social.googleMaps,
    // Add tripadvisor URL here once you have it: "https://www.tripadvisor.in/..."
  ],
  touristType: ["Nature & Adventure", "Eco-tourism", "Culinary Tourism", "Family Tourism"],
};

// ── 2. TouristTrip — Guided Kayaking Tour ─────────────────
export const kayakingTourSchema: Schema = {
  "@context": "https://schema.org",
  "@type": "TouristTrip",
  name: "Guided Backwater Kayaking Tour – Kadambrayar River, Kochi Kerala",
  description:
    "A guided kayaking tour through the Kadambrayar backwaters near Kochi, Kerala. Beginner-friendly, eco-certified, with professional guides.",
  url: siteConfig.url,
  provider: { "@id": `${siteConfig.url}/#business` },
  touristType: "Adventure & Eco-tourism",
  availableLanguage: [
    { "@type": "Language", name: "English" },
    { "@type": "Language", name: "Malayalam" },
    { "@type": "Language", name: "Hindi" },
  ],
  itinerary: {
    "@type": "ItemList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Safety briefing & kayak fitting" },
      { "@type": "ListItem", position: 2, name: "Guided paddle through Kadambrayar backwaters" },
      { "@type": "ListItem", position: 3, name: "Mangrove forest & wildlife observation" },
      { "@type": "ListItem", position: 4, name: "Riverside rest stop & refreshments" },
      { "@type": "ListItem", position: 5, name: "Return paddle & debrief" },
    ],
  },
  offers: {
    "@type": "Offer",
    priceCurrency: "INR",
    price: "XXXX",                      // ← replace with your actual tour price
    availability: "https://schema.org/InStock",
    url: siteConfig.url,
    seller: { "@id": `${siteConfig.url}/#business` },
  },
};

// ── 3. FoodEstablishment — Riverside Dining ───────────────
export const diningSchema: Schema = {
  "@context": "https://schema.org",
  "@type": ["FoodEstablishment", "Restaurant"],
  name: `${siteConfig.name} – Riverside Dining`,
  description:
    "Fresh Kerala seafood and riverside dining on the Kadambrayar river near Kakkanad, Kochi.",
  url: siteConfig.url,
  telephone: siteConfig.phone,
  servesCuisine: ["Kerala Seafood", "South Indian", "Continental"],
  acceptsReservations: true,
  address: {
    "@type": "PostalAddress",
    addressLocality: siteConfig.address.locality,
    addressRegion: siteConfig.address.region,
    postalCode: siteConfig.address.postalCode,
    addressCountry: siteConfig.address.country,
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: siteConfig.geo.latitude,
    longitude: siteConfig.geo.longitude,
  },
  parentOrganization: { "@id": `${siteConfig.url}/#business` },
  priceRange: "₹₹",
};

// ── 4. FAQPage — targets Google featured snippets ─────────
export const faqSchema: Schema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is kayaking in Kochi suitable for beginners?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, all our guided kayaking tours on the Kadambrayar river near Kochi are beginner-friendly. Our professional guides provide full safety briefings and paddling instruction before every tour.",
      },
    },
    {
      "@type": "Question",
      name: "What is the best time for kayaking in Kerala?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The best time for kayaking in Kerala is October to March. The Kadambrayar backwaters near Kochi are calm and scenic during these months with ideal weather conditions.",
      },
    },
    {
      "@type": "Question",
      name: "How far is Hooked & Cooked from Kochi city centre?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Hooked & Cooked – River Dine is located near Kakkanad, approximately 15–20 km from Kochi city centre, about 30–40 minutes by road.",
      },
    },
    {
      "@type": "Question",
      name: "Do you offer kayaking tours from Alleppey or Kottayam?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Our kayaking tours operate from the Kadambrayar river near Kakkanad, Kochi. Visitors from Alleppey, Kottayam, and Ernakulam can reach us within 1–2 hours.",
      },
    },
    {
      "@type": "Question",
      name: "Can we book riverside dining without a kayaking tour?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, you can book our riverside seafood dining experience independently without joining a kayaking tour. We recommend reserving a table in advance, especially on weekends.",
      },
    },
    {
      "@type": "Question",
      name: "What eco-tourism activities are available near Kakkanad, Kochi?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We offer guided backwater kayaking, mangrove nature walks, bird watching, and river wildlife tours on the Kadambrayar river near Kakkanad, Kochi.",
      },
    },
  ],
};

// ── 5. WebSite schema — enables Google Sitelinks search ───
export const websiteSchema: Schema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteConfig.url}/#website`,
  name: siteConfig.name,
  url: siteConfig.url,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${siteConfig.url}/?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

// ── All schemas bundled ────────────────────────────────────
export const allSchemas: Schema[] = [
  websiteSchema,
  localBusinessSchema,
  kayakingTourSchema,
  diningSchema,
  faqSchema,
];
