'use client';

import { useState, } from 'react';
import { Card, CardContent, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  FileText, 
  Sparkles, 
  Clock, 
  Lightbulb, 
  RefreshCw, 
  Save, 
  ArrowLeft, 
  Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { generateAISummary, saveAISummary, type SummaryData } from "./actions";
import AISummaryDisplay from "./AISummaryDisplay";
import AISummaryStats from "./AISummaryStats";
import AISummaryActions from "./AISummaryActions";

interface AISummaryContentProps {
  noteId: string;
}

export default function AISummaryContent({ noteId }: AISummaryContentProps) {
  const router = useRouter();
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateAISummary(noteId);
      
      if (result.success && result.data) {
        setSummaryData(result.data);
        setHasGenerated(true);
        toast.success("AI Summary generated successfully!", {
          description: "Your note has been analyzed and summarized."
        });
      } else {
        setError(result.error || 'Failed to generate summary');
        toast.error("Failed to generate summary", {
          description: result.error || 'An unexpected error occurred'
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      toast.error("Summary generation failed", {
        description: err instanceof Error ? err.message : 'An unexpected error occurred'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveSummary = async () => {
    if (!summaryData) return;

    setIsSaving(true);
    try {
      const result = await saveAISummary(
        noteId, 
        summaryData.summary, 
        summaryData.keyTakeaways
      );
      
      if (!result.success) {
        setError(result.error || 'Failed to save summary');
        toast.error("Failed to save summary", {
          description: result.error || 'An unexpected error occurred'
        });
      } else {
        toast.success("Summary saved successfully!", {
          description: "Your AI summary has been saved for future reference."
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save summary');
      toast.error("Save failed", {
        description: err instanceof Error ? err.message : 'Failed to save summary'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Study
            </Button>
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">AI Summary</h1>
            </div>
          </div>
          
          {hasGenerated && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateSummary}
                disabled={isGenerating}
                className="flex items-center gap-2"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Regenerate
              </Button>
              
              {summaryData && (
                <div className="flex items-center gap-2">
                  <AISummaryActions summaryData={summaryData} />
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleSaveSummary}
                    disabled={isSaving}
                    className="flex items-center gap-2"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Summary
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Content */}
        {isGenerating ? (
          /* Loading State */
          <Card className="text-center py-12">
            <CardContent className="space-y-6">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
              
              <div className="space-y-3">
                <h2 className="text-xl font-semibold">Generating Your AI Summary</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Our AI is analyzing your note content to create a comprehensive summary 
                  and extract key takeaways. This usually takes just a few seconds.
                </p>
              </div>

              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-100" />
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-200" />
              </div>
            </CardContent>
          </Card>
        ) : !hasGenerated ? (
          /* Welcome Card */
          <Card className="text-center py-12">
            <CardContent className="space-y-6">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              
              <div className="space-y-3">
                <h2 className="text-xl font-semibold">Generate AI Summary</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Get an intelligent summary of your note with key takeaways and insights 
                  to help you understand and remember the important concepts.
                </p>
              </div>

              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Sparkles className="h-4 w-4" />
                  AI-Powered
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Quick Generation
                </div>
                <div className="flex items-center gap-1">
                  <Lightbulb className="h-4 w-4" />
                  Key Insights
                </div>
              </div>

              <Button 
                onClick={handleGenerateSummary}
                disabled={isGenerating}
                size="lg"
                className="mt-6"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Summary...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate AI Summary
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ) : summaryData ? (
          /* Summary Display */
          <div className="space-y-6 animate-in fade-in-50 duration-500">
            <AISummaryStats summaryData={summaryData} />
            <AISummaryDisplay summaryData={summaryData} />
          </div>
        ) : null}
      </div>
    </div>
  );
}