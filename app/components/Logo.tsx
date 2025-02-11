import { Link } from "@remix-run/react";

export default function Logo() {
  return (
    <Link to="/">
      <div className="md:flex items-center gap-x-2">
        <img src="/icon.png" height="50" width="50" alt="Conspecto logo" />
        <p className="hidden md:block text-xl bg-gradient-to-r from-[#c97d26] to-[#e0a758] bg-clip-text text-transparent font-semibold font-poppins">
          Conspecto
        </p>
      </div>
    </Link>
  );
}
