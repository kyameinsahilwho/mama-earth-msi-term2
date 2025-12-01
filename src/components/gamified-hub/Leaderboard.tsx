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
                className={user.username === "You" ? "bg-accent" : ""} // "You" logic needs real auth check
              >
                <TableCell className="font-medium text-center">
                  {index === 0 ? <Trophy className="w-5 h-5 text-yellow-500 inline"/> : index + 1}
                </TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell className="text-right">{user.points}</TableCell>
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
