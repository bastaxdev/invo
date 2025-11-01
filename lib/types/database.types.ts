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
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          org_number: string
          address: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          org_number?: string
          address?: string
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
          currency: string
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
          currency?: string
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
          currency?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
