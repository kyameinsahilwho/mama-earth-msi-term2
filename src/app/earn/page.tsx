"use client";

import React from "react";
import EarningSection from "@/components/gamified-hub/EarningSection";
import JourneyFlow from "@/components/gamified-hub/JourneyFlow";
import { useGamification } from "@/context/GamificationContext";

export default function EarnPage() {
  const { appState, setAppState, addPoints } = useGamification();

  return (
    <div className="space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Earn Leaf Points</h1>
        <p className="text-xl text-muted-foreground">Complete daily tasks and grow your garden!</p>
      </div>
      
      <EarningSection 
        appState={appState} 
        setAppState={setAppState} 
        addPoints={addPoints} 
      />
      
      <JourneyFlow />
    </div>
  );
}
