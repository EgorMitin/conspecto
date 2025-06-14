'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";

export default function AISummaryLoading() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">AI Summary</h1>
        </div>
      </div>

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
    </div>
  );
}
