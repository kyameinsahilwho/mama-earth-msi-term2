"use client";

import React from "react";
import Hero from "@/components/gamified-hub/Hero";
import GamifiedFeatures from "@/components/gamified-hub/GamifiedFeatures";
import WelcomeScreen from "@/components/gamified-hub/WelcomeScreen";
import { useGamification } from "@/context/GamificationContext";
import { useRouter } from "next/navigation";

export default function Home() {
  const { appState, setAppState, addPoints } = useGamification();
  const router = useRouter();

  const handleStartEarning = () => {
    router.push("/earn");
  };

  return (
    <div className="space-y-12">
      <WelcomeScreen />
      <Hero onStartEarning={handleStartEarning} />
      
      <GamifiedFeatures 
        appState={appState} 
        setAppState={setAppState} 
        addPoints={addPoints} 
      />
    </div>
  );
}
