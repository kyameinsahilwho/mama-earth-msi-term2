"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Hand, Leaf, Award, ShoppingBag, ArrowRight } from "lucide-react";

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-stretch">
          {flowSteps.map((step, index) => (
            <div key={step.title} className="flex items-center">
              <div className="flex flex-col items-center flex-grow">
                <Card className="text-center p-6 flex-grow flex flex-col w-full">
                  <CardContent className="p-0 flex flex-col items-center justify-center flex-grow">
                    <div className="flex justify-center mb-4">
                      <div className="bg-primary/10 p-4 rounded-full">
                        {step.icon}
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 font-headline">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              </div>
              {index < flowSteps.length - 1 && (
                <div className="hidden md:flex items-center justify-center h-full mx-4">
                  <ArrowRight className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
