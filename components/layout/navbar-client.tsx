// components/layout/navbar-client.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
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
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Menu, X } from 'lucide-react'

interface NavbarProps {
  user: {
    email: string | undefined
  }
  profile: {
    mva_registered: boolean
    logo_url: string | null
    business_name: string | null
    full_name: string | null
  } | null
  revenueNOK: number
}

export function NavbarClient({ user, profile, revenueNOK }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Determine initials
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

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/dashboard/clients', label: 'Clients' },
    { href: '/dashboard/invoices', label: 'Invoices' },
    { href: '/dashboard/templates', label: 'Templates' },
    { href: '/dashboard/analytics', label: 'Analytics' },
    { href: '/dashboard/mva-guide', label: 'MVA Guide' },
  ]

  return (
    <nav className="border-b border-border bg-background sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center">
            <span className="text-xl sm:text-2xl font-bold text-foreground">
              Invo
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* MVA Indicator */}
            {!profile?.mva_registered && revenueNOK > 0 && (
              <div className="hidden sm:block text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
                MVA: {Math.round((revenueNOK / 50000) * 100)}%
              </div>
            )}

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full"
                >
                  <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                    {profile?.logo_url && (
                      <AvatarImage
                        src={profile.logo_url}
                        alt="Company logo"
                        className="object-cover"
                      />
                    )}
                    <AvatarFallback className="bg-foreground text-background text-xs sm:text-sm">
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
                    <p className="text-xs leading-none text-slate-500 dark:text-slate-400 truncate">
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

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button
                  variant="ghost"
                  className="w-full justify-start text-slate-700 dark:text-slate-300"
                >
                  {link.label}
                </Button>
              </Link>
            ))}
            {!profile?.mva_registered && revenueNOK > 0 && (
              <div className="px-4 py-2 text-sm text-muted-foreground">
                MVA Progress: {Math.round((revenueNOK / 50000) * 100)}%
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
