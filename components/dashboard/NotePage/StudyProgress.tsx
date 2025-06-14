'use client';

import { Card } from "@/components/ui/card";
import { BookOpen, RotateCcw, Target, BookOpenCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { formatNextReviewDate } from "@/utils/global";

interface StudyProgressProps {
  questions: number;
  reviewed: number;
  nextReview: string;
}

export function StudyProgress({ questions, reviewed, nextReview }: StudyProgressProps) {
  const router = useRouter();
  
  const handleStudyClick = () => {
    router.push(`${window.location.pathname}/study`);
  };

  return (
    <Card className="p-5 bg-muted/30">
      <div className="flex flex-col sm:flex-row justify-between gap-6">
        <div className="flex flex-wrap gap-6 flex-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <RotateCcw className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="font-medium">Repetitions</p>
              <p className="text-muted-foreground">{reviewed || 0}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-full">
              <Target className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="font-medium">Questions</p>
              <p className="text-muted-foreground">{questions || 0}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-full">
              <BookOpen className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="font-medium">Next Review</p>
              <p className="text-muted-foreground">{formatNextReviewDate(nextReview)}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center">
          <Button 
            onClick={handleStudyClick} 
            className="w-full sm:w-auto flex items-center gap-2"
          >
            <BookOpenCheck className="w-4 h-4" />
            Study Now
          </Button>
        </div>
      </div>
    </Card>
  );
}