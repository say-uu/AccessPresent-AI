import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Hand, Menu, X, Upload } from "lucide-react";

const links = [
  { to: "/", label: "Home" },
  { to: "/gesture-setup", label: "Gesture Setup" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/presentation", label: "Start Presenting" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? "text-accent-indigo bg-accent-indigo/10"
        : "text-navy-600 hover:text-navy-900 hover:bg-navy-900/5"
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-navy-900/10">
      <nav
        className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3"
        aria-label="Primary"
      >
        <NavLink
          to="/"
          className="flex items-center gap-2 font-semibold text-navy-900 text-lg shrink-0"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple text-white shadow-sm">
            <Hand size={18} strokeWidth={2.5} />
          </span>
          AccessPresent <span className="text-accent-indigo">AI</span>
        </NavLink>

        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClass} end={link.to === "/"}>
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/upload")}
            className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.03] hover:bg-navy-800 focus-visible:outline-2 focus-visible:outline-accent-indigo"
          >
            <Upload size={16} />
            Upload Presentation
          </button>
        </div>

        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-navy-700 hover:bg-navy-900/5"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden border-t border-navy-900/10 bg-white px-4 py-3 flex flex-col gap-1 animate-slide-up">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={linkClass}
              end={link.to === "/"}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              navigate("/upload");
            }}
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white"
          >
            <Upload size={16} />
            Upload Presentation
          </button>
        </div>
      )}
    </header>
  );
}
