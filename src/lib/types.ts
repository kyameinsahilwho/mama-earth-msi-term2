export type BadgeName = "Seedling" | "Sapling" | "Growing Tree" | "Ancient Banyan";

export interface Badge {
  name: BadgeName;
  points: number;
  unlocked: boolean;
}

export interface AppState {
  points: number;
  badges: Badge[];
  lastLoginDate: string | null;
  lastRoutineDate: string | null;
  routineCountToday: number;
  streak: number;
  quizTaken: boolean;
  referrals: number;
  feedbackGiven: number;
}
