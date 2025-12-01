import { supabase } from './supabaseClient';
import { AppState, Badge } from './types';
import { User } from '@supabase/supabase-js';

// --- Types ---
export interface DbProfile {
  id: string;
  auth_id: string | null;
  username: string;
  points: number;
  badges: any; // JSONB
  last_login_date: string | null;
  last_routine_date: string | null;
  routine_count_today: number;
  streak: number;
  quiz_taken: boolean;
  referrals: number;
  feedback_given: number;
}

export interface DbReward {
  id: number;
  name: string;
  points_required: number;
  description: string;
  image_url: string | null;
}

// --- Service Functions ---

/**
 * Get or create a user profile based on Supabase Auth User.
 */
export async function getOrCreateProfile(user: User): Promise<DbProfile | null> {
  // 1. Try to find existing profile by auth_id
  const { data: existing, error: findError } = await supabase
    .from('profiles')
    .select('*')
    .eq('auth_id', user.id)
    .single();

  if (existing) {
    return existing;
  }

  if (findError && findError.code !== 'PGRST116') { // PGRST116 is "not found"
    console.error('Error finding profile:', findError);
    return null;
  }

  // 2. Create new profile if not found
  // Use email or metadata for username/display_name
  const username = user.user_metadata?.full_name || user.email?.split('@')[0] || `user_${user.id.slice(0, 8)}`;
  const avatarUrl = user.user_metadata?.avatar_url || null;

  const { data: newProfile, error: createError } = await supabase
    .from('profiles')
    .insert([{ 
      auth_id: user.id,
      username, 
      display_name: username,
      avatar_url: avatarUrl
    }])
    .select()
    .single();

  if (createError) {
    console.error('Error creating profile:', createError);
    return null;
  }

  return newProfile;
}

/**
 * Update profile fields (generic).
 */
export async function updateProfile(profileId: string, updates: Partial<DbProfile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', profileId)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
  return data;
}

/**
 * Add points to a user and record the transaction.
 */
export async function addPoints(profileId: string, amount: number, reason: string) {
  // 1. Record transaction
  const { error: txError } = await supabase
    .from('points_transactions')
    .insert([{ profile_id: profileId, amount, reason }]);

  if (txError) {
    console.error('Error recording points transaction:', txError);
    // We might still want to proceed or throw, depending on strictness.
  }

  // 2. Update profile points (RPC is better for atomicity, but simple update works for now)
  // We fetch current points first to be safe, or use an RPC increment function.
  // For simplicity here, we'll assume the client state is roughly in sync or just fetch-update.
  // Better approach: Use a Postgres function `increment_points`.
  
  // Let's try a direct update using the current known value from DB to avoid race conditions if possible,
  // but without a custom RPC, we have to read-then-write or trust the client.
  // We will read-then-write.
  
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('points')
    .eq('id', profileId)
    .single();
    
  if (fetchError || !profile) throw new Error("Profile not found for points update");

  const newPoints = profile.points + amount;

  const { data: updatedProfile, error: updateError } = await supabase
    .from('profiles')
    .update({ points: newPoints })
    .eq('id', profileId)
    .select()
    .single();

  if (updateError) throw updateError;
  return updatedProfile;
}

/**
 * Fetch all available rewards.
 */
export async function getRewards(): Promise<DbReward[]> {
  const { data, error } = await supabase
    .from('rewards')
    .select('*')
    .order('points_required', { ascending: true });

  if (error) {
    console.error('Error fetching rewards:', error);
    return [];
  }
  return data || [];
}

/**
 * Redeem a reward.
 */
export async function redeemReward(profileId: string, rewardId: number, cost: number) {
  // 1. Check balance
  const { data: profile } = await supabase
    .from('profiles')
    .select('points')
    .eq('id', profileId)
    .single();

  if (!profile || profile.points < cost) {
    throw new Error("Insufficient points");
  }

  // 2. Deduct points
  const newPoints = profile.points - cost;
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ points: newPoints })
    .eq('id', profileId);

  if (updateError) throw updateError;

  // 3. Record redemption
  const { error: redeemError } = await supabase
    .from('redemptions')
    .insert([{ profile_id: profileId, reward_id: rewardId, status: 'completed' }]);

  if (redeemError) console.error("Error logging redemption:", redeemError);

  return newPoints;
}

/**
 * Fetch leaderboard.
 */
