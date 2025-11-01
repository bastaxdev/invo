// app/dashboard/clients/[id]/edit/page.tsx
import { redirect } from 'next/navigation'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import { updateClient } from '@/app/actions/clients'
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

export default async function EditClientPage({
  params,
}: {
  params: { id: string }
}) {
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
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!client) {
    redirect('/dashboard/clients')
  }

  const updateClientWithId = updateClient.bind(null, params.id)

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Edit Client</CardTitle>
            <CardDescription>Update client information</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={updateClientWithId} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Client Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  defaultValue={client.name}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org_number">Organization Number</Label>
                <Input
                  id="org_number"
                  name="org_number"
                  type="text"
                  defaultValue={client.org_number}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  type="text"
                  defaultValue={client.address}
                  required
                />
              </div>
              <div className="flex gap-4">
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
