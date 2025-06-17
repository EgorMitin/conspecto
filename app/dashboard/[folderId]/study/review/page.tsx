'use client';

import ReviewSession from "@/components/dashboard/Study/ReviewSession";
import { useAppState } from "@/lib/providers/app-state-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export default function ReviewPage() {
  const { isLoading, currentNote } = useAppState()
  const router = useRouter()

  useEffect(() => {
    if (!currentNote && !isLoading) {
      toast.error("Note not found");
      router.push('/dashboard');
    }
  }, [currentNote, router, isLoading]);

  if (!currentNote) {
    return ("LOADING...");
  }

  return (
    <main className="flex-1 flex flex-col overflow-auto">
      <ReviewSession noteContent={currentNote.content} noteTitle={currentNote.title} />
    </main>
  );
}