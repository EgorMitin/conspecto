import { AiReviewQuestion } from "@/types/AiReviewSession";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

export default function EvaluationDisplay ({ question }: { question: AiReviewQuestion }) {
  if (question.status !== 'evaluated' || !question.evaluation) return null;

  const getEvaluationConfig = (evaluation: string) => {
    switch (evaluation) {
      case 'correct':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-50 dark:bg-green-950/30',
          borderColor: 'border-green-200 dark:border-green-800',
          iconColor: 'text-green-600 dark:text-green-400',
          textColor: 'text-green-800 dark:text-green-300',
          messageColor: 'text-green-700 dark:text-green-300',
          label: 'Correct!'
        };
      case 'incorrect':
        return {
          icon: XCircle,
          bgColor: 'bg-red-50 dark:bg-red-950/30',
          borderColor: 'border-red-200 dark:border-red-800',
          iconColor: 'text-red-600 dark:text-red-400',
          textColor: 'text-red-800 dark:text-red-300',
          messageColor: 'text-red-700 dark:text-red-300',
          label: 'Incorrect'
        };
      case 'partial':
        return {
          icon: AlertCircle,
          bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          iconColor: 'text-yellow-600 dark:text-yellow-400',
          textColor: 'text-yellow-800 dark:text-yellow-300',
          messageColor: 'text-yellow-700 dark:text-yellow-300',
          label: 'Partially Correct'
        };
      default:
        return {
          icon: XCircle,
          bgColor: 'bg-gray-50 dark:bg-gray-950/30',
          borderColor: 'border-gray-200 dark:border-gray-800',
          iconColor: 'text-gray-600 dark:text-gray-400',
          textColor: 'text-gray-800 dark:text-gray-300',
          messageColor: 'text-gray-700 dark:text-gray-300',
          label: 'Unknown'
        };
    }
  };

  const config = getEvaluationConfig(question.evaluation);

  return (
    <div className={`mt-4 p-4 rounded-lg border ${config.bgColor} ${config.borderColor}`}>
      <div className="flex items-start gap-3">
        <config.icon className={`h-5 w-5 ${config.iconColor} mt-0.5`} />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`font-medium text-sm ${config.textColor}`}>
              {config.label}
            </span>
            {question.score !== undefined && (
              <span className={`text-xs px-2 py-1 rounded-full ${config.bgColor} ${config.borderColor} border font-medium`}>
                {question.score}/100
              </span>
            )}
          </div>
          
          {question.aiMessage && (
            <p className={`text-sm mb-3 ${config.messageColor}`}>
              {question.aiMessage}
            </p>
          )}
          
          {question.correctAnswer && (
            <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md">
              <p className="text-xs font-medium text-blue-800 dark:text-blue-300 mb-1">Correct Answer:</p>
              <p className="text-sm text-blue-700 dark:text-blue-300">{question.correctAnswer}</p>
            </div>
          )}
          
          {question.suggestions && question.suggestions.length > 0 && (
            <div className="p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-md">
              <p className="text-xs font-medium text-gray-800 dark:text-gray-200 mb-2">Suggestions for improvement:</p>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                {question.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-gray-400 dark:text-gray-500 mt-1">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};