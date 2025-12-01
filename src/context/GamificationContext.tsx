"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { getOrCreateProfile, addPoints as dbAddPoints, updateProfile } from "@/lib/gamified-service";
import { AppState, Badge } from "@/lib/types";
import { Session } from "@supabase/supabase-js";
import { useSoundEffects } from "@/hooks/use-sound-effects";

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

interface GamificationContextType {
  appState: AppState;
  session: Session | null;
  isLoading: boolean;
  addPoints: (amount: number, message: string) => void;
  redeemReward: (pointsCost: number, rewardName: string) => Promise<void>;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  logout: () => Promise<void>;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export function GamificationProvider({ children }: { children: React.ReactNode }) {
  const [appState, setAppState] = useState<AppState>(INITIAL_STATE);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { playSound } = useSoundEffects();

  // Initialize user and load data from Supabase
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user);
      } else {
        setIsLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user);
      } else {
        setAppState(INITIAL_STATE);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (user: any) => {
    try {
      const profile = await getOrCreateProfile(user);
      if (profile) {
        setAppState(prev => ({
          ...prev,
          user: { id: profile.id, username: profile.username },
          points: profile.points,
          lastLoginDate: profile.last_login_date,
          lastRoutineDate: profile.last_routine_date,
          routineCountToday: profile.routine_count_today,
          streak: profile.streak,
          quizTaken: profile.quiz_taken,
          referrals: profile.referrals,
          feedbackGiven: profile.feedback_given,
          badges: badgeMilestones.map(b => ({
            ...b,
            unlocked: profile.points >= b.points
          }))
        }));
      }
    } catch (err) {
      console.error("Failed to init user", err);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAndAwardBadges = useCallback((currentPoints: number) => {
    appState.badges.forEach((badge) => {
      if (!badge.unlocked && currentPoints >= badge.points) {
        playSound("success");
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
  }, [appState.badges, toast, playSound]);

  const addPoints = useCallback(async (amount: number, message: string) => {
    playSound("success");
    setAppState(prev => {
      const newPoints = prev.points + amount;
      checkAndAwardBadges(newPoints);
      return { ...prev, points: newPoints };
    });
    
    toast({
      title: "Points Earned!",
      description: `+${amount} Leaf Points for ${message}.`,
    });

    if (appState.user?.id) {
      try {
        await dbAddPoints(appState.user.id, amount, message);
      } catch (err) {
        console.error("Failed to add points to DB", err);
      }
    }
  }, [appState.user?.id, checkAndAwardBadges, toast, playSound]);

  const redeemReward = async (pointsCost: number, rewardName: string) => {
    if (appState.points >= pointsCost) {
      playSound("click");
      setAppState(prev => ({...prev, points: prev.points - pointsCost}));
      toast({
        title: "Reward Redeemed!",
        description: `You've successfully redeemed ${rewardName}.`,
      });

      if (appState.user?.id) {
        try {
           await updateProfile(appState.user.id, { points: appState.points - pointsCost });
        } catch (err) {
           console.error("Failed to redeem in DB", err);
        }
      }
    } else {
      playSound("error");
      toast({
        variant: "destructive",
        title: "Not enough points!",
        description: `You need ${pointsCost - appState.points} more points to redeem this.`,
      });
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setAppState(INITIAL_STATE);
    toast({
      title: "Signed out",
      description: "See you next time!",
    });
  };

  // Sync state changes wrapper
  const handleSetAppState = (action: React.SetStateAction<AppState>) => {
    setAppState(prev => {
      const newState = typeof action === 'function' ? action(prev) : action;
      
      if (prev.user?.id) {
        const updates: any = {};
        if (newState.lastLoginDate !== prev.lastLoginDate) updates.last_login_date = newState.lastLoginDate;
        if (newState.lastRoutineDate !== prev.lastRoutineDate) updates.last_routine_date = newState.lastRoutineDate;
        if (newState.routineCountToday !== prev.routineCountToday) updates.routine_count_today = newState.routineCountToday;
        if (newState.streak !== prev.streak) updates.streak = newState.streak;
        if (newState.quizTaken !== prev.quizTaken) updates.quiz_taken = newState.quizTaken;
        if (newState.referrals !== prev.referrals) updates.referrals = newState.referrals;
        if (newState.feedbackGiven !== prev.feedbackGiven) updates.feedback_given = newState.feedbackGiven;

        if (Object.keys(updates).length > 0) {
          updateProfile(prev.user.id, updates).catch(err => console.error("Sync error", err));
        }
      }
      return newState;
    });
  };

  return (
    <GamificationContext.Provider value={{ 
      appState, 
      session, 
      isLoading, 
      addPoints, 
      redeemReward, 
      setAppState: handleSetAppState,
      logout 
    }}>
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification() {
  const context = useContext(GamificationContext);
  if (context === undefined) {
    throw new Error("useGamification must be used within a GamificationProvider");
  }
  return context;
}
