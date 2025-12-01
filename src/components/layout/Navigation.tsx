"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Gift, Trophy, RotateCw, Map, Leaf, Sprout } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const navItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Earn", href: "/earn", icon: Leaf },
  { name: "Garden", href: "/garden", icon: Sprout },
  { name: "Rewards", href: "/rewards", icon: Gift },
  { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { name: "Journey", href: "/journey", icon: Map },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r-2 border-black bg-background h-[calc(100vh-65px)] sticky top-[65px]">
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-md border-2 border-transparent transition-all font-bold",
                    isActive
                      ? "bg-primary text-primary-foreground border-black shadow-neo-sm"
                      : "hover:bg-accent hover:border-black hover:shadow-neo-sm"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </motion.div>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t-2 border-black z-50 px-4 py-2 flex justify-between items-center shadow-[0_-4px_0px_0px_rgba(0,0,0,0.1)]">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center p-2">
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={cn(
                  "p-2 rounded-full transition-colors",
                  isActive ? "bg-primary text-primary-foreground border-2 border-black" : "text-muted-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
              </motion.div>
              <span className={cn("text-[10px] font-bold mt-1", isActive ? "text-primary" : "text-muted-foreground")}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
