# Supabase setup for MamaEarth gamified app

This document explains how to wire Supabase into the project and create the database tables required by the gamified features.

Environment variables
- `NEXT_PUBLIC_SUPABASE_URL`: your Supabase project URL (example provided by you)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: anon public key for client usage (example provided by you)

Important note about keys
- The anon key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) is safe for client usage but cannot run migrations or create tables.
- To create tables you need to use the Supabase SQL editor (recommended) or the Supabase CLI with a `service_role` key (admin privileges).

Quick options to create the schema

1) Supabase SQL editor (recommended)
- Open your Supabase project in the browser.
- Go to "SQL" → "New query" and paste the contents of `db/schema.sql`.
- Run the query. This will create the tables and seed basic badges and rewards.

2) Supabase CLI (service role key required)
- Install Supabase CLI and authenticate: `supabase login`
- Run the SQL file (replace project ref or use `--project-ref`):

```powershell
supabase db query --file db/schema.sql --project-ref fdgcezeruaozujeykcwv
```

Note: the CLI may require a service role key; be careful to not commit that key to source control.

Adding the client in the app
- The helper client is at `src/lib/supabaseClient.ts` and uses the `NEXT_PUBLIC_` variables.
- Example usage in a React component (client side):

```tsx
import { supabase } from '@/lib/supabaseClient';

const { data, error } = await supabase.from('profiles').select('*').limit(10);
```

Server-side operations
- For server-side operations that require elevated privileges (for example, creating admin-only records or using RLS bypass), use the `service_role` key on a secure server environment and never expose it to clients.

Next steps you may want me to take
- Add server-side API routes to create/update profiles, record points transactions, and handle redemptions.
- Wire the client components to read/write from Supabase.

If you'd like, I can now:
- Add API routes for `points` updates, `redeem` endpoints, and `spin` recording, and wire the client calls.
- Or I can run through the SQL in your Supabase project if you provide a service role key (not recommended to paste here). 
