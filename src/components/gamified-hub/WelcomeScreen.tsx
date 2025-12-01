"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Sprout, Gift, Trophy, Leaf, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function WelcomeScreen() {
  const [isOpen, setIsOpen] = useState(false);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCurrentCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if user has seen the welcome screen
    const hasSeenWelcome = localStorage.getItem("hasSeenWelcome");
    if (!hasSeenWelcome) {
      // Small delay to ensure smooth entrance after hydration
      const timer = setTimeout(() => setIsOpen(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (!api) {
      return;
    }
 
    setCurrentCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);
 
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // When closed, mark as seen
      localStorage.setItem("hasSeenWelcome", "true");
    }
  };

  const handleClose = () => {
    handleOpenChange(false);
  };

  if (!mounted) return null;

  const features = [
    {
      title: "Welcome to Mamaearth",
      description: "Join our community of sustainability heroes. Grow your virtual garden and make a real-world impact.",
      icon: <Leaf className="w-16 h-16 sm:w-20 sm:h-20 text-green-500" />,
      bg: "bg-green-50"
    },
    {
      title: "Plant & Grow",
      description: "Plant virtual seeds and water them daily. Watch them bloom into beautiful trees as you maintain your streak.",
      icon: <Sprout className="w-16 h-16 sm:w-20 sm:h-20 text-green-600" />,
      bg: "bg-blue-50"
    },
    {
      title: "Earn Leaf Points",
      description: "Complete daily routines, take quizzes, and spin the wheel to earn Leaf Points.",
      icon: <Trophy className="w-16 h-16 sm:w-20 sm:h-20 text-yellow-500" />,
      bg: "bg-yellow-50"
    },
    {
      title: "Real Rewards",
      description: "Redeem your points for exclusive discounts and coupons on Mamaearth products.",
      icon: <Gift className="w-16 h-16 sm:w-20 sm:h-20 text-purple-500" />,
      bg: "bg-purple-50"
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[90vw] max-w-[450px] max-h-[90vh] p-0 overflow-hidden border-none shadow-2xl rounded-xl flex flex-col">
        <DialogTitle className="sr-only">Welcome to Mamaearth Growth Garden</DialogTitle>
        <div className={cn("transition-colors duration-500 ease-in-out flex-1 flex flex-col", features[current - 1]?.bg || "bg-white")}>
            <Carousel setApi={setApi} className="w-full flex-1">
            <CarouselContent className="h-full">
                {features.map((feature, index) => (
                <CarouselItem key={index} className="h-full">
                    <div className="p-6 flex flex-col items-center justify-center text-center h-full min-h-[300px] space-y-4">
                        <div className="p-4 bg-white rounded-full shadow-xl animate-in zoom-in duration-500 shrink-0">
                            {feature.icon}
                        </div>
                        <div className="space-y-2 overflow-y-auto max-h-[200px]">
                            <h2 className="text-xl sm:text-2xl font-bold font-headline text-foreground">{feature.title}</h2>
                            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed px-2">{feature.description}</p>
                        </div>
                    </div>
                </CarouselItem>
                ))}
            </CarouselContent>
            
            {/* Custom Navigation Dots */}
            <div className="flex justify-center gap-2 pb-4 shrink-0">
                {features.map((_, index) => (
                    <div 
                        key={index}
                        className={cn(
                            "w-2 h-2 rounded-full transition-all duration-300",
                            current === index + 1 ? "bg-primary w-6" : "bg-primary/30"
                        )}
                    />
                ))}
            </div>
            </Carousel>
            
            <div className="p-4 bg-white/50 backdrop-blur-sm border-t shrink-0">
                {current === count ? (
                    <Button onClick={handleClose} className="w-full text-lg font-bold shadow-lg hover:shadow-xl transition-all" size="lg">
                        Get Started <Leaf className="ml-2 w-5 h-5" />
                    </Button>
                ) : (
                    <Button onClick={() => api?.scrollNext()} className="w-full text-lg font-bold" variant="outline" size="lg">
                        Next <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                )}
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
