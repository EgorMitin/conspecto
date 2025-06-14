'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import ModeToggle from '@/components/mode-toggle';
import { LogOut } from 'lucide-react';
import LogoutButton from '@/components/logout-button';
import { User } from '@/types/User';
import { Button } from '@/components/ui/button';
import { useSubscriptionModal } from '@/lib/providers/subscription-modal-provider';

interface UserCardProps {
  user: User;
}

export default function UserCard ({ user }: UserCardProps) {
  const { setOpen } = useSubscriptionModal();

  return (
    <article className="hidden sm:flex justify-between items-center px-4 py-2 dark:bg-Neutrals/neutrals-12 rounded-3xl z-45">
      <aside className="flex justify-center items-center gap-2">
        <Avatar>
          <AvatarImage src={user.profilePhotoUrl || ""} />
          <AvatarFallback>
            <Image src='/icons/FallbackProfileIcon.jpg' alt="Profile" width={40} height={40} />
          </AvatarFallback>
        </Avatar>
        <div>
          <Button
            onClick={() => setOpen(true)}
            variant="ghost"
            className='p-2'
          >
            <span className="text-muted-foreground">
              {user.subscriptionPlan?.status === 'active' ? 'Pro Plan' : 'Free Plan'}
            </span>
          </Button>
        </div>
      </aside>
      <div className="flex items-center justify-center">
        <LogoutButton>
          <LogOut />
        </LogoutButton>
        <ModeToggle />
      </div>
    </article>
  );
};