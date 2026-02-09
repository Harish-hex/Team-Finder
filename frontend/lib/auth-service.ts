import { supabase } from './supabase'

export interface UserProfile {
    email: string;
    isVerified: boolean;
    profile?: {
        displayName: string;
        university: string;
        interests: string[];
        experienceLevel: 'Beginner' | 'Intermediate' | 'Advanced';
        isMentor: boolean;
    };
}

// Mock database
let users: Record<string, UserProfile> = {};
let otps: Record<string, { code: string; expiresAt: number }> = {};

// Helper to simulate delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const AuthService = {
    async sendOTP(email: string): Promise<{ success: boolean; error?: string }> {
        await delay(800); // Simulate network delay

        // Allow any email containing ".edu" domain part (simple check)
        // const eduRegex = /^[^\s@]+@[^\s@]+\.edu(\.[a-z]{2})?$/i; 
        // Simpler check for prototype: must contain ".edu"
        if (!email.includes('.edu')) {
            return { success: false, error: 'Please enter a valid .edu email address.' };
        }

        // Generate 6-digit OTP
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

        otps[email] = { code, expiresAt };

        console.log(`[AuthService] OTP for ${email}: ${code}`); // For manual verification

        if (!users[email]) {
            users[email] = { email, isVerified: false };
        }

        return { success: true };
    },

    async verifyOTP(email: string, code: string): Promise<{ success: boolean; error?: string }> {
        await delay(800);

        const record = otps[email];
        if (!record) {
            return { success: false, error: 'No OTP requested for this email.' };
        }

        if (Date.now() > record.expiresAt) {
            return { success: false, error: 'OTP has expired. Please request a new one.' };
        }

        if (record.code !== code) {
            return { success: false, error: 'Invalid OTP. Please try again.' };
        }

        // Success
        delete otps[email]; // OTP is single-use
        if (users[email]) {
            users[email].isVerified = true;
        }

        // Simulate setting session (in a real app, this would set a cookie/token)
        localStorage.setItem('fireteam_user_email', email);

        return { success: true };
    },

    async getUser(email: string): Promise<UserProfile | null> {
        // Get current Supabase user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return null

        // Check if user has a profile in database
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single()

        if (error || !profile) {
            // No profile exists
            return {
                email,
                isVerified: true,
                profile: undefined
            }
        }

        // Profile exists
        return {
            email,
            isVerified: true,
            profile: {
                displayName: profile.display_name,
                university: profile.university,
                interests: profile.interests,
                experienceLevel: profile.experience_level,
                isMentor: profile.is_mentor
            }
        }
    },

    async saveProfile(email: string, profile: UserProfile['profile']): Promise<{ success: boolean }> {
        if (!profile) return { success: false }

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false }

        const { error } = await supabase
            .from('profiles')
            .upsert({
                user_id: user.id,
                display_name: profile.displayName,
                university: profile.university,
                interests: profile.interests,
                experience_level: profile.experienceLevel,
                is_mentor: profile.isMentor,
                updated_at: new Date().toISOString()
            })

        if (error) {
            console.error('Error saving profile:', error)
            return { success: false }
        }

        return { success: true }
    },

    // Helper for components to get current user based on pseudo-session
    getCurrentUserEmail(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('fireteam_user_email');
    },

    logout() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('fireteam_user_email');
        }
    }
};