export async function getLeaderboard() {
  const { data, error } = await supabase
    .from('leaderboard') // This is a view
    .select('*')
    .limit(10);

  if (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
  return data;
}

/**
 * Record a spin result.
 */
export async function recordSpin(profileId: string, result: any, pointsAwarded: number, discount: number) {
  const { error } = await supabase
    .from('spins')
    .insert([{ 
      profile_id: profileId, 
      result, 
      points_awarded: pointsAwarded, 
      discount 
    }]);

  if (error) console.error('Error recording spin:', error);
  
  // Also record in points transactions if points were awarded
  if (pointsAwarded > 0) {
    await addPoints(profileId, pointsAwarded, "Daily Spin Win");
  }
}

export interface ActivityLogItem {
  id: string;
  type: 'earned' | 'redeemed' | 'badge';
  title: string;
  description: string;
  date: string;
  points?: number;
}

/**
 * Get a unified timeline of user activity.
 */
export async function getUserActivityLog(profileId: string): Promise<ActivityLogItem[]> {
  const activities: ActivityLogItem[] = [];

  // 1. Points Transactions (Earnings)
  const { data: transactions } = await supabase
    .from('points_transactions')
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false });

  if (transactions) {
    transactions.forEach(tx => {
      activities.push({
        id: `tx-${tx.id}`,
        type: 'earned',
        title: 'Points Earned',
        description: tx.reason || 'Activity',
        date: tx.created_at,
        points: tx.amount
      });
    });
  }

  // 2. Redemptions (Spending)
  const { data: redemptions } = await supabase
    .from('redemptions')
    .select('*, rewards(name)')
    .eq('profile_id', profileId)
    .order('redeemed_at', { ascending: false });

  if (redemptions) {
    redemptions.forEach(r => {
      activities.push({
        id: `red-${r.id}`,
        type: 'redeemed',
        title: 'Reward Redeemed',
        description: r.rewards?.name || 'Unknown Reward',
        date: r.redeemed_at,
        points: 0 // Could fetch cost if needed, but 0 for now
      });
    });
  }

  // 3. Badges
  const { data: badges } = await supabase
    .from('user_badges')
    .select('*, badges(name, description)')
    .eq('profile_id', profileId)
    .order('unlocked_at', { ascending: false });

  if (badges) {
    badges.forEach(b => {
      activities.push({
        id: `bdg-${b.id}`,
        type: 'badge',
        title: 'Badge Unlocked',
        description: b.badges?.name || 'New Badge',
        date: b.unlocked_at || new Date().toISOString(),
      });
    });
  }

  // Sort by date desc
  return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// --- Garden Functions ---

export interface DbPlant {
  id: string;
  profile_id: string;
  name: string;
  seed: string;
  stage: number;
  water_count: number;
  max_water_for_stage: number;
  coupon_code?: string;
  coupon_value?: number;
}

export async function getUserPlants(profileId: string): Promise<DbPlant[]> {
  const { data, error } = await supabase
    .from('user_plants')
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching plants:', error);
    return [];
  }
  return data || [];
}

export async function plantSeed(profileId: string, name: string = "My Plant") {
  const seed = Math.random().toString(36).substring(7); // Random seed
  const { data, error } = await supabase
    .from('user_plants')
    .insert([{ 
      profile_id: profileId, 
      name, 
      seed,
      stage: 1,
      water_count: 0,
      max_water_for_stage: 3 // Needs 3 waters to grow to stage 2
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function waterPlant(plantId: string) {
  // 1. Get current state
  const { data: plant, error: fetchError } = await supabase
    .from('user_plants')
    .select('*')
    .eq('id', plantId)
    .single();

  if (fetchError || !plant) throw new Error("Plant not found");

  if (plant.stage >= 5) return plant; // Fully grown

  let newWaterCount = plant.water_count + 1;
  let newStage = plant.stage;
  let newMaxWater = plant.max_water_for_stage;
  let couponCode = null;
  let couponValue = null;

  // Check for growth
  if (newWaterCount >= plant.max_water_for_stage) {
    newStage += 1;
    newWaterCount = 0;
    newMaxWater = Math.floor(plant.max_water_for_stage * 1.5); // Harder to grow next level
    
    // Check for Bloom (Stage 5)
    if (newStage === 5) {
        // Generate Coupon
        const discountOptions = [5, 10, 15, 20, 25];
        couponValue = discountOptions[Math.floor(Math.random() * discountOptions.length)];
        couponCode = `BLOOM-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${couponValue}`;
    }
  }

  const updates: any = { 
      water_count: newWaterCount, 
      stage: newStage,
      max_water_for_stage: newMaxWater
  };

  if (couponCode) {
      updates.coupon_code = couponCode;
      updates.coupon_value = couponValue;
  }

  const { data: updated, error: updateError } = await supabase
    .from('user_plants')
    .update(updates)
    .eq('id', plantId)
    .select()
    .single();

  if (updateError) throw updateError;
  return updated;
}
