import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AiReviewQuestion } from "@/types/AiReviewSession";
import { CheckCircle, SkipForward, XCircle, AlertCircle, Clock } from "lucide-react";
import { formatTime } from "../functions";

type QuestionReviewProps = {
  question: AiReviewQuestion;
  index: number
}

export default function QuestionReview({ question, index }: QuestionReviewProps) {
  const getStatusIcon = () => {
    if (question.status === 'skipped') {
      return <SkipForward className="h-5 w-5 text-orange-500" />;
    }
    if (question.evaluation === 'correct') {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    if (question.evaluation === 'partial') {
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
    if (question.evaluation === 'incorrect') {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
    return null;
  };

  const getStatusColor = () => {
    if (question.status === 'skipped') return 'border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/30';
    if (question.evaluation === 'correct') return 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/30';
    if (question.evaluation === 'partial') return 'border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-950/30';
    if (question.evaluation === 'incorrect') return 'border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/30';
    return 'border-gray-200 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-800/50';
  };

  const getStatusBadge = () => {
    if (question.status === 'skipped') {
      return <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900 dark:text-orange-300 dark:border-orange-700">Skipped</Badge>;
    }
    if (question.evaluation === 'correct') {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700">
          Correct {question.score !== undefined && `(${question.score}%)`}
        </Badge>
      );
    }
    if (question.evaluation === 'partial') {
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-700">
          Partial Credit {question.score !== undefined && `(${question.score}%)`}
        </Badge>
      );
    }
    if (question.evaluation === 'incorrect') {
      return (
        <Badge variant="secondary" className="bg-red-100 text-red-700 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-700">
          Incorrect {question.score !== undefined && `(${question.score}%)`}
        </Badge>
      );
    }
    return null;
  };

  const getQuestionTypeDisplay = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${getStatusColor()}`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              {getStatusIcon()}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">Question {index + 1}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {getQuestionTypeDisplay(question.question_type)}
                  </Badge>
                  {question.timeSpent > 0 && (
                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(question.timeSpent)}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            {getStatusBadge()}
          </div>

          {/* Question */}
          <div className="bg-white/70 rounded-lg p-4 border border-gray-100 dark:bg-gray-800/70 dark:border-gray-700">
            <p className="text-gray-800 font-medium mb-3 dark:text-gray-200">{question.question}</p>
            
            {/* User's Answer */}
            {question.answer && question.status !== 'skipped' && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Your Answer:</p>
                <p className="text-sm text-gray-700 bg-gray-50 rounded p-3 border dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600">
                  {question.answer}
                </p>
              </div>
            )}
          </div>

          {/* AI Feedback */}
          {question.aiMessage && question.status !== 'skipped' && (
            <div className="bg-white/70 rounded-lg p-4 border border-gray-100 dark:bg-gray-800/70 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-600 mb-2 dark:text-gray-400">AI Feedback:</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{question.aiMessage}</p>
              
              {/* Correct Answer */}
              {question.correctAnswer && question.evaluation !== 'correct' && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                  <p className="text-sm font-medium text-gray-600 mb-1 dark:text-gray-400">Correct Answer:</p>
                  <p className="text-sm text-green-700 bg-green-50 rounded p-2 border border-green-200 dark:text-green-300 dark:bg-green-950/50 dark:border-green-800">
                    {question.correctAnswer}
                  </p>
                </div>
              )}

              {/* Suggestions */}
              {question.suggestions && question.suggestions.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                  <p className="text-sm font-medium text-gray-600 mb-2 dark:text-gray-400">Suggestions for Improvement:</p>
                  <ul className="space-y-1">
                    {question.suggestions.map((suggestion, idx) => (
                      <li key={idx} className="text-sm text-blue-700 flex items-start gap-2 dark:text-blue-300">
                        <span className="text-blue-500 mt-0.5 dark:text-blue-400">•</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Skipped Message */}
          {question.status === 'skipped' && (
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200 dark:bg-orange-950/30 dark:border-orange-800">
              <p className="text-sm text-orange-700 dark:text-orange-300">
                This question was skipped. Consider reviewing this topic and trying similar questions in your next session.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};