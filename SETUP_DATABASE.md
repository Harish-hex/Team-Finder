# Database Setup Guide

## ⚠️ CRITICAL: Run Migrations First!

Before the app will work, you MUST run the SQL migrations in your Supabase database.

### Step 1: Open Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project: `inefmtonhhvttbqkukyn`
3. Click on "SQL Editor" in the left sidebar

### Step 2: Run Each Migration File

Run these files **in order** from `supabase/migrations/`:

1. `001_create_profiles_table.sql`
2. `002_create_teams_table.sql`
3. `003_create_team_members_table.sql`
4. `004_create_team_applications_table.sql`
5. `005_create_events_table.sql`
6. `006_create_team_function.sql`
7. `007_application_functions.sql`
8. `008_helper_functions.sql`

**How to run:**
- Copy the entire contents of each file
- Paste into the SQL Editor
- Click "Run" button
- Wait for success message
- Move to next file

### Step 3: Verify Tables Created

In Supabase Dashboard:
1. Click "Table Editor" in left sidebar
2. You should see these tables:
   - profiles
   - teams
   - team_members
   - team_applications
   - events

### Step 4: Test the App

Now you can test:
1. Login with .edu email → receive OTP
2. Verify OTP → should redirect to onboarding (first time) or landing page (returning user)
3. Create profile → should save to `profiles` table
4. Create team → should save to `teams` table and appear in teams list

---

## Quick Migration Script (Alternative)

If you have Supabase CLI installed:

```bash
s
supabase db push
```

This will automatically run all migrations.
