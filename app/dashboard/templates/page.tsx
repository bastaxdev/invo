// app/dashboard/templates/page.tsx
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
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { DeleteTemplateButton } from '@/components/templates/delete-template-button'

export default async function TemplatesPage({
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

  const { data: templates } = await supabase
    .from('invoice_templates')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Invoice Templates
          </h1>
          <p className="mt-2 text-slate-600">
            Reusable invoice templates for faster invoicing
          </p>
        </div>
        <Link href="/dashboard/templates/new">
          <Button>Create Template</Button>
        </Link>
      </div>

      {params.error && (
        <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-800">
          {params.error}
        </div>
      )}

      <div className="mt-8">
        {!templates || templates.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
            <p className="text-slate-500">
              No templates yet. Create your first template!
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-slate-200 bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Due Days</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">
                      {template.name}
                      {template.is_default && (
                        <Badge variant="secondary" className="ml-2">
                          Default
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {template.description || '-'}
                    </TableCell>
                    <TableCell>{template.currency}</TableCell>
                    <TableCell>{template.default_due_days} days</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/dashboard/templates/${template.id}/edit`}>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </Link>
                        <DeleteTemplateButton
                          id={template.id}
                          name={template.name}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}
