"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Header from "@/components/gamified-hub/Header";
import Hero from "@/components/gamified-hub/Hero";
import EarningSection from "@/components/gamified-hub/EarningSection";
import GamifiedFeatures from "@/components/gamified-hub/GamifiedFeatures";
import JourneyFlow from "@/components/gamified-hub/JourneyFlow";
import RewardsSection from "@/components/gamified-hub/RewardsSection";
import Footer from "@/components/gamified-hub/Footer";
import { useToast } from "@/hooks/use-toast";
import type { Badge, BadgeName, AppState } from "@/lib/types";

const badgeMilestones: Badge[] = [
  { name: "Seedling", points: 100, unlocked: false },
  { name: "Sapling", points: 300, unlocked: false },
  { name: "Growing Tree", points: 600, unlocked: false },
  { name: "Ancient Banyan", points: 1000, unlocked: false },
];

const INITIAL_STATE: AppState = {
  points: 0,
  badges: badgeMilestones,
  lastLoginDate: null,
  lastRoutineDate: null,
  routineCountToday: 0,
  streak: 0,
  quizTaken: false,
  referrals: 0,
  feedbackGiven: 0,
};

export default function Home() {
  const [appState, setAppState] = useState<AppState>(INITIAL_STATE);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();
  const earningSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
    try {
      const savedState = localStorage.getItem("mamaearthGameState");
      if (savedState) {
        const parsedState = JSON.parse(savedState) as AppState;
        
        // Data migration: ensure badges are up to date
        const currentBadgeNames = badgeMilestones.map(b => b.name);
        const savedBadges = parsedState.badges?.filter(b => currentBadgeNames.includes(b.name)) || [];
        const newBadges = badgeMilestones.filter(b => !savedBadges.some(sb => sb.name === b.name));
        
        const updatedBadges = [...savedBadges, ...newBadges].map(badge => ({
            ...badge,
            unlocked: parsedState.points >= badge.points
        })).sort((a,b) => a.points - b.points);

        setAppState({...parsedState, badges: updatedBadges});
      } else {
        setAppState(INITIAL_STATE);
      }
    } catch (error) {
      console.error("Failed to load state from localStorage", error);
      setAppState(INITIAL_STATE);
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem("mamaearthGameState", JSON.stringify(appState));
    }
  }, [appState, isClient]);
  
  const checkAndAwardBadges = useCallback((currentPoints: number) => {
    appState.badges.forEach((badge) => {
      if (!badge.unlocked && currentPoints >= badge.points) {
        toast({
          title: "✨ Badge Unlocked! ✨",
          description: `You've earned the ${badge.name} badge!`,
          duration: 5000,
        });
        setAppState(prev => ({
          ...prev,
          badges: prev.badges.map(b => b.name === badge.name ? { ...b, unlocked: true } : b)
        }));
      }
    });
  }, [appState.badges, toast]);

  const addPoints = useCallback((amount: number, message: string) => {
    setAppState(prev => {
      const newPoints = prev.points + amount;
      checkAndAwardBadges(newPoints);
      return { ...prev, points: newPoints };
    });
    toast({
      title: "Points Earned!",
      description: `+${amount} Leaf Points for ${message}.`,
    });
  }, [checkAndAwardBadges, toast]);

  const handleScrollToEarning = () => {
    earningSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  
  const redeemReward = (pointsCost: number, rewardName: string) => {
    if (appState.points >= pointsCost) {
      setAppState(prev => ({...prev, points: prev.points - pointsCost}));
      toast({
        title: "Reward Redeemed!",
        description: `You've successfully redeemed ${rewardName}.`,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Not enough points!",
        description: `You need ${pointsCost - appState.points} more points to redeem this.`,
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header points={appState.points} />
      <main className="flex-1">
        <Hero onStartEarning={handleScrollToEarning} />
        <div ref={earningSectionRef}>
          <EarningSection appState={appState} setAppState={setAppState} addPoints={addPoints} />
        </div>
        <GamifiedFeatures appState={appState} setAppState={setAppState} addPoints={addPoints} />
        <JourneyFlow />
        <RewardsSection userPoints={appState.points} redeemReward={redeemReward} />
      </main>
      <Footer />
    </div>
  );
}
