"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, ArrowLeft, User, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState<"ATHLETE" | "CLUB">("ATHLETE")

  return (
    <div className="flex min-h-screen">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-card border-r border-border p-12">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <span className="text-lg font-bold text-primary-foreground font-mono">O</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground font-mono">OGLA</span>
        </Link>

        <div className="max-w-md">
          <h2 className="text-3xl font-bold tracking-tight text-foreground text-balance">
            Start your journey today.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground text-pretty">
            Whether you are an athlete looking for your next competition or a club seeking talented fighters, Ogla connects you.
          </p>
        </div>

        <p className="text-xs text-muted-foreground">
          {'2026 Ogla. All rights reserved.'}
        </p>
      </div>

      {/* Right Panel */}
      <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground lg:hidden">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>

          <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
          <p className="mt-2 text-sm text-muted-foreground">Choose your role and get started</p>

          {/* Role Selection */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={() => setRole("ATHLETE")}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border p-4 transition-all",
                role === "ATHLETE"
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-muted-foreground"
              )}
            >
              <User className="h-6 w-6" />
              <span className="text-sm font-medium">Athlete</span>
            </button>
            <button
              onClick={() => setRole("CLUB")}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border p-4 transition-all",
                role === "CLUB"
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-muted-foreground"
              )}
            >
              <Building2 className="h-6 w-6" />
              <span className="text-sm font-medium">Club</span>
            </button>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <Button variant="outline" className="w-full gap-2" size="lg">
              <svg viewBox="0 0 24 24" className="h-5 w-5">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </Button>
          </div>

          <div className="my-6 flex items-center gap-4">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">or</span>
            <Separator className="flex-1" />
          </div>

          <form className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" placeholder="John" className="h-11" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" placeholder="Doe" className="h-11" />
              </div>
            </div>

            {role === "CLUB" && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="clubName">Club Name</Label>
                <Input id="clubName" placeholder="Dragon Dojo" className="h-11" />
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" className="h-11" />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 8 characters"
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button size="lg" className="mt-2 w-full">
              {role === "ATHLETE" ? "Create Athlete Account" : "Register Club"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
