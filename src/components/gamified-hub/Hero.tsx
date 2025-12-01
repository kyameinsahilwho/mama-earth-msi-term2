"use client";

import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface HeroProps {
  onStartEarning: () => void;
}

export default function Hero({ onStartEarning }: HeroProps) {
  return (
    <section className="py-20 md:py-28 text-center bg-primary/5">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 font-headline">
          Welcome to Your <span className="text-primary">Growth Garden</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
          Complete routines, take quizzes, refer friends, and earn Leaf Points to unlock exclusive rewards.
        </p>
        <Button size="lg" onClick={onStartEarning}>
          <Sparkles className="mr-2 h-5 w-5" />
          Start Earning
        </Button>
      </div>
    </section>
  );
}
