import { logger } from '@/utils/logger';
import { 
  AIProvider, 
  QuestionGenerationParams, 
  AnswerEvaluationParams, 
  AnswerEvaluation,
  AIServiceConfig 
} from '../types';
import { AiReviewQuestion } from '@/types/AiReviewSession';
import { DIFFICULTY_DESCRIPTIONS, QUESTION_TYPE_CONFIGS, selectRandomQuestionTypes } from '../config';

export abstract class BaseAIProvider implements AIProvider {
  abstract name: string;
  protected config: AIServiceConfig;

  protected static SUMMARY_PROMPT = `You are an expert at creating concise, comprehensive summaries of educational content.
Create a clear, well-structured summary that captures the main points and key concepts.

Guidelines:
- Focus on the most important concepts and ideas
- Use clear, educational language
- Organize information logically
- Aim for 150-300 words depending on content length`;

  protected static KEY_TAKEAWAYS_PROMPT = `Extract 3-7 key takeaways from the provided content.
Each takeaway should be:
- A complete, actionable insight
- Clear and concise (1-2 sentences max)
- Focused on the most important concepts

Return the takeaways as a JSON array of strings.`;

  constructor(config: AIServiceConfig) {
    this.config = {
      temperature: 0.7,
      maxTokens: 2000,
      timeout: 30000,
      retryAttempts: 3,
      ...config,
    };
  }

  async generateQuestions(params: QuestionGenerationParams): Promise<AiReviewQuestion[]> {
    try {
      const selectedTypes = params.questionTypes || 
        selectRandomQuestionTypes(params.difficulty, params.questionCount);

      const questionTypePrompts = selectedTypes.map(type => {
        const config = QUESTION_TYPE_CONFIGS[type];
        return `- ${config.name} (${type}): ${config.description}`;
      }).join('\n');

      const systemPrompt = this.buildQuestionGenerationPrompt(params, questionTypePrompts);
      const response = await this.callAPI(systemPrompt, params.noteContent);
      return this.parseQuestionResponse(response, selectedTypes);
    } catch (error) {
      logger.error(`${this.name} question generation failed:`, error);
      throw error;
    }
  }

  async evaluateAnswer(params: AnswerEvaluationParams): Promise<AnswerEvaluation> {
    try {
      const systemPrompt = this.buildEvaluationPrompt(params);
      const userMessage = `Question: ${params.question}\nStudent's Answer: ${params.userAnswer}`;
      const response = await this.callAPI(systemPrompt, userMessage);
      return this.parseEvaluationResponse(response);
    } catch (error) {
      logger.error(`${this.name} answer evaluation failed:`, error);
      return {
        evaluation: 'incorrect',
        message: 'Unable to evaluate answer automatically. Please review your response.',
        suggestions: ['Try to provide more specific details', 'Review the source material']
      };
    }
  }

  async summarizeContent(content: string): Promise<string> {
    try {
      const response = await this.callAPI((this.constructor as typeof BaseAIProvider).SUMMARY_PROMPT, content, {
        maxTokens: 500,
        temperature: 0.3
      });
      return response.trim();
    } catch (error) {
      logger.error('Content summarization failed:', error);
      throw error;
    }
  }

  async extractKeyTakeaways(content: string): Promise<string[]> {
    try {
      const response = await this.callAPI((this.constructor as typeof BaseAIProvider).KEY_TAKEAWAYS_PROMPT, content, {
        maxTokens: 800,
        temperature: 0.3
      });
      return JSON.parse(response);
    } catch (error) {
      logger.error('Key takeaways extraction failed:', error);
      throw error;
    }
  }

  protected buildQuestionGenerationPrompt(
    params: QuestionGenerationParams, 
    questionTypePrompts: string
  ): string {
    const difficultyDescription = DIFFICULTY_DESCRIPTIONS[params.difficulty];
    return `You are an educational assessment expert. Create ${params.questionCount} high-quality review questions based on the provided content.

**Difficulty Level:** ${difficultyDescription}

**Question Types to Use:**
${questionTypePrompts}

**Mode:** ${params.mode === 'mono_test' ? 'Single comprehensive test format' : 'Separate individual questions'}

**Instructions:**
1. Create exactly ${params.questionCount} questions
2. Each question should test different aspects of the content
3. Questions must be appropriate for the ${params.difficulty} difficulty level
4. Distribute question types evenly from the provided list
5. Make questions clear, specific, and answerable from the content
6. Ensure questions test understanding, not just memorization (unless explicitly a memorization type)

**Required JSON Response Format:**
[
  {
    "id": "unique_id_here",
    "question_type": "question_type_from_list",
    "question": "The actual question text with clear instructions",
    "options": ["option1", "option2", "option3", "option4"], // Only for multiple choice types
    "status": "generated"
  }
]

**Content to base questions on:**`;
  }

