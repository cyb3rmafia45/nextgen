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

const ContextualHistoryAnalysisOutputSchema = z.object({
  searchResults: z.string().describe('The search results of where else the image has appeared online.'),
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
  prompt: `You are an expert investigator specializing in detecting image misuse.

You will perform a reverse image search to identify where else the image has appeared online. You will analyze the search results and summarize your findings in a report.

Analyze the following image:

Image: {{media url=photoDataUri}}

Report:`,
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
