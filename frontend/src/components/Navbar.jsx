import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FaDumbbell, FaBars, FaTimes } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const linkClass = ({ isActive }) =>
  `rounded-xl px-3 py-2 text-sm font-medium transition ${
    isActive
      ? "bg-orange-400/20 text-orange-100 ring-1 ring-orange-300/30"
      : "text-slate-200 hover:bg-white/10 hover:text-white"
  }`;

const navItems = ["dashboard", "workout", "library", "analytics", "leaderboard", "profile", "settings"];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/15 bg-slate-950/65 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-3 sm:px-4 md:px-8">
        <Link to="/dashboard" className="group flex items-center gap-2 text-white">
          <span className="rounded-lg bg-gradient-to-br from-orange-400 to-teal-400 p-2 shadow-glow transition group-hover:scale-105">
            <FaDumbbell className="text-sm text-white sm:text-base" />
          </span>
          <span className="hidden font-semibold tracking-wide sm:inline">AI Fitness Trainer</span>
          <span className="font-semibold tracking-wide sm:hidden">AIFit</span>
        </Link>

        <button
          type="button"
          className="rounded-xl border border-white/20 bg-slate-900/50 p-2 text-slate-100 md:hidden"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-label="Toggle menu"
        >
          {open ? <FaTimes /> : <FaBars />}
        </button>

        <nav className="hidden items-center gap-1 rounded-2xl border border-white/15 bg-slate-900/45 p-1.5 md:flex">
          {navItems.map((item) => (
            <NavLink key={item} to={`/${item}`} className={linkClass}>
              {item[0].toUpperCase() + item.slice(1)}
            </NavLink>
          ))}
          <button
            type="button"
            onClick={handleLogout}
            className="ml-1 rounded-xl bg-rose-500/85 px-3 py-2 text-sm font-medium text-white transition hover:bg-rose-500"
          >
            Logout
          </button>
        </nav>
      </div>

      {open && (
        <nav className="reveal-up max-h-[72vh] space-y-2 overflow-y-auto border-t border-white/15 bg-slate-950/92 px-3 py-3 md:hidden">
          {navItems.map((item) => (
            <NavLink key={item} to={`/${item}`} className={({ isActive }) => `${linkClass({ isActive })} block w-full px-4 py-3`} onClick={() => setOpen(false)}>
              {item[0].toUpperCase() + item.slice(1)}
            </NavLink>
          ))}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-xl bg-rose-500/90 px-4 py-3 text-sm font-medium text-white"
          >
            Logout
          </button>
        </nav>
      )}
    </header>
  );
};

export default Navbar;
