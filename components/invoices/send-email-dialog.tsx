// components/invoices/send-email-dialog.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { sendInvoiceEmail } from '@/app/actions/email'
import { Mail } from 'lucide-react'

interface SendEmailDialogProps {
  invoiceId: string
  invoiceNumber: string
  defaultEmail?: string
}

export function SendEmailDialog({
  invoiceId,
  invoiceNumber,
  defaultEmail,
}: SendEmailDialogProps) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState(defaultEmail || '')
  const [language, setLanguage] = useState<'en' | 'pl' | 'no'>('en')
  const [isSending, setIsSending] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSending(true)
    setMessage(null)

    const result = await sendInvoiceEmail(invoiceId, email, language)

    if (result.error) {
      setMessage({ type: 'error', text: result.error })
    } else {
      setMessage({ type: 'success', text: 'Invoice sent successfully!' })
      setTimeout(() => {
        setOpen(false)
        setMessage(null)
      }, 2000)
    }

    setIsSending(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg">
          <Mail className="mr-2 h-4 w-4" />
          Send via Email
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Invoice via Email</DialogTitle>
          <DialogDescription>
            Send invoice {invoiceNumber} as a PDF attachment
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSend} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Recipient Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="client@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Email Language</Label>
            <Select
              value={language}
              onValueChange={(value: 'en' | 'pl' | 'no') => setLanguage(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">🇬🇧 English</SelectItem>
                <SelectItem value="pl">🇵🇱 Polish</SelectItem>
                <SelectItem value="no">🇳🇴 Norwegian</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">
              Choose the language for the email body (PDF is always bilingual)
            </p>
          </div>

          {message && (
            <div
              className={`rounded-md p-3 text-sm ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800'
                  : 'bg-red-50 text-red-800'
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={isSending} className="flex-1">
              {isSending ? 'Sending...' : 'Send Invoice'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSending}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
