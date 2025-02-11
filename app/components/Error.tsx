import { Link } from "@remix-run/react";

import { Button } from "./ui/button";

export default function Error() {
  return (
    <div className="h-full flex flex-col items-center justify-center space-y-4">
      <img src="/error.png" height="300" width="900" alt="Error" />
      <h2 className="text-xl font-medium">Something went wrong!</h2>
      <Button asChild>
        <Link to="/">Go back</Link>
      </Button>
    </div>
  );
}
