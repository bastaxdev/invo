// app/dashboard/settings/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { updateProfile } from '@/app/actions/settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: { error?: string; success?: string }
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="mt-2 text-slate-600">
          Manage your profile and invoice information
        </p>
      </div>

      {searchParams.error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800">
          {searchParams.error}
        </div>
      )}

      {searchParams.success && (
        <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-800">
          Profile updated successfully!
        </div>
      )}

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your email and account details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user.email || ''} disabled />
              <p className="text-xs text-slate-500">Email cannot be changed</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invoice Seller Information</CardTitle>
            <CardDescription>
              This information will appear on your generated invoices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={updateProfile} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    type="text"
                    placeholder="Jan Kowalski"
                    defaultValue={profile?.full_name || ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business_name">
                    Business Name (Optional)
                  </Label>
                  <Input
                    id="business_name"
                    name="business_name"
                    type="text"
                    placeholder="Kowalski Consulting"
                    defaultValue={profile?.business_name || ''}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tax_id">Tax ID / NIP</Label>
                  <Input
                    id="tax_id"
                    name="tax_id"
                    type="text"
                    placeholder="1234567890"
                    defaultValue={profile?.tax_id || ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+48 123 456 789"
                    defaultValue={profile?.phone || ''}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  name="address"
                  placeholder="ul. Przykładowa 1&#10;00-001 Warszawa&#10;Poland"
                  rows={3}
                  defaultValue={profile?.address || ''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank_account">Bank Account / IBAN</Label>
                <Input
                  id="bank_account"
                  name="bank_account"
                  type="text"
                  placeholder="PL12 3456 7890 1234 5678 9012 3456"
                  defaultValue={profile?.bank_account || ''}
                />
              </div>

              <Button type="submit" className="w-full sm:w-auto">
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
