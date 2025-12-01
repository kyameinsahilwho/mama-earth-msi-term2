"use client";
import { Leaf, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  points: number;
  onLogout?: () => void;
}

export default function Header({ points, onLogout }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Leaf className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-primary-dark font-headline">
              Mamaearth Growth Garden
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">
              Earn Leaf Points • Win Rewards • Glow Together
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-base px-4 py-2 border-primary/50 bg-primary/10">
            <Leaf className="w-4 h-4 mr-2 text-primary" />
            <span className="font-bold text-primary">{points}</span>
          </Badge>
          {onLogout && (
            <Button variant="ghost" size="icon" onClick={onLogout} title="Sign Out">
              <LogOut className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
