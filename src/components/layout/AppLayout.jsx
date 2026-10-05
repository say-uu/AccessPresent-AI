import { Outlet } from "react-router-dom";
import Navbar from "./Navbar.jsx";

export default function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-mist-50">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-navy-900/10 py-8 px-6 text-center text-sm text-navy-500">
        <p>
          Your webcam is processed locally in your browser. AccessPresent AI does
          not record or upload your camera video.
        </p>
        <p className="mt-2">&copy; {new Date().getFullYear()} AccessPresent AI</p>
      </footer>
    </div>
  );
}
