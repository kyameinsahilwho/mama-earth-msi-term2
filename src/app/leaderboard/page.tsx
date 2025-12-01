"use client";

import React from "react";
import Leaderboard from "@/components/gamified-hub/Leaderboard";
import { useGamification } from "@/context/GamificationContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LeaderboardPage() {
  const { appState } = useGamification();

  return (
    <div className="space-y-12 max-w-2xl mx-auto">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Community Leaderboard</h1>
        <p className="text-xl text-muted-foreground">See who's growing the biggest garden!</p>
      </div>

      <Card className="border-4 border-black shadow-neo bg-white">
        <CardHeader className="bg-yellow-300 border-b-4 border-black">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            🏆 Top Gardeners
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Leaderboard userPoints={appState.points} />
        </CardContent>
      </Card>
    </div>
  );
}
