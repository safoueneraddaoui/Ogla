"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  User,
  Users,
  Trophy,
  MessageCircle,
  Bell,
  Settings,
  Search,
  Menu,
  X,
  LogOut,
  Shield,
  Building2,
  Swords,
  ChevronDown,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DashboardShellProps {
  children: React.ReactNode
  role?: "athlete" | "club" | "admin"
}

const navItems = {
  athlete: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "My Profile", href: "/dashboard/profile", icon: User },
    { label: "Affiliations", href: "/dashboard/affiliations", icon: Building2 },
    { label: "Competitions", href: "/dashboard/competitions", icon: Trophy },
    { label: "Messages", href: "/dashboard/messages", icon: MessageCircle },
    { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
  ],
  club: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Club Profile", href: "/dashboard/profile", icon: Building2 },
    { label: "Members", href: "/dashboard/members", icon: Users },
    { label: "Competitions", href: "/dashboard/competitions", icon: Trophy },
    { label: "Messages", href: "/dashboard/messages", icon: MessageCircle },
    { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
  ],
  admin: [
    { label: "Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Competitions", href: "/admin/competitions", icon: Trophy },
    { label: "Matches", href: "/admin/matches", icon: Swords },
    { label: "Reports", href: "/admin/reports", icon: Shield },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ],
}

export function DashboardShell({ children, role = "athlete" }: DashboardShellProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const items = navItems[role]

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card transition-transform lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground font-mono">O</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground font-mono">OGLA</span>
          </Link>
          <button className="lg:hidden text-muted-foreground" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="flex flex-col gap-1">
            {items.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all",
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4.5 w-4.5" />
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="border-t border-border p-4">
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
          >
            <Settings className="h-4.5 w-4.5" />
            Settings
          </Link>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 backdrop-blur-xl px-6">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-muted-foreground" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
              <Menu className="h-5 w-5" />
            </button>
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search athletes, clubs, competitions..."
                className="h-9 w-80 rounded-lg border border-border bg-secondary pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
              <Bell className="h-4.5 w-4.5 text-muted-foreground" />
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">3</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-secondary" aria-label="User menu">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">JD</AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-foreground">John Doe</p>
                    <p className="text-xs text-muted-foreground capitalize">{role}</p>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden md:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem><User className="mr-2 h-4 w-4" /> Profile</DropdownMenuItem>
                <DropdownMenuItem><Settings className="mr-2 h-4 w-4" /> Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive"><LogOut className="mr-2 h-4 w-4" /> Sign Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
