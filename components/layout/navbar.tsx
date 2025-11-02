// components/layout/navbar.tsx
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signOut } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MiniMVAIndicator } from '@/components/layout/mini-mva-indicator'
import { calculateLast12MonthsRevenueNOK } from '@/app/actions/mva'

export async function Navbar() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile for logo and name
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('mva_registered, logo_url, business_name, full_name')
    .eq('user_id', user.id)
    .single()

  // Determine initials based on business_name or full_name, fallback to email
  let initials = 'U'
  if (profile?.business_name) {
    initials = profile.business_name
      .split(' ')
      .map((word: string) => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()
  } else if (profile?.full_name) {
    initials = profile.full_name
      .split(' ')
      .map((word: string) => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()
  } else {
    initials = user.email?.split('@')[0].substring(0, 2).toUpperCase() || 'U'
  }

  const revenueNOK = await calculateLast12MonthsRevenueNOK()

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center">
              <span className="text-2xl font-bold text-slate-900">Invo</span>
            </Link>

            {/* Navigation Links */}
            <div className="ml-10 flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Link href="/dashboard/clients">
                <Button variant="ghost">Clients</Button>
              </Link>
              <Link href="/dashboard/invoices">
                <Button variant="ghost">Invoices</Button>
              </Link>
              <Link href="/dashboard/templates">
                <Button variant="ghost">Templates</Button>
              </Link>
              <Link href="/dashboard/analytics">
                <Button variant="ghost">Analytics</Button>
              </Link>
              <Link href="/dashboard/mva-guide">
                <Button variant="ghost">MVA Guide</Button>
              </Link>
            </div>
          </div>

          {/* MVA Indicator + User Dropdown */}
          <div className="flex items-center gap-3">
            <MiniMVAIndicator
              revenueNOK={revenueNOK}
              mvaRegistered={profile?.mva_registered || false}
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full"
                >
                  <Avatar>
                    {/* Show logo if available, otherwise show initials */}
                    {profile?.logo_url && (
                      <AvatarImage
                        src={profile.logo_url}
                        alt="Company logo"
                        className="object-cover"
                      />
                    )}
                    <AvatarFallback className="bg-slate-900 text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      My Account
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <form action={signOut} className="w-full">
                    <button type="submit" className="w-full text-left">
                      Log out
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  )
}
