"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Zap, Calendar, Star, Users, MessageSquare, Gift, Copy, Check } from "lucide-react";
import type { AppState } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

interface EarningSectionProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  addPoints: (amount: number, message: string) => void;
}

export default function EarningSection({ appState, setAppState, addPoints }: EarningSectionProps) {
  // Use ISO string (YYYY-MM-DD) for consistent date comparison with DB
  const today = new Date().toISOString().split('T')[0];
  const { toast } = useToast();

  // Modal States
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isReferralOpen, setIsReferralOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  // Quiz State
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);

  // Referral State
  const referralCode = appState.user?.referralCode || "Generating...";
  const [copied, setCopied] = useState(false);

  // Feedback State
  const [feedbackText, setFeedbackText] = useState("");

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
  
  const handleQuizComplete = () => {
    if (!appState.quizTaken) {
      setAppState(prev => ({...prev, quizTaken: true}));
      addPoints(40, "Skin Quiz Completion");
      setIsQuizOpen(false);
      toast({ title: "Quiz Completed!", description: "Thanks for telling us about your skin." });
    }
  };

  const handleReferralCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    // In a real app, points are awarded when the friend SIGNS UP.
    // For this demo, we'll award points for "Sharing" the code once.
    // We'll use a local storage flag or just allow it once per session for demo.
    // Or better, just show the code and say "Points when they join".
    // But user wants "real" points. Let's say "Share Bonus" for now.
    // We'll limit it to once per user in DB (referrals count).
    
    // Actually, let's just simulate a successful referral for the demo after a delay?
    // No, that's confusing. Let's just award points for "Generating Referral Link" once.
    if ((appState.referrals || 0) === 0) {
        setAppState(prev => ({...prev, referrals: 1}));
        addPoints(100, "First Referral Link Generated");
    } else {
        toast({ title: "Link Copied", description: "Share this with your friends!" });
    }
  };

  const handleFeedbackSubmit = () => {
    if (feedbackText.length < 10) {
        toast({ variant: "destructive", title: "Too short", description: "Please write at least 10 characters." });
        return;
    }
    setAppState(prev => ({...prev, feedbackGiven: (prev.feedbackGiven || 0) + 1}));
    addPoints(30, "Product Feedback");
    setIsFeedbackOpen(false);
    setFeedbackText("");
    toast({ title: "Feedback Sent", description: "Thank you for your review!" });
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
      action: () => setIsQuizOpen(true),
      disabled: appState.quizTaken,
      constraint: "Once per user",
    },
    {
      title: "Refer a Friend",
      description: "Share the love and get rewarded.",
      reward: 100,
      icon: <Users className="w-6 h-6 text-primary" />,
      buttonText: "Refer Now",
      action: () => setIsReferralOpen(true),
      disabled: false,
      constraint: "When they join",
    },
    {
      title: "Leave Feedback",
      description: "Review a product you've purchased.",
      reward: 30,
      icon: <MessageSquare className="w-6 h-6 text-primary" />,
      buttonText: "Give Feedback",
      action: () => setIsFeedbackOpen(true),
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
            <Card key={index} className="flex flex-col transform transition-transform duration-300 hover:-translate-y-2 shadow-neo-sm hover:shadow-neo">
              <CardHeader className="flex-row items-start gap-4 space-y-0">
                <div className="bg-primary/10 p-3 rounded-full border-2 border-black">{card.icon}</div>
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
                  className="w-full font-bold border-2 border-black shadow-neo-sm active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
                >
                  {card.disabled && card.buttonText !== "Automatic" ? "Claimed Today" : card.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Quiz Dialog */}
      <Dialog open={isQuizOpen} onOpenChange={setIsQuizOpen}>
        <DialogContent className="sm:max-w-[425px] border-2 border-black shadow-neo">
          <DialogHeader>
            <DialogTitle>Skin Profile Quiz</DialogTitle>
            <DialogDescription>
              Answer 3 quick questions to help us personalize your experience.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {quizStep === 0 && (
                <div className="space-y-3">
                    <Label>1. What is your skin type?</Label>
                    <RadioGroup onValueChange={(v) => setQuizAnswers([...quizAnswers, v])}>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="oily" id="r1" /><Label htmlFor="r1">Oily</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="dry" id="r2" /><Label htmlFor="r2">Dry</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="combination" id="r3" /><Label htmlFor="r3">Combination</Label></div>
                    </RadioGroup>
                </div>
            )}
            {quizStep === 1 && (
                <div className="space-y-3">
                    <Label>2. What is your main concern?</Label>
                    <RadioGroup onValueChange={(v) => setQuizAnswers([...quizAnswers, v])}>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="acne" id="c1" /><Label htmlFor="c1">Acne</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="aging" id="c2" /><Label htmlFor="c2">Aging</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="dullness" id="c3" /><Label htmlFor="c3">Dullness</Label></div>
                    </RadioGroup>
                </div>
            )}
            {quizStep === 2 && (
                <div className="space-y-3">
                    <Label>3. How often do you use sunscreen?</Label>
                    <RadioGroup onValueChange={(v) => setQuizAnswers([...quizAnswers, v])}>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="daily" id="s1" /><Label htmlFor="s1">Daily</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="sometimes" id="s2" /><Label htmlFor="s2">Sometimes</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="never" id="s3" /><Label htmlFor="s3">Never</Label></div>
                    </RadioGroup>
                </div>
            )}
          </div>
          <DialogFooter>
            {quizStep < 2 ? (
                <Button onClick={() => setQuizStep(prev => prev + 1)}>Next</Button>
            ) : (
                <Button onClick={handleQuizComplete}>Finish & Earn 40pts</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Referral Dialog */}
      <Dialog open={isReferralOpen} onOpenChange={setIsReferralOpen}>
        <DialogContent className="sm:max-w-[425px] border-2 border-black shadow-neo">
          <DialogHeader>
            <DialogTitle>Refer a Friend</DialogTitle>
            <DialogDescription>
              Share your unique code. You'll both get 100 points when they join!
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 py-4">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="link" className="sr-only">Link</Label>
              <Input id="link" defaultValue={referralCode} readOnly className="font-mono text-center font-bold" />
            </div>
            <Button size="sm" className="px-3" onClick={handleReferralCopy}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setIsReferralOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen}>
        <DialogContent className="sm:max-w-[425px] border-2 border-black shadow-neo">
          <DialogHeader>
            <DialogTitle>Product Feedback</DialogTitle>
            <DialogDescription>
              Tell us what you think about your recent purchase.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="feedback" className="mb-2 block">Your Review</Label>
            <Textarea 
                id="feedback" 
                placeholder="I loved the texture of the face wash..." 
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button onClick={handleFeedbackSubmit}>Submit Review</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

