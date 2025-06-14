'use client';

import React, { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { v4 } from 'uuid';
import { z } from 'zod';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import EmojiPicker from '@/components/emoji-picker';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Loader from '@/components/Loader';
import { useRouter } from 'next/navigation';
import { useAppState } from '@/lib/providers/app-state-provider';
import { CreateFolderFormSchema } from './FormSchema';
import { User } from '@/types/User';
import { EMOJI_PICKER_DEFAULT } from '@/config/dashboard';
import { Folder } from '@/types/Folder';
import createNewFolder from './actions';
import { uploadFile } from '@/lib/firebase/storage';
import { useSubscriptionModal } from '@/lib/providers/subscription-modal-provider';


export default function FolderCreator({ user }: { user: User }) {
  const router = useRouter();
  const { dispatch } = useAppState();
  const { setOpen } = useSubscriptionModal();
  const [selectedEmoji, setSelectedEmoji] = useState(EMOJI_PICKER_DEFAULT);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting: isLoading, errors },
  } = useForm<z.infer<typeof CreateFolderFormSchema>>({
    mode: 'onChange',
    defaultValues: {
      logo: '',
      folderName: '',
    },
  });

  const onSubmit: SubmitHandler<
    z.infer<typeof CreateFolderFormSchema>
  > = async (value) => {
    const file = value.logo?.[0];
    let filePath = null;
    const folderUUID = v4();
    console.log(file);

    if (file) {
      try {
        const result = await uploadFile(file, `folder-logos/folderLogo.${folderUUID}`);

        if (!result.success) throw new Error('Upload failed');
        filePath = result.url;
      } catch (error) {
        console.log('Error', error);
        toast.error('Error! Could not upload your folder logo');
      }
    }
    try {
      const newFolder: Folder = {
        userId: user.id,
        id: folderUUID,
        name: value.folderName,
        iconId: selectedEmoji,
        inTrash: false,
        logo: filePath || null,
        bannerUrl: '',
        notes: [],
        createdAt: new Date(),
      };

      const error = await createNewFolder(newFolder);
      if (error) {
        console.error('Error creating a folder:', error);
        throw new Error();
      }
      dispatch({
        type: 'ADD_FOLDER',
        payload: { folder: { ...newFolder, notes: [] } },
      });

      toast.success('Folder Created', {
        description: `${newFolder.name} has been created successfully.`,
      });

      router.replace(`/dashboard/${newFolder.id}`);
    } catch (error) {
      console.log(error, 'Error');
      toast.error('Could not create your folder', {
        description:
          "Oops! Something went wrong, and we couldn't create your folder. Try again or come back later.",
      });
    } finally {
      reset();
    }
  };

  return (
      <Card className="w-full max-w-2xl mx-auto my-8 sm:h-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Create a New Folder</CardTitle>
          <CardDescription>
            Organize your notes by creating a new folder.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <div className="text-5xl">
                  <EmojiPicker getValue={(emoji) => setSelectedEmoji(emoji)}>
                    {selectedEmoji}
                  </EmojiPicker>
                </div>
                <div className="w-full">
                  <Label
                    htmlFor="folderName"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Folder Name
                  </Label>
                  <Input
                    id="folderName"
                    type="text"
                    placeholder="e.g., Project Alpha, Meeting Notes"
                    disabled={isLoading}
                    className="mt-1"
                    {...register('folderName', {
                      required: 'Folder name is required.',
                    })}
                  />
                  {errors.folderName && (
                    <small className="mt-1 text-sm text-red-600">
                      {errors.folderName.message?.toString()}
                    </small>
                  )}
                </div>
              </div>
  
              <div>
                <Label
                  htmlFor={user.subscriptionPlan ? "logo" : undefined}
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Folder Logo (Optional)
                </Label>
                {user.subscriptionPlan ? (
                  <div className="mt-1">
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      disabled={isLoading}
                      {...register('logo')}
                    />
                    {errors.logo && (
                      <small className="mt-1 text-sm text-red-600">
                        {errors.logo.message?.toString()}
                      </small>
                    )}
                  </div>
                ) : (
                  <div className="mt-2 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">
                          Customize with a Folder Logo
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Add a personal touch to your folders. Upgrade to Pro to upload custom logos.
                        </p>
                      </div>
                      <Button
                        type="button"
                        onClick={() => setOpen(true)}
                        variant="default"
                        className="mt-2 sm:mt-0 sm:ml-auto whitespace-nowrap group flex items-center transition-transform duration-200 ease-in-out hover:scale-105 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="mr-2 h-4 w-4 transition-transform duration-200 ease-in-out group-hover:scale-125 group-hover:rotate-[10deg]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13 10V3L4 14h7v7l9-11h-7z" 
                          />
                        </svg>
                        Upgrade to Pro
                      </Button>
                    </div>
                  </div>
                )}
              </div>
  
              <div className="flex justify-end pt-2">
              </div>
  
              <div className="flex justify-end pt-2">
                <Button
                  disabled={isLoading}
                  type="submit"
                  size="lg" // Slightly larger submit button
                >
                  {!isLoading ? 'Create Folder' : <Loader />}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }