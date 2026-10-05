import { Routes, Route } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout.jsx";
import Home from "./pages/Home.jsx";
import Upload from "./pages/Upload.jsx";
import GestureSetup from "./pages/GestureSetup.jsx";
import HowItWorks from "./pages/HowItWorks.jsx";
import Presentation from "./pages/Presentation.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/gesture-setup" element={<GestureSetup />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
      </Route>
      {/* Presentation mode renders full-viewport, without the marketing navbar */}
      <Route path="/presentation" element={<Presentation />} />
    </Routes>
  );
}
