'use client';

import QuestionsStatistics from './QuestionsStatistics';
import AIReviewStatistics from './AIReviewStatistics';

export interface SmallStatisticsData {
  questions: {
    howManyQuestions: number;
    howManyReviewed: number;
    percentageAccuracy: number;
    history: Array<{
      date: string;
      count: number;
    }>;
  }
  aiReview: {
    howManyReviews: number;
    averageScore: number;
    percentageToMastery: number;
    history: Array<{
      date: string;
      score: number;
    }>;
  }
}

export default function NoteStatistics({ statisticsData }: { statisticsData: SmallStatisticsData }) {
  const { questions, aiReview } = statisticsData;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate()}.${date.getMonth() + 1}`;
  };

  const generate10DayData = (history: Array<{ date: string; [key: string]: string | number }>, dataKey: string, defaultValue: number = 0) => {
    const result = [];
    const today = new Date();
    
    // Create a map of existing data for quick lookup
    const historyMap = new Map();
    if (history && history.length > 0) {
      history.forEach(item => {
        const dateKey = new Date(item.date).toDateString();
        historyMap.set(dateKey, item[dataKey]);
      });
    }
    
    // Generate 10 days of data
    for (let i = 10; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateKey = date.toDateString();
      const formattedDate = formatDate(date.toISOString());
      
      result.push({
        date: formattedDate,
        [dataKey]: historyMap.get(dateKey) || defaultValue
      });
    }
    
    return result;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
      <QuestionsStatistics 
        data={questions} 
        generate10DayData={generate10DayData} 
      />
      <AIReviewStatistics 
        data={aiReview} 
        generate10DayData={generate10DayData} 
      />
    </div>
  );
}
