// app/dashboard/templates/new/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createTemplate } from '@/app/actions/templates'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { TemplateForm } from '@/components/templates/template-form'

export default async function NewTemplatePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle>Create Invoice Template</CardTitle>
          <CardDescription>
            Create a reusable template for faster invoicing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TemplateForm action={createTemplate} />
        </CardContent>
      </Card>
    </div>
  )
}
