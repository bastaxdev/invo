// app/dashboard/clients/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { DeleteClientButton } from '@/components/clients/delete-client-button'
import { Users, Building2, MapPin, Mail, Phone, Hash } from 'lucide-react'

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Clients
          </h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-muted-foreground">
            Manage your clients
          </p>
        </div>
        <Link href="/dashboard/clients/new">
          <Button className="w-full sm:w-auto">Add Client</Button>
        </Link>
      </div>

      {/* Error Message */}
      {params.error && (
        <div className="mb-4 rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
          {params.error}
        </div>
      )}

      {/* Content */}
      {!clients || clients.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No clients yet. Add your first client!
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {clients.map((client) => (
              <Card key={client.id} className="overflow-hidden">
                <CardContent className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground text-base flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        {client.name}
                      </h3>
                      {client.country && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {client.country === 'NO' && '🇳🇴 Norway'}
                          {client.country === 'PL' && '🇵🇱 Poland'}
                          {client.country === 'SE' && '🇸🇪 Sweden'}
                          {client.country === 'DK' && '🇩🇰 Denmark'}
                          {client.country === 'DE' && '🇩🇪 Germany'}
                          {client.country === 'GB' && '🇬🇧 United Kingdom'}
                          {client.country === 'US' && '🇺🇸 United States'}
                          {!['NO', 'PL', 'SE', 'DK', 'DE', 'GB', 'US'].includes(
                            client.country
                          ) && client.country}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-3 text-sm">
                    {client.org_number && (
                      <div className="flex items-start gap-2">
                        <Hash className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Org. Number
                          </p>
                          <p className="font-medium text-foreground">
                            {client.org_number}
                          </p>
                        </div>
                      </div>
                    )}

                    {client.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Address
                          </p>
                          <p className="font-medium text-foreground whitespace-pre-line">
                            {client.address}
                          </p>
                        </div>
                      </div>
                    )}

                    {client.email && (
                      <div className="flex items-start gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Email</p>
                          <a
                            href={`mailto:${client.email}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {client.email}
                          </a>
                        </div>
                      </div>
                    )}

                    {client.phone && (
                      <div className="flex items-start gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Phone</p>
                          <a
                            href={`tel:${client.phone}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {client.phone}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-3 border-t border-border">
                    <Link
                      href={`/dashboard/clients/${client.id}/edit`}
                      className="flex-1"
                    >
                      <Button variant="outline" size="sm" className="w-full">
                        Edit
                      </Button>
                    </Link>
                    <DeleteClientButton id={client.id} name={client.name} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block rounded-lg border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Org. Number</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium text-foreground">
                      {client.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {client.org_number || '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {client.country === 'NO' && '🇳🇴 Norway'}
                      {client.country === 'PL' && '🇵🇱 Poland'}
                      {client.country === 'SE' && '🇸🇪 Sweden'}
                      {client.country === 'DK' && '🇩🇰 Denmark'}
                      {client.country === 'DE' && '🇩🇪 Germany'}
                      {client.country === 'GB' && '🇬🇧 UK'}
                      {client.country === 'US' && '🇺🇸 USA'}
                      {!['NO', 'PL', 'SE', 'DK', 'DE', 'GB', 'US'].includes(
                        client.country || ''
                      ) &&
                        (client.country || 'NO')}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">
                        {client.email && (
                          <div className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                            <a
                              href={`mailto:${client.email}`}
                              className="text-primary hover:underline"
                            >
                              {client.email}
                            </a>
                          </div>
                        )}
                        {client.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                            <a
                              href={`tel:${client.phone}`}
                              className="text-primary hover:underline"
                            >
                              {client.phone}
                            </a>
                          </div>
                        )}
                        {!client.email && !client.phone && (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">
                      {client.address}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/dashboard/clients/${client.id}/edit`}>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </Link>
                        <DeleteClientButton id={client.id} name={client.name} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  )
}
