"use client";

import AchievementBadges from "./AchievementBadges";
import Leaderboard from "./Leaderboard";
import SpinTheLeafWheel from "./SpinTheLeafWheel";
import type { AppState } from "@/lib/types";

interface GamifiedFeaturesProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  addPoints: (amount: number, message: string) => void;
}

export default function GamifiedFeatures({ appState, setAppState, addPoints }: GamifiedFeaturesProps) {
  return (
    <section className="py-12 md:py-20 bg-primary/5">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-10 font-headline">Level Up Your Journey</h2>
        
        <div className="space-y-16">
          <div>
            <h3 className="text-2xl font-semibold text-center mb-6 font-headline">Achievement Badges</h3>
            <AchievementBadges badges={appState.badges} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-2">
              <h3 className="text-2xl font-semibold text-center mb-6 font-headline">Spin-the-Leaf Wheel</h3>
              <SpinTheLeafWheel appState={appState} setAppState={setAppState} addPoints={addPoints} />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-center mb-6 font-headline">Leaderboard</h3>
              <Leaderboard userPoints={appState.points} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
