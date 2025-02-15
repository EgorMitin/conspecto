import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { useEffect } from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useUser } from "~/hooks/hooks";
import { createNote } from "~/services/notes.server";
import { getUserFromSession } from "~/services/session.server";
import { toast } from "sonner";

export type ActionData = {
  success?: boolean;
  error?: string;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await getUserFromSession(request);
  if (!user) {
    throw new Error("Unauthorized");
  }
  try {
    await createNote({
      title: "Untitled Note",
      content: "",
      userId: user.uid,
      parentNote: null,
      isArchived: false,
      isPublished: false,
      icon: null,
      coverImage: null,
      questions: [],
    });
  } catch (error) {
    console.error(error);
    return json({ error: "Something went wrong" });
  }

  return json({ success: true });
};

export default function Dashboard() {
  const fetcher = useFetcher<ActionData>();
  const user = useUser();

  useEffect(() => {
    if (fetcher.state === "submitting") {
      toast.loading("Creating note...", { id: "create-note" });
    } else {
      toast.dismiss("create-note");
      if (fetcher.data?.error) {
        toast.error(fetcher.data.error);
      } else if (fetcher.data?.success) {
        toast.success("New note created!");
      }
    }
  }, [fetcher.state, fetcher.data]);

  return (
    <div className="h-full flex flex-col items-center justify-center space-y-4">
      <img
        src="/dashboard/empty-light.png"
        height="300"
        width="300"
        alt="Empty"
        className="dark:hidden"
      />
      <img
        src="/dashboard/empty-dark.svg"
        height="300"
        width="300"
        alt="Empty"
        className="hidden dark:block"
      />
      <h2 className="text-lg font-medium">
        Welcome to {user?.nickname}&apos;s Conspecto!
      </h2>
      <fetcher.Form method="post">
        <Button type="submit">
          <PlusCircle className="h-4 w-4 mr-2" />
          Create a new note
        </Button>
      </fetcher.Form>
    </div>
  );
}
