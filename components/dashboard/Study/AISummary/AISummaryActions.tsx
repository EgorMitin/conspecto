'use client';

import { Button } from "@/components/ui/button";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Download, FileText, Share2 } from "lucide-react";
import { toast } from "sonner";
import type { SummaryData } from "./actions";

interface AISummaryActionsProps {
  summaryData: SummaryData;
}

export default function AISummaryActions({ summaryData }: AISummaryActionsProps) {
  const handleExportText = () => {
    const content = `
# AI Summary: ${summaryData.sourceTitle}

## Summary
${summaryData.summary}

## Key Takeaways
${summaryData.keyTakeaways.map((takeaway, index) => `${index + 1}. ${takeaway}`).join('\n')}

---
Generated on ${new Date().toLocaleDateString()}
Word Count: ${summaryData.wordCount}
Estimated Reading Time: ${summaryData.estimatedReadTime} minutes
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${summaryData.sourceTitle}_AI_Summary.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Summary exported!", {
      description: "Your AI summary has been downloaded as a text file."
    });
  };

  const handleExportMarkdown = () => {
    const content = `
# AI Summary: ${summaryData.sourceTitle}

## 📝 Summary
${summaryData.summary}

## 💡 Key Takeaways
${summaryData.keyTakeaways.map((takeaway, index) => `${index + 1}. ${takeaway}`).join('\n')}

---
**Generated on:** ${new Date().toLocaleDateString()}  
**Word Count:** ${summaryData.wordCount}  
**Estimated Reading Time:** ${summaryData.estimatedReadTime} minutes
    `.trim();

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${summaryData.sourceTitle}_AI_Summary.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Summary exported!", {
      description: "Your AI summary has been downloaded as a Markdown file."
    });
  };

  const handleShare = async () => {
    const shareData = {
      title: `AI Summary: ${summaryData.sourceTitle}`,
      text: `${summaryData.summary}\n\nKey Takeaways:\n${summaryData.keyTakeaways.map((takeaway, index) => `${index + 1}. ${takeaway}`).join('\n')}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success("Summary shared!", {
          description: "Your AI summary has been shared successfully."
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(shareData.text);
        toast.success("Summary copied!", {
          description: "Your AI summary has been copied to the clipboard."
        });
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
        toast.error("Failed to share", {
          description: "Unable to share or copy the summary."
        });
      }
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48" align="end">
        <div className="space-y-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start"
            onClick={handleExportText}
          >
            <FileText className="mr-2 h-4 w-4" />
            Export as Text
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start"
            onClick={handleExportMarkdown}
          >
            <FileText className="mr-2 h-4 w-4" />
            Export as Markdown
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start"
            onClick={handleShare}
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share Summary
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
