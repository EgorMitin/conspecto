'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import AISummaryContent from "@/components/dashboard/Study/AISummary/AISummaryContent";
import { useUser } from "@/lib/context/UserContext";

export default function UserSummaryPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!user && !isLoading) {
      toast.error("Authentication required");
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading user data...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="dark:border-Neutrals-12/70 border-l-[1px] relative overflow-auto flex-1 h-full flex flex-col">
      <header className="z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b p-4 w-full">
        <div className="flex flex-col gap-4 w-full px-2">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">User Summary</h1>
            <p className="text-muted-foreground">AI summary of all your notes</p>
          </div>
        </div>
      </header>

      <AISummaryContent sourceId={user.id} sourceType="user" />
    </div>
  );
}
