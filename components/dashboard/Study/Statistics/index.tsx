'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Brain, Target, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

  const generate10DayData = (history: any[], dataKey: string, defaultValue: number = 0) => {
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

  // questions = {
  //   ...questions, history: [
  //     { date: "2025-05-28", count: 1, },
  //     { date: "2025-05-30", count: 1, },
  //     { date: "2025-06-01", count: 1, },
  //     { date: "2025-06-02", count: 1, },
  //     { date: "2025-06-03", count: 2, },
  //     { date: "2025-06-04", count: 1, },
  //     { date: "2025-06-08", count: 2 }
  //   ]
  // }

  // aiReview = {
  //   ...aiReview, history: [
  //     { date: "2025-06-02", score: 7 },
  //     { date: "2025-06-05", score: 8 },
  //     { date: "2025-06-09", score: 9 }
  //   ]
  // }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">

      {/* Questions Statistics Card */}
      <Card className="relative overflow-hidden gap-0 p-2 flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-blue-500" />
            Questions
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {questions.howManyQuestions} total
          </Badge>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Reviews</span>
              <span className="text-sm font-medium">{questions.howManyReviewed}</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Accuracy</span>
                <span className="text-sm font-medium">{Math.round(questions.percentageAccuracy)}%</span>
              </div>
              <Progress
                value={questions.percentageAccuracy}
                className="h-2"
              />
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Questions Reviewed Over Time</h4>
              <div className="h-60 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={generate10DayData(questions.history, 'count', 0)}
                    margin={{ top: 20, right: 20, left: 20, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      axisLine={{ stroke: '#e0e0e0' }}
                      tickLine={{ stroke: '#e0e0e0' }}
                      label={{ value: 'Date', position: 'insideBottom', offset: -10, style: { textAnchor: 'middle', fontSize: 12, fill: '#666' } }}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      orientation="left"
                      tick={{ fontSize: 12 }}
                      axisLine={{ stroke: '#e0e0e0' }}
                      tickLine={{ stroke: '#e0e0e0' }}
                      label={{ value: 'Questions Count', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 12, fill: '#666' } }}
                    />
                    <Tooltip 
                      formatter={(value) => [value, 'Questions']}
                      labelFormatter={(label) => `Date: ${label}`}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e0e0e0',
                        borderRadius: '6px',
                        fontSize: '12px'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      name="Questions"
                      stroke={questions.history && questions.history.length > 0 ? "#9333ea" : "#e0e0e0"}
                      strokeWidth={2}
                      dot={{ r: 2, fill: questions.history && questions.history.length > 0 ? "#9333ea" : "#e0e0e0" }}
                      activeDot={{ r: 4 }}
                      strokeDasharray={questions.history && questions.history.length > 0 ? "0" : "5,5"}
                    />
                  </LineChart>
                </ResponsiveContainer>
                {(!questions.history || questions.history.length === 0) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded">
                    <div className="text-center">
                      <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No question data yet</p>
                      <p className="text-xs text-muted-foreground/70">Start reviewing questions to see your progress</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <div className="pt-2 border-t w-full">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              {questions.percentageAccuracy >= 80 ? "Excellent performance!" :
                questions.percentageAccuracy >= 60 ? "Good progress" :
                  "Keep practicing"}
            </div>
          </div>
        </CardFooter>
      </Card>

      {/* AI Review Statistics Card */}
      <Card className="relative overflow-hidden gap-0 p-2 flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Brain className="h-4 w-4 text-purple-500" />
            AI Review
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {aiReview.howManyReviews} sessions
          </Badge>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Avg Score</span>
              <span className="text-sm font-medium">{Math.round(aiReview.averageScore * 10) / 10}/10</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Mastery Progress</span>
                <span className="text-sm font-medium">{Math.round(aiReview.percentageToMastery)}%</span>
              </div>
              <Progress
                value={aiReview.percentageToMastery}
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">AI Review Scores Over Time</h4>
              <div className="h-60 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={generate10DayData(aiReview.history, 'score', 0)}
                    margin={{ top: 20, right: 20, left: 20, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      axisLine={{ stroke: '#e0e0e0' }}
                      tickLine={{ stroke: '#e0e0e0' }}
                      label={{ value: 'Date', position: 'insideBottom', offset: -10, style: { textAnchor: 'middle', fontSize: 12, fill: '#666' } }}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      domain={[0, 10]} 
                      tick={{ fontSize: 12 }}
                      axisLine={{ stroke: '#e0e0e0' }}
                      tickLine={{ stroke: '#e0e0e0' }}
                      label={{ value: 'Score (0-10)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 12, fill: '#666' } }}
                    />
                    <Tooltip 
                      formatter={(value) => [value === 0 ? 'No review' : value, 'AI Score']}
                      labelFormatter={(label) => `Date: ${label}`}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e0e0e0',
                        borderRadius: '6px',
                        fontSize: '12px'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      name="AI Score"
                      stroke={aiReview.history && aiReview.history.length > 0 ? "#9333ea" : "#e0e0e0"}
                      strokeWidth={2}
                      dot={{ r: 2, fill: aiReview.history && aiReview.history.length > 0 ? "#9333ea" : "#e0e0e0" }}
                      activeDot={{ r: 4 }}
                      strokeDasharray={aiReview.history && aiReview.history.length > 0 ? "0" : "5,5"}
                      connectNulls={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
                {(!aiReview.history || aiReview.history.length === 0) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded">
                    <div className="text-center">
                      <Brain className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No AI review data yet</p>
                      <p className="text-xs text-muted-foreground/70">Complete AI review sessions to track your scores</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <div className="pt-2 border-t w-full">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Target className="h-3 w-3" />
              {aiReview.percentageToMastery >= 80 ? "Near mastery!" :
                aiReview.percentageToMastery >= 50 ? "Making progress" :
                  "Early stages"}
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}