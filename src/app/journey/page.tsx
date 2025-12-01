"use client";

import React from "react";
import JourneyTimeline from "@/components/gamified-hub/JourneyTimeline";

export default function JourneyPage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold font-headline">Your Growth Journey</h1>
        <p className="text-xl text-muted-foreground">Track every step of your glowing transformation.</p>
      </div>
      
      <JourneyTimeline />
    </div>
  );
}
