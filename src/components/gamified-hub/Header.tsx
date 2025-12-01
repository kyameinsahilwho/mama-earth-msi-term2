"use client";
import { Leaf } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  points: number;
}

export default function Header({ points }: HeaderProps) {
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
        <Badge variant="outline" className="text-base px-4 py-2 border-primary/50 bg-primary/10">
          <Leaf className="w-4 h-4 mr-2 text-primary" />
          <span className="font-bold text-primary">{points}</span>
        </Badge>
      </div>
    </header>
  );
}
