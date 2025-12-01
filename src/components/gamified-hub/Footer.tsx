"use client";

import { Leaf } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-primary/10 text-primary-foreground py-6">
      <div className="container mx-auto px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Leaf className="w-5 h-5 text-primary" />
          <p className="font-bold text-lg text-primary font-headline">Mamaearth Growth Garden</p>
        </div>
        <p className="text-sm text-muted-foreground">
          Made for academic project use only.
        </p>
        <p className="text-xs text-muted-foreground/80 mt-1">
          © {new Date().getFullYear()} All rights reserved.
        </p>
      </div>
    </footer>
  );
}
