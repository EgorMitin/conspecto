'use client';

import { useState, useRef } from 'react';
import { ImageIcon, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { updateNote } from '@/lib/server_actions/notes';
import { useAppState } from '@/lib/providers/app-state-provider';
import { toast } from 'sonner';
import { uploadFile } from '@/lib/firebase/storage';
import { v4 } from 'uuid';
import Image from 'next/image';

export default function BannerUpload() {
  const { dispatch, folderId, currentNote: note } = useAppState();
  const [isUploading, setIsUploading] = useState(false);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!note) return null;

  const handleMouseEnter = () => {
    if (typeof window !== 'undefined' && 'ontouchstart' in window) return;
    setOptionsVisible(true);
  };

  const handleMouseLeave = () => {
    if (typeof window !== 'undefined' && 'ontouchstart' in window) return;
    setOptionsVisible(false);
  };

  const handleClick = () => {
    if (typeof window !== 'undefined' && 'ontouchstart' in window) {
      setOptionsVisible((prev) => !prev);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!folderId || !note) return;
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    const uuid = v4();
    setIsUploading(true);

    try {
      const uploadPromise = uploadFile(file, `note-banners/banner.${uuid}`);

      toast.promise(uploadPromise, {
        loading: 'Uploading banner image...',
        success: 'Banner uploaded successfully',
        error: 'Failed to upload banner image',
      });

      const result = await uploadPromise;

      if (result.success) {
        dispatch({
          type: 'UPDATE_NOTE',
          payload: {
            folderId,
            noteId: note.id,
            note: { bannerUrl: result.url },
          },
        });

        const { error } = await updateNote(note.id, { bannerUrl: result.url });
        if (error) {
          toast.error('Error! Could not save banner to note');
          dispatch({
            type: 'UPDATE_NOTE',
            payload: {
              folderId,
              noteId: note.id,
              note: { bannerUrl: note.bannerUrl },
            },
          });
        }
      }
    } catch (error) {
      console.error('Banner upload error:', error);
      toast.error('Failed to upload banner image');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveBanner = async () => {
    if (!folderId || !note) return;

    dispatch({
      type: 'UPDATE_NOTE',
      payload: {
        folderId,
        noteId: note.id,
        note: { bannerUrl: '' },
      },
    });

    const { error } = await updateNote(note.id, { bannerUrl: '' });
    if (error) {
      toast.error('Error! Could not remove banner');
      dispatch({
        type: 'UPDATE_NOTE',
        payload: {
          folderId,
          noteId: note.id,
          note: { bannerUrl: note.bannerUrl },
        },
      });
    } else {
      toast.success('Banner removed successfully');
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleBannerUpload}
        className="hidden"
      />

      {note.bannerUrl ? (
        <div
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
        >
          <div className="relative w-full h-48 md:h-64 overflow-hidden rounded-lg">
            <Image
              src={note.bannerUrl}
              alt="Note banner"
              fill
              className="object-cover"
              priority
            />
          </div>

          <div
            className={`absolute inset-0 bg-gradient-to-t p-4 from-black/10 via-black/10 to-transparent rounded-lg flex items-end justify-end gap-2 transition-opacity duration-200 ${optionsVisible ? 'opacity-100' : 'opacity-0'}`}>
            <Button
              variant="secondary"
              size="sm"
              onClick={triggerFileInput}
              disabled={isUploading}
              className="bg-white/90 hover:bg-white text-black"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? 'Uploading...' : 'Change'}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                handleRemoveBanner();
                setOptionsVisible(false);
              }}
              disabled={isUploading}
              className="bg-red-600/90 hover:bg-red-700 text-white"
            >
              <X className="w-4 h-4 mr-2" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <div
          className="w-full h-32 md:h-40 border-2 border-dashed border-muted-foreground/30 rounded-lg flex flex-col items-center justify-center gap-3 hover:border-muted-foreground/50 hover:bg-muted/30 transition-colors cursor-pointer group"
          onClick={triggerFileInput}
        >
          <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors">
            <ImageIcon className="w-8 h-8" />
            <div className="text-center">
              <p className="text-sm font-medium">
                {isUploading ? 'Uploading banner...' : 'Add a banner image'}
              </p>
              <p className="text-xs text-muted-foreground">
                Click to upload • Max 5MB • JPG, PNG, GIF
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
