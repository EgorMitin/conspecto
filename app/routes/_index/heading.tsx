import { ArrowRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useUser } from "~/hooks/hooks";
import { Link } from "@remix-run/react";

export default function Heading() {
  const user = useUser();
  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold">
        Learn Smarter, Not Harder. Meet -{" "}
        <span className="bg-gradient-to-r from-[#c97d26] to-[#e0a758] bg-clip-text text-transparent font-semibold font-poppins relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-gradient-to-r after:from-[#c97d26] after:to-[#e0a758] hover:scale-105 hover:brightness-110 transition-all duration-300">
          Conspecto
        </span>
      </h1>
      <h3 className="text-base sm:text-xl md:text-2xl font-medium">
        Conspecto is <i>not</i> a note-taking app—it’s your next A+ diploma
        passed exam big idea dream promotion unstoppable advantage
      </h3>
      {user ? (
        <Button
          asChild
          className="group bg-gradient-to-r from-[#c97d26] to-[#e0a758] font-semibold shadow-lg hover:scale-[1.02] transition-all duration-100 backface-visibility-hidden transform-gpu"
        >
          <Link to="/dashboard">
            Go to Dashboard
            <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      ) : (
        <Button
          asChild
          className="group bg-gradient-to-r from-[#c97d26] to-[#e0a758] font-semibold shadow-lg hover:scale-[1.02] transition-all duration-100 backface-visibility-hidden transform-gpu"
        >
          <Link to="/signup">
            Try Conspecto
            <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      )}
    </div>
  );
}
