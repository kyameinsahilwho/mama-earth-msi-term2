"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Leaf, Gift, Trophy, Calendar, Circle } from "lucide-react";
import { getUserActivityLog, ActivityLogItem } from "@/lib/gamified-service";
import { useGamification } from "@/context/GamificationContext";
import { format } from "date-fns";

export default function JourneyTimeline() {
  const { appState } = useGamification();
  const [activities, setActivities] = useState<ActivityLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (appState.user?.id) {
      getUserActivityLog(appState.user.id).then(data => {
        setActivities(data);
        setLoading(false);
      });
    }
  }, [appState.user?.id, appState.points]); // Refresh when points change

  if (loading) {
    return <div className="text-center py-10">Loading your journey...</div>;
  }

  if (activities.length === 0) {
    return (
      <Card className="text-center py-10">
        <CardContent>
          <p className="text-muted-foreground">Your journey hasn't started yet. Start earning points!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative border-l-4 border-primary/20 ml-4 md:ml-8 space-y-8 py-4">
      {activities.map((item, index) => (
        <div key={item.id} className="relative pl-8 md:pl-12">
          {/* Timeline Dot */}
          <div className="absolute -left-[11px] top-1 bg-background rounded-full border-4 border-primary w-6 h-6 flex items-center justify-center">
             {/* Inner dot handled by border */}
          </div>

          <Card className="mb-4 transform transition-all hover:translate-x-2 hover:shadow-neo-sm">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  {item.type === 'earned' && <Leaf className="w-5 h-5 text-green-600" />}
                  {item.type === 'redeemed' && <Gift className="w-5 h-5 text-purple-600" />}
                  {item.type === 'badge' && <Trophy className="w-5 h-5 text-yellow-600" />}
                  <CardTitle className="text-lg font-bold">{item.title}</CardTitle>
                </div>
                <span className="text-xs text-muted-foreground font-mono">
                  {format(new Date(item.date), "MMM d, yyyy h:mm a")}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
              {item.points !== undefined && item.points !== 0 && (
                <Badge variant={item.type === 'earned' ? "default" : "secondary"} className="font-bold">
                  {item.type === 'earned' ? '+' : '-'}{Math.abs(item.points)} Points
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
