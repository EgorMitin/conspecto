import { AiReviewQuestion } from "@/types/AiReviewSession";
import { CheckCircle, XCircle } from "lucide-react";

export default function EvaluationDisplay ({ question }: { question: AiReviewQuestion }) {
  console.log('EvaluationDisplay question:', question);
  if (question.status !== 'evaluated' || !question.evaluation) return null;

  const isCorrect = question.evaluation === 'correct';

  return (
    <div className={`mt-4 p-4 rounded-lg border ${isCorrect
      ? 'bg-green-50 border-green-200'
      : 'bg-red-50 border-red-200'
      }`}>
      <div className="flex items-start gap-3">
        {isCorrect ? (
          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
        ) : (
          <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`font-medium text-sm ${isCorrect ? 'text-green-800' : 'text-red-800'
              }`}>
              {isCorrect ? 'Correct!' : 'Incorrect'}
            </span>
          </div>
          {question.aiMessage && (
            <p className={`text-sm ${isCorrect ? 'text-green-700' : 'text-red-700'
              }`}>
              {question.aiMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};