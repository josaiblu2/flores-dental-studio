import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blogCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    author: z.string().default('Flores Dental Studio'),
    category: z.enum(['Guía', 'Mitos', 'Innovación']),
    image: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

const testimonialsCollection = defineCollection({
  loader: glob({ pattern: "**/*.{json,yaml}", base: "./src/content/testimonials" }),
  schema: z.object({
    patientName: z.string(),
    treatment: z.string(),
    rating: z.number().min(1).max(5).default(5),
    text: z.string(),
    status: z.enum(['pending', 'approved']).default('pending')
  }),
});

export const collections = {
  'blog': blogCollection,
  'testimonials': testimonialsCollection,
};
