// app/api/templates/[id]/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch template
  const { data: template, error: templateError } = await supabase
    .from('invoice_templates')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (templateError || !template) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 })
  }

  // Fetch template items
  const { data: items } = await supabase
    .from('template_items')
    .select('*')
    .eq('template_id', id)
    .order('sort_order')

  return NextResponse.json({ template, items })
}
