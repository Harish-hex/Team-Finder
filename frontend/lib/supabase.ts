import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️  Supabase credentials not found. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        storageKey: 'teamfinder-auth',
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
})

// Database types
export interface Profile {
    id: string
    user_id: string
    display_name: string
    university: string
    interests: string[]
    experience_level: 'Beginner' | 'Intermediate' | 'Advanced'
    is_mentor: boolean
    created_at: string
    updated_at: string
}

export interface Team {
    id: string
    name: string
    description: string
    event_type: 'hackathon' | 'ctf' | 'competition' | 'project'
    tech_stack: string[]
    roles_needed: string[]
    max_members: number
    is_beginner_friendly: boolean
    has_mentor: boolean
    invite_code: string
    created_by: string
    created_at: string
    updated_at: string
}

export interface TeamMember {
    id: string
    team_id: string
    user_id: string
    role: 'admin' | 'member'
    joined_at: string
}

export interface TeamApplication {
    id: string
    team_id: string
    user_id: string
    preferred_role: string
    experience: string
    message: string
    contact_info: string
    status: 'pending' | 'approved' | 'rejected'
    created_at: string
    updated_at: string
}

export interface Event {
    id: string
    title: string
    description: string
    created_by: string
    created_at: string
}
