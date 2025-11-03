// components/layout/navbar.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
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

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/dashboard/clients', label: 'Clients' },
    { href: '/dashboard/invoices', label: 'Invoices' },
    { href: '/dashboard/templates', label: 'Templates' },
    { href: '/dashboard/analytics', label: 'Analytics' },
    { href: '/dashboard/mva-guide', label: 'MVA Guide' },
  ]

  return (
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center">
            <span className="text-xl sm:text-2xl font-bold text-slate-900">
              Invo
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button variant="ghost" size="sm">
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Right Side: MVA Indicator + User Menu + Mobile Toggle */}
          <div className="flex items-center gap-2">
            {/* MVA Indicator - Hide text on mobile */}
            {!profile?.mva_registered && revenueNOK > 0 && (
              <div className="hidden sm:block text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
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
                    <AvatarFallback className="bg-slate-900 text-white text-xs sm:text-sm">
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
                    <p className="text-xs leading-none text-muted-foreground truncate">
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
          <div className="lg:hidden border-t py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button variant="ghost" className="w-full justify-start">
                  {link.label}
                </Button>
              </Link>
            ))}
            {/* MVA Status in mobile menu */}
            {!profile?.mva_registered && revenueNOK > 0 && (
              <div className="px-4 py-2 text-sm text-slate-600">
                MVA Progress: {Math.round((revenueNOK / 50000) * 100)}%
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