  protected buildEvaluationPrompt(params: AnswerEvaluationParams): string {
    const questionConfig = QUESTION_TYPE_CONFIGS[params.questionType];
    return `You are an educational assessment expert evaluating a student's answer.

**Question Type:** ${questionConfig.name} (${params.questionType})
**Question Context:** ${questionConfig.description}

**Evaluation Criteria:**
- Accuracy: Is the core information correct?
- Completeness: Does the answer address all parts of the question?
- Understanding: Does the response demonstrate genuine comprehension?
- Clarity: Is the answer well-expressed and coherent?

**Evaluation Guidelines:**
- "correct": Answer is accurate, complete, and demonstrates understanding
- "partial": Answer has some correct elements but is incomplete or has minor errors
- "incorrect": Answer is largely wrong, missing key points, or demonstrates misunderstanding

**Feedback Guidelines:**
- Be encouraging and constructive
- If correct: Acknowledge success and optionally add interesting insights
- If partial: Point out what's correct and what needs improvement
- If incorrect: Explain the correct answer and why the student's response was off-target
- Provide specific suggestions for improvement when possible

**Required JSON Response Format:**
{
  "evaluation": "correct" | "partial" | "incorrect",
  "score": 0-100,
  "message": "Detailed, constructive feedback message",
  "suggestions": ["specific suggestion 1", "specific suggestion 2"],
  "correctAnswer": "What the correct answer should include (if incorrect/partial)"
}
  
**Content to base questions on:**
${params.context.noteContent}}`;
  }

  protected parseQuestionResponse(response: string, expectedTypes: any[]): AiReviewQuestion[] {
    try {
      let questions = JSON.parse(response);
      if (!Array.isArray(questions)) {
        throw new Error('Response is not an array');
      }
      return questions.map((q: any, index: number) => ({
        id: q.id || `ai_q_${Date.now()}_${index}`,
        question_type: q.question_type || expectedTypes[index] || 'fact_based',
        question: q.question || 'Question content missing',
        timeSpent: 0,
        status: 'generated' as const,
        evaluation: null,
        aiMessage: null,
        ...(q.options && { options: q.options }),
        ...(q.correct_answer && { correctAnswer: q.correct_answer }),
      }));
    } catch (parseError) {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          const questions = JSON.parse(jsonMatch[0]);
          return this.parseQuestionResponse(JSON.stringify(questions), expectedTypes);
        } catch (e) {
          return [];
        }
      }
      logger.error('Failed to parse question response:', parseError);
      throw new Error('Failed to parse AI response as valid JSON');
    }
  }

  protected parseEvaluationResponse(response: string): AnswerEvaluation {
    try {
      let evaluation = JSON.parse(response);
      if (!evaluation.evaluation || !evaluation.message) {
        throw new Error('Invalid evaluation format');
      }
      if (!['correct', 'partial', 'incorrect'].includes(evaluation.evaluation)) {
        evaluation.evaluation = 'incorrect';
      }
      if (typeof evaluation.score !== 'number' || evaluation.score < 0 || evaluation.score > 100) {
        evaluation.score = evaluation.evaluation === 'correct' ? 100 : 
                           evaluation.evaluation === 'partial' ? 50 : 0;
      }
      return {
        evaluation: evaluation.evaluation,
        message: evaluation.message,
        score: evaluation.score,
        suggestions: evaluation.suggestions || [],
        correctAnswer: evaluation.correctAnswer,
      };
    } catch (parseError) {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return this.parseEvaluationResponse(jsonMatch[0]);
        } catch (e) {}
      }
      logger.error('Failed to parse evaluation response:', parseError);
      return {
        evaluation: 'incorrect',
        message: 'Unable to parse evaluation result automatically.',
        score: 0,
        suggestions: ['Please review the question and try again'],
      };
    }
  }

  // Provider-specific API call must be implemented by subclasses
  protected abstract callAPI(
    systemPrompt: string, 
    userMessage: string,
    overrides?: Partial<AIServiceConfig>
  ): Promise<string>;
}
