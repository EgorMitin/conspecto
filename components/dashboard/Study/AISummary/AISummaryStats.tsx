'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, FileText, Hash, BookOpen } from "lucide-react";
import type { SummaryData } from "./actions";

interface AISummaryStatsProps {
  summaryData: SummaryData;
}

export default function AISummaryStats({ summaryData }: AISummaryStatsProps) {
  const { wordCount, estimatedReadTime, keyTakeaways, noteTitle } = summaryData;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

      <Card>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Hash className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Word Count</p>
              <p className="text-2xl font-bold">{wordCount.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Read Time</p>
              <p className="text-2xl font-bold">{estimatedReadTime} min</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4 text-purple-500" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Key Points</p>
              <p className="text-2xl font-bold">{keyTakeaways.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-orange-500" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Source</p>
              <p className="text-sm font-semibold truncate" title={noteTitle}>
                {noteTitle}
              </p>
              <Badge variant="secondary" className="mt-1">
                Original Note
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
