"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { useMemo } from "react";

const fakeUsers = [
  { name: "GreenQueen", points: 1250 },
  { name: "EcoWarrior", points: 980 },
  { name: "OrganicGlow", points: 720 },
  { name: "SkinSavvy", points: 450 },
  { name: "NatureLover", points: 210 },
];

interface LeaderboardProps {
  userPoints: number;
}

export default function Leaderboard({ userPoints }: LeaderboardProps) {
  const sortedUsers = useMemo(() => {
    const allUsers = [...fakeUsers, { name: "You", points: userPoints }];
    return allUsers.sort((a, b) => b.points - a.points);
  }, [userPoints]);

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
            {sortedUsers.map((user, index) => (
              <TableRow
                key={user.name}
                className={user.name === "You" ? "bg-accent" : ""}
              >
                <TableCell className="font-medium text-center">
                  {index === 0 ? <Trophy className="w-5 h-5 text-yellow-500 inline"/> : index + 1}
                </TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell className="text-right">{user.points}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
