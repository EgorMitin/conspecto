'use client';

import Image from 'next/image';
import Link from 'next/link';
import Logo from '/public/favicon.png';

import { Button } from '@/components/ui/button';
import { User } from '@/types/User';
import { logOut } from '@/lib/auth/logOut';

export default function Header({ user}: { user: User | null}) {

  const handleLogout = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo Section */}
          <Link
            href="/"
            className="flex items-center space-x-3 transition-all duration-200 hover:opacity-80"
          >
            <div className="relative">
              <Image
                src={Logo}
                alt="Conspecto Logo"
                width={32}
                height={32}
                className="rounded-lg"
              />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              Conspecto
            </span>
          </Link>

          {/* Navigation Section */}
          <nav className="flex items-center space-x-2 sm:space-x-4">
            {user ? (
              <div className="flex items-center space-x-2">
                {/* User Avatar/Info */}
                <div className="hidden md:flex items-center space-x-3 text-sm text-muted-foreground">
                  <span>Welcome back!</span>
                </div>
                
                {/* Action Buttons */}
                <Link href="/dashboard">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden sm:inline-flex font-medium"
                  >
                    Dashboard
                  </Button>
                </Link>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="font-medium transition-colors hover:bg-destructive hover:text-destructive-foreground"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="font-medium"
                  >
                    Login
                  </Button>
                </Link>
                
                <Link href="/signup">
                  <Button
                    size="sm"
                    className="font-medium bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};