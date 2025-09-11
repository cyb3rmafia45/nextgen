'use server';

/**
 * @fileOverview This file defines the Genkit flow for generating a Trust Report.
 *
 * - generateTrustReport - An async function that takes analysis results and synthesizes them into a human-readable Trust Report.
 * - GenerateTrustReportInput - The input type for the generateTrustReport function.
 * - GenerateTrustReportOutput - The return type for the generateTrustReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTrustReportInputSchema = z.object({
  deepfakeLikelihood: z.number().describe('The likelihood of the media being a deepfake, from 0 to 1.'),
  reverseImageSearchResults: z.string().describe('The results of reverse image searches.'),
  elaResults: z.string().describe('The results of Error Level Analysis.'),
  exifData: z.string().describe('The extracted EXIF data from the media.'),
});
export type GenerateTrustReportInput = z.infer<typeof GenerateTrustReportInputSchema>;

const GenerateTrustReportOutputSchema = z.object({
  trustReport: z.string().describe('A human-readable report summarizing the trustworthiness of the media based on the analysis results.'),
});
export type GenerateTrustReportOutput = z.infer<typeof GenerateTrustReportOutputSchema>;

export async function generateTrustReport(input: GenerateTrustReportInput): Promise<GenerateTrustReportOutput> {
  return generateTrustReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTrustReportPrompt',
  input: {schema: GenerateTrustReportInputSchema},
  output: {schema: GenerateTrustReportOutputSchema},
  prompt: `You are an AI agent that synthesizes technical analysis results into an easy-to-understand Trust Report. Use the following information to create the report:

Deepfake Likelihood: {{{deepfakeLikelihood}}}
Reverse Image Search Results: {{{reverseImageSearchResults}}}
Error Level Analysis Results: {{{elaResults}}}
EXIF Data: {{{exifData}}}

Write a concise report summarizing the trustworthiness of the media. Focus on presenting the information in a way that is understandable to a non-technical audience.`,
});

const generateTrustReportFlow = ai.defineFlow(
  {
    name: 'generateTrustReportFlow',
    inputSchema: GenerateTrustReportInputSchema,
    outputSchema: GenerateTrustReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
