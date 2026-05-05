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
    cta: z.string(),
    relatedCaseStudies: z.array(z.string()),
    benefits: z.array(z.string()),
    faqs: z.array(
      z.object({
        question: z.string(),
        answer: z.string(),
      })
    ),
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
    draft: z.boolean().default(true),
  }),
});

export const collections = { services, caseStudies, faqs, blog };
