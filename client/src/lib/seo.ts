import { useHead, useSeoMeta } from '@unhead/react';
import {
  defineOrganization,
  defineWebPage,
  defineWebSite,
  useSchemaOrg,
} from '@unhead/schema-org/react';

export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://tracklyid.vercel.app').replace(/\/+$/, '');
export const SITE_NAME = 'Trackly';
export const SITE_DESCRIPTION =
  'Trackly is a free, privacy-first habit and activity tracker for building calm routines with heatmaps, streaks, and daily progress logs.';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

export interface SeoOptions {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
  type?: 'website' | 'article';
  image?: string;
  markdownPath?: string;
}

function absoluteUrl(path: string) {
  if (path === '/') return `${SITE_URL}/`;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

function markdownPathFor(path: string) {
  if (path === '/') return '/index.md';
  return `${path.replace(/\/+$/, '')}.md`;
}

/**
 * Sets the full SEO head for a public, indexable page.
 * Canonical URLs always point at the production origin, never at localhost.
 */
export function useSeo({
  title,
  description,
  path,
  noindex = false,
  type = 'website',
  image = DEFAULT_OG_IMAGE,
  markdownPath,
}: SeoOptions) {
  const url = absoluteUrl(path);
  const markdownUrl = absoluteUrl(markdownPath ?? markdownPathFor(path));

  useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogUrl: url,
    ogType: type,
    ogImage: image,
    ogImageAlt: 'Trackly - build calm routines, observe steady progress',
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: image,
    robots: noindex ? 'noindex, nofollow' : 'index, follow',
  });

  useHead({
    link: [
      { key: 'canonical', rel: 'canonical', href: url },
      { key: 'markdown-alternate', rel: 'alternate', type: 'text/markdown', href: markdownUrl },
    ],
  });
}

/** Private app pages: never index, never show a canonical URL. */
export function useAppSeo(title: string, description = 'Your private Trackly workspace.') {
  useSeoMeta({
    title,
    description,
    robots: 'noindex, nofollow',
  });
}

export interface SchemaOptions {
  pageName?: string;
  pagePath?: string;
  faq?: Array<{ question: string; answer: string }>;
}

/**
 * Shared Schema.org graph for every public page. Search engines and AI agents
 * can then understand the product, the site, and the author without guessing
 * from the rendered UI.
 */
export function useTracklySchema({ pageName, pagePath = '/', faq }: SchemaOptions = {}) {
  const pageUrl = absoluteUrl(pagePath);

  const nodes: Array<Record<string, unknown>> = [
    defineWebSite({
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      description: SITE_DESCRIPTION,
      inLanguage: 'en',
    }),
    defineWebPage({
      name: pageName ?? SITE_NAME,
      description: SITE_DESCRIPTION,
      url: pageUrl,
    }),
    // Plain object instead of defineSoftwareApp(): its TypeScript helper
    // requires a `review`, which a new product does not have yet.
    {
      '@type': 'SoftwareApplication',
      '@id': `${SITE_URL}/#software`,
      name: SITE_NAME,
      applicationCategory: 'LifestyleApplication',
      operatingSystem: 'Web',
      description: SITE_DESCRIPTION,
      url: `${SITE_URL}/`,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    },
    defineOrganization({
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      logo: `${SITE_URL}/icon-512.png`,
      sameAs: ['https://github.com/IchwanArdi'],
      founder: {
        '@type': 'Person',
        name: 'Ichwan Ardi',
        url: 'https://github.com/IchwanArdi',
      },
    }),
  ];

  if (faq?.length) {
    nodes.push({
      '@type': 'FAQPage',
      mainEntity: faq.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    });
  }

  useSchemaOrg(nodes);
}
