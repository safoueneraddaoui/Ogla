"use client"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Users,
  Trophy,
  Building2,
  TrendingUp,
  ArrowUpRight,
  Swords,
  Plus,
  MoreHorizontal,
  AlertCircle,
} from "lucide-react"

const adminStats = [
  { label: "Total Athletes", value: "10,482", icon: Users, change: "+324 this month", up: true },
  { label: "Active Clubs", value: "218", icon: Building2, change: "+12 this month", up: true },
  { label: "Competitions", value: "47", icon: Trophy, change: "8 active now", up: true },
  { label: "Matches Played", value: "3,291", icon: Swords, change: "+156 this week", up: true },
]

const recentUsers = [
  { name: "Yuki Tanaka", email: "yuki@example.com", role: "ATHLETE", joined: "2h ago" },
  { name: "Golden Tiger Gym", email: "info@goldentiger.com", role: "CLUB", joined: "5h ago" },
  { name: "Maria Santos", email: "maria@example.com", role: "ATHLETE", joined: "1d ago" },
  { name: "Alexander Petrov", email: "alex@example.com", role: "ATHLETE", joined: "1d ago" },
  { name: "Seoul Fight Club", email: "admin@sfc.kr", role: "CLUB", joined: "2d ago" },
]

const pendingActions = [
  { text: "3 competitions awaiting approval", type: "competition" },
  { text: "12 new club registrations to review", type: "club" },
  { text: "5 reported profiles flagged", type: "report" },
  { text: "System update scheduled for March 1", type: "system" },
]

export default function AdminDashboard() {
  return (
    <DashboardShell role="admin">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Overview</h1>
            <p className="mt-1 text-sm text-muted-foreground">Monitor and manage the entire Ogla platform</p>
          </div>
          <Button className="gap-2"><Plus className="h-4 w-4" /> Create Competition</Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {adminStats.map((stat) => (
            <Card key={stat.label} className="border-border bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-primary" />
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
                <p className="mt-2 text-xs text-primary">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Users */}
          <div className="lg:col-span-2">
            <Card className="border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-foreground">Recent Registrations</CardTitle>
                <Button variant="ghost" size="sm" className="text-primary">View All</Button>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  {recentUsers.map((user, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">{user.name.split(" ").map(n => n[0]).join("").slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-foreground">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={user.role === "CLUB" ? "secondary" : "outline"} className="text-xs">
                          {user.role}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{user.joined}</span>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Actions */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <AlertCircle className="h-4 w-4 text-primary" /> Action Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                {pendingActions.map((action, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-lg border border-border bg-secondary/30 p-3">
                    <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    <div>
                      <p className="text-sm text-foreground">{action.text}</p>
                      <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary">Review</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  )
}
