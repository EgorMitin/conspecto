"use client";

import { useEffect, useMemo } from "react";
import { useUser } from "@/lib/context/UserContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import FolderCreator from "@/components/dashboard/FolderCreator";
import Breadcrumbs from "@/components/dashboard/Breadcrumbs";
import DashboardStatsOverview from "@/components/dashboard/DashboardStatsOverview";
import WeeklyActivityChart from "@/components/dashboard/WeeklyActivityChart";
import RecentActivity from "@/components/dashboard/RecentActivity";
import QuickActions from "@/components/dashboard/QuickActions";
import { calculateDashboardStatistics } from "@/utils/dashboard-statistics";
import { useAppState } from "@/lib/providers/app-state-provider";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const user = useUser();
  const router = useRouter();
  const { state, isLoading } = useAppState();

  if (!user) {
    console.log("No user found, redirecting to landing page");
    router.replace("/");
    return null;
  }

  useEffect(() => {
    const currentUrl = new URL(window.location.href);
    const verified = currentUrl.searchParams.get("verified");

    if (verified) {
      toast.success("Your email has been verified successfully!");
      currentUrl.searchParams.delete("verified");

      const newPath = currentUrl.pathname + (currentUrl.searchParams.toString() ? `?${currentUrl.searchParams.toString()}` : '');
      router.replace(newPath);
    }
  }, [router]);

  // Calculate dashboard statistics from app state
  const stats = useMemo(() => {
    if (isLoading || !state.folders) {
      return null;
    }
    return calculateDashboardStatistics(state.folders);
  }, [state.folders, isLoading]);

  return (
    <div className="dark:border-Neutrals-12/70 border-l-[1px] relative overflow-auto flex-1 h-full flex flex-col">
      <header className="z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b p-4 w-full">
        <div className="flex flex-col gap-4 w-full px-2">
          <Breadcrumbs />
        </div>
      </header>
      
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
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Welcome back! 👋
              </h1>
              <p className="text-muted-foreground">
                Here's an overview of your learning progress and activity.
              </p>
            </div>

            {/* Stats Overview */}
            <div id="dashboard-stats">
              <DashboardStatsOverview stats={stats} />
            </div>

            {/* Charts and Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <WeeklyActivityChart stats={stats} />
              <RecentActivity stats={stats} />
            </div>

            {/* Quick Actions */}
            <QuickActions stats={stats} />

            {/* Folder Creator */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-4">Organize Your Content</h2>
              <FolderCreator user={user} />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-muted-foreground">Failed to load dashboard data</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-2 text-primary hover:underline"
              >
                Try again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
