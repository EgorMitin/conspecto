'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import Logo from '/public/favicon.png';

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { Button } from '@/components/ui/button';
import clsx from 'clsx';
import { User } from '@/types/User';
import ListItem from './ListItem';
import { components } from './consts';
import { logOut } from '@/lib/auth/logOut';

export default function Header({ user}: { user: User | null}) {
  const [path, setPath] = useState('#products');

  const handleLogout = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header
      className="p-4 flex justify-center items-center"
    >
      <Link
        href={'/'}
        className="w-full flex gap-2
        justify-left items-center"
      >
        <Image
          src={Logo}
          alt="Conspecto Logo"
          width={25}
          height={25}
        />
        <span
          className="font-semibold
          dark:text-white
        "
        >
          Conspecto
        </span>
      </Link>
      <NavigationMenu className="hidden md:block">
        <NavigationMenuList className="gap-6">
          <NavigationMenuItem>
            <NavigationMenuTrigger
              onClick={() => setPath('#resources')}
              className={clsx("font-normal text-xl", {
                'dark:text-white': path === '#resources',
                'dark:text-white/40': path !== '#resources',
              })}
            >
              Resources
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul
                className="grid gap-3 p-6 md:w-[400px] ld:w-[500px] lg:grid-cols-[.75fr_1fr]"
              >
                <ListItem
                  href="#"
                  title="Introduction"
                >
                  Re-usable components built using Radix UI and Tailwind CSS.
                </ListItem>
                <ListItem
                  href="#"
                  title="Installation"
                >
                  How to install dependencies and structure your app.
                </ListItem>
                <ListItem
                  href="#"
                  title="Typography"
                >
                  Styles for headings, paragraphs, lists...etc
                </ListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger
              onClick={() => setPath('#pricing')}
              className={clsx("font-normal text-xl", {
                'dark:text-white': path === '#pricing',
                'dark:text-white/40': path !== '#pricing',
              })}
            >
              Pricing
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4  md:grid-row-2  ">
                <ListItem
                  title="Pro Plan"
                  href={'#'}
                >
                  Unlock full power with collaboration.
                </ListItem>
                <ListItem
                  title={'free Plan'}
                  href={'#'}
                >
                  Great for teams just starting out.
                </ListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger
              onClick={() => setPath('#components')}
              className={clsx("font-normal text-xl", {
                'dark:text-white': path === '#components',
                'dark:text-white/40': path !== '#components',
              })}
            >
              Components
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul
                className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2  lg:w-[600px]"
              >
                {components.map((component) => (
                  <ListItem
                    key={component.title}
                    title={component.title}
                    href={component.href}
                  >
                    {component.description}
                  </ListItem>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              className={clsx("font-normal text-xl", navigationMenuTriggerStyle(), {
                'dark:text-white': path === '#testimonials',
                'dark:text-white/40': path !== '#testimonials',
              })}
            >
              Testimonial
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      <aside
        className="flex
        w-full
        gap-2
        justify-end
      "
      >
        {user ? (
          <>
            <Link href={'/dashboard'}>
              <Button
                variant="secondary"
                className=" p-1 hidden sm:block"
              >
                Dashboard
              </Button>
            </Link>
              <Button
                variant="secondary"
                className=" p-1 hidden sm:block"
                onClick={handleLogout}
              >
                LogOut
              </Button>
          </>
        ) : (
          <>
            <Link href="/login">
              <Button
                variant="secondary"
                className=" p-1 hidden sm:block"
              >
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                variant="default"
                className="whitespace-nowrap"
              >
                Sign Up
              </Button>
            </Link>
          </>
        )}
      </aside>
    </header>
  );
};