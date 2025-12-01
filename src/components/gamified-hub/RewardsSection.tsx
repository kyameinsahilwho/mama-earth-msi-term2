"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Gift } from "lucide-react";

const rewards = [
  {
    name: "Travel Size Product",
    points: 500,
    description: "Get a free travel-sized version of our best-sellers.",
    imageId: "reward-product",
  },
  {
    name: "Next Order Discount",
    points: 800,
    description: "Enjoy a 15% discount on your next purchase.",
    imageId: "reward-discount",
  },
  {
    name: "VIP Access Bundle",
    points: 1500,
    description: "A curated box of our latest products, just for you.",
    imageId: "reward-bundle",
  },
];

interface RewardsSectionProps {
  userPoints: number;
  redeemReward: (points: number, name: string) => void;
}

export default function RewardsSection({ userPoints, redeemReward }: RewardsSectionProps) {
  return (
    <section className="py-12 md:py-20 bg-primary/5">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-10 font-headline">Redeem Your Rewards</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {rewards.map((reward) => {
            const placeholder = PlaceHolderImages.find(p => p.id === reward.imageId);
            const canRedeem = userPoints >= reward.points;

            return (
              <Card key={reward.name} className="flex flex-col">
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
                    {reward.points} Points
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => redeemReward(reward.points, reward.name)}
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
