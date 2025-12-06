"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RotateCw, Ticket, Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { AppState } from "@/lib/types";
import { recordSpin } from "@/lib/gamified-service";

interface SpinWheelProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  addPoints: (amount: number, message: string) => void;
}

const segments = [
  { type: "points", value: 10, label: "+10 Points", color: "#e6f4ea" }, // Light Green
  { type: "discount", value: 5, label: "5% Off", color: "#ccebd6" }, // Medium Green
  { type: "points", value: 50, label: "+50 Points", color: "#e6f4ea" },
  { type: "try_again", value: 0, label: "Try Again", color: "#ccebd6" },
  { type: "points", value: 20, label: "+20 Points", color: "#e6f4ea" },
  { type: "discount", value: 10, label: "10% Off", color: "#ccebd6" },
];

export default function SpinTheLeafWheel({ appState, setAppState, addPoints }: SpinWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [canSpin, setCanSpin] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const hasCompletedRoutineToday = appState.lastRoutineDate === today && (appState.routineCountToday || 0) > 0;
    const hasSpunToday = appState.lastSpinDate === today;
    setCanSpin(hasCompletedRoutineToday && !hasSpunToday);
  }, [appState.lastRoutineDate, appState.routineCountToday, appState.lastSpinDate]);

  const handleSpin = () => {
    if (isSpinning || !canSpin) return;

    setIsSpinning(true);
    const randomSegment = Math.floor(Math.random() * segments.length);
    const segmentAngle = 360 / segments.length;
    
    // Calculate stop angle to land in the middle of the segment
    // We want the pointer (at top, 270deg or -90deg visually) to point to the segment
    // The wheel rotates clockwise.
    // If we want segment i to be at the top:
    // Rotation = - (i * segmentAngle)
    // Add some full rotations (360 * 5)
    
    const stopAngle = -(randomSegment * segmentAngle); 
    const finalRotation = rotation + 360 * 5 + stopAngle;
    
    setRotation(finalRotation);

    setTimeout(() => {
      const winningSegment = segments[randomSegment];
      setIsSpinning(false);
      
      const todayISO = new Date().toISOString().split('T')[0];
      setAppState(prev => ({ ...prev, lastSpinDate: todayISO }));

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
    }, 5000);
  };
  
  const radius = 100;
  const center = 100;
  
  return (
    <Card>
      <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
        <div className="relative w-64 h-64 md:w-80 md:h-80">
          {/* SVG Wheel */}
          <svg 
            viewBox="0 0 200 200" 
            className="w-full h-full transform transition-transform duration-[5000ms] cubic-bezier(0.25, 1, 0.5, 1)"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {segments.map((segment, index) => {
              const angle = 360 / segments.length;
              const startAngle = index * angle;
              const endAngle = (index + 1) * angle;
              
              // Convert polar to cartesian
              const x1 = center + radius * Math.cos(Math.PI * startAngle / 180);
              const y1 = center + radius * Math.sin(Math.PI * startAngle / 180);
              const x2 = center + radius * Math.cos(Math.PI * endAngle / 180);
              const y2 = center + radius * Math.sin(Math.PI * endAngle / 180);
              
              // SVG Path command
              const d = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;
              
              // Text position (midpoint of segment, slightly inwards)
              const midAngle = startAngle + angle / 2;
              const textRadius = radius * 0.65;
              const tx = center + textRadius * Math.cos(Math.PI * midAngle / 180);
              const ty = center + textRadius * Math.sin(Math.PI * midAngle / 180);

              return (
                <g key={index}>
                  <path d={d} fill={segment.color} stroke="#fff" strokeWidth="2" />
                  <g transform={`translate(${tx}, ${ty}) rotate(${midAngle + 90})`}>
                    <text 
                      textAnchor="middle" 
                      dominantBaseline="middle" 
                      fill="#1a1a1a" 
                      fontSize="10" 
                      fontWeight="bold"
                    >
                      {segment.label}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>

          {/* Center Pin */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full border-4 border-primary flex items-center justify-center shadow-lg z-10">
             <div className="w-3 h-3 bg-primary rounded-full"></div>
          </div>
          
          {/* Pointer */}
          <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-[20px] border-t-primary z-20 drop-shadow-md"></div>
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

