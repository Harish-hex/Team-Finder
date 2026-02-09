# TeamFinder Backend - Supabase Setup

This directory contains SQL migrations for the TeamFinder backend database.

## Database Schema

The backend consists of 5 main tables:

1. **profiles** - User profile information from onboarding
2. **teams** - Team information and metadata
3. **team_members** - Team membership tracking
4. **team_applications** - Join requests and application management
5. **events** - Dashboard announcements (admin-created)

## Running Migrations

### Option 1: Supabase CLI (Recommended)

If you have Supabase CLI installed:

```bash
# Initialize Supabase project (first time only)
supabase init

# Link to your Supabase project
supabase link --project-ref your-project-ref

# Run all migrations
supabase db push
```

### Option 2: Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run each migration file in order (001 through 008)

### Option 3: Direct psql

```bash
# Set your database URL
export DATABASE_URL="postgresql://postgres:[password]@[host]:5432/postgres"

# Run migrations in order
psql $DATABASE_URL -f supabase/migrations/001_create_profiles_table.sql
psql $DATABASE_URL -f supabase/migrations/002_create_teams_table.sql
psql $DATABASE_URL -f supabase/migrations/003_create_team_members_table.sql
psql $DATABASE_URL -f supabase/migrations/004_create_team_applications_table.sql
psql $DATABASE_URL -f supabase/migrations/005_create_events_table.sql
psql $DATABASE_URL -f supabase/migrations/006_create_team_function.sql
psql $DATABASE_URL -f supabase/migrations/007_application_functions.sql
psql $DATABASE_URL -f supabase/migrations/008_helper_functions.sql
```

## Available RPC Functions

### Team Operations

- **`create_team(...)`** - Create a new team with invite code
  - Returns: `{success, team_id, invite_code}`

### Application Flow

- **`apply_to_team(team_id, preferred_role, experience, message)`** - Submit application
  - Returns: `{success}` or `{success: false, error}`

- **`approve_application(application_id)`** - Approve pending application (admin only)
  - Returns: `{success}` or `{success: false, error}`

- **`reject_application(application_id)`** - Reject pending application (admin only)
  - Returns: `{success}` or `{success: false, error}`

### Query Functions

- **`get_my_team()`** - Get current user's team info
- **`get_team_by_invite(invite_code)`** - Resolve invite code to team details
- **`get_my_applications()`** - Get user's application history
- **`get_team_applications(team_id)`** - Get applications for a team (admin only)
- **`get_team_members_with_profiles(team_id)`** - Get team members with profile data

## Row Level Security (RLS)

All tables have RLS enabled with the following policies:

- **profiles**: Users can only read/write their own profile
- **teams**: All authenticated users can read; only creators can update/delete
- **team_members**: All can read; system functions handle inserts
- **team_applications**: Users see own applications; admins see team applications
- **events**: All can read; only admins can create

## Admin Configuration

To add admin users for event creation, edit `005_create_events_table.sql` and add emails to the admin list:

```sql
CREATE POLICY "Admins can create events"
  ON events
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.jwt() ->> 'email' IN (
      'admin@example.edu',
      'your-admin-email@example.edu'
    )
  );
```

## Testing

After running migrations, verify:

1. All tables exist in Supabase Table Editor
2. RLS is enabled on all tables
3. Test creating a profile, team, and application via SQL Editor
4. Verify invite code generation works

## Frontend Integration

See the implementation plan for detailed frontend integration points. Key operations:

- **Onboarding**: `INSERT INTO profiles` after form submission
- **Create Team**: Call RPC `create_team(...)`
- **Apply to Team**: Call RPC `apply_to_team(...)`
- **Dashboard**: Call `get_my_team()` and `get_my_applications()`
- **Invite Links**: Call `get_team_by_invite(code)` then redirect to `/teams/:id`
