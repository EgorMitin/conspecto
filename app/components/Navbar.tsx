import { cn } from "~/lib/utils";
import Logo from "./Logo";
import { ModeToggle } from "~/components/Mode-toggle";
import { Button } from "~/components/ui/button";
import { Link, Form, useNavigation } from "@remix-run/react";
import { LogIn, LogOut } from "lucide-react";
import { useUser, useScrollTop } from "~/hooks";

export default function Navbar() {
  const isScrolled = useScrollTop();
  const user = useUser();
  const navigation = useNavigation();
  const isLoggingOut =
    navigation.state === "submitting" && navigation.formAction === "/logout";

  return (
    <div
      className={cn(
        "z-50 fixed top-0 flex items-center w-full md:p-6 p-3",
        isScrolled && "border-b shadow-sm",
      )}
    >
      <div className="hidden md:block">
        <Logo />
      </div>
      <div className="md:ml-auto md:justify-end justify-between w-full flex items-center gap-x-2">
        <ModeToggle />
        {user ? (
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
        ) : (
          <div className="flex items-center gap-x-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/login">
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Link>
            </Button>
            <Button asChild>
              <Link to="/signup">Sign up</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
