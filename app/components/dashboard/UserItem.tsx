import { ChevronsLeftRight, LogOut } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Form, useNavigation } from "@remix-run/react";
import { useUser } from "~/hooks";

export default function UserItem() {
  const navigation = useNavigation();
  const isLoggingOut =
    navigation.state === "submitting" && navigation.formAction === "/logout";
  const user = useUser();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div
          role="button"
          className="flex items-center text-sm p-3 w-full hover:bg-primary/5"
        >
          <div className="gap-x-2 flex items-center max-w-[150]">
            {/* <Avatar className="h-5 w-5">
                            <AvatarImage src={user?.imageURL} alt="User photo" />
                        </Avatar> */}
            <span className="text-start font-medium line-clamp-1">
              {user?.nickname}&apos;s Conspecto
            </span>
          </div>
          <ChevronsLeftRight className="rotate-90 ml-2 text-muted-foreground h-4 w-4" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-80"
        align="start"
        alignOffset={11}
        forceMount
      >
        <div className="flex flex-col space-y-4 p-2">
          <p className="text-xs font-medium leading-none text-muted-foreground">
            {user?.email}
          </p>
          <div className="flex items-center gap-x-2">
            <div className="rounded-md bg-secondary p-1">
              {/* <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.imageUrl} />
                    </Avatar> */}
            </div>
            <div className="space-y-1">
              <p className="text-sm line-clamp-1">
                {user?.nickname}&apos;s Conspecto
              </p>
            </div>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          asChild
          className="w-full cursor-pointer text-muted-foreground"
        >
          <Form action="/action/logout" method="post">
            <Button
              variant="ghost"
              size="sm"
              disabled={isLoggingOut}
              type="submit"
            >
              {isLoggingOut ? (
                "Logging out..."
              ) : (
                <>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </>
              )}
            </Button>
          </Form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
