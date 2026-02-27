"use client"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus, Check, X, Clock, Building2, ExternalLink } from "lucide-react"

const activeAffiliations = [
  { club: "Dragon Dojo", role: "Member", since: "Jan 2024", disciplines: ["Karate", "Kata"], members: 45 },
  { club: "Iron Fist Academy", role: "Coach", since: "Mar 2023", disciplines: ["Judo"], members: 82 },
]

const pendingRequests = [
  { club: "Golden Tiger Gym", requestDate: "Feb 20, 2026", disciplines: ["BJJ", "MMA"], members: 120 },
]

const suggestedClubs = [
  { name: "Rising Sun Dojo", disciplines: ["Karate", "Aikido"], location: "Osaka, Japan", members: 67 },
  { name: "Eagle MMA Center", disciplines: ["MMA", "BJJ"], location: "Los Angeles, USA", members: 150 },
  { name: "Lion Heart Academy", disciplines: ["Judo", "Wrestling"], location: "London, UK", members: 93 },
]

export default function AffiliationsPage() {
  return (
    <DashboardShell role="athlete">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Affiliations</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage your club memberships and connections</p>
          </div>
          <Button className="gap-2"><Plus className="h-4 w-4" /> Find Clubs</Button>
        </div>

        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">Active ({activeAffiliations.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingRequests.length})</TabsTrigger>
            <TabsTrigger value="discover">Discover</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-4">
            <div className="flex flex-col gap-4">
              {activeAffiliations.map((a, i) => (
                <Card key={i} className="border-border bg-card">
                  <CardContent className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-14 w-14">
                        <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">{a.club[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-lg font-semibold text-foreground">{a.club}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline" className="text-xs">{a.role}</Badge>
                          <span>Since {a.since}</span>
                          <span>{a.members} members</span>
                        </div>
                        <div className="mt-2 flex gap-1.5">
                          {a.disciplines.map((d) => (
                            <Badge key={d} variant="secondary" className="text-xs">{d}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="gap-1">
                        <ExternalLink className="h-3.5 w-3.5" /> View Club
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive">Leave</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pending" className="mt-4">
            <div className="flex flex-col gap-4">
              {pendingRequests.map((p, i) => (
                <Card key={i} className="border-border bg-card border-dashed">
                  <CardContent className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
                        <Clock className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-foreground">{p.club}</p>
                        <p className="text-sm text-muted-foreground">Requested on {p.requestDate}</p>
                        <div className="mt-2 flex gap-1.5">
                          {p.disciplines.map((d) => (
                            <Badge key={d} variant="secondary" className="text-xs">{d}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs gap-1 w-fit">
                      <Clock className="h-3 w-3" /> Awaiting Approval
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="discover" className="mt-4">
            <div className="mb-4 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search clubs by name, discipline, or location..."
                className="h-11 w-full rounded-lg border border-border bg-secondary pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {suggestedClubs.map((club, i) => (
                <Card key={i} className="border-border bg-card">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-accent/10 text-accent font-bold">{club.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-foreground">{club.name}</p>
                        <p className="text-xs text-muted-foreground">{club.location}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {club.disciplines.map((d) => (
                        <Badge key={d} variant="secondary" className="text-xs">{d}</Badge>
                      ))}
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">{club.members} members</p>
                    <Button className="mt-4 w-full" size="sm">Request Affiliation</Button>
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
