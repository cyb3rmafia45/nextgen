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

type ExifField = {
  label: string;
  value: string;
  suspicious: boolean;
  explanation: string;
};


export type AnalysisResult = {
  deepfake: DetectDeepfakeOutput;
  contextualHistory: ContextualHistoryAnalysisOutput;
  ela: { summary: string; suspicious: boolean };
  exif: { summary: string; suspicious: boolean; fields: ExifField[] };
  trustReport: GenerateTrustReportOutput;
  trustScore: number;
  photoDataUri?: string;
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

const getMockExifResult = (): { summary: string; suspicious: boolean; fields: ExifField[] } => {
  const hasExif = Math.random() > 0.3;
  if (!hasExif) {
    return {
      summary:
        "No EXIF metadata was found. This could mean the data was intentionally stripped, which can be a method to hide an image's origin or edit history.",
      suspicious: true,
      fields: [
        {
          label: "Metadata Status",
          value: "Not Found",
          suspicious: true,
          explanation: "The absence of metadata can be a red flag, as it prevents verification of the image's history and authenticity. It is common for social media platforms to strip this data, but it can also be done intentionally to obscure edits."
        }
      ]
    };
  }
  const wasEdited = Math.random() > 0.5;
  if (wasEdited) {
     return {
      summary:
        "EXIF data indicates the image was processed with 'Adobe Photoshop 23.5'. The presence of editing software in metadata suggests that modifications may have been made.",
      suspicious: true,
      fields: [
        { label: "Camera Model", value: "ILCE-7RM3", suspicious: false, explanation: "The camera model used to take the shot." },
        { label: "Date/Time Original", value: "2023:08:15 14:30:05", suspicious: false, explanation: "The original date and time the photo was taken." },
        { label: "Software", value: "Adobe Photoshop 23.5", suspicious: true, explanation: "This tag indicates the image was saved using editing software. While not proof of manipulation, it confirms the image is not a direct-from-camera original." },
        { label: "GPS Latitude", value: "40° 44' 54.37'' N", suspicious: false, explanation: "Geolocation data, if present, can help verify the location of the photo." }
      ]
    };
  }
  
  return {
    summary:
      "EXIF data shows the image was captured with a 'Canon EOS R5' and has not been processed by common editing software. The metadata appears consistent with an original camera file.",
    suspicious: false,
    fields: [
        { label: "Camera Model", value: "Canon EOS R5", suspicious: false, explanation: "The camera model used to take the shot." },
        { label: "Date/Time Original", value: "2024:01:20 09:12:41", suspicious: false, explanation: "The original date and time the photo was taken." },
        { label: "F-Number", value: "f/2.8", suspicious: false, explanation: "The aperture setting of the lens." },
        { label: "ISO Speed Ratings", value: "100", suspicious: false, explanation: "The light sensitivity of the camera sensor." }
    ]
  };
};

async function performAnalysis(
  photoDataUri: string
): Promise<Omit<AnalysisResult, "photoDataUri">> {
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
    reverseImageSearchResults: contextualHistoryResult.summary,
    elaResults: elaResult.summary,
    exifData: exifResult.summary,
  });

  // Calculate Trust Score
  let score = 100;
  score -= deepfakeLikelihood * 70; // Major penalty for deepfake likelihood
  if (
    contextualHistoryResult.summary.includes("multiple websites") ||
    contextualHistoryResult.summary.includes("stock photo")
  ) {
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

export async function analyzeImage(
  photoDataUri: string
): Promise<AnalysisResult> {
  const analysis = await performAnalysis(photoDataUri);
  return { ...analysis, photoDataUri };
}
