import { useState } from "react";
import { useFetcher } from "@remix-run/react";
import { Check, Copy, Globe } from "lucide-react";

import { PopoverTrigger, Popover, PopoverContent } from "../ui/popover";
import { Button } from "../ui/button";
import { useOrigin } from "~/hooks/hooks";
import type { Note } from "~/lib/types";

interface PublishProps {
  note: Note;
}

export const Publish = ({ note }: PublishProps) => {
  const origin = useOrigin();
  const updateFetcher = useFetcher();

  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const url = `${origin}/preview/${note.id}`;

  const onPublish = () => {
    setIsSubmitting(true);

    updateFetcher.submit(
      { id: note.id, isPublished: true },
      { method: "patch", action: "/dashboard/update" },
    );
    setIsSubmitting(false);
  };

  const onUnpublish = () => {
    setIsSubmitting(true);

    updateFetcher.submit(
      { id: note.id, isPublished: false },
      { method: "patch", action: "/dashboard/update" },
    );
    setIsSubmitting(false);
  };

  const onCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="sm" variant="ghost">
          Publish
          {note.isPublished && <Globe className="text-sky-500 w-4 h-4 ml-2" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end" alignOffset={8} forceMount>
        {note.isPublished ? (
          <div className="space-y-4">
            <div className="flex items-center gap-x-2">
              <Globe className="text-sky-500 animate-pulse h-4 w-4" />
              <p className="text-xs font-medium text-sky-500">
                This note is live on web.
              </p>
            </div>
            <div className="flex items-center">
              <input
                className="flex-1 px-2 text-xs border rounded-l-md h-8 bg-muted truncate"
                value={url}
                disabled
              />
              <Button
                onClick={onCopy}
                disabled={copied}
                className="h-8 rounded-l-none"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <Button
              size="sm"
              className="w-full text-xs"
              disabled={isSubmitting}
              onClick={onUnpublish}
            >
              Unpublish
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <Globe className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm font-medium mb-2">Publish this note</p>
            <span className="text-xs text-muted-foreground mb-4">
              Share your work with others.
            </span>
            <Button
              disabled={isSubmitting}
              onClick={onPublish}
              className="w-full text-xs"
              size="sm"
            >
              Publish
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
