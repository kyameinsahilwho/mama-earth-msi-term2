export type BadgeName = "Seedling" | "Sapling" | "Growing Tree" | "Ancient Banyan";

export interface Badge {
  name: BadgeName;
  points: number;
  unlocked: boolean;
}

export interface UserProfile {
  id: string;
  username: string;
  referralCode?: string;
}

export interface AppState {
  user?: UserProfile; // Added user profile
  points: number;
  badges: Badge[];
  lastLoginDate: string | null;
  lastRoutineDate: string | null;
  routineCountToday: number;
  streak: number;
  quizzesTakenToday: number;
  referrals: number;
  referredBy?: string | null; // ID of the user who referred this user
  feedbackGiven: number;
}
