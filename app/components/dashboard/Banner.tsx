import { useFetcher, useNavigate } from "@remix-run/react";
import { Button } from "../ui/button";
import { ConfirmModal } from "../modals/Confirm-modal";
import type { Note } from "~/lib/types";

interface BannerProps {
  note: Note;
}

export const Banner = ({
  note
}: BannerProps) => {
    const deleteFetcher = useFetcher();
    const restoreFetcher = useFetcher();
    const navigate = useNavigate();

    const onRestore = (noteId: string) => {
        restoreFetcher.submit(
          { id: noteId },
          { method: "post", action: "/dashboard/restore" }
        );
        navigate("/dashboard");
      };
    
      const onRemove = (noteId: string) => {
        deleteFetcher.submit(
          { id: noteId },
          { method: "delete", action: "/dashboard/delete" }
        );
      };

  return (
    <div className="w-full bg-rose-500 text-center text-sm p-2 text-white flex items-center gap-x-2 justify-center">
      <p>
        This page is in the Trash.
      </p>
      <Button
        size="sm"
        onClick={() => onRestore(note.id)}
        variant="outline"
        className="border-white bg-transparent hover:bg-primary/5 text-white hover:text-white p-1 px-2 h-auto font-normal"
      >
        Restore page
      </Button>
      <ConfirmModal onConfirm={() => onRemove(note.id)}>
        <Button
          size="sm"
          variant="outline"
          className="border-white bg-transparent hover:bg-primary/5 text-white hover:text-white p-1 px-2 h-auto font-normal"
        >
          Delete forever
        </Button>
      </ConfirmModal>
    </div>
  )
}