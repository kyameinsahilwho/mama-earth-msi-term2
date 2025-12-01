"use client";

import React from "react";
import Header from "@/components/gamified-hub/Header";
import Navigation from "@/components/layout/Navigation";
import AuthOverlay from "@/components/auth/AuthOverlay";
import { useGamification } from "@/context/GamificationContext";
import { AnimatePresence, motion } from "framer-motion";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { appState, session, isLoading, logout } = useGamification();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary border-r-transparent"></div>
      </div>
    );
  }

  if (!session) {
    return <AuthOverlay />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background font-body">
      <Header points={appState.points} user={session?.user} onLogout={logout} />
      <div className="flex flex-1">
        <Navigation />
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-6xl mx-auto"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
