"use client";

import { Award, ShieldCheck, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Badge as BadgeType } from "@/lib/types";

const badgeIcons: { [key: string]: React.ReactNode } = {
  Seedling: <Star className="h-8 w-8" />,
  Sapling: <Award className="h-8 w-8" />,
  "Growing Tree": <ShieldCheck className="h-8 w-8" />,
  "Ancient Banyan": (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-tree-pine"><path d="M12 10v12"/><path d="M17 8.5c.66-.5 1-1.21 1-2a2 2 0 0 0-4 0c0 .79.34 1.5.99 2"/><path d="M17 14c2 0 3-1 3-3 0-1.66-1.34-3-3-3s-3 1.34-3 3c0 2 1 3 3 3z"/><path d="M7 8.5c-.66-.5-1-1.21-1-2a2 2 0 1 1 4 0c0 .79-.34 1.5-1 2"/><path d="M7 14c-2 0-3-1-3-3 0-1.66 1.34-3 3-3s3 1.34 3 3c0 2-1 3-3 3z"/></svg>
  ),
};

const badgeColors = {
  unlocked: "bg-primary/10 text-primary-foreground border-primary/20",
  locked: "bg-muted text-muted-foreground border-border",
};

interface AchievementBadgesProps {
  badges: BadgeType[];
}

export default function AchievementBadges({ badges }: AchievementBadgesProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {badges.map((badge) => (
        <Card
          key={badge.name}
          className={`text-center transition-all duration-300 transform hover:scale-105 ${
            badge.unlocked ? badgeColors.unlocked : badgeColors.locked
          }`}
        >
          <CardHeader className="items-center pb-2">
            <div
              className={`p-4 rounded-full mb-2 ${
                badge.unlocked ? "bg-accent" : "bg-muted-foreground/20"
              }`}
            >
              {badgeIcons[badge.name]}
            </div>
            <CardTitle className="text-base font-semibold">{badge.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {badge.unlocked ? "Unlocked!" : `Reach ${badge.points} points`}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
