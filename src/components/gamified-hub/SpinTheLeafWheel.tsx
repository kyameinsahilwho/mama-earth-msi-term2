"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RotateCw, Ticket, Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { AppState } from "@/lib/types";
import { recordSpin } from "@/lib/gamified-service";
import "./spin-wheel.css";

interface SpinWheelProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  addPoints: (amount: number, message: string) => void;
}

const segments = [
  { type: "points", value: 10, label: "+10 Points" },
  { type: "discount", value: 5, label: "5% Off" },
  { type: "points", value: 50, label: "+50 Points" },
  { type: "try_again", value: 0, label: "Try Again" },
  { type: "points", value: 20, label: "+20 Points" },
  { type: "discount", value: 10, label: "10% Off" },
];

export default function SpinTheLeafWheel({ appState, setAppState, addPoints }: SpinWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [canSpin, setCanSpin] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    const today = new Date().toDateString();
    const hasCompletedRoutineToday = appState.lastRoutineDate === today && (appState.routineCountToday || 0) > 0;
    setCanSpin(hasCompletedRoutineToday);
  }, [appState.lastRoutineDate, appState.routineCountToday]);

  const handleSpin = () => {
    if (isSpinning || !canSpin) return;

    setIsSpinning(true);
    const randomSegment = Math.floor(Math.random() * segments.length);
    const segmentAngle = 360 / segments.length;
    const stopAngle = randomSegment * segmentAngle + segmentAngle / 2;
    const randomOffset = Math.random() * (segmentAngle * 0.8) - (segmentAngle * 0.4);
    const finalRotation = rotation + 360 * 5 + stopAngle + randomOffset;
    
    setRotation(finalRotation);

    setTimeout(() => {
      const winningSegment = segments[randomSegment];
      setIsSpinning(false);

      // Record spin in DB
      if (appState.user?.id) {
        const points = winningSegment.type === "points" ? winningSegment.value : 0;
        const discount = winningSegment.type === "discount" ? winningSegment.value : 0;
        recordSpin(appState.user.id, winningSegment, points, discount);
      }

      if (winningSegment.type === "points") {
        addPoints(winningSegment.value, "Spin the Wheel");
      } else if (winningSegment.type === "discount") {
        toast({
          title: "🎉 You Won a Discount! 🎉",
          description: `Enjoy a ${winningSegment.value}% discount on your next order.`,
        });
      } else {
        toast({
          title: "Better luck next time!",
          description: "Spin again after completing your next routine.",
        });
      }
       // For this prototype, we allow another spin right away if they completed a routine
       // In a real app, you'd track spins per day
    }, 5000); // Corresponds to CSS transition duration
  };
  
  return (
    <Card>
      <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
        <div className="relative w-64 h-64 md:w-80 md:h-80">
          <div
            className="wheel"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {segments.map((segment, index) => (
              <div
                key={index}
                className="segment"
                style={{ "--i": index, "--total": segments.length } as React.CSSProperties}
              >
                <span className="segment-label">
                  {segment.type === 'points' && <Gift className="w-4 h-4 inline-block mr-1" />}
                  {segment.type === 'discount' && <Ticket className="w-4 h-4 inline-block mr-1" />}
                  {segment.label}
                </span>
              </div>
            ))}
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-background rounded-full border-4 border-secondary flex items-center justify-center">
             <div className="w-3 h-3 bg-primary rounded-full"></div>
          </div>
          <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-[16px] border-t-primary"></div>
        </div>

        <div className="flex flex-col items-center md:items-start text-center md:text-left flex-1">
          <p className="text-muted-foreground mb-4">
            Complete at least one routine today to unlock your daily spin!
          </p>
          <Button onClick={handleSpin} disabled={isSpinning || !canSpin} size="lg">
            <RotateCw className={`mr-2 h-5 w-5 ${isSpinning ? "animate-spin" : ""}`} />
            {isSpinning ? "Spinning..." : "Spin Now"}
          </Button>
          {!canSpin && !isSpinning && (
            <p className="text-sm text-destructive mt-2">Complete a routine to spin.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
