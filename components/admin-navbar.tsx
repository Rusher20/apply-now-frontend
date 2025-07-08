"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Users, Briefcase, Menu, X } from "lucide-react"
import { useState } from "react"
import LogoutButton from "./LogoutButton"
import { cn } from "@/lib/utils"

const navigation = [
  {
    name: "Applications",
    href: "/admin/applications",
    icon: Users,
    description: "Manage job applications",
  },
  {
    name: "Positions",
    href: "/admin/positions",
    icon: Briefcase,
    description: "Manage job positions",
  },
]

export default function AdminNavbar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <Link href="/admin" className="flex items-center gap-3">
              <img src="/PPSI.png" alt="PPSI Logo" className="h-10 object-contain" />
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">HR Dashboard</h1>
                <p className="text-xs text-gray-600">Admin Panel</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-100 text-blue-700 border border-blue-200"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                  {isActive && (
                    <Badge variant="secondary" className="ml-1 bg-blue-200 text-blue-800">
                      Active
                    </Badge>
                  )}
                </Link>
              )
            })}
          </div>

          {/* Right side - Desktop */}
          <div className="hidden md:flex items-center gap-4">
            <LogoutButton />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <LogoutButton />
            <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-blue-100 text-blue-700 border border-blue-200"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </div>
                    {isActive && (
                      <Badge variant="secondary" className="ml-auto bg-blue-200 text-blue-800">
                        Active
                      </Badge>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
