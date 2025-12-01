"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { getLeaderboard } from "@/lib/gamified-service";

interface LeaderboardUser {
  username: string;
  points: number;
}

interface LeaderboardProps {
  userPoints: number;
}

export default function Leaderboard({ userPoints }: LeaderboardProps) {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);

  useEffect(() => {
    getLeaderboard().then((data: any[]) => {
      // Map DB response to local shape
      const mapped = data.map(u => ({
        username: u.username || "Anonymous",
        points: u.points
      }));
      setUsers(mapped);
    });
  }, [userPoints]); // Refresh when user points change (optional, but good for immediate feedback)

  // Merge current user if not in top list (optional logic, for now just show top list)
  // Or highlight current user if they are in the list.
  // For simplicity, we'll just show the fetched leaderboard.
  
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Rank</TableHead>
              <TableHead>User</TableHead>
              <TableHead className="text-right">Points</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user, index) => (
              <TableRow
                key={index}
                className={`${user.username === "You" ? "bg-accent" : ""} ${index < 3 ? "relative overflow-hidden" : ""}`}
              >
                <TableCell className="font-medium text-center relative">
                  {index === 0 && <Trophy className="w-5 h-5 text-yellow-500 inline relative z-10 drop-shadow-md" />}
                  {index === 1 && <Trophy className="w-5 h-5 text-gray-400 inline relative z-10" />}
                  {index === 2 && <Trophy className="w-5 h-5 text-amber-700 inline relative z-10" />}
                  {index > 2 && index + 1}
                  
                  {/* Golden Shine Effect for Top 3 */}
                  {index < 3 && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 animate-shine pointer-events-none" />
                  )}
                </TableCell>
                <TableCell className="font-bold">{user.username}</TableCell>
                <TableCell className="text-right font-mono">{user.points}</TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  Loading leaderboard...
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
