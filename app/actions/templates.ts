// app/actions/templates.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'

interface TemplateItemInput {
  description: string
  quantity: number
  unit_price: number
}

export async function createTemplate(formData: FormData) {
  const supabase = await createSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const templateData = {
    user_id: user.id,
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    currency: formData.get('currency') as string,
    default_due_days: parseInt(formData.get('default_due_days') as string),
    is_default: formData.get('is_default') === 'on',
  }

  // If setting as default, unset other defaults
  if (templateData.is_default) {
    await supabase
      .from('invoice_templates')
      .update({ is_default: false })
      .eq('user_id', user.id)
  }

  const { data: template, error } = await supabase
    .from('invoice_templates')
    .insert(templateData)
    .select()
    .single()

  if (error) {
    redirect('/dashboard/templates?error=' + encodeURIComponent(error.message))
  }

  // Handle template items
  const itemsJson = formData.get('items') as string
  if (itemsJson) {
    const items = JSON.parse(itemsJson)
    const templateItems = items.map((item: TemplateItemInput, index: number) => ({
      template_id: template.id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      sort_order: index,
    }))

    await supabase.from('template_items').insert(templateItems)
  }

  revalidatePath('/dashboard/templates')
  redirect('/dashboard/templates')
}

export async function updateTemplate(id: string, formData: FormData) {
  const supabase = await createSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const data = {
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    currency: formData.get('currency') as string,
    default_due_days: parseInt(formData.get('default_due_days') as string),
    is_default: formData.get('is_default') === 'on',
    updated_at: new Date().toISOString(),
  }

  // If setting as default, unset other defaults
  if (data.is_default) {
    await supabase
      .from('invoice_templates')
      .update({ is_default: false })
      .eq('user_id', user.id)
      .neq('id', id)
  }

  const { error } = await supabase
    .from('invoice_templates')
    .update(data)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    redirect('/dashboard/templates?error=' + encodeURIComponent(error.message))
  }

  // Update template items
  await supabase.from('template_items').delete().eq('template_id', id)

  const itemsJson = formData.get('items') as string
  if (itemsJson) {
    const items = JSON.parse(itemsJson)
    const templateItems = items.map((item: TemplateItemInput, index: number) => ({
      template_id: id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      sort_order: index,
    }))

    await supabase.from('template_items').insert(templateItems)
  }

  revalidatePath('/dashboard/templates')
  redirect('/dashboard/templates')
}

export async function deleteTemplate(id: string) {
  const supabase = await createSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { error } = await supabase
    .from('invoice_templates')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    redirect('/dashboard/templates?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/dashboard/templates')
}
