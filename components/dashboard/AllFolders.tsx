import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Folder, Calendar, FileText, BookOpen } from "lucide-react";
import { AppFolderType } from "@/lib/providers/app-state-provider";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

interface AllFoldersProps {
  folders: AppFolderType[];
}

export default function AllFolders({ folders }: AllFoldersProps) {
  const router = useRouter();

  const handleFolderClick = (folderId: string) => {
    router.push(`/dashboard/${folderId}`);
  };

  if (folders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Folder className="h-5 w-5 text-blue-500" />
            All Folders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium text-muted-foreground mb-2">No folders yet</h3>
            <p className="text-sm text-muted-foreground">
              Create your first folder to start organizing your notes
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeFolders = folders.filter(folder => !folder.inTrash);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Folder className="h-5 w-5 text-blue-500" />
            All Folders
          </CardTitle>
          <Badge variant="secondary" className="flex items-center gap-1">
            {activeFolders.length} folders
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {activeFolders.map((folder) => (
            <div
              key={folder.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
              onClick={() => handleFolderClick(folder.id)}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="text-2xl">{folder.iconId}</div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{folder.name}</h4>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      <span>{folder.notes.length} notes</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      <span>{folder.notes.reduce((sum, note) => sum + note.questions.length, 0)} questions</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{folder.createdAt ? formatDistanceToNow(new Date(folder.createdAt)) + ' ago' : 'Unknown'}</span>
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
                  handleFolderClick(folder.id);
                }}
              >
                Open
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
