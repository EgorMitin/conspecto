'use server';

import Sidebar from "@/components/dashboard/Sidebar";
import { getCurrentUser } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { getFoldersAndNotesFromDBAction } from "../actions";
import FolderPageContent from "@/components/dashboard/FolderPageContent";
import Breadcrumbs from "@/components/dashboard/NotePage/Breadcrumbs";

interface FolderPageParams {
  params: Promise<{ folderId: string }>
}

export default async function FolderPage({ params }: FolderPageParams) {
  const user = await getCurrentUser();
  if (!user) {
    console.log("No user found, redirecting to landing page")
    redirect('/');
  }

  const { folderId } = await params;
  const { folders, notes } = await getFoldersAndNotesFromDBAction(user, folderId);
  const folderName = folders.find(folder => folder.id === folderId)!.name;

  return (
    <main className="flex h-screen w-full min-w-0">
      <Sidebar
        user={user}
        folders={folders}
        folderId={folderId}
        notes={notes}
      />
      <div className="dark:border-Neutrals-12/70 border-l-[1px] relative overflow-auto flex-1 h-full flex flex-col">
        <header className="z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b p-4 w-full">
          <div className="flex flex-col gap-4 w-full px-2">
            <Breadcrumbs folderName={folderName} folderId={folderId} page="folder" />
          </div>
        </header>

        <FolderPageContent
          notes={notes}
          user={user}
        />
      </div>
    </main>
  );
}