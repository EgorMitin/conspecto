import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, Clock, FileText, Folder as FolderIcon, Target } from "lucide-react";
import { AppFolderType } from "@/lib/providers/app-state-provider";
import { AiReviewSession } from "@/types/AiReviewSession";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

interface UnfinishedAiReviewsProps {
  folders: AppFolderType[];
}

interface UnfinishedReview {
  review: AiReviewSession;
  sourceType: 'note' | 'folder';
  sourceTitle: string;
  folderId: string;
  noteId?: string;
}

export default function UnfinishedAiReviews({ folders }: UnfinishedAiReviewsProps) {
  const router = useRouter();

  const unfinishedReviews: UnfinishedReview[] = [];

  folders.forEach(folder => {
    // Get unfinished folder-level AI reviews
    if (folder.aiReviews) {
      folder.aiReviews
        .filter(review => review.status !== 'completed' && review.status !== 'failed')
        .forEach(review => {
          unfinishedReviews.push({
            review,
            sourceType: 'folder',
            sourceTitle: folder.name,
            folderId: folder.id,
          });
        });
    }

    // Get unfinished note-level AI reviews
    folder.notes.forEach(note => {
      if (note.aiReviews) {
        note.aiReviews
          .filter(review => review.status !== 'completed' && review.status !== 'failed')
          .forEach(review => {
            unfinishedReviews.push({
              review,
              sourceType: 'note',
              sourceTitle: note.title,
              folderId: folder.id,
              noteId: note.id,
            });
          });
      }
    });
  });

  unfinishedReviews.sort((a, b) => {
    const dateA = new Date(a.review.requestedAt || 0);
    const dateB = new Date(b.review.requestedAt || 0);
    return dateB.getTime() - dateA.getTime();
  });

  const handleReviewClick = (review: UnfinishedReview) => {
    const baseUrl = `/dashboard/${review.folderId}`;
    const noteSegment = review.noteId ? `/${review.noteId}` : '';
    const sessionUrl = `${baseUrl}${noteSegment}/study/ai-review/session?sessionId=${review.review.id}`;
    router.push(sessionUrl);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ready_for_review':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'evaluating_answers':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Generating Questions';
      case 'ready_for_review':
        return 'Ready to Start';
      case 'in_progress':
        return 'In Progress';
      case 'evaluating_answers':
        return 'Evaluating';
      default:
        return status;
    }
  };

  if (unfinishedReviews.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            Unfinished AI Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium text-muted-foreground mb-2">No unfinished reviews</h3>
            <p className="text-sm text-muted-foreground">
              All your AI review sessions are completed
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            Unfinished AI Reviews
          </CardTitle>
          <Badge variant="secondary" className="flex items-center gap-1">
            {unfinishedReviews.length} pending
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {unfinishedReviews.map((item) => (
            <div
              key={item.review.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors group"
              onClick={() => handleReviewClick(item)}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  {item.sourceType === 'note' ? (
                    <FileText className="h-5 w-5 text-blue-500" />
                  ) : (
                    <FolderIcon className="h-5 w-5 text-blue-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{item.sourceTitle}</h4>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getStatusColor(item.review.status)}`}
                    >
                      {getStatusLabel(item.review.status)}
                    </Badge>
                    {item.review.difficulty && (
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        <span className="capitalize">{item.review.difficulty}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        {formatDistanceToNow(new Date(item.review.requestedAt || 0))} ago
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  handleReviewClick(item);
                }}
              >
                {item.review.status === 'ready_for_review' ? 'Start' : 'Continue'}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
