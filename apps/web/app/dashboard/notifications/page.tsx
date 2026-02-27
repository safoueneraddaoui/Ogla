"use client"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import {
  Bell,
  Trophy,
  Building2,
  MessageCircle,
  Shield,
  Check,
  CheckCheck,
  Clock,
} from "lucide-react"

const notifications = [
  { id: 1, type: "COMPETITION", title: "Competition Registration Open", body: "National Karate Open 2026 is now accepting entries. Register before spots fill up.", time: "5 min ago", read: false },
  { id: 2, type: "AFFILIATION", title: "Affiliation Accepted", body: "Dragon Dojo has accepted your affiliation request. You are now an active member.", time: "1 hour ago", read: false },
  { id: 3, type: "CHAT", title: "New Message", body: "Yuki Tanaka sent you a message: 'Good luck in the tournament!'", time: "2 hours ago", read: false },
  { id: 4, type: "COMPETITION", title: "Match Scheduled", body: "Your quarter-final match against Carlos Rivera is scheduled for 3:00 PM today.", time: "5 hours ago", read: true },
  { id: 5, type: "SYSTEM", title: "Profile Milestone", body: "Congratulations! Your profile has reached 100% completeness.", time: "1 day ago", read: true },
  { id: 6, type: "AFFILIATION", title: "Affiliation Request", body: "Golden Tiger Gym is interested in your profile. Consider connecting.", time: "2 days ago", read: true },
  { id: 7, type: "COMPETITION", title: "Match Result Confirmed", body: "Your win against Lee Min-ho in the Regional Open has been officially recorded.", time: "3 days ago", read: true },
  { id: 8, type: "SYSTEM", title: "Platform Update", body: "New features available: Live match scoring and bracket visualization.", time: "5 days ago", read: true },
]

const typeConfig = {
  COMPETITION: { icon: Trophy, color: "text-primary" },
  AFFILIATION: { icon: Building2, color: "text-accent" },
  CHAT: { icon: MessageCircle, color: "text-primary" },
  SYSTEM: { icon: Shield, color: "text-muted-foreground" },
}

export default function NotificationsPage() {
  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <DashboardShell role="athlete">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
            <p className="mt-1 text-sm text-muted-foreground">{unreadCount} unread notifications</p>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5">
            <CheckCheck className="h-3.5 w-3.5" /> Mark All Read
          </Button>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
            <TabsTrigger value="competitions">Competitions</TabsTrigger>
            <TabsTrigger value="affiliations">Affiliations</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <div className="flex flex-col gap-2">
              {notifications.map((notif) => {
                const config = typeConfig[notif.type as keyof typeof typeConfig]
                const Icon = config.icon
                return (
                  <Card
                    key={notif.id}
                    className={cn(
                      "border-border transition-all cursor-pointer hover:border-primary/20",
                      !notif.read && "bg-primary/5 border-primary/20"
                    )}
                  >
                    <CardContent className="flex items-start gap-4 p-4">
                      <div className={cn("mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary", config.color)}>
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className={cn("text-sm", !notif.read ? "font-semibold text-foreground" : "font-medium text-foreground")}>{notif.title}</p>
                            <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">{notif.body}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" /> {notif.time}
                            </span>
                            {!notif.read && <span className="h-2 w-2 rounded-full bg-primary" />}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="unread" className="mt-4">
            <div className="flex flex-col gap-2">
              {notifications.filter(n => !n.read).map((notif) => {
                const config = typeConfig[notif.type as keyof typeof typeConfig]
                const Icon = config.icon
                return (
                  <Card key={notif.id} className="border-primary/20 bg-primary/5 cursor-pointer">
                    <CardContent className="flex items-start gap-4 p-4">
                      <div className={cn("mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary", config.color)}>
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">{notif.title}</p>
                        <p className="mt-0.5 text-sm text-muted-foreground">{notif.body}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{notif.time}</p>
                      </div>
                      <span className="h-2 w-2 shrink-0 rounded-full bg-primary mt-2" />
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="competitions" className="mt-4">
            <div className="flex flex-col gap-2">
              {notifications.filter(n => n.type === "COMPETITION").map((notif) => (
                <Card key={notif.id} className={cn("border-border", !notif.read && "bg-primary/5 border-primary/20")}>
                  <CardContent className="flex items-start gap-4 p-4">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                      <Trophy className="h-4.5 w-4.5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{notif.title}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{notif.body}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{notif.time}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="affiliations" className="mt-4">
            <div className="flex flex-col gap-2">
              {notifications.filter(n => n.type === "AFFILIATION").map((notif) => (
                <Card key={notif.id} className={cn("border-border", !notif.read && "bg-primary/5 border-primary/20")}>
                  <CardContent className="flex items-start gap-4 p-4">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-accent">
                      <Building2 className="h-4.5 w-4.5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{notif.title}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{notif.body}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{notif.time}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  )
}
