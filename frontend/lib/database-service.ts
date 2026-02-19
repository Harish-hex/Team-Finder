import { supabase, Profile, Team, TeamApplication, Event } from './supabase'

export interface UserProfile {
    email: string
    isVerified: boolean
    profile?: {
        displayName: string
        university: string
        interests: string[]
        experienceLevel: 'Beginner' | 'Intermediate' | 'Advanced'
        isMentor: boolean
    }
}

/**
 * Database service for TeamFinder
 * Replaces the mock AuthService with real Supabase operations
 */
export const DatabaseService = {
    // ============ PROFILE OPERATIONS ============

    /**
     * Get current user's profile
     */
    async getProfile(): Promise<Profile | null> {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return null

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single()

        if (error) {
            console.error('Error fetching profile:', error)
            return null
        }

        return data
    },

    /**
     * Create or update user profile (onboarding)
     */
    async saveProfile(profileData: {
        displayName: string
        university: string
        interests: string[]
        experienceLevel: 'Beginner' | 'Intermediate' | 'Advanced'
        isMentor: boolean
    }): Promise<{ success: boolean; error?: string }> {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return { success: false, error: 'Not authenticated' }
        }

        const { error } = await supabase
            .from('profiles')
            .upsert({
                user_id: user.id,
                display_name: profileData.displayName,
                university: profileData.university,
                interests: profileData.interests,
                experience_level: profileData.experienceLevel,
                is_mentor: profileData.isMentor,
                updated_at: new Date().toISOString()
            })

        if (error) {
            console.error('Error saving profile:', error)
            return { success: false, error: error.message }
        }

        return { success: true }
    },

    /**
     * Create a new team
     */
    async createTeam(teamData: {
        name: string
        description: string
        eventType: string
        techStack: string[]
        rolesNeeded: string[]
        teamSize: number
        isBeginnerFriendly: boolean
        hasMentor: boolean
    }): Promise<{ success: boolean; teamId?: string; inviteCode?: string; error?: string }> {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return { success: false, error: 'Not authenticated' }
        }

        // Generate invite code
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
        let inviteCode = ''
        for (let i = 0; i < 8; i++) {
            inviteCode += chars.charAt(Math.floor(Math.random() * chars.length))
        }

        // Create team with direct insert
        const { data: team, error: teamError } = await supabase
            .from('teams')
            .insert({
                name: teamData.name,
                description: teamData.description,
                event_type: teamData.eventType,
                tech_stack: teamData.techStack,
                roles_needed: teamData.rolesNeeded,
                max_members: teamData.teamSize,
                is_beginner_friendly: teamData.isBeginnerFriendly,
                has_mentor: teamData.hasMentor,
                invite_code: inviteCode,
                created_by: user.id
            })
            .select()
            .single()

        if (teamError) {
            console.error('Error creating team:', teamError)
            return { success: false, error: teamError.message }
        }

        // Add creator as admin member
        const { error: memberError } = await supabase
            .from('team_members')
            .insert({
                team_id: team.id,
                user_id: user.id,
                role: 'admin'
            })

        if (memberError) {
            console.error('Error adding team member:', memberError)
            // Team was created, but member add failed - still return success
        }

        return {
            success: true,
            teamId: team.id,
            inviteCode: inviteCode
        }
    },

    /**
     * Get all teams with optional filters
     */
    async getTeams(filters?: {
        eventType?: string
        techStack?: string[]
        roles?: string[]
        beginnerFriendly?: boolean
    }): Promise<Team[]> {
        let query = supabase
            .from('teams')
            .select('*')

        if (filters?.eventType && filters.eventType !== 'all') {
            query = query.eq('event_type', filters.eventType)
        }

        if (filters?.beginnerFriendly) {
            query = query.eq('is_beginner_friendly', true)
        }

        const { data, error } = await query.order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching teams:', error)
            return []
        }

        return data || []
    },

    /**
     * Get team by ID with members count
     */
    async getTeamById(teamId: string): Promise<Team | null> {
        const { data, error } = await supabase
            .from('teams')
            .select('*')
            .eq('id', teamId)
            .single()

        if (error) {
            console.error('Error fetching team:', error)
            return null
        }

        return data
    },

    /**
     * Get team members with profiles
     */
    async getTeamMembers(teamId: string) {
        const { data, error } = await supabase.rpc('get_team_members_with_profiles', {
            p_team_id: teamId
        })

        if (error) {
            console.error('Error fetching team members:', error)
            return []
        }

        return data || []
    },

    /**
     * Resolve invite code to team
     */
    async getTeamByInvite(inviteCode: string) {
        const { data, error } = await supabase.rpc('get_team_by_invite', {
            p_invite_code: inviteCode
        })

        if (error || !data || data.length === 0) {
            return null
        }

        return data[0]
    },

    // ============ APPLICATION OPERATIONS ============

    /**
     * Submit application to join a team
     */
    async applyToTeam(applicationData: {
        teamId: string
        preferredRole: string
        experience: string
        message: string
        contactInfo: string
    }): Promise<{ success: boolean; error?: string }> {
        const { data, error } = await supabase.rpc('apply_to_team', {
            p_team_id: applicationData.teamId,
            p_preferred_role: applicationData.preferredRole,
            p_experience: applicationData.experience,
            p_message: applicationData.message,
            p_contact_info: applicationData.contactInfo
        })

        if (error) {
            console.error('Error applying to team:', error)
            return { success: false, error: error.message }
        }

        if (!data.success) {
            return { success: false, error: data.error }
        }

        return { success: true }
    },

    /**
     * Get user's applications
     */
    async getMyApplications() {
        const { data, error } = await supabase.rpc('get_my_applications')

        if (error) {
            console.error('Error fetching applications:', error)
            return []
        }

        return data || []
    },

    /**
     * Get applications for a team (admin only)
     * Uses RPC function that JOINs profiles server-side (bypasses RLS)
     * Falls back to direct query if RPC fails
     */
    async getTeamApplications(teamId: string) {
        // Try RPC first (preferred - bypasses RLS for profile data)
        const { data, error } = await supabase.rpc('get_team_applications', {
            p_team_id: teamId
        })

        if (!error && data) {
            // Map RPC response fields to match what the UI expects
            return (data || []).map((app: any) => ({
                id: app.application_id,
                user_id: app.user_id,
                preferred_role: app.preferred_role,
                experience: app.experience,
                message: app.message,
                status: app.status,
                created_at: app.created_at,
                display_name: app.user_name || 'Unknown User',
                university: app.user_university || 'Unknown',
                experience_level: app.user_experience_level,
                contact_info: app.contact_info || ''
            }))
        }

        // RPC failed - log details and fall back to direct query
        console.error('RPC get_team_applications failed:', error?.message, error?.code, error?.details, error?.hint)

        // Fallback: direct query approach
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return []

        const { data: applications, error: appError } = await supabase
            .from('team_applications')
            .select('*')
            .eq('team_id', teamId)
            .order('created_at', { ascending: false })

        if (appError || !applications) {
            console.error('Fallback query also failed:', appError)
            return []
        }

        // Try to get profiles (may fail due to RLS, but we handle gracefully)
        const userIds = applications.map(app => app.user_id)
        const { data: profiles } = await supabase
            .from('profiles')
            .select('user_id, display_name, university')
            .in('user_id', userIds)

        return applications.map(app => {
            const profile = profiles?.find(p => p.user_id === app.user_id)
            return {
                ...app,
                display_name: profile?.display_name || 'Unknown User',
                university: profile?.university || 'Unknown',
                contact_info: app.contact_info || ''
            }
        })
    },

    /**
     * Approve application (admin only)
     */
    async approveApplication(applicationId: string): Promise<{ success: boolean; error?: string }> {
        const { data, error } = await supabase.rpc('approve_application', {
            p_application_id: applicationId
        })

        if (error) {
            return { success: false, error: error.message }
        }

        if (!data.success) {
            return { success: false, error: data.error }
        }

        return { success: true }
    },

    /**
     * Reject application (admin only)
     */
    async rejectApplication(applicationId: string): Promise<{ success: boolean; error?: string }> {
        const { data, error } = await supabase.rpc('reject_application', {
            p_application_id: applicationId
        })

        if (error) {
            return { success: false, error: error.message }
        }

        if (!data.success) {
            return { success: false, error: data.error }
        }

        return { success: true }
    },

    // ============ DASHBOARD OPERATIONS ============

    /**
     * Get user's current team
     */
    async getMyTeam() {
        const { data, error } = await supabase.rpc('get_my_team')

        if (error) {
            console.error('Error fetching my team:', error)
            return null
        }

        if (!data || data.length === 0) {
            return null
        }

        return data[0]
    },

    /**
     * Get events feed for dashboard
     */
    async getEvents(limit: number = 10): Promise<Event[]> {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit)

        if (error) {
            console.error('Error fetching events:', error)
            return []
        }

        return data || []
    },

    /**
     * Create event (admin only)
     */
    async createEvent(eventData: {
        title: string
        description: string
    }): Promise<{ success: boolean; error?: string }> {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return { success: false, error: 'Not authenticated' }
        }

        const { error } = await supabase
            .from('events')
            .insert({
                title: eventData.title,
                description: eventData.description,
                created_by: user.id
            })

        if (error) {
            console.error('Error creating event:', error)
            return { success: false, error: error.message }
        }

        return { success: true }
    },

    // ============ TEAM MANAGEMENT OPERATIONS ============

    /**
     * Delete a team (owner only)
     */
    async deleteTeam(teamId: string): Promise<{ success: boolean; error?: string }> {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return { success: false, error: 'Not authenticated' }
        }

        // Verify user is the team owner
        const { data: team, error: fetchError } = await supabase
            .from('teams')
            .select('created_by')
            .eq('id', teamId)
            .single()

        if (fetchError || !team) {
            return { success: false, error: 'Team not found' }
        }

        if (team.created_by !== user.id) {
            return { success: false, error: 'Only the team owner can delete this team' }
        }

        // Delete team applications first (foreign key constraint)
        await supabase
            .from('team_applications')
            .delete()
            .eq('team_id', teamId)

        // Delete team members (foreign key constraint)
        await supabase
            .from('team_members')
            .delete()
            .eq('team_id', teamId)

        // Delete the team
        const { error: deleteError } = await supabase
            .from('teams')
            .delete()
            .eq('id', teamId)

        if (deleteError) {
            console.error('Error deleting team:', deleteError)
            return { success: false, error: deleteError.message }
        }

        return { success: true }
    },

    /**
     * Leave a team (for non-owner members)
     */
    async leaveTeam(teamId: string): Promise<{ success: boolean; error?: string }> {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return { success: false, error: 'Not authenticated' }
        }

        // Verify user is a member but not the owner
        const { data: team, error: fetchError } = await supabase
            .from('teams')
            .select('created_by')
            .eq('id', teamId)
            .single()

        if (fetchError || !team) {
            return { success: false, error: 'Team not found' }
        }

        if (team.created_by === user.id) {
            return { success: false, error: 'Team owners cannot leave. Delete the team instead.' }
        }

        // Remove user from team_members
        const { error: deleteError } = await supabase
            .from('team_members')
            .delete()
            .eq('team_id', teamId)
            .eq('user_id', user.id)

        if (deleteError) {
            console.error('Error leaving team:', deleteError)
            return { success: false, error: deleteError.message }
        }

        return { success: true }
    },

    /**
     * Get teams the user has joined (but not created)
     */
    async getJoinedTeams(): Promise<Team[]> {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return []

        // Get team IDs where user is a member
        const { data: memberData, error: memberError } = await supabase
            .from('team_members')
            .select('team_id')
            .eq('user_id', user.id)

        if (memberError || !memberData || memberData.length === 0) {
            return []
        }

        const teamIds = memberData.map(m => m.team_id)

        // Get team details, excluding teams created by user
        const { data: teams, error: teamsError } = await supabase
            .from('teams')
            .select('*')
            .in('id', teamIds)
            .neq('created_by', user.id)

        if (teamsError) {
            console.error('Error fetching joined teams:', teamsError)
            return []
        }

        return teams || []
    },

    /**
     * Get teams the user owns with pending applications count
     */
    async getMyTeamsWithApplications(): Promise<Array<Team & { pending_applications: number }>> {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return []

        // Get teams created by user
        const { data: teams, error: teamsError } = await supabase
            .from('teams')
            .select('*')
            .eq('created_by', user.id)

        if (teamsError || !teams) {
            return []
        }

        // Get pending applications count for each team
        const teamsWithCounts = await Promise.all(
            teams.map(async (team) => {
                const { count, error } = await supabase
                    .from('team_applications')
                    .select('*', { count: 'exact', head: true })
                    .eq('team_id', team.id)
                    .eq('status', 'pending')

                return {
                    ...team,
                    pending_applications: error ? 0 : (count || 0)
                }
            })
        )

        return teamsWithCounts
    }
}
