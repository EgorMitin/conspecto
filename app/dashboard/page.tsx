"use server";

import FolderCreator from "@/components/dashboard/FolderCreator";
import Sidebar from "@/components/dashboard/Sidebar";
import { getCurrentUser } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { getFoldersAndNotesFromDBAction } from "./actions";
import Breadcrumbs from "@/components/dashboard/NotePage/Breadcrumbs";




export default async function Dashboard() {
  const user = await getCurrentUser()
  if (!user) {
    console.log("No user found, redirecting to landing page")
    redirect('/');
  }
  const { folders, notes } = await getFoldersAndNotesFromDBAction(user);

  return (
    <main className="flex h-screen w-full min-w-0">
      <Sidebar
        user={user}
        folders={folders}
        notes={notes}
      />
      <div className="dark:border-Neutrals-12/70 border-l-[1px] relative overflow-auto flex-1 h-full flex flex-col">
        <header className="z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b p-4 w-full">
          <div className="flex flex-col gap-4 w-full px-2">
            <Breadcrumbs />
          </div>
        </header>
        <FolderCreator user={user} />
      </div>
    </main>
  );
}