import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  // In Next.js the NEXT_PUBLIC_* vars are available on both client and server runtime
  // but fail early during development if missing.
  // We avoid throwing to keep hot reload smooth, but log an explicit message.
  // Consumers should still handle missing client if needed.
  // eslint-disable-next-line no-console
  console.warn("Supabase environment variables are not set: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");

// Helper typed wrappers can be added here when models are defined.
export default supabase;
