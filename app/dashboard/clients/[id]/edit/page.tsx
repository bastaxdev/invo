// app/dashboard/clients/[id]/edit/page.tsx
import { redirect } from 'next/navigation'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import { updateClient } from '@/app/actions/clients'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Link from 'next/link'

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!client) {
    redirect('/dashboard/clients')
  }

  const updateClientWithId = updateClient.bind(null, id)

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Edit Client</CardTitle>
            <CardDescription>Update client information</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={updateClientWithId} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  Basic Information
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="name">
                    Client Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="e.g., Acme AS"
                    defaultValue={client.name}
                    required
                  />
                  <p className="text-xs text-slate-500">
                    Company or individual name
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select
                      name="country"
                      defaultValue={client.country || 'NO'}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NO">🇳🇴 Norway</SelectItem>
                        <SelectItem value="PL">🇵🇱 Poland</SelectItem>
                        <SelectItem value="SE">🇸🇪 Sweden</SelectItem>
                        <SelectItem value="DK">🇩🇰 Denmark</SelectItem>
                        <SelectItem value="DE">🇩🇪 Germany</SelectItem>
                        <SelectItem value="GB">🇬🇧 United Kingdom</SelectItem>
                        <SelectItem value="US">🇺🇸 United States</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="org_number">
                      Organization Number (Optional)
                    </Label>
                    <Input
                      id="org_number"
                      name="org_number"
                      type="text"
                      placeholder="e.g., 123456789"
                      defaultValue={client.org_number || ''}
                    />
                    <p className="text-xs text-slate-500">
                      Leave empty for individual clients
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tax_id">Tax ID / VAT Number (Optional)</Label>
                  <Input
                    id="tax_id"
                    name="tax_id"
                    type="text"
                    placeholder="e.g., NO123456789MVA"
                    defaultValue={client.tax_id || ''}
                  />
                  <p className="text-xs text-slate-500">
                    VAT/MVA registration number if applicable
                  </p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  Contact Information
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address (Optional)</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="contact@example.com"
                      defaultValue={client.email || ''}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number (Optional)</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+47 12 34 56 78"
                      defaultValue={client.phone || ''}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">
                    Address <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="address"
                    name="address"
                    placeholder="Storgata 1&#10;0001 Oslo&#10;Norway"
                    rows={3}
                    defaultValue={client.address}
                    required
                  />
                  <p className="text-xs text-slate-500">
                    Full address including street, postal code, and city
                  </p>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <Button type="submit" className="flex-1">
                  Update Client
                </Button>
                <Link href="/dashboard/clients" className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
