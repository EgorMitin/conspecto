'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Lightbulb,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Sparkles,
  Loader2,
  Brain
} from "lucide-react";
import type { SummaryData } from './actions';
import ReactMarkdown from 'react-markdown';


interface AISummaryDisplayProps {
  summaryData: SummaryData;
  handleStartAIReview: () => void;
  isStartingReview: boolean;
}

export default function AISummaryDisplay({ summaryData, handleStartAIReview, isStartingReview }: AISummaryDisplayProps) {
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [copiedTakeaways, setCopiedTakeaways] = useState(false);
  const [showOriginalNote, setShowOriginalNote] = useState(false);

  const { summary, keyTakeaways, sourceContent, sourceTitle, sourceType } = summaryData;

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    } catch (err) {
      console.error('Failed to copy summary:', err);
    }
  };

  const handleCopyTakeaways = async () => {
    try {
      const takeawaysText = keyTakeaways.map((takeaway, index) =>
        `${index + 1}. ${takeaway}`
      ).join('\n');
      await navigator.clipboard.writeText(takeawaysText);
      setCopiedTakeaways(true);
      setTimeout(() => setCopiedTakeaways(false), 2000);
    } catch (err) {
      console.error('Failed to copy takeaways:', err);
    }
  };

  return (
    <div className="space-y-6">

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Summary
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopySummary}
              className="flex items-center gap-2"
            >
              {copiedSummary ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Summary
                </>
              )}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            AI-generated summary of your {sourceType}&apos;s main content and concepts
          </p>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <div className="text-base leading-relaxed text-foreground/90 font-medium">
              <ReactMarkdown>
                {summary}
              </ReactMarkdown>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Key Takeaways
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyTakeaways}
              className="flex items-center gap-2"
            >
              {copiedTakeaways ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Takeaways
                </>
              )}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Essential points and insights extracted from your {sourceType}
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {keyTakeaways.map((takeaway, index) => (
              <div key={index} className="flex gap-4 p-4 rounded-lg bg-muted/50 border border-muted/20 hover:bg-muted/70 transition-colors">
                <div className="flex-shrink-0">
                  <Badge variant="secondary" className="w-8 h-8 rounded-full flex items-center justify-center font-semibold">
                    {index + 1}
                  </Badge>
                </div>
                <p className="text-sm leading-relaxed text-foreground/90">
                  {takeaway}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className='flex justify-center'>
        <Button
          variant="secondary"
          size="lg"
          onClick={handleStartAIReview}
          disabled={isStartingReview}
          className="flex items-center gap-2 px-10 py-3 text-lg shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200 ease-in-out"
        >
          {isStartingReview ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Brain className="h-4 w-4" />
          )}
          Ready for AI-Review
        </Button>
      </div>

      <Card>
        <CardHeader>
          <Button
            variant="ghost"
            onClick={() => setShowOriginalNote(!showOriginalNote)}
            className="flex items-center justify-between w-full p-0"
          >
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-slate-500" />
              Original {sourceType === 'note' ? 'Note' : 'Folder'} Content
            </CardTitle>
            {showOriginalNote ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
          <p className="text-sm text-muted-foreground text-left">
            View the original {sourceType} content that was used to generate this summary
          </p>
        </CardHeader>

        {showOriginalNote && (
          <CardContent>
            <Separator className="mb-4" />
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <h4 className="font-semibold mb-3">{sourceTitle}</h4>
              <div className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
                {sourceContent}
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
