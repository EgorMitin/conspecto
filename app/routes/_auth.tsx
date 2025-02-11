import { Outlet } from "@remix-run/react";
import Navbar from "~/components/Navbar";
import Footer from "~/components/Footer";

export default function Layout() {
  return (
    <div className="h-full">
      <Navbar />
      <main className="h-full pt-40">
        <div className="min-h-full flex flex-col">
          <div
            className="flex flex-col items-center justify-center
                    text-center gap-y-8 flex-1 px-6 pb-10 text-secondary-foreground"
          >
            <Outlet />
          </div>
          <Footer />
        </div>
      </main>
    </div>
  );
}
