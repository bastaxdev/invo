// lib/types/database.types.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string
          user_id: string
          name: string
          org_number: string
          address: string
          country: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          org_number: string
          address: string
          country?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          org_number?: string
          address?: string
          country?: string
          created_at?: string
          updated_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          user_id: string
          client_id: string
          invoice_number: string
          issue_date: string
          due_date: string
          description: string
          amount: number
          vat_rate: number
          vat_amount: number
          amount_with_vat: number
          currency: string
          status: string
          payment_received: boolean
          payment_date: string | null
          mva_registered_at_creation: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          client_id: string
          invoice_number: string
          issue_date: string
          due_date: string
          description: string
          amount: number
          vat_rate?: number
          vat_amount?: number
          amount_with_vat?: number
          currency?: string
          status?: string
          payment_received?: boolean
          payment_date?: string | null
          mva_registered_at_creation?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          client_id?: string
          invoice_number?: string
          issue_date?: string
          due_date?: string
          description?: string
          amount?: number
          vat_rate?: number
          vat_amount?: number
          amount_with_vat?: number
          currency?: string
          status?: string
          payment_received?: boolean
          payment_date?: string | null
          mva_registered_at_creation?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      invoice_items: {
        Row: {
          id: string
          invoice_id: string
          description: string
          quantity: number
          unit_price: number
          amount: number
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          description: string
          quantity?: number
          unit_price: number
          amount: number
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          description?: string
          quantity?: number
          unit_price?: number
          amount?: number
          sort_order?: number
          created_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string | null
          business_name: string | null
          tax_id: string | null
          address: string | null
          phone: string | null
          bank_account: string | null
          bank_name: string | null
          bank_address: string | null
          swift_bic: string | null
          company_registration: string | null
          logo_url: string | null
          show_logo_on_invoice: boolean
          invoice_prefix: string | null
          default_currency: string
          pdf_language_polish: boolean
          pdf_language_norwegian: boolean
          pdf_language_english: boolean
          last_overdue_check: string | null
          mva_registered: boolean
          last_mva_popup: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name?: string | null
          business_name?: string | null
          tax_id?: string | null
          address?: string | null
          phone?: string | null
          bank_account?: string | null
          bank_name?: string | null
          bank_address?: string | null
          swift_bic?: string | null
          company_registration?: string | null
          logo_url?: string | null
          show_logo_on_invoice?: boolean
          invoice_prefix: string | null
          default_currency: string
          pdf_language_polish: boolean
          pdf_language_norwegian: boolean
          pdf_language_english: boolean
          last_overdue_check?: string | null
          mva_registered?: boolean
          last_mva_popup?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string | null
          business_name?: string | null
          tax_id?: string | null
          address?: string | null
          phone?: string | null
          bank_account?: string | null
          bank_name?: string | null
          bank_address?: string | null
          swift_bic?: string | null
          company_registration?: string | null
          logo_url?: string | null
          show_logo_on_invoice?: boolean
          invoice_prefix: string | null
          default_currency: string
          pdf_language_polish: boolean
          pdf_language_norwegian: boolean
          pdf_language_english: boolean
          last_overdue_check?: string | null
          mva_registered?: boolean
          last_mva_popup?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      invoice_templates: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          currency: string
          default_due_days: number
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          currency?: string
          default_due_days?: number
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          currency?: string
          default_due_days?: number
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      template_items: {
        Row: {
          id: string
          template_id: string
          description: string
          quantity: number
          unit_price: number
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          template_id: string
          description: string
          quantity?: number
          unit_price: number
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          template_id?: string
          description?: string
          quantity?: number
          unit_price?: number
          sort_order?: number
          created_at?: string
        }
      }
    }
  }
}
