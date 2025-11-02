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
import { LogoUpload } from '@/components/settings/logo-upload'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>
}) {
  const params = await searchParams
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

      {params.error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800">
          {params.error}
        </div>
      )}

      {params.success && (
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
            <CardTitle>Branding</CardTitle>
            <CardDescription>
              Upload your company logo (optional)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <LogoUpload currentLogoUrl={profile?.logo_url} userId={user.id} />

            {profile?.logo_url && (
              <div className="flex items-center space-x-2 pt-4 border-t">
                <input
                  type="checkbox"
                  id="show_logo_on_invoice"
                  name="show_logo_on_invoice"
                  defaultChecked={profile?.show_logo_on_invoice ?? true}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  form="profile-form"
                />
                <label
                  htmlFor="show_logo_on_invoice"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Show logo on invoices
                </label>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Norwegian MVA (VAT) Registration</CardTitle>
            <CardDescription>
              Required when your revenue exceeds 50,000 NOK in 12 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="mva_registered"
                  name="mva_registered"
                  defaultChecked={profile?.mva_registered ?? false}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  form="profile-form"
                />
                <label
                  htmlFor="mva_registered"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I am registered for Norwegian MVA
                </label>
              </div>

              <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
                <p className="font-semibold mb-1">What is MVA?</p>
                <p>
                  MVA (Merverdiavgift) is Norwegian VAT. If you earn more than
                  50,000 NOK from Norwegian clients in a 12-month period, you
                  must register and charge 25% VAT on your invoices.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invoice Languages</CardTitle>
            <CardDescription>
              Choose which languages to include in your PDF invoices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="pdf_language_polish"
                  name="pdf_language_polish"
                  defaultChecked={profile?.pdf_language_polish ?? true}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  form="profile-form"
                />
                <label
                  htmlFor="pdf_language_polish"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  🇵🇱 Polish (Polski)
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="pdf_language_norwegian"
                  name="pdf_language_norwegian"
                  defaultChecked={profile?.pdf_language_norwegian ?? true}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  form="profile-form"
                />
                <label
                  htmlFor="pdf_language_norwegian"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  🇳🇴 Norwegian (Norsk)
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="pdf_language_english"
                  name="pdf_language_english"
                  defaultChecked={profile?.pdf_language_english ?? false}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  form="profile-form"
                />
                <label
                  htmlFor="pdf_language_english"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  🇬🇧 English
                </label>
              </div>

              <p className="text-xs text-slate-500 pt-2">
                Select at least one language. Your invoices will include all
                selected languages.
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>
              This information will appear on your generated invoices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              id="profile-form"
              action={updateProfile}
              className="space-y-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full_name">
                    Full Name{' '}
                    {!profile?.business_name && (
                      <span className="text-red-500">*</span>
                    )}
                  </Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    type="text"
                    placeholder="Jan Kowalski"
                    defaultValue={profile?.full_name || ''}
                    required={!profile?.business_name}
                  />
                  <p className="text-xs text-slate-500">
                    Required if Business Name is not provided
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business_name">
                    Business Name{' '}
                    {!profile?.full_name && (
                      <span className="text-red-500">*</span>
                    )}
                  </Label>
                  <Input
                    id="business_name"
                    name="business_name"
                    type="text"
                    placeholder="Kowalski Consulting"
                    defaultValue={profile?.business_name || ''}
                    required={!profile?.full_name}
                  />
                  <p className="text-xs text-slate-500">
                    Required if Full Name is not provided
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoice_prefix">
                    Invoice Prefix <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="invoice_prefix"
                    name="invoice_prefix"
                    type="text"
                    placeholder="e.g., INVO, JK, ABC"
                    defaultValue={profile?.invoice_prefix || ''}
                    maxLength={6}
                    pattern="[A-Z0-9]{2,6}"
                    className="uppercase"
                    required
                  />
                  <p className="text-xs text-slate-500">
                    2-6 characters, letters and numbers only. Used for invoice
                    numbers (e.g., INVO-001, INVO-002)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default_currency">
                    Default Currency for Analytics
                  </Label>
                  <Select
                    name="default_currency"
                    defaultValue={profile?.default_currency || 'PLN'}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PLN">PLN (Polish Złoty)</SelectItem>
                      <SelectItem value="NOK">NOK (Norwegian Krone)</SelectItem>
                      <SelectItem value="EUR">EUR (Euro)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500">
                    All analytics will be converted to this currency
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tax_id">Tax ID / NIP (Optional)</Label>
                  <Input
                    id="tax_id"
                    name="tax_id"
                    type="text"
                    placeholder="1234567890"
                    defaultValue={profile?.tax_id || ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_registration">
                    Company Registration (Optional)
                  </Label>
                  <Input
                    id="company_registration"
                    name="company_registration"
                    type="text"
                    placeholder="KRS 0000123456"
                    defaultValue={profile?.company_registration || ''}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+48 123 456 789"
                  defaultValue={profile?.phone || ''}
                  required
                />
                <p className="text-xs text-slate-500">
                  Include country code (e.g., +48 for Poland, +47 for Norway)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">
                  Address <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="address"
                  name="address"
                  placeholder="ul. Przykładowa 1&#10;00-001 Warszawa&#10;Poland"
                  rows={3}
                  defaultValue={profile?.address || ''}
                  required
                />
              </div>

              <div className="border-t pt-4">
                <h3 className="mb-4 text-lg font-semibold">Bank Details</h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bank_account">
                      Bank Account / IBAN{' '}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="bank_account"
                      name="bank_account"
                      type="text"
                      placeholder="PL61 1090 1014 0000 0712 1981 2874"
                      defaultValue={profile?.bank_account || ''}
                      required
                    />
                    <p className="text-xs text-slate-500">
                      IBAN format recommended
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="bank_name">
                        Bank Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="bank_name"
                        name="bank_name"
                        type="text"
                        placeholder="PKO Bank Polski"
                        defaultValue={profile?.bank_name || ''}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="swift_bic">
                        SWIFT/BIC Code <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="swift_bic"
                        name="swift_bic"
                        type="text"
                        placeholder="BPKOPLPW"
                        defaultValue={profile?.swift_bic || ''}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bank_address">
                      Bank Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="bank_address"
                      name="bank_address"
                      type="text"
                      placeholder="ul. Puławska 15, 02-515 Warszawa, Poland"
                      defaultValue={profile?.bank_address || ''}
                      required
                    />
                  </div>
                </div>
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
