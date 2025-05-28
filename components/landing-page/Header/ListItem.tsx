import { NavigationMenuLink } from "@/components/ui/navigation-menu";
import clsx from "clsx";
import React from "react";

const ListItem = React.forwardRef<
  React.ElementRef<'a'>,
  React.ComponentPropsWithoutRef<'a'>
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={clsx(
            'group block select-none space-y-1 font-medium leading-none'
          )}
          {...props}
        >
          <div className="dark:text-white text-sm font-medium leading-none">
            {title}
          </div>
          <p
            className="dark:group-hover:text-white/70 line-clamp-2 text-sm leading-snug dark:text-white/40
          "
          >
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});

ListItem.displayName = 'ListItem';

export default ListItem;