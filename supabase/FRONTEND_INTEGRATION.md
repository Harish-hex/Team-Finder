# Frontend Integration Guide

This guide shows how to integrate the Supabase backend with your existing TeamFinder frontend.

## Setup

1. **Install Supabase Client** (already done in your project)
   ```bash
   npm install @supabase/supabase-js
   ```

2. **Configure Environment Variables**
   
   Update your `.env` file with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

## Code Examples

### 1. Profile Operations (Onboarding)

Replace the mock `AuthService.saveProfile()` with real Supabase calls:

```typescript
// In your onboarding page
import { supabase } from '@/lib/supabase'

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  
  const { error } = await supabase
    .from('profiles')
    .insert({
      user_id: user.id,
      display_name: displayName,
      university: university,
      interests: selectedInterests,
      experience_level: experienceLevel,
      is_mentor: isMentor
    })
  
  if (error) {
    toast.error('Failed to save profile')
  } else {
    toast.success('Profile created!')
    router.push('/')
  }
}
```

### 2. Create Team

Replace the mock team creation with RPC call:

```typescript
// In create team page
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setIsSubmitting(true)
  
  const { data, error } = await supabase.rpc('create_team', {
    p_name: formData.eventName,
    p_description: formData.description,
    p_event_type: formData.eventType,
    p_tech_stack: formData.techStack,
    p_roles_needed: formData.rolesNeeded,
    p_max_members: parseInt(formData.teamSize),
    p_is_beginner_friendly: formData.isBeginnerFriendly,
    p_has_mentor: formData.hasMentor
  })
  
  if (error) {
    toast.error('Failed to create team')
  } else {
    setIsSuccess(true)
    // Optionally show invite code: data.invite_code
    setTimeout(() => router.push('/teams'), 2000)
  }
  
  setIsSubmitting(false)
}
```

### 3. Browse Teams

Replace mock data with real query:

```typescript
// In teams page
const [teams, setTeams] = useState([])

useEffect(() => {
  const fetchTeams = async () => {
    let query = supabase
      .from('teams')
      .select(\`
        *,
        team_members(count)
      \`)
    
    // Apply filters
    if (eventType !== 'all') {
      query = query.eq('event_type', eventType)
    }
    
    if (beginnerFriendly) {
      query = query.eq('is_beginner_friendly', true)
    }
    
    const { data, error } = await query
    
    if (!error) {
      setTeams(data)
    }
  }
  
  fetchTeams()
}, [eventType, beginnerFriendly])
```

### 4. Apply to Team

Replace mock application with RPC call:

```typescript
// In team detail page
const handleSubmitApplication = async (e: React.FormEvent) => {
  e.preventDefault()
  
  const { data, error } = await supabase.rpc('apply_to_team', {
    p_team_id: team.id,
    p_preferred_role: applicationData.role,
    p_experience: applicationData.experience,
    p_message: applicationData.message
  })
  
  if (error || !data.success) {
    toast.error(data?.error || 'Failed to submit application')
  } else {
    setIsSubmitted(true)
    toast.success('Application submitted!')
  }
}
```

### 5. Dashboard - Get My Team

```typescript
// In dashboard/landing page
const [myTeam, setMyTeam] = useState(null)

useEffect(() => {
  const fetchMyTeam = async () => {
    const { data, error } = await supabase.rpc('get_my_team')
    
    if (!error && data && data.length > 0) {
      setMyTeam(data[0])
    }
  }
  
  fetchMyTeam()
}, [])
```

### 6. Dashboard - Get My Applications

```typescript
// In dashboard/landing page
const [myApplications, setMyApplications] = useState([])

useEffect(() => {
  const fetchMyApplications = async () => {
    const { data, error } = await supabase.rpc('get_my_applications')
    
    if (!error) {
      setMyApplications(data)
    }
  }
  
  fetchMyApplications()
}, [])
```

### 7. Invite Link Resolution

Create a new route `/join/[code]/page.tsx`:

```typescript
'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function JoinPage() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string
  
  useEffect(() => {
    const resolveInvite = async () => {
      const { data, error } = await supabase.rpc('get_team_by_invite', {
        p_invite_code: code
      })
      
      if (!error && data && data.length > 0) {
        // Redirect to team detail page
        router.push(\`/teams/\${data[0].team_id}\`)
      } else {
        // Invalid code
        router.push('/teams')
      }
    }
    
    resolveInvite()
  }, [code, router])
  
  return <div>Resolving invite...</div>
}
```

### 8. Get Events Feed

```typescript
// In dashboard/landing page
const [events, setEvents] = useState([])

useEffect(() => {
  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (!error) {
      setEvents(data)
    }
  }
  
  fetchEvents()
}, [])
```

### 9. Approve/Reject Applications (Admin)

```typescript
// In team management page (admin view)
const handleApprove = async (applicationId: string) => {
  const { data, error } = await supabase.rpc('approve_application', {
    p_application_id: applicationId
  })
  
  if (error || !data.success) {
    toast.error(data?.error || 'Failed to approve')
  } else {
    toast.success('Application approved!')
    // Refresh applications list
  }
}

const handleReject = async (applicationId: string) => {
  const { data, error } = await supabase.rpc('reject_application', {
    p_application_id: applicationId
  })
  
  if (error || !data.success) {
    toast.error(data?.error || 'Failed to reject')
  } else {
    toast.success('Application rejected')
    // Refresh applications list
  }
}
```

## Authentication

Your Supabase Auth is already set up. The backend uses `auth.uid()` to identify users, which works automatically with your existing auth setup.

## Next Steps

1. Run the migrations in your Supabase project
2. Replace mock data/functions with the code examples above
3. Test each flow end-to-end
4. Add error handling and loading states as needed
5. Consider adding real-time subscriptions for live updates

## Real-time Updates (Optional)

You can add real-time subscriptions for live data:

```typescript
// Subscribe to team applications
const channel = supabase
  .channel('team_applications')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'team_applications',
      filter: \`team_id=eq.\${teamId}\`
    },
    (payload) => {
      // Handle new/updated applications
      console.log('Application changed:', payload)
    }
  )
  .subscribe()

// Cleanup
return () => {
  supabase.removeChannel(channel)
}
```
