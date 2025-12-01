"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Leaf, Gift, Trophy, Calendar, Droplets, RotateCw, 
  BrainCircuit, Users, ShoppingBag, Star 
} from "lucide-react";
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
  }, [appState.user?.id, appState.points]);

  const getIcon = (item: ActivityLogItem) => {
    const text = (item.title + item.description).toLowerCase();
    
    if (item.type === 'redeemed') return <ShoppingBag className="w-5 h-5 text-purple-600" />;
    if (item.type === 'badge') return <Trophy className="w-5 h-5 text-yellow-600" />;
    
    if (text.includes('water')) return <Droplets className="w-5 h-5 text-blue-500" />;
    if (text.includes('spin')) return <RotateCw className="w-5 h-5 text-orange-500" />;
    if (text.includes('quiz')) return <BrainCircuit className="w-5 h-5 text-pink-500" />;
    if (text.includes('referral')) return <Users className="w-5 h-5 text-indigo-500" />;
    if (text.includes('login') || text.includes('daily')) return <Calendar className="w-5 h-5 text-green-500" />;
    
    return <Leaf className="w-5 h-5 text-green-600" />;
  };

  // Group consecutive watering actions
  const groupedActivities = React.useMemo(() => {
    if (!activities.length) return [];
    
    const grouped: ActivityLogItem[] = [];
    let currentGroup: ActivityLogItem | null = null;
    let count = 1;

    for (let i = 0; i < activities.length; i++) {
      const item = activities[i];
      const isWatering = item.title === "Watering Plant" || item.description.includes("Watering Plant");
      
      if (isWatering) {
        if (currentGroup && (currentGroup.title === "Watering Plant" || currentGroup.description.includes("Watering Plant"))) {
          count++;
          // Update the current group's description or title to reflect count
          // We'll do this when pushing the group
        } else {
          if (currentGroup) {
             // Push previous group
             if (count > 1) {
                 currentGroup.title = `${currentGroup.title} (x${count})`;
             }
             grouped.push(currentGroup);
          }
          // Start new group
          currentGroup = { ...item };
          count = 1;
        }
      } else {
        if (currentGroup) {
           if (count > 1) {
               currentGroup.title = `${currentGroup.title} (x${count})`;
           }
           grouped.push(currentGroup);
           currentGroup = null;
           count = 1;
        }
        grouped.push(item);
      }
    }
    
    // Push last group
    if (currentGroup) {
        if (count > 1) {
            currentGroup.title = `${currentGroup.title} (x${count})`;
        }
        grouped.push(currentGroup);
    }

    return grouped;
  }, [activities]);

  if (loading) {
    return <div className="text-center py-10 text-muted-foreground">Loading your journey...</div>;
  }

  if (groupedActivities.length === 0) {
    return (
      <div className="text-center py-10 border-2 border-dashed rounded-lg">
        <p className="text-muted-foreground">Your journey hasn't started yet. Start earning points!</p>
      </div>
    );
  }

  return (
    <div className="relative border-l-2 border-primary/20 ml-4 md:ml-6 space-y-6 py-2">
      {groupedActivities.map((item) => (
        <div key={item.id} className="relative pl-6 md:pl-8 group">
          {/* Timeline Dot */}
          <div className="absolute -left-[9px] top-3 bg-background rounded-full border-2 border-primary w-4 h-4 flex items-center justify-center group-hover:scale-110 transition-transform">
             <div className="w-2 h-2 bg-primary rounded-full" />
          </div>

          <Card className="overflow-hidden transition-all hover:shadow-md border-l-4 border-l-primary/40">
            <CardContent className="p-4 flex items-start gap-4">
              <div className="mt-1 bg-primary/10 p-2 rounded-full shrink-0">
                {getIcon(item)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-semibold text-base truncate pr-2">{item.title}</h4>
                  <span className="text-xs text-muted-foreground whitespace-nowrap font-mono mt-1">
                    {format(new Date(item.date), "MMM d, h:mm a")}
                  </span>
                </div>
                
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                
                {/* Only show points if they exist and are not 0 */}
                {item.points && item.points !== 0 ? (
                  <div className="mt-3 flex items-center">
                    <Badge variant={item.type === 'earned' ? "default" : "secondary"} className="font-bold text-xs px-2 py-0.5 h-6">
                      {item.type === 'earned' ? '+' : ''}{item.points} Points
                    </Badge>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
