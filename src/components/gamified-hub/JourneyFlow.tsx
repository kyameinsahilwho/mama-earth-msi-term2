"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Hand, Leaf, Award, ShoppingBag } from "lucide-react";

const flowSteps = [
  {
    icon: <Hand className="w-8 h-8 text-primary" />,
    title: "Take Action",
    description: "Engage in daily activities and challenges.",
  },
  {
    icon: <Leaf className="w-8 h-8 text-primary" />,
    title: "Earn Leaf Points",
    description: "Collect points for every action you complete.",
  },
  {
    icon: <Award className="w-8 h-8 text-primary" />,
    title: "Progress & Win",
    description: "Unlock badges and climb the leaderboard.",
  },
  {
    icon: <ShoppingBag className="w-8 h-8 text-primary" />,
    title: "Claim Rewards",
    description: "Redeem your points for exclusive rewards.",
  },
];

export default function JourneyFlow() {
  return (
    <section className="py-12 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-10 font-headline">Your Journey to Rewards</h2>
        <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8">
          {flowSteps.map((step, index) => (
            <React.Fragment key={step.title}>
              <Card className="text-center p-6">
                <CardContent className="p-0">
                  <div className="flex justify-center mb-4">
                    <div className="bg-primary/10 p-4 rounded-full">
                      {step.icon}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 font-headline">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
              {index < flowSteps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 left-0 w-full h-px -translate-y-1/2">
                   <svg width="100%" height="100%" className="text-border">
                        <line x1={`${(index + 0.5) * 25}%`} y1="0" x2={`${(index + 1.5) * 25}%`} y2="0" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" transform="translate(0, 12)" />
                   </svg>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
