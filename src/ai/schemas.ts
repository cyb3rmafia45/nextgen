/**
 * @fileOverview This file contains the Zod schemas and TypeScript types for the image analysis flows.
 * By centralizing the schemas here, we can share them between the "use server" functions and client components
 * without violating Next.js build rules.
 */

import { z } from 'zod';

// Schema for Deepfake Detection Output
const DetectDeepfakeOutputSchema = z.object({
  isDeepfake: z.boolean().describe('Whether the image is likely a deepfake.'),
  confidence: z
    .number()
    .describe('The confidence level (0-1) of the deepfake detection.'),
  explanation: z
    .string()
    .describe('Explanation of why the image is classified as deepfake or not.'),
  identifiedModel: z.string().optional().describe('The AI model identified as being used to generate the image, if any (e.g., "Midjourney", "DALL-E", "Stable Diffusion", "Pica AI").')
});

// Schema for a single online sighting of an image
const SightingSchema = z.object({
  source: z.string().describe('The website or platform where the image was found (e.g., "example.com", "Twitter").'),
  date: z.string().optional().describe('The approximate date the image appeared in YYYY-MM-DD format, if available. If not, this can be omitted.'),
  context: z.string().describe('A brief summary of how the image was used in that context.'),
  isOriginalSource: z.boolean().optional().describe('Set to true if this appears to be the original source of the image.'),
});

// Schema for the Contextual History (Reverse Image Search) Analysis Output
const ContextualHistoryAnalysisOutputSchema = z.object({
  summary: z.string().describe("A one-sentence summary of the image's online history."),
  sightings: z.array(SightingSchema).describe('A list of places where the image has been found online. Return at least 3-5 mock examples.'),
});

// Input schema for the main analyzeImage flow
export const AnalyzeImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo to be analyzed, as a data URI that must include a MIME type and use Base64 encoding. Expected format: data:<mimetype>;base64,<encoded_data>.'
    ),
});
export type AnalyzeImageInput = z.infer<typeof AnalyzeImageInputSchema>;

// Output schema for the main analyzeImage flow
export const AnalyzeImageOutputSchema = z.object({
  deepfake: DetectDeepfakeOutputSchema.describe('The results of the deepfake detection analysis.'),
  contextualHistory: ContextualHistoryAnalysisOutputSchema.describe('The results of the contextual history (reverse image search) analysis.'),
  trustReport: z.string().describe('A human-readable report summarizing the trustworthiness of the media based on all available analysis results. This should be a concise summary suitable for a non-technical audience.'),
});
export type AnalyzeImageOutput = z.infer<typeof AnalyzeImageOutputSchema>;
