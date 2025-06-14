import { Badge } from "@/components/ui/badge";
import { AiReviewQuestionType } from "@/types/AiReviewSession";

export default function QuestionTypeInfo ({ type }: { type: AiReviewQuestionType }) {
  const typeLabels: Record<AiReviewQuestionType, string> = {
    fact_based: 'Fact-based Question',
    definition: 'Definition',
    true_false: 'True/False',
    fill_in_the_blank: 'Fill in the Blank',
    multiple_choice_basic: 'Multiple Choice',
    flashcard: 'Flashcard',
    matching: 'Matching',
    cloze_deletion: 'Cloze Deletion',
    explain_own_words: 'Explain in Your Own Words',
    scenario: 'Scenario Question',
    compare_contrast: 'Compare & Contrast',
    cause_effect: 'Cause and Effect',
    categorization: 'Categorization',
    multiple_choice_conceptual: 'Multiple Choice (Conceptual)',
    problem_solving: 'Problem Solving',
    justify_defend: 'Justify/Defend',
    critique_statement: 'Critique a Statement',
    rank_prioritize: 'Rank/Prioritize',
    summary: 'Create a Summary',
    concept_map: 'Concept Map',
    prediction_hypothesis: 'Prediction/Hypothesis'
  };

  return (
    <Badge variant="outline" className="text-xs">
      {typeLabels[type] || type}
    </Badge>
  );
};