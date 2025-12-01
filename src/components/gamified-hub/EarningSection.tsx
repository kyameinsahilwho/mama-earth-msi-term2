"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, Calendar, Star, Users, MessageSquare, Gift } from "lucide-react";
import type { AppState } from "@/lib/types";

interface EarningSectionProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  addPoints: (amount: number, message: string) => void;
}

export default function EarningSection({ appState, setAppState, addPoints }: EarningSectionProps) {
  const today = new Date().toDateString();

  const handleDailyLogin = () => {
    if (appState.lastLoginDate !== today) {
      setAppState(prev => ({...prev, lastLoginDate: today}));
      addPoints(10, "Daily Login");
    }
  };

  const handleRoutine = () => {
    if (appState.lastRoutineDate !== today) {
      setAppState(prev => ({...prev, lastRoutineDate: today, routineCountToday: 1, streak: (prev.streak || 0) + 1}));
      addPoints(20, "AM/PM Routine");
    } else if ((appState.routineCountToday || 0) < 2) {
      setAppState(prev => ({...prev, routineCountToday: 2, streak: (prev.streak || 0) + 1}));
      addPoints(20, "AM/PM Routine");
    }

    // Check for 7-day streak
    if (((appState.streak || 0) + 1) % 7 === 0 && (appState.streak || 0) > 0) {
      addPoints(50, "7-Day Streak");
    }
  };
  
  const handleQuiz = () => {
    if (!appState.quizTaken) {
      setAppState(prev => ({...prev, quizTaken: true}));
      addPoints(40, "Skin Quiz");
    }
  };

  const handleReferral = () => {
    setAppState(prev => ({...prev, referrals: (prev.referrals || 0) + 1}));
    addPoints(100, "Referring a Friend");
  };

  const handleFeedback = () => {
    setAppState(prev => ({...prev, feedbackGiven: (prev.feedbackGiven || 0) + 1}));
    addPoints(30, "Leaving Feedback");
  };


  const earningCards = [
    {
      title: "Daily Login",
      description: "Visit the app each day to earn points.",
      reward: 10,
      icon: <Calendar className="w-6 h-6 text-primary" />,
      buttonText: "Claimed",
      action: handleDailyLogin,
      disabled: appState.lastLoginDate === today,
      constraint: "Once per day",
    },
    {
      title: "Complete AM/PM Routine",
      description: "Log your morning and evening routines.",
      reward: 20,
      icon: <Zap className="w-6 h-6 text-primary" />,
      buttonText: "Log Routine",
      action: handleRoutine,
      disabled: (appState.routineCountToday || 0) >= 2,
      constraint: "Max 2 per day",
    },
    {
      title: "7-Day Streak",
      description: "Complete your routine for 7 days in a row.",
      reward: 50,
      icon: <Star className="w-6 h-6 text-primary" />,
      buttonText: "Automatic",
      action: () => {},
      disabled: true,
      constraint: `Day ${appState.streak % 7} of 7`,
    },
    {
      title: "Skin Quiz",
      description: "Take our skin quiz for personalized advice.",
      reward: 40,
      icon: <Gift className="w-6 h-6 text-primary" />,
      buttonText: "Take Quiz",
      action: handleQuiz,
      disabled: appState.quizTaken,
      constraint: "Once per user",
    },
    {
      title: "Refer a Friend",
      description: "Share the love and get rewarded.",
      reward: 100,
      icon: <Users className="w-6 h-6 text-primary" />,
      buttonText: "Refer Now",
      action: handleReferral,
      disabled: false,
      constraint: "Once per referral",
    },
    {
      title: "Leave Feedback",
      description: "Review a product you've purchased.",
      reward: 30,
      icon: <MessageSquare className="w-6 h-6 text-primary" />,
      buttonText: "Give Feedback",
      action: handleFeedback,
      disabled: false,
      constraint: "For purchased products",
    },
  ];

  return (
    <section id="earn-points" className="py-12 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-2 font-headline">How to Earn Leaf Points</h2>
        <p className="text-center text-muted-foreground mb-10">Engage with us and watch your garden grow!</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {earningCards.map((card, index) => (
            <Card key={index} className="flex flex-col transform transition-transform duration-300 hover:-translate-y-2">
              <CardHeader className="flex-row items-start gap-4 space-y-0">
                <div className="bg-primary/10 p-3 rounded-full">{card.icon}</div>
                <div>
                  <CardTitle className="font-headline">{card.title}</CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="text-sm text-muted-foreground">
                    <span className="font-semibold text-primary">+{card.reward} Leaf Points</span>
                    <span className="mx-2">|</span>
                    {card.constraint}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={card.action}
                  disabled={card.disabled}
                  className="w-full"
                >
                  {card.disabled && card.buttonText !== "Automatic" ? "Claimed Today" : card.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
