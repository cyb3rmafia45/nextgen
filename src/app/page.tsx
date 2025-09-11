"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  FileCheck2,
  History,
  Loader2,
  ScanSearch,
  ShieldCheck,
  UploadCloud,
  X,
} from "lucide-react";

import { analyzeImage, type AnalysisResult } from "@/app/actions";
import { AppLogo } from "@/components/app-logo";
import OpeningAnimation from "@/components/opening-animation";
import { TrustScoreGauge } from "@/components/trust-score-gauge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type AnalysisState = "animating" | "idle" | "analyzing" | "results" | "error";
type AnalysisStep = "deepfake" | "history" | "ela" | "exif" | "report";

const analysisSteps: {
  key: AnalysisStep;
  label: string;
  icon: React.ElementType;
}[] = [
  { key: "deepfake", label: "Detecting Deepfake", icon: ShieldCheck },
  { key: "history", label: "Analyzing Contextual History", icon: History },
  { key: "ela", label: "Performing Error Level Analysis", icon: ScanSearch },
  { key: "exif", label: "Extracting Metadata", icon: FileCheck2 },
  { key: "report", label: "Generating Trust Report", icon: Loader2 },
];

export default function Home() {
  const [analysisState, setAnalysisState] =
    useState<AnalysisState>("animating");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(URL.createObjectURL(file));
      setImageDataUri(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleImageUpload(file);
    } else {
      toast({
        variant: "destructive",
        title: "Invalid File Type",
        description: "Please upload an image file.",
      });
    }
  };

  const startAnalysis = async () => {
    if (!imageDataUri) return;
    setAnalysisState("analyzing");
    try {
      const result = await analyzeImage(imageDataUri);
      setAnalysisResult(result);
      setAnalysisState("results");
    } catch (error) {
      console.error(error);
      setAnalysisState("error");
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "An unexpected error occurred. Please try again.",
      });
      resetState();
    }
  };

  const resetState = useCallback(() => {
    setAnalysisState("idle");
    setImagePreview(null);
    setImageDataUri(null);
    setAnalysisResult(null);
  }, []);

  if (analysisState === "animating") {
    return (
      <OpeningAnimation onAnimationEnd={() => setAnalysisState("idle")} />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="p-4 border-b">
        <div className="container mx-auto flex items-center gap-2">
          <AppLogo className="w-8 h-8"/>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Next Gen
          </h1>
        </div>
      </header>
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex flex-col gap-4 items-center justify-center">
            {imagePreview ? (
              <Card className="w-full max-w-lg mx-auto">
                <CardContent className="p-4 relative aspect-video">
                  <Image
                    src={imagePreview}
                    alt="Uploaded image preview"
                    fill
                    className="object-contain rounded-md"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-background/50 hover:bg-background/80 rounded-full h-8 w-8"
                    onClick={() => { setImagePreview(null); setImageDataUri(null); }}
                    disabled={analysisState === "analyzing"}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <label
                onDragEnter={handleDragEnter}
                onDragOver={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  "flex flex-col items-center justify-center w-full max-w-lg h-64 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-secondary transition-colors",
                  isDragging && "border-primary bg-accent/20"
                )}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Click to upload</span> or drag and
                    drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, or WEBP
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg, image/webp"
                />
              </label>
            )}
            <div className="flex gap-4">
              <Button
                size="lg"
                onClick={startAnalysis}
                disabled={!imagePreview || analysisState === "analyzing"}
              >
                {analysisState === "analyzing" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Analyze Image
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={resetState}
                disabled={analysisState === "analyzing"}
              >
                Start Over
              </Button>
            </div>
          </div>

          <div className="w-full">
            <Card className="min-h-[400px]">
              <CardHeader>
                <CardTitle>Analysis Report</CardTitle>
                <CardDescription>
                  {analysisState === 'idle' && "Upload an image to begin analysis."}
                  {analysisState === 'analyzing' && "AI is analyzing your image. Please wait..."}
                  {analysisState === 'results' && "Your comprehensive trust report is ready."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analysisState === 'analyzing' && (
                  <div className="space-y-4 pt-4">
                    {analysisSteps.map((step) => (
                      <div key={step.key} className="flex items-center gap-3">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        <span className="text-foreground">{step.label}</span>
                      </div>
                    ))}
                  </div>
                )}
                {analysisState === 'results' && analysisResult && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      <TrustScoreGauge score={analysisResult.trustScore} />
                      <div className="flex-1">
                        <h3 className="text-xl font-bold">AI Trust Report</h3>
                        <p className="text-muted-foreground mt-2">
                          {analysisResult.trustReport.trustReport}
                        </p>
                      </div>
                    </div>

                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="details">
                        <AccordionTrigger>View Detailed Analysis</AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-4">
                          <div className="flex justify-between items-center p-3 rounded-md bg-secondary">
                            <div className="flex items-center gap-3">
                              <ShieldCheck className="h-5 w-5 text-primary" />
                              <span className="font-medium">Deepfake Detection</span>
                            </div>
                            <Badge variant={analysisResult.deepfake.isDeepfake ? "destructive" : "default"}>
                              {analysisResult.deepfake.isDeepfake ? "Likely Deepfake" : "Likely Authentic"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground px-3">{analysisResult.deepfake.explanation}</p>

                          <div className="flex justify-between items-center p-3 rounded-md bg-secondary">
                            <div className="flex items-center gap-3">
                              <History className="h-5 w-5 text-primary" />
                              <span className="font-medium">Contextual History</span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground px-3">{analysisResult.contextualHistory.searchResults}</p>

                          <div className="flex justify-between items-center p-3 rounded-md bg-secondary">
                            <div className="flex items-center gap-3">
                              <ScanSearch className="h-5 w-5 text-primary" />
                              <span className="font-medium">Error Level Analysis (ELA)</span>
                            </div>
                            <Badge variant={analysisResult.ela.suspicious ? "destructive" : "default"}>
                              {analysisResult.ela.suspicious ? "Suspicious" : "Looks Clean"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground px-3">{analysisResult.ela.summary}</p>
                          
                          <div className="flex justify-between items-center p-3 rounded-md bg-secondary">
                            <div className="flex items-center gap-3">
                              <FileCheck2 className="h-5 w-5 text-primary" />
                              <span className="font-medium">Metadata (EXIF)</span>
                            </div>
                            <Badge variant={analysisResult.exif.suspicious ? "destructive" : "default"}>
                              {analysisResult.exif.suspicious ? "Indicates Editing" : "No Issues"}
                            </Badge>
                          </div>
                           <p className="text-sm text-muted-foreground px-3">{analysisResult.exif.summary}</p>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
