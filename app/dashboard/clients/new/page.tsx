// app/dashboard/clients/new/page.tsx
import { redirect } from 'next/navigation'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import { createClient } from '@/app/actions/clients'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Add New Client</CardTitle>
            <CardDescription>
              Add a Norwegian client to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createClient} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Client Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="e.g., Acme AS"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org_number">Organization Number</Label>
                <Input
                  id="org_number"
                  name="org_number"
                  type="text"
                  placeholder="e.g., 123456789"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  type="text"
                  placeholder="e.g., Storgata 1, 0001 Oslo, Norway"
                  required
                />
              </div>
              <div className="flex gap-4">
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
