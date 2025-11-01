// app/dashboard/templates/[id]/edit/page.tsx
import { redirect } from 'next/navigation'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import { updateTemplate } from '@/app/actions/templates'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { TemplateForm } from '@/components/templates/template-form'

export default async function EditTemplatePage({
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

  const { data: template } = await supabase
    .from('invoice_templates')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!template) {
    redirect('/dashboard/templates')
  }

  const { data: templateItems } = await supabase
    .from('template_items')
    .select('*')
    .eq('template_id', id)
    .order('sort_order')

  const updateTemplateWithId = updateTemplate.bind(null, id)

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle>Edit Template</CardTitle>
          <CardDescription>Update template configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <TemplateForm
            template={template}
            templateItems={templateItems || undefined}
            action={updateTemplateWithId}
          />
        </CardContent>
      </Card>
    </div>
  )
}
