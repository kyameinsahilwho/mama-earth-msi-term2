"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Gift } from "lucide-react";
import { getRewards, DbReward } from "@/lib/gamified-service";

interface RewardsSectionProps {
  userPoints: number;
  redeemReward: (points: number, name: string) => void;
}

export default function RewardsSection({ userPoints, redeemReward }: RewardsSectionProps) {
  const [rewards, setRewards] = useState<DbReward[]>([]);

  useEffect(() => {
    getRewards().then(setRewards);
  }, []);

  // Fallback if DB is empty or loading
  if (rewards.length === 0) {
     // You might want a loading state here, or just show nothing
     // For now, let's show the hardcoded ones if DB returns empty to avoid breaking UI during transition
     // But actually, the DB seed should have populated them.
  }

  return (
    <section className="py-12 md:py-20 bg-primary/5">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-10 font-headline">Redeem Your Rewards</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {rewards.map((reward) => {
            // Map DB reward to placeholder image based on name or ID logic
            // For this demo, we'll try to match by name or just pick one
            let imageId = "reward-product";
            if (reward.name.includes("Discount")) imageId = "reward-discount";
            if (reward.name.includes("Bundle")) imageId = "reward-bundle";

            const placeholder = PlaceHolderImages.find(p => p.id === imageId);
            const canRedeem = userPoints >= reward.points_required;

            return (
              <Card key={reward.id} className="flex flex-col">
                <CardHeader>
                  {placeholder && (
                    <div className="aspect-square relative w-full mb-4 rounded-md overflow-hidden">
                       <Image
                          src={placeholder.imageUrl}
                          alt={reward.name}
                          fill
                          data-ai-hint={placeholder.imageHint}
                          className="object-cover"
                        />
                    </div>
                  )}
                  <CardTitle className="font-headline">{reward.name}</CardTitle>
                  <CardDescription>{reward.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-lg font-bold text-primary">
                    <Gift className="inline-block w-5 h-5 mr-2" />
                    {reward.points_required} Points
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => redeemReward(reward.points_required, reward.name)}
                    disabled={!canRedeem}
                    className="w-full"
                  >
                    {canRedeem ? "Redeem" : "Not Enough Points"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
