'use client'

import React, { useState, useRef } from 'react'
import { Camera, Loader2, X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface ProfileData {
    id: string
    user_id: string
    display_name: string
    university: string
    interests: string[]
    experience_level: 'Beginner' | 'Intermediate' | 'Advanced'
    is_mentor: boolean
    avatar_url?: string
}

const suggestedInterests = ['React', 'Python', 'TypeScript', 'Machine Learning', 'Cybersecurity', 'UI/UX', 'Data Science', 'Cloud', 'Mobile Dev', 'Blockchain']

interface EditProfileDialogProps {
    profile: ProfileData
    open: boolean
    onOpenChange: (open: boolean) => void
    onSaved: () => void
}

export function EditProfileDialog({ profile, open, onOpenChange, onSaved }: EditProfileDialogProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url || null)
    const [formData, setFormData] = useState({
        displayName: profile.display_name,
        university: profile.university,
        interests: [...profile.interests],
        experienceLevel: profile.experience_level,
        isMentor: profile.is_mentor,
        avatarUrl: profile.avatar_url || '',
    })
    const [newInterest, setNewInterest] = useState('')

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file')
            return
        }
        if (file.size > 800 * 1024) {
            toast.error('Image must be smaller than 800KB')
            return
        }

        // Preview
        const reader = new FileReader()
        reader.onload = (e) => setAvatarPreview(e.target?.result as string)
        reader.readAsDataURL(file)

        // Upload to Supabase Storage
        setUploading(true)
        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${profile.user_id}-${Date.now()}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, file, { upsert: true })

            if (uploadError) {
                console.error('Upload error:', uploadError)
                toast.error('Failed to upload image. Storage bucket may not be configured.')
                setAvatarPreview(profile.avatar_url || null)
                return
            }

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName)

            setFormData(prev => ({ ...prev, avatarUrl: publicUrl }))
            toast.success('Avatar uploaded!')
        } catch (err) {
            console.error('Upload error:', err)
            toast.error('Failed to upload avatar')
            setAvatarPreview(profile.avatar_url || null)
        } finally {
            setUploading(false)
        }
    }

    const handleAddInterest = (interest: string) => {
        if (interest && !formData.interests.includes(interest)) {
            setFormData(prev => ({ ...prev, interests: [...prev.interests, interest] }))
            setNewInterest('')
        }
    }

    const handleRemoveInterest = (interest: string) => {
        setFormData(prev => ({ ...prev, interests: prev.interests.filter(i => i !== interest) }))
    }

    const handleSave = async () => {
        if (!formData.displayName.trim() || !formData.university.trim()) {
            toast.error('Name and university are required')
            return
        }

        setSaving(true)
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    display_name: formData.displayName.trim(),
                    university: formData.university.trim(),
                    interests: formData.interests,
                    experience_level: formData.experienceLevel,
                    is_mentor: formData.isMentor,
                    avatar_url: formData.avatarUrl || null,
                    updated_at: new Date().toISOString(),
                })
                .eq('user_id', profile.user_id)

            if (error) {
                toast.error('Failed to save profile')
                console.error(error)
            } else {
                toast.success('Profile updated!')
                onSaved()
                onOpenChange(false)
            }
        } catch (err) {
            toast.error('An unexpected error occurred')
        } finally {
            setSaving(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>Update your profile information</DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center gap-3">
                        <div
                            className="relative h-24 w-24 cursor-pointer group"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {avatarPreview ? (
                                <img
                                    src={avatarPreview}
                                    alt="Avatar"
                                    className="h-24 w-24 rounded-full object-cover border-4 border-border"
                                />
                            ) : (
                                <div className="h-24 w-24 rounded-full border-4 border-border bg-violet-500 flex items-center justify-center text-2xl text-violet-50 font-bold">
                                    {formData.displayName.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                {uploading ? (
                                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                                ) : (
                                    <Camera className="h-6 w-6 text-white" />
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarChange}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">Click to upload (max 2MB)</p>
                    </div>

                    {/* Display Name */}
                    <div className="space-y-2">
                        <Label htmlFor="edit-name">Display Name *</Label>
                        <Input
                            id="edit-name"
                            value={formData.displayName}
                            onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                            required
                        />
                    </div>

                    {/* University */}
                    <div className="space-y-2">
                        <Label htmlFor="edit-university">University *</Label>
                        <Input
                            id="edit-university"
                            value={formData.university}
                            onChange={(e) => setFormData(prev => ({ ...prev, university: e.target.value }))}
                            required
                        />
                    </div>

                    {/* Experience Level */}
                    <div className="space-y-2">
                        <Label>Experience Level</Label>
                        <Select
                            value={formData.experienceLevel}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, experienceLevel: value as any }))}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Beginner">Beginner</SelectItem>
                                <SelectItem value="Intermediate">Intermediate</SelectItem>
                                <SelectItem value="Advanced">Advanced</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Interests */}
                    <div className="space-y-3">
                        <Label>Interests</Label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Add interest..."
                                value={newInterest}
                                onChange={(e) => setNewInterest(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault()
                                        handleAddInterest(newInterest)
                                    }
                                }}
                            />
                            <Button type="button" variant="outline" size="icon" onClick={() => handleAddInterest(newInterest)}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>

                        {formData.interests.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {formData.interests.map((interest) => (
                                    <Badge key={interest} variant="secondary" className="gap-1 pr-1">
                                        {interest}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveInterest(interest)}
                                            className="ml-1 rounded-full p-0.5 hover:bg-muted"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}

                        <div className="flex flex-wrap gap-2">
                            {suggestedInterests
                                .filter(i => !formData.interests.includes(i))
                                .slice(0, 5)
                                .map(interest => (
                                    <Badge
                                        key={interest}
                                        variant="outline"
                                        className="cursor-pointer hover:bg-secondary"
                                        onClick={() => handleAddInterest(interest)}
                                    >
                                        <Plus className="mr-1 h-3 w-3" />
                                        {interest}
                                    </Badge>
                                ))}
                        </div>
                    </div>

                    {/* Mentor Toggle */}
                    <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-4">
                        <div>
                            <p className="font-medium text-foreground">Mentor</p>
                            <p className="text-sm text-muted-foreground">Available to mentor others</p>
                        </div>
                        <Switch
                            checked={formData.isMentor}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isMentor: checked }))}
                        />
                    </div>
                </div>

                {/* Save */}
                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Saving...
                            </>
                        ) : (
                            'Save Changes'
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
