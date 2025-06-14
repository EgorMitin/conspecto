import { Card, CardContent } from "@/components/ui/card";
import { AiReviewQuestion } from "@/types/AiReviewSession";
import { CheckCircle, SkipForward, XCircle } from "lucide-react";

type QuestionReviewProps = {
  question: AiReviewQuestion;
  index: number
}

export default function QuestionReview({ question, index }: QuestionReviewProps) {
  const getStatusIcon = () => {
    if (question.status === 'skipped') {
      return <SkipForward className="h-4 w-4 text-orange-500" />;
    }
    if (question.evaluation === 'correct') {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    if (question.evaluation === 'incorrect') {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  const getStatusColor = () => {
    if (question.status === 'skipped') return 'border-orange-200 bg-orange-50';
    if (question.evaluation === 'correct') return 'border-green-200 bg-green-50';
    if (question.evaluation === 'incorrect') return 'border-red-200 bg-red-50';
    return 'border-gray-200 bg-gray-50';
  };

  return (
    <Card className={`${getStatusColor()}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-medium text-muted-foreground">
              Q{index + 1}
            </span>
            {getStatusIcon()}
          </div>
          <div className="flex-1 space-y-2">
            <p className="text-sm font-medium">{question.question}</p>

            {question.answer && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Your Answer:</p>
                <p className="text-xs text-muted-foreground bg-white/50 p-2 rounded">
                  {question.answer}
                </p>
              </div>
            )}

            {question.aiMessage && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">AI Feedback:</p>
                <p className="text-xs text-muted-foreground bg-white/50 p-2 rounded">
                  {question.aiMessage}
                </p>
              </div>
            )}

            {question.status === 'skipped' && (
              <p className="text-xs text-orange-600 italic">
                Question was skipped
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};