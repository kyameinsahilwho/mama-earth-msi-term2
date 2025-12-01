"use client";

import React from "react";
import { useGamification } from "@/context/GamificationContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, Flame, Users, MessageSquare, LogOut, 
  Leaf, Calendar, Award, Star, Copy, CheckCircle 
} from "lucide-react";
import { format } from "date-fns";
import { submitReferralCode } from "@/lib/gamified-service";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function ProfilePage() {
  const { appState, session, logout, addPoints, setAppState } = useGamification();
  const { toast } = useToast();
  const [referralCode, setReferralCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  if (!session || !appState.user) {
    return <div>Loading profile...</div>;
  }

  const user = session.user;
  const metadata = user.user_metadata || {};
  const displayName = metadata.full_name || appState.user.username || "Gardener";
  const email = user.email;
  const avatarUrl = metadata.avatar_url;
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();

  // Calculate level progress (simplified)
  const currentBadge = appState.badges.filter(b => b.unlocked).pop() || appState.badges[0];
  const nextBadge = appState.badges.find(b => !b.unlocked);
  const progressToNext = nextBadge 
    ? ((appState.points - (currentBadge.points || 0)) / (nextBadge.points - (currentBadge.points || 0))) * 100
    : 100;

  const handleReferralSubmit = async () => {
    if (!referralCode.trim()) return;
    if (!appState.user?.id) return;

    setIsSubmitting(true);
    try {
      await submitReferralCode(appState.user.id, referralCode.trim());
      toast({
        title: "Referral Successful!",
        description: "You earned 50 points for being referred.",
      });
      addPoints(50, "Referred by Friend");
      // Update local state to hide input
      setAppState(prev => ({ ...prev, referredBy: "submitted" })); 
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Referral Failed",
        description: error.message || "Could not submit code.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(appState.user?.referralCode || "");
    toast({ title: "Copied!", description: "Referral code copied to clipboard." });
  };

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <Card className="border-none shadow-none bg-transparent">
        <CardContent className="p-0 flex flex-col md:flex-row items-center md:items-start gap-6">
          <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-white shadow-lg">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback className="text-2xl font-bold bg-primary/20 text-primary">{initials}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 text-center md:text-left space-y-2">
            <h1 className="text-3xl font-bold font-headline">{displayName}</h1>
            <p className="text-muted-foreground">{email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
              <Badge variant="secondary" className="px-3 py-1">
                <Trophy className="w-3 h-3 mr-1 text-yellow-600" />
                {currentBadge.name}
              </Badge>
              <Badge variant="outline" className="px-3 py-1 border-orange-200 bg-orange-50 text-orange-700">
                <Flame className="w-3 h-3 mr-1" />
                {appState.streak} Day Streak
              </Badge>
            </div>
          </div>

          <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
            <div className="p-3 bg-green-100 rounded-full text-green-600">
              <Leaf className="w-6 h-6" />
            </div>
            <div className="text-2xl font-bold">{appState.points}</div>
            <div className="text-xs text-muted-foreground uppercase font-bold">Total Points</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
            <div className="p-3 bg-blue-100 rounded-full text-blue-600">
              <Users className="w-6 h-6" />
            </div>
            <div className="text-2xl font-bold">{appState.referrals}</div>
            <div className="text-xs text-muted-foreground uppercase font-bold">Referrals</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
            <div className="p-3 bg-purple-100 rounded-full text-purple-600">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div className="text-2xl font-bold">{appState.feedbackGiven}</div>
            <div className="text-xs text-muted-foreground uppercase font-bold">Feedback</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
            <div className="p-3 bg-yellow-100 rounded-full text-yellow-600">
              <Star className="w-6 h-6" />
            </div>
            <div className="text-2xl font-bold">{appState.badges.filter(b => b.unlocked).length}</div>
            <div className="text-xs text-muted-foreground uppercase font-bold">Badges</div>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Current Level: {currentBadge.name}</span>
            {nextBadge && <span className="text-sm text-muted-foreground font-normal">Next: {nextBadge.name}</span>}
          </CardTitle>
          <CardDescription>Keep earning points to reach the next level!</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Progress value={nextBadge ? (appState.points / nextBadge.points) * 100 : 100} className="h-4" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{appState.points} Points</span>
              {nextBadge && <span>{nextBadge.points} Points Goal</span>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referral Section */}
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Refer a Friend
          </CardTitle>
          <CardDescription>
            Invite friends to join Mamaearth Growth Garden. You get 100 points, they get 50!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Your Code */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Your Referral Code</label>
            <div className="flex gap-2">
              <div className="flex-1 p-3 bg-white border rounded-md font-mono font-bold text-center tracking-wider">
                {appState.user.referralCode || "Generating..."}
              </div>
              <Button variant="outline" onClick={copyReferralCode} className="shrink-0">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Enter Friend's Code */}
          {!appState.referredBy ? (
            <div className="space-y-2 pt-4 border-t border-indigo-100">
              <label className="text-sm font-medium text-muted-foreground">Have a referral code?</label>
              <div className="flex gap-2">
                <Input 
                  placeholder="Enter friend's referral code" 
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  className="bg-white"
                />
                <Button onClick={handleReferralSubmit} disabled={isSubmitting || !referralCode}>
                  {isSubmitting ? "..." : "Redeem"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-md border border-green-100">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">You have already been referred!</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Details */}
      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">User ID</label>
              <div className="p-2 bg-muted rounded text-sm font-mono truncate">{appState.user.id}</div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">Member Since</label>
              <div className="p-2 bg-muted rounded text-sm">
                {session.user.created_at ? format(new Date(session.user.created_at), "MMMM d, yyyy") : "N/A"}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">Last Login</label>
              <div className="p-2 bg-muted rounded text-sm">
                {appState.lastLoginDate ? format(new Date(appState.lastLoginDate), "MMMM d, yyyy h:mm a") : "Just now"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
