// app/dashboard/clients/new/page.tsx
import { redirect } from 'next/navigation'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import { createClient } from '@/app/actions/clients'
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

export default async function NewClientPage() {
  const supabase = await createSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Add New Client</CardTitle>
            <CardDescription>
              Add a client to your account with complete contact information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createClient} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Basic Information
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">
                    Client Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="e.g., Acme AS"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Company or individual name
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-foreground">
                      Country
                    </Label>
                    <Select name="country" defaultValue="NO">
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
                    <Label htmlFor="org_number" className="text-foreground">
                      Organization Number{' '}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="org_number"
                      name="org_number"
                      type="text"
                      placeholder="e.g., 123456789"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tax_id" className="text-foreground">
                    Tax ID / VAT Number (Optional)
                  </Label>
                  <Input
                    id="tax_id"
                    name="tax_id"
                    type="text"
                    placeholder="e.g., NO123456789MVA"
                  />
                  <p className="text-xs text-muted-foreground">
                    VAT/MVA registration number if applicable
                  </p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4 border-t border-border pt-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Contact Information
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground">
                      Email Address (Optional)
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="contact@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-foreground">
                      Phone Number (Optional)
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+47 12 34 56 78"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-foreground">
                    Address <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="address"
                    name="address"
                    placeholder="Storgata 1&#10;0001 Oslo&#10;Norway"
                    rows={3}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Full address including street, postal code, and city
                  </p>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-border">
                <Button type="submit" className="flex-1">
                  Create Client
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
