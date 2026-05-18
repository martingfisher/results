import { defineCollection, z } from 'astro:content';

const message = z.object({
  from: z.enum(['client', 'agency']),
  text: z.string(),
});

const services = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    pageSlug: z.string(),
    summary: z.string(),
    eyebrow: z.string(),
    video: z.string(),
    poster: z.string(),
    streamId: z.string().optional(),
    cta: z.string(),
    secondaryCta: z.string().optional(),
    introSection: z.object({
      heading: z.string(),
      body: z.string(),
      primary: z.string(),
      secondary: z.string().optional(),
    }).optional(),
    bodyEyebrow: z.string().optional(),
    bodyHeading: z.string().optional(),
    relatedCaseStudies: z.array(z.string()),
    benefits: z.array(z.string()),
    serviceAreasEyebrow: z.string().optional(),
    serviceAreasHeading: z.string().optional(),
    serviceAreas: z.array(z.object({ title: z.string(), description: z.string() })).optional(),
    approach: z.object({ heading: z.string(), intro: z.string() }).optional(),
    editorialSections: z.array(z.object({ heading: z.string(), body: z.string() })).optional(),
    process: z.array(z.object({ step: z.string(), title: z.string(), description: z.string() })).optional(),
    closingCta: z.object({
      heading: z.string(),
      subheading: z.string().optional(),
      body: z.string().optional(),
      primary: z.string(),
      secondary: z.string().optional(),
    }).optional(),
    faqs: z.array(
      z.object({
        question: z.string(),
        answer: z.string(),
      })
    ).optional(),
    chat: z.array(message),
  }),
});

const caseStudies = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    client: z.string(),
    pageSlug: z.string(),
    sector: z.string(),
    summary: z.string(),
    summaryHeading: z.string().optional(),
    performanceNote: z.string().optional(),
    lighthouseScores: z
      .array(
        z.object({
          label: z.string(),
          score: z.number(),
        })
      )
      .optional(),
    services: z.array(z.string()),
    heroImage: z.string(),
    images: z.array(z.string()),
    proofMoments: z
      .array(
        z.object({
          image: z.string(),
          alt: z.string(),
          text: z.string(),
        })
      )
      .optional(),
    quote: z.string(),
    quoteBy: z.string(),
    outcomes: z.array(z.string()),
  }),
});

const faqs = defineCollection({
  type: 'content',
  schema: z.object({
    question: z.string(),
    answer: z.string(),
    page: z.string(),
  }),
});

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    pageSlug: z.string(),
    summary: z.string(),
    date: z.string(),
    category: z.string(),
    image: z.string().optional(),
    draft: z.boolean().default(true),
  }),
});

export const collections = { services, caseStudies, faqs, blog };
