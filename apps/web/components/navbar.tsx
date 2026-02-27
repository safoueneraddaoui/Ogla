"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <span className="text-lg font-bold text-primary-foreground font-mono">O</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground font-mono">OGLA</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link href="/athletes" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Athletes
          </Link>
          <Link href="/clubs" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Clubs
          </Link>
          <Link href="/competitions" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Competitions
          </Link>
          <button className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
            More <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Log In</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/register">Get Started</Link>
          </Button>
        </div>

        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="border-t border-border bg-background px-6 py-6 md:hidden">
          <div className="flex flex-col gap-4">
            <Link href="/athletes" className="text-sm text-muted-foreground hover:text-foreground">Athletes</Link>
            <Link href="/clubs" className="text-sm text-muted-foreground hover:text-foreground">Clubs</Link>
            <Link href="/competitions" className="text-sm text-muted-foreground hover:text-foreground">Competitions</Link>
            <div className="flex flex-col gap-2 pt-4 border-t border-border">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Log In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
