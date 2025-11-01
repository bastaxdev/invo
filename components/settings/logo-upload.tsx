// components/settings/logo-upload.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { Upload, X } from 'lucide-react'
import Image from 'next/image'

interface LogoUploadProps {
  currentLogoUrl?: string | null
  userId: string
}

export function LogoUpload({ currentLogoUrl, userId }: LogoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [logoUrl, setLogoUrl] = useState(currentLogoUrl)
  const [error, setError] = useState<string | null>(null)

  const uploadLogo = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      setError(null)

      if (!event.target.files || event.target.files.length === 0) {
        return
      }

      const file = event.target.files[0]

      // Validate file type - only allow specific formats
      const allowedTypes = [
        'image/png',
        'image/jpeg',
        'image/jpg',
        'image/svg+xml',
      ]
      if (!allowedTypes.includes(file.type)) {
        setError('Only PNG, JPG, or SVG files are allowed')
        return
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('Image must be less than 2MB')
        return
      }

      const supabase = createClient()
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}/logo.${fileExt}`

      // Delete old logo if exists
      if (logoUrl) {
        const oldPath = logoUrl.split('/').slice(-2).join('/')
        await supabase.storage.from('logos').remove([oldPath])
      }

      // Upload new logo
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, file, { upsert: true })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('logos').getPublicUrl(fileName)

      // Update profile with new logo URL
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ logo_url: publicUrl })
        .eq('user_id', userId)

      if (updateError) {
        throw updateError
      }

      setLogoUrl(publicUrl)
      window.location.reload() // Refresh to show new logo
    } catch (error: any) {
      setError(error.message)
    } finally {
      setUploading(false)
    }
  }

  const removeLogo = async () => {
    try {
      setUploading(true)
      setError(null)

      const supabase = createClient()

      if (logoUrl) {
        const path = logoUrl.split('/').slice(-2).join('/')
        await supabase.storage.from('logos').remove([path])
      }

      // Update profile to remove logo URL
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ logo_url: null })
        .eq('user_id', userId)

      if (updateError) {
        throw updateError
      }

      setLogoUrl(null)
      window.location.reload()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Label>Company Logo</Label>

      {logoUrl ? (
        <div className="space-y-4">
          <div className="relative h-32 w-32 rounded-lg border bg-slate-50 p-2">
            <Image
              src={logoUrl}
              alt="Company logo"
              fill
              className="object-contain"
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={removeLogo}
              disabled={uploading}
            >
              <X className="mr-2 h-4 w-4" />
              Remove Logo
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <label
            htmlFor="logo-upload"
            className="flex h-32 w-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100"
          >
            <Upload className="h-8 w-8 text-slate-400" />
            <span className="mt-2 text-xs text-slate-500">Upload Logo</span>
            <input
              id="logo-upload"
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/svg+xml"
              onChange={uploadLogo}
              disabled={uploading}
              className="hidden"
            />
          </label>
          <p className="text-xs text-slate-500">
            PNG, JPG or SVG only. Max 2MB.
          </p>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {uploading && <p className="text-sm text-slate-600">Uploading...</p>}
    </div>
  )
}
