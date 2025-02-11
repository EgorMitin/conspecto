import {
  Outlet,
  useNavigation,
  useLoaderData,
  useNavigate,
  useParams,
} from "@remix-run/react";
import { useEffect } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { getUserFromSession } from "~/services/session.server";
import { redirect, json } from "@remix-run/node";
import { getNotesByUser } from "~/services/notes.server";
import Navigation from "~/components/dashboard/Navigation";
import { UserSession, Note } from "~/lib/types";
import Search from "~/components/Search";
import { Loader2 } from "lucide-react";

type DashboardLayouLoader = {
  user: UserSession;
  notes: Note[];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUserFromSession(request);
  if (!user) {
    return redirect("/");
  }
  const notes = await getNotesByUser(user.uid);
  return json({ user, notes });
};

export default function DashboardLayout() {
  const { notes: rawNotes } = useLoaderData<DashboardLayouLoader>();
  const notes = rawNotes.map((note) => ({
    ...note,
    createdAt: new Date(note.createdAt),
    updatedAt: new Date(note.updatedAt),
  }));
  const params = useParams();
  const navigation = useNavigation();
  const navigate = useNavigate();
  useEffect(() => {
    if (notes.length && !params.noteId) {
      navigate("/dashboard/notes/" + notes[0].id);
    }
  }, []);

  if (navigation.state === "loading") {
    return (
      <div className="h-full flex">
        <Navigation notes={notes} />
        <main className="flex-1 h-full overflow-y-auto dark:bg-[#1F1F1F]">
          <Loader2 className="animate-spin" />
        </main>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      <Navigation notes={notes} />
      <main className="flex-1 h-full overflow-y-auto dark:bg-[#1F1F1F]">
        <Search notes={notes} />
        <Outlet />
      </main>
    </div>
  );
}
