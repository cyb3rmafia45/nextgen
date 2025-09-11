'use server';
/**
 * @fileOverview This flow performs a reverse image search to identify where else the image has appeared online.
 *
 * - contextualHistoryAnalysis - A function that initiates the reverse image search and returns the findings.
 * - ContextualHistoryAnalysisInput - The input type for the contextualHistoryAnalysis function, which is a data URI of the image.
 * - ContextualHistoryAnalysisOutput - The return type for the contextualHistoryAnalysis function, which is a string containing the search results.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ContextualHistoryAnalysisInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo to search for online, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'    ),
});
export type ContextualHistoryAnalysisInput = z.infer<typeof ContextualHistoryAnalysisInputSchema>;

const SightingSchema = z.object({
  source: z.string().describe('The website or platform where the image was found (e.g., "example.com", "Twitter").'),
  date: z.string().optional().describe('The approximate date the image appeared in YYYY-MM-DD format, if available. If not, this can be omitted.'),
  context: z.string().describe('A brief summary of how the image was used in that context.'),
  isOriginalSource: z.boolean().optional().describe('Set to true if this appears to be the original source of the image.'),
});

const ContextualHistoryAnalysisOutputSchema = z.object({
  summary: z.string().describe('A one-sentence summary of the image\'s online history.'),
  sightings: z.array(SightingSchema).describe('A list of places where the image has been found online. Return at least 3-5 mock examples.'),
});
export type ContextualHistoryAnalysisOutput = z.infer<typeof ContextualHistoryAnalysisOutputSchema>;

export async function contextualHistoryAnalysis(
  input: ContextualHistoryAnalysisInput
): Promise<ContextualHistoryAnalysisOutput> {
  return contextualHistoryAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'contextualHistoryAnalysisPrompt',
  input: {schema: ContextualHistoryAnalysisInputSchema},
  output: {schema: ContextualHistoryAnalysisOutputSchema},
  prompt: `You are an expert investigator specializing in tracing the origins and usage of images online.

You will perform a reverse image search to identify where else the image has appeared online. You will analyze the search results and summarize your findings.

For the output, provide a list of sightings. Each sighting should include the source (website), the approximate date of appearance, and the context of its use. If you can determine the original source, mark it accordingly. Generate at least 3-5 distinct and realistic mock examples for the timeline.

Analyze the following image:

Image: {{media url=photoDataUri}}

`,
});

const contextualHistoryAnalysisFlow = ai.defineFlow(
  {
    name: 'contextualHistoryAnalysisFlow',
    inputSchema: ContextualHistoryAnalysisInputSchema,
    outputSchema: ContextualHistoryAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
