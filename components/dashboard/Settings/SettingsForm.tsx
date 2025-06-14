'use client';

import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useAppState } from '@/lib/providers/app-state-provider';
import { useRouter } from 'next/navigation';
import {
  Briefcase,
  CreditCard,
  ExternalLink,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LogoutButton from '@/components/logout-button';
import Link from 'next/link';
import { useSubscriptionModal } from '@/lib/providers/subscription-modal-provider';
import { postData } from '@/utils/global';
import { useUser } from '@/lib/context/UserContext';
import { Folder } from '@/types/Folder';
import { deleteFolder, updateFolder } from '@/lib/server_actions/folders';
import { updateUser } from '@/lib/server_actions/users';
import { v4 } from 'uuid';
import Image from 'next/image';
import { uploadFile } from '@/lib/firebase/storage';


export default function SettingsForm () {
  const user = useUser();
  const { open, setOpen } = useSubscriptionModal();
  const router = useRouter();
  const { state, folderId, dispatch } = useAppState();
  const titleTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const [uploadingProfilePic, setUploadingProfilePic] = useState(false);
  const [folderDetails, setFolderDetails] = useState<Folder>();
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [loadingPortal, setLoadingPortal] = useState(false);

  //WIP PAYMENT PORTAL
  const redirectToCustomerPortal = async () => {
    setLoadingPortal(true);
    try {
      const { url, error } = await postData({
        url: '/api/create-portal-link',
      });
      window.location.assign(url);
    } catch (error) {
      console.log(error);
    }
    setLoadingPortal(false);
  };

  const folderNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!folderId || !e.target.value) return;
    dispatch({
      type: 'UPDATE_FOLDER',
      payload: { folder: { name: e.target.value }, id: folderId },
    });
    if (titleTimerRef.current) clearTimeout(titleTimerRef.current);
    titleTimerRef.current = setTimeout(async () => {
      await updateFolder(folderId, { name: e.target.value });
    }, 500);
  };

  const onChangeProfilePicture = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!user?.id) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const uuid = v4();
    setUploadingProfilePic(true);
    const resultPromise = uploadFile(file, `profile-photos/profilePhoto.${uuid}`)
    toast.promise(resultPromise, {
      loading: 'Uploading profile picture...',
      success: 'Profile picture uploaded successfully',
      error: 'Failed to upload profile picture',
    })
    const result = await resultPromise;
    if (result.success) {
      await updateUser(user.id, { profilePhotoUrl: result.url });
    }
    setUploadingProfilePic(false);
  }

  const onChangeFolderLogo = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!folderId) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const uuid = v4();
    setUploadingLogo(true);
    const result = await uploadFile(file, `folder-logos/folderLogo.${uuid}`);

    if (result.success) {
      dispatch({
        type: 'UPDATE_FOLDER',
        payload: { id: folderId, folder: { logo: result.url } },
      });
      await updateFolder(folderId, { logo: result.url });
      setUploadingLogo(false);
    }
  };

  //WIP Payment Portal redirect

  useEffect(() => {
    const showingFolder = state.folders.find(
      (folder) => folder.id === folderId
    );
    if (showingFolder) setFolderDetails(showingFolder);
  }, [folderId, state]);

  return (
    <div className="flex gap-4 flex-col">
      <p className="flex items-center gap-2 mt-6">
        <Briefcase size={20} />
        This Folder
      </p>
      <Separator />
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="folderName"
          className="text-sm text-muted-foreground"
        >
          Name
        </Label>
        <Input
          name="folderName"
          value={folderDetails ? folderDetails.name : ''}
          placeholder="Folder Name"
          onChange={folderNameChange}
        />
        <Label
          htmlFor="folderLogo"
          className="text-sm text-muted-foreground"
        >
          Folder Logo
        </Label>
        <Input
          name="folderLogo"
          type="file"
          accept="image/*"
          placeholder="folder Logo"
          onChange={onChangeFolderLogo}
          disabled={uploadingLogo || user?.subscriptionPlan?.status !== 'active'}
        />
        {user?.subscriptionPlan?.status !== 'active' && (
          <small className="text-muted-foreground">
            To customize your folder, you need to be on a Pro Plan
          </small>
        )}
      </div>
      <>
        <Label htmlFor="permissions">Permissions</Label>
        <Alert variant={'destructive'}>
          <AlertDescription>
            Warning! deleting your folder will permanantly delete all data
            related to this folder.
          </AlertDescription>
        </Alert>
        <Button
          className="mt-4 border-2 bg-destructive/85 hover:bg-destructive/70 border-destructive"
          type="submit"
          onClick={async () => {
            if (!folderId) return toast.info('No folder selected')
            await deleteFolder(folderId);
            toast.success('Successfully deleted your workspae');
            dispatch({ type: 'DELETE_FOLDER', payload: { id: folderId } });
            router.replace('/dashboard');
          }}
        >
          Delete Folder
        </Button>
        <p className="flex items-center gap-2 mt-6">
          <UserIcon size={20} /> Profile
        </p>
        <Separator />
        <div className="flex items-center">
          <Avatar>
            <AvatarImage src={user?.profilePhotoUrl || ""} />
            <AvatarFallback>
              <Image src='/icons/FallbackProfileIcon.jpg' alt="Profile" width={40} height={40} />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col ml-6">
            <small className="text-muted-foreground cursor-not-allowed">
              {user ? user.email : ''}
            </small>
            <Label
              htmlFor="profilePicture"
              className="text-sm text-muted-foreground"
            >
              Profile Picture
            </Label>
            <Input
              name="profilePicture"
              type="file"
              accept="image/*"
              placeholder="Profile Picture"
              onChange={onChangeProfilePicture}
              disabled={uploadingProfilePic}
            />
          </div>  
        </div>
          <div className="flex items-center">
            <LogoutButton>
              <LogOut /> Logout
            </LogoutButton>
          </div>
        <p className="flex items-center gap-2 mt-6">
          <CreditCard size={20} /> Billing & Plan
        </p>
        <Separator />
        <p className="text-muted-foreground">
          You are currently on a{' '}
          {user?.subscriptionPlan?.status === 'active' ? 'Pro' : 'Free'} Plan
        </p>
        <Link
          href="/"
          target="_blank"
          className="text-muted-foreground flex flex-row items-center gap-2"
        >
          View Plans <ExternalLink size={16} />
        </Link>
        {user?.subscriptionPlan?.status === 'active' ? (
          <div>
            <Button
              type="button"
              size="sm"
              variant={'secondary'}
              disabled={loadingPortal}
              className="text-sm"
              onClick={redirectToCustomerPortal}
            >
              Manage Subscription
            </Button>
          </div>
        ) : (
          <div>
            <Button
              type="button"
              size="sm"
              variant={'secondary'}
              className="text-sm"
              onClick={() => setOpen(true)}
            >
              Start Plan
            </Button>
          </div>
        )}
      </>
    </div>
  );
};