"use client";

import React from "react";
import RewardsSection from "@/components/gamified-hub/RewardsSection";
import { useGamification } from "@/context/GamificationContext";

export default function RewardsPage() {
  const { appState, redeemReward } = useGamification();

  return (
    <div className="space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Rewards Garden</h1>
        <p className="text-xl text-muted-foreground">Redeem your hard-earned Leaf Points for exclusive goodies!</p>
      </div>

      <RewardsSection 
        userPoints={appState.points} 
        redeemReward={redeemReward} 
      />
    </div>
  );
}
