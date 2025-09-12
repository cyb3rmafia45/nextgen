
'use server';
/**
 * @fileOverview A comprehensive image analysis AI agent.
 * This flow combines multiple analysis types (deepfake, contextual history) 
 * and generates a final trust report in a single API call.
 *
 * - analyzeImage - A function that handles the full image analysis process.
 */

import { ai } from '@/ai/genkit';
import { AnalyzeImageInputSchema, AnalyzeImageOutputSchema, type AnalyzeImageInput, type AnalyzeImageOutput } from '@/ai/schemas';


export async function analyzeImage(input: AnalyzeImageInput): Promise<AnalyzeImageOutput> {
  return analyzeImageFlow(input);
}


const prompt = ai.definePrompt({
  name: 'analyzeImagePrompt',
  input: { schema: AnalyzeImageInputSchema },
  output: { schema: AnalyzeImageOutputSchema },
  prompt: `You are an expert AI agent that performs a comprehensive analysis of an image to determine its trustworthiness. You will perform multiple tasks and return a single, consolidated JSON object with the results.

Analyze the following image:

Image: {{media url=photoDataUri}}

Perform the following analyses:

1.  **Deepfake Detection**:
    - Analyze the image for signs of AI generation, manipulation, or deepfaking.
    - **CRITICAL INSTRUCTION**: Pay extremely close attention to watermarks. The presence of a watermark from an AI image generation tool (e.g., "Pica AI", "DALL-E", "Midjourney", "Stable Diffusion", etc.) is definitive proof that the image is AI-generated. If you find such a watermark, you MUST set 'isDeepfake' to true and your confidence to a high value (e.g., 0.95 or higher).
    - Consider other factors like inconsistencies in lighting, shadows, unnatural textures (skin, hair), and artifacts.
    - If you determine the image is AI-generated, identify the model used if possible.
    - Populate the 'deepfake' field in the output with your findings.

2.  **Contextual History Analysis**:
    - Perform a conceptual reverse image search to identify where else the image has appeared online.
    - Provide a one-sentence summary of the image's online history.
    - Generate a list of at least 3-5 distinct and realistic mock examples for the timeline of sightings. Each sighting should include the source (website), date, and context.
    - If you can determine an original source, mark it accordingly.
    - Populate the 'contextualHistory' field in the output.

3.  **Trust Report Generation**:
    - Based on ALL the information you have gathered from the deepfake and contextual history analyses, write a concise, easy-to-understand summary of the media's trustworthiness.
    - This report should be suitable for a non-technical audience.
    - Populate the 'trustReport' field in the output with this summary.

Return a single JSON object that strictly conforms to the output schema.
`,
});

const analyzeImageFlow = ai.defineFlow(
  {
    name: 'analyzeImageFlow',
    inputSchema: AnalyzeImageInputSchema,
    outputSchema: AnalyzeImageOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('The AI model did not return a valid analysis.');
    }
    return output;
  }
);
