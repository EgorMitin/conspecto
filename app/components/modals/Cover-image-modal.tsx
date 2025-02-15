import { Dialog, DialogContent, DialogHeader } from "../ui/dialog";
import { useCoverImage } from "~/hooks/hooks";
import { useState } from "react";
import { useParams, useFetcher } from "@remix-run/react";
import SingleImageDropzone from "../Img-dropzone";
import { storage } from "~/lib/firebase/client";

export default function CoverImageModal() {
  const coverImage = useCoverImage();
  const params = useParams();
  const fetcher = useFetcher();
  const [file, setFile] = useState<File>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    setFile(undefined);
    setIsSubmitting(false);
    coverImage.onClose();
  };

  const onUpload = async (file?: File) => {
    if (!file || !storage) return;
    setIsSubmitting(true);
    setFile(file);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (coverImage.url) {
        formData.append("previousUrl", coverImage.url);
      }

      const response = await fetch("/dashboard/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.url && params.noteId) {
        fetcher.submit(
          { id: params.noteId, coverImage: data.url },
          { method: "POST", action: "/dashboard/update" },
        );
      }
    } catch (error) {
      console.error("Error handling image:", error);
    } finally {
      handleClose();
    }
  };

  return (
    <Dialog open={coverImage.isOpen} onOpenChange={coverImage.onClose}>
      <DialogContent>
        <DialogHeader>
          <h2 className="text-center text-lg font-semibold">Cover Image</h2>
        </DialogHeader>
        <SingleImageDropzone
          className="w-full outline-none z-[99]"
          disabled={isSubmitting}
          value={file}
          onChange={onUpload}
        />
      </DialogContent>
    </Dialog>
  );
}
