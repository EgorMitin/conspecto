import { ImageIcon, X } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { cn } from "~/lib/utils";
import { Button } from "../ui/button";
import { useCoverImage } from "~/hooks";
import { useFetcher } from "@remix-run/react";

interface CoverImageProps {
  url?: string | null;
  preview?: boolean;
  noteId?: string;
}

export const Cover = ({ url, preview, noteId }: CoverImageProps) => {
  const imgFetcher = useFetcher();
  const urlFetcher = useFetcher();
  const coverImage = useCoverImage();

  if (!noteId && !preview) {
    return null;
  }

  const removeCoverImage = () => {
    urlFetcher.submit(
      { id: noteId!, coverImage: null },
      { method: "post", action: "/dashboard/update" },
    );
  };

  const onRemove = async () => {
    if (url) {
      try {
        imgFetcher.submit(
          { url },
          { method: "post", action: "/dashboard/deleteImage" },
        );
        removeCoverImage();
      } catch (error) {
        console.error("Error removing image:", error);
      }
    }
  };

  return (
    <div
      className={cn(
        "relative w-full h-[35vh] group",
        !url && "h-[12vh]",
        url && "bg-muted",
      )}
    >
      {url && (
        <img
          src={url}
          alt="Cover"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      {!!url && !preview && (
        <div className="opacity-0 group-hover:opacity-100 absolute bottom-5 right-5 flex items-center gap-x-2">
          <Button
            onClick={() => coverImage.onReplace(url)}
            className="text-muted-foreground text-xs"
            variant="outline"
            size="sm"
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Change cover
          </Button>
          <Button
            onClick={onRemove}
            className="text-muted-foreground text-xs"
            variant="outline"
            size="sm"
          >
            <X className="h-4 w-4 mr-2" />
            Remove
          </Button>
        </div>
      )}
    </div>
  );
};

Cover.Skeleton = function CoverSkeleton() {
  return <Skeleton className="w-full h-[12vh]" />;
};
