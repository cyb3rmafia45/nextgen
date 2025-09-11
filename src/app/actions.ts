"use server";

import {
  contextualHistoryAnalysis,
  type ContextualHistoryAnalysisOutput,
} from "@/ai/flows/contextual-history-analysis";
import {
  detectDeepfake,
  type DetectDeepfakeOutput,
} from "@/ai/flows/deepfake-detection";
import {
  generateTrustReport,
  type GenerateTrustReportOutput,
} from "@/ai/flows/generate-trust-report";

export type AnalysisResult = {
  deepfake: DetectDeepfakeOutput;
  contextualHistory: ContextualHistoryAnalysisOutput;
  ela: { summary: string; suspicious: boolean };
  exif: { summary: string; suspicious: boolean };
  trustReport: GenerateTrustReportOutput;
  trustScore: number;
};

// Mock ELA and EXIF data generation
const getMockElaResult = (): { summary: string; suspicious: boolean } => {
  const isSuspicious = Math.random() > 0.5;
  return isSuspicious
    ? {
        summary:
          "Error Level Analysis reveals inconsistencies in compression levels across the image, particularly around the subject's face. This may suggest digital alteration or compositing.",
        suspicious: true,
      }
    : {
        summary:
          "The image exhibits uniform compression levels throughout, with no significant discrepancies found. This is consistent with an unedited, original photograph.",
        suspicious: false,
      };
};

const getMockExifResult = (): { summary: string; suspicious: boolean } => {
  const hasExif = Math.random() > 0.3;
  if (!hasExif) {
    return {
      summary:
        "No EXIF metadata was found. This could mean the data was intentionally stripped, which can be a method to hide an image's origin or edit history.",
      suspicious: true,
    };
  }
  const wasEdited = Math.random() > 0.5;
  return wasEdited
    ? {
        summary:
          "EXIF data indicates the image was processed with 'Adobe Photoshop 23.5'. The presence of editing software in metadata suggests that modifications may have been made.",
        suspicious: true,
      }
    : {
        summary:
          "EXIF data shows the image was captured with a 'Canon EOS R5' and has not been processed by common editing software. The metadata appears consistent with an original camera file.",
        suspicious: false,
      };
};

export async function analyzeImage(
  photoDataUri: string
): Promise<AnalysisResult> {
  // Run analyses in parallel
  const [deepfakeResult, contextualHistoryResult, elaResult, exifResult] =
    await Promise.all([
      detectDeepfake({ photoDataUri }),
      contextualHistoryAnalysis({ photoDataUri }),
      Promise.resolve(getMockElaResult()),
      Promise.resolve(getMockExifResult()),
    ]);
  
  const deepfakeLikelihood = deepfakeResult.isDeepfake
    ? deepfakeResult.confidence
    : 1 - deepfakeResult.confidence;

  // Generate the final report
  const trustReportResult = await generateTrustReport({
    deepfakeLikelihood,
    reverseImageSearchResults: contextualHistoryResult.searchResults,
    elaResults: elaResult.summary,
    exifData: exifResult.summary,
  });

  // Calculate Trust Score
  let score = 100;
  score -= deepfakeLikelihood * 70; // Major penalty for deepfake likelihood
  if (contextualHistoryResult.searchResults.includes("multiple websites") || contextualHistoryResult.searchResults.includes("stock photo")) {
    score -= 10;
  }
  if (elaResult.suspicious) {
    score -= 15;
  }
  if (exifResult.suspicious) {
    score -= 10;
  }
  const trustScore = Math.max(0, Math.round(score));

  return {
    deepfake: deepfakeResult,
    contextualHistory: contextualHistoryResult,
    ela: elaResult,
    exif: exifResult,
    trustReport: trustReportResult,
    trustScore,
  };
}
