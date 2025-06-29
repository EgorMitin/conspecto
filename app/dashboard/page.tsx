"use client";

import { useEffect, useMemo } from "react";
import { useUser } from "@/lib/context/UserContext";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import FolderCreator from "@/components/dashboard/FolderCreator";
import DashboardStatsOverview from "@/components/dashboard/DashboardStatsOverview";
import WeeklyActivityChart from "@/components/dashboard/WeeklyActivityChart";
import RecentActivity from "@/components/dashboard/RecentActivity";
import QuickActions from "@/components/dashboard/QuickActions";
import AllFolders from "@/components/dashboard/AllFolders";
import UnfinishedAiReviews from "@/components/dashboard/UnfinishedAiReviews";
import { calculateDashboardStatistics } from "@/utils/dashboard-statistics";
import { useAppState } from "@/lib/providers/app-state-provider";
import { Loader2 } from "lucide-react";


export default function Dashboard() {
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { state, isLoading } = useAppState();

  useEffect(() => {
    if (!user) {
      console.log("No user found, redirecting to landing page");
      router.push("/");
      return;
    }
  }, [user, router]);

  useEffect(() => {
    const verified = searchParams.get("verified");
    if (verified && !isLoading) {
      toast.success("Your email has been verified successfully!");
      const params = new URLSearchParams(searchParams.toString());
      params.delete("verified");
      const newPath =
        pathname + (params.toString() ? `?${params.toString()}` : "");
      router.replace(newPath);
    }
  }, [searchParams, isLoading, pathname, router]);

  const stats = useMemo(() => {
    if (isLoading || state.folders.length === 0) {
      return null;
    }
    return calculateDashboardStatistics(state.folders);
  }, [state.folders, isLoading]);

  if (!user) {
    return null;
  }

  return (
    <div className="dark:border-Neutrals-12/70 border-l-[1px] relative overflow-auto flex-1 h-full flex flex-col">
      <div className="flex-1 p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading your dashboard...</p>
            </div>
          </div>
        ) : stats ? (
          <div className="space-y-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Welcome back! 👋
              </h1>
              <p className="text-muted-foreground">
                Here's an overview of your learning progress and activity.
              </p>
            </div>

            <div className="@container">
              <div className="grid grid-cols-1 @[700px]:grid-cols-7 @[900px]:grid-cols-3 gap-6 h-fit">
                <div id="dashboard-stats" className="@[700px]:col-span-4 @[900px]:col-span-2">
                  <DashboardStatsOverview stats={stats} />
                </div>
                <div className="@[700px]:row-span-2 @[1120px]:row-span-2 @[700px]:col-span-3 @[900px]:col-span-1">
                  <RecentActivity stats={stats} />
                </div>

                <div className="@[700px]:col-span-4 @[900px]:col-span-2">
                  <WeeklyActivityChart stats={stats} />
                </div>
              </div>
            </div>
            <div className="@container">
              <div className="grid grid-cols-1 @[900px]:grid-cols-2 gap-6">
                <AllFolders folders={state.folders} />
                <UnfinishedAiReviews folders={state.folders} />
              </div>
            </div>



            <QuickActions stats={stats} />
          </div>
        ) : (
          <div className="flex items-center justify-center mt-30">
            <div>
              <h1 className="text-3xl font-semibold mb-4 text-center">To start taking notes create your first folder</h1>
              <FolderCreator user={user} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
