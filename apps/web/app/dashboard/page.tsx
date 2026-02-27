"use client"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  Trophy,
  Users,
  Swords,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  Clock,
  MapPin,
} from "lucide-react"

const stats = [
  { label: "Active Affiliations", value: "3", icon: Users, change: "+1 this month" },
  { label: "Competitions Entered", value: "12", icon: Trophy, change: "+2 this quarter" },
  { label: "Matches Won", value: "28", icon: Swords, change: "73% win rate" },
  { label: "Ranking Points", value: "1,450", icon: TrendingUp, change: "+120 pts" },
]

const upcomingCompetitions = [
  { name: "National Karate Open", date: "Mar 15, 2026", location: "Tokyo Arena", status: "Confirmed", discipline: "Karate" },
  { name: "Judo Masters Cup", date: "Apr 2, 2026", location: "Seoul Sports Center", status: "Registered", discipline: "Judo" },
  { name: "BJJ Grand Prix", date: "Apr 20, 2026", location: "Rio Convention Center", status: "Pending", discipline: "BJJ" },
]

const recentActivity = [
  { text: "You won a match against Yuki Tanaka", time: "2 hours ago", type: "win" as const },
  { text: "Dragon Dojo accepted your affiliation", time: "1 day ago", type: "affiliation" as const },
  { text: "New competition: Spring Championship", time: "2 days ago", type: "competition" as const },
  { text: "Coach left a message in team chat", time: "3 days ago", type: "message" as const },
]

export default function AthleteDashboard() {
  return (
    <DashboardShell role="athlete">
      <div className="flex flex-col gap-6">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome back, John</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here is what is happening with your martial arts career.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-border bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
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
          {/* Upcoming Competitions */}
          <div className="lg:col-span-2">
            <Card className="border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-foreground">Upcoming Competitions</CardTitle>
                <Button variant="ghost" size="sm" className="text-primary">View All</Button>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  {upcomingCompetitions.map((comp) => (
                    <div key={comp.name} className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                          <Trophy className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{comp.name}</p>
                          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {comp.date}</span>
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {comp.location}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="text-xs">{comp.discipline}</Badge>
                        <Badge
                          variant={comp.status === "Confirmed" ? "default" : "outline"}
                          className="text-xs"
                        >
                          {comp.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Feed */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                {recentActivity.map((activity, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="mt-1 flex h-2 w-2 shrink-0 rounded-full bg-primary" />
                    <div>
                      <p className="text-sm text-foreground">{activity.text}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" /> {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Completeness */}
        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Profile Completeness</p>
                <p className="mt-1 text-sm text-muted-foreground">Add your belt rank and achievements to complete your profile</p>
              </div>
              <span className="text-2xl font-bold text-primary">72%</span>
            </div>
            <Progress value={72} className="mt-4 h-2" />
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
