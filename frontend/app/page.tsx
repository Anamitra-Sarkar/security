/**
 * Root page: shows Landing on first visit, transitions to Analyzer on "Try Now".
 */
"use client";
import { useState } from "react";
import Landing from "./components/Landing";
import Analyzer from "./components/Analyzer";
import ThemeToggle from "./components/ThemeToggle";

export default function Home() {
  const [showApp, setShowApp] = useState(false);

  return (
    <main>
      <ThemeToggle />
      {showApp ? (
        <Analyzer />
      ) : (
        <Landing onTryNow={() => setShowApp(true)} />
      )}
    </main>
  );
}
