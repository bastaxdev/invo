// components/invoices/client-selection.tsx
'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Client {
  id: string
  name: string
  org_number: string
  address: string
  country?: string
}

interface ClientSelectionProps {
  clients: Client[]
  useNewClient: boolean
  setUseNewClient: (value: boolean) => void
  selectedClientId: string
  setSelectedClientId: (value: string) => void
  newClientCountry: string
  setNewClientCountry: (value: string) => void
  isEditing: boolean
}

export function ClientSelection({
  clients,
  useNewClient,
  setUseNewClient,
  selectedClientId,
  setSelectedClientId,
  newClientCountry,
  setNewClientCountry,
  isEditing,
}: ClientSelectionProps) {
  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="use-new-client"
          checked={useNewClient}
          onCheckedChange={(checked) => setUseNewClient(checked === true)}
          disabled={isEditing}
        />
        <label
          htmlFor="use-new-client"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Create new client for this invoice
        </label>
      </div>

      {!useNewClient ? (
        <div className="space-y-2">
          <Label htmlFor="client_id">Select Client</Label>
          <Select
            name="client_id"
            value={selectedClientId}
            onValueChange={setSelectedClientId}
            required={!useNewClient}
            disabled={isEditing}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a client" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name} ({client.country || 'NO'})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isEditing && (
            <p className="text-xs text-slate-500">
              Client cannot be changed when editing.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new_client_name">Client Name</Label>
            <Input
              id="new_client_name"
              name="new_client_name"
              type="text"
              placeholder="e.g., Acme AS"
              required={useNewClient}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new_client_org_number">
              Organization Number (Optional)
            </Label>
            <Input
              id="new_client_org_number"
              name="new_client_org_number"
              type="text"
              placeholder="e.g., 123456789"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new_client_address">Address</Label>
            <Input
              id="new_client_address"
              name="new_client_address"
              type="text"
              placeholder="e.g., Storgata 1, 0001 Oslo, Norway"
              required={useNewClient}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new_client_country">Country</Label>
            <Select
              name="new_client_country"
              value={newClientCountry}
              onValueChange={setNewClientCountry}
              required={useNewClient}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NO">🇳🇴 Norway</SelectItem>
                <SelectItem value="PL">🇵🇱 Poland</SelectItem>
                <SelectItem value="SE">🇸🇪 Sweden</SelectItem>
                <SelectItem value="DK">🇩🇰 Denmark</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">
              VAT is only applied to Norwegian clients when you're MVA
              registered
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
