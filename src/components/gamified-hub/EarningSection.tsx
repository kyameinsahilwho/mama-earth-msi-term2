"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Zap, Calendar, Star, Users, MessageSquare, Gift, Copy, Check, Loader2, Award } from "lucide-react";
import type { AppState } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { generateQuiz, type QuizQuestion } from "@/ai/flows/quiz-flow";
import { submitFeedback } from "@/lib/gamified-service";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EarningSectionProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  addPoints: (amount: number, message: string) => void;
}

export default function EarningSection({ appState, setAppState, addPoints }: EarningSectionProps) {
  const today = new Date().toISOString().split('T')[0];
  const { toast } = useToast();

  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isReferralOpen, setIsReferralOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  
  const referralCode = appState.user?.referralCode || "Generating...";
  const [copied, setCopied] = useState(false);

  // Feedback State
  const [feedbackProduct, setFeedbackProduct] = useState("");
  const [feedbackRating, setFeedbackRating] = useState("5");
  const [feedbackComment, setFeedbackComment] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const MAMAEARTH_PRODUCTS = [
    "Onion Hair Oil",
    "Ubtan Face Wash",
    "Vitamin C Face Serum",
    "Tea Tree Face Wash",
    "CoCo Face Mask",
    "Rice Water Shampoo",
    "Aloe Vera Gel",
    "Charcoal Face Wash",
    "Bye Bye Blemishes Face Cream",
    "Retinol Face Serum",
    "Other"
  ];

  const startQuiz = async () => {
    if (appState.quizzesTakenToday >= 5) {
      toast({ title: "Daily Limit Reached", description: "You can only take 5 quizzes per day." });
      return;
    }
    
    setIsQuizOpen(true);
    setQuizLoading(true);
    setQuizFinished(false);
    setCurrentQuestionIndex(0);
    setQuizScore(0);
    setSelectedAnswer(null);

    try {
      const quizData = await generateQuiz({ topic: "skincare" });
      if (quizData.questions && quizData.questions.length > 0) {
        setQuizQuestions(quizData.questions);
      } else {
        throw new Error("No questions generated");
      }
    } catch (error) {
      console.error("Failed to generate quiz:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not load the quiz. Please try again." });
      setIsQuizOpen(false);
    } finally {
      setQuizLoading(false);
    }
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === null) return;

    const currentQuestion = quizQuestions[currentQuestionIndex];
    let score = quizScore;
    if (parseInt(selectedAnswer) === currentQuestion.answerIndex) {
      score = score + 1;
      setQuizScore(score);
    }

    setSelectedAnswer(null);
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setQuizFinished(true);
      const pointsEarned = score * 10;
      if (appState.quizzesTakenToday < 5 && pointsEarned > 0) {
        addPoints(pointsEarned, `Skin Quiz (${score}/${quizQuestions.length})`);
      }
      setAppState(prev => ({...prev, quizzesTakenToday: (prev.quizzesTakenToday || 0) + 1}));
    }
  };
  
  const resetAndCloseQuiz = () => {
    setIsQuizOpen(false);
    // Delay reset to allow dialog to close smoothly
    setTimeout(() => { 
        setQuizQuestions([]);
        setQuizFinished(false);
        setCurrentQuestionIndex(0);
    }, 300);
  };


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

    if (((appState.streak || 0) + 1) % 7 === 0 && (appState.streak || 0) > 0) {
      addPoints(50, "7-Day Streak");
    }
  };
  
  const handleReferralCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if ((appState.referrals || 0) === 0) {
        setAppState(prev => ({...prev, referrals: 1}));
        addPoints(100, "First Referral Link Generated");
    } else {
        toast({ title: "Link Copied", description: "Share this with your friends!" });
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!feedbackProduct || !feedbackComment) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Please fill in all fields." });
      return;
    }

    setIsSubmittingFeedback(true);
    try {
      if (appState.user?.id) {
        await submitFeedback(appState.user.id, feedbackProduct, parseInt(feedbackRating), feedbackComment);
        setAppState(prev => ({...prev, feedbackGiven: (prev.feedbackGiven || 0) + 1}));
        setIsFeedbackOpen(false);
        setFeedbackProduct("");
        setFeedbackComment("");
        setFeedbackRating("5");
      } else {
        toast({ variant: "destructive", title: "Error", description: "You must be logged in." });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to submit feedback." });
    } finally {
      setIsSubmittingFeedback(false);
    }
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
      reward: 100,
      icon: <Gift className="w-6 h-6 text-primary" />,
      buttonText: "Take Quiz",
      action: startQuiz,
      disabled: appState.quizzesTakenToday >= 5,
      constraint: `Quiz ${appState.quizzesTakenToday || 0}/5`,
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
      constraint: "Unlimited",
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
                  {card.disabled && card.buttonText !== "Automatic" && card.title !== '7-Day Streak' ? "Completed" : card.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={isQuizOpen} onOpenChange={resetAndCloseQuiz}>
        <DialogContent className="sm:max-w-md border-2 border-black shadow-neo">
          <DialogHeader>
            <DialogTitle>Mamaearth Skincare Quiz</DialogTitle>
            <DialogDescription>
              {quizFinished ? "Quiz Complete!" : `Question ${currentQuestionIndex + 1} of ${quizQuestions.length}`}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4 min-h-[300px] flex flex-col justify-center">
            {quizLoading ? (
              <div className="flex flex-col items-center justify-center text-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Generating your personalized quiz...</p>
              </div>
            ) : quizFinished ? (
              <div className="flex flex-col items-center justify-center text-center gap-4 animate-in fade-in zoom-in">
                <Award className="w-16 h-16 text-yellow-500" />
                <h3 className="text-2xl font-bold">Great job!</h3>
                <p className="text-muted-foreground">You scored {quizScore} out of {quizQuestions.length}.</p>
                <p className="font-bold text-primary text-lg">+{quizScore * 10} Leaf Points have been added!</p>
              </div>
            ) : quizQuestions.length > 0 ? (
              <div className="space-y-4 animate-in fade-in">
                <Label className="font-bold text-base text-center block">{quizQuestions[currentQuestionIndex].question}</Label>
                <RadioGroup onValueChange={setSelectedAnswer} value={selectedAnswer ?? undefined}>
                  {quizQuestions[currentQuestionIndex].options.map((option, index) => (
                    <div 
                      key={index} 
                      className={`flex items-center space-x-3 p-3 border rounded-md cursor-pointer transition-colors ${selectedAnswer === index.toString() ? 'bg-primary/10 border-primary' : 'bg-secondary/50 hover:bg-secondary/80'}`}
                      onClick={() => setSelectedAnswer(index.toString())}
                    >
                      <RadioGroupItem value={index.toString()} id={`q${currentQuestionIndex}-o${index}`} />
                      <Label htmlFor={`q${currentQuestionIndex}-o${index}`} className="flex-1 cursor-pointer pointer-events-none">{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ) : (
                 <div className="text-center text-muted-foreground">Could not load quiz.</div>
            )}
          </div>
          <DialogFooter>
             {quizFinished ? (
              <Button onClick={resetAndCloseQuiz} className="w-full">Close</Button>
            ) : (
              <Button onClick={handleNextQuestion} disabled={selectedAnswer === null || quizLoading} className="w-full">
                {currentQuestionIndex < quizQuestions.length - 1 ? "Next Question" : "Finish Quiz"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isReferralOpen} onOpenChange={setIsReferralOpen}>
        <DialogContent className="sm:max-w-[425px] border-2 border-black shadow-neo">
          <DialogHeader>
            <DialogTitle>Refer a Friend</DialogTitle>
            <DialogDescription>
              Share your unique code. You'll get 100 points, they get 50!
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

      <Dialog open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen}>
        <DialogContent className="sm:max-w-[425px] border-2 border-black shadow-neo">
          <DialogHeader>
            <DialogTitle>Product Feedback</DialogTitle>
            <DialogDescription>
              Tell us about your experience and earn 30 points!
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="product">Product Name</Label>
              <Select value={feedbackProduct} onValueChange={setFeedbackProduct}>
                <SelectTrigger id="product">
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {MAMAEARTH_PRODUCTS.map((product) => (
                    <SelectItem key={product} value={product}>
                      {product}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rating">Rating</Label>
              <Select value={feedbackRating} onValueChange={setFeedbackRating}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">⭐⭐⭐⭐⭐ (Excellent)</SelectItem>
                  <SelectItem value="4">⭐⭐⭐⭐ (Good)</SelectItem>
                  <SelectItem value="3">⭐⭐⭐ (Average)</SelectItem>
                  <SelectItem value="2">⭐⭐ (Poor)</SelectItem>
                  <SelectItem value="1">⭐ (Terrible)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="comment">Your Review</Label>
              <Textarea 
                id="comment" 
                placeholder="What did you like or dislike?" 
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFeedbackOpen(false)}>Cancel</Button>
            <Button onClick={handleFeedbackSubmit} disabled={isSubmittingFeedback}>
              {isSubmittingFeedback && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </section>
  );
}
