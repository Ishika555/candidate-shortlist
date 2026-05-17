// ============================================================
// App.jsx — Root Component
// Manages which page is currently active and renders the
// Sidebar + page content layout.
// ============================================================

import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import CandidatesPage from "./pages/CandidatesPage";
import AddCandidatePage from "./pages/AddCandidatePage";
import MatchPage from "./pages/MatchPage";
import AIShortlistPage from "./pages/AIShortlistPage";
import ChartsPage from "./pages/ChartsPage";
import "./styles/global.css";

// Map page keys to their components
const PAGES = {
  candidates: CandidatesPage,
  add: AddCandidatePage,
  match: MatchPage,
  ai: AIShortlistPage,
  charts: ChartsPage,
};

function App() {
  // Track which page is currently active; default to candidates list
  const [activePage, setActivePage] = useState("candidates");

  // Look up the component for the current page
  const ActiveComponent = PAGES[activePage] || CandidatesPage;

  return (
    <div className="app-wrapper">
      {/* Fixed sidebar navigation */}
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      {/* Main scrollable content area */}
      <main className="main-content">
        <ActiveComponent />
      </main>
    </div>
  );
}

export default App;
