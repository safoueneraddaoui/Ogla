"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Calendar,
  MapPin,
  Users,
  Trophy,
  Filter,
  ArrowRight,
  Zap,
  Clock,
} from "lucide-react"
import Link from "next/link"

const competitions = [
  {
    id: "1",
    name: "National Karate Open 2026",
    discipline: "Karate",
    location: "Tokyo Arena, Japan",
    startDate: "Mar 15, 2026",
    endDate: "Mar 17, 2026",
    status: "OPEN" as const,
    entries: 128,
    maxEntries: 256,
  },
  {
    id: "2",
    name: "Judo Masters Cup",
    discipline: "Judo",
    location: "Seoul Sports Center, Korea",
    startDate: "Apr 2, 2026",
    endDate: "Apr 4, 2026",
    status: "OPEN" as const,
    entries: 64,
    maxEntries: 128,
  },
  {
    id: "3",
    name: "BJJ Grand Prix Spring",
    discipline: "BJJ",
    location: "Rio Convention Center, Brazil",
    startDate: "Apr 20, 2026",
    endDate: "Apr 22, 2026",
    status: "OPEN" as const,
    entries: 96,
    maxEntries: 192,
  },
  {
    id: "4",
    name: "World Taekwondo Championship",
    discipline: "Taekwondo",
    location: "London Olympic Arena, UK",
    startDate: "May 10, 2026",
    endDate: "May 14, 2026",
    status: "DRAFT" as const,
    entries: 0,
    maxEntries: 512,
  },
  {
    id: "5",
    name: "Regional Karate Series - Round 3",
    discipline: "Karate",
    location: "Osaka Budokan, Japan",
    startDate: "Feb 28, 2026",
    endDate: "Mar 1, 2026",
    status: "IN_PROGRESS" as const,
    entries: 64,
    maxEntries: 64,
  },
]

const statusConfig = {
  OPEN: { label: "Open", variant: "default" as const },
  DRAFT: { label: "Upcoming", variant: "secondary" as const },
  IN_PROGRESS: { label: "Live", variant: "destructive" as const },
  CLOSED: { label: "Closed", variant: "outline" as const },
}

export default function CompetitionsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 pt-28 pb-20">
        <div className="flex flex-col gap-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Competitions</h1>
              <p className="mt-2 text-muted-foreground">Discover and register for martial arts competitions worldwide</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search competitions..."
                  className="h-10 w-64 rounded-lg border border-border bg-secondary pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>
              <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
            </div>
          </div>

          {/* Live Banner */}
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 animate-pulse">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground">Regional Karate Series - Round 3</p>
                    <Badge variant="destructive" className="text-xs">LIVE</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">64 athletes competing now at Osaka Budokan</p>
                </div>
              </div>
              <Button className="gap-2" asChild>
                <Link href="/competitions/5">
                  Watch Live <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="open">Open Registration</TabsTrigger>
              <TabsTrigger value="live">Live Now</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <div className="flex flex-col gap-4">
                {competitions.map((comp) => {
                  const config = statusConfig[comp.status]
                  return (
                    <Link key={comp.id} href={`/competitions/${comp.id}`}>
                      <Card className="border-border bg-card transition-all hover:border-primary/30 cursor-pointer">
                        <CardContent className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6">
                          <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                              <Trophy className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-lg font-semibold text-foreground">{comp.name}</p>
                                <Badge variant={config.variant} className="text-xs">
                                  {comp.status === "IN_PROGRESS" && <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-current animate-pulse" />}
                                  {config.label}
                                </Badge>
                              </div>
                              <div className="mt-1.5 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {comp.startDate} - {comp.endDate}</span>
                                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {comp.location}</span>
                                <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {comp.entries}/{comp.maxEntries}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary">{comp.discipline}</Badge>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            </TabsContent>

            <TabsContent value="open" className="mt-6">
              <div className="flex flex-col gap-4">
                {competitions.filter(c => c.status === "OPEN").map((comp) => (
                  <Card key={comp.id} className="border-border bg-card">
                    <CardContent className="flex items-center justify-between p-6">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                          <Trophy className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-foreground">{comp.name}</p>
                          <p className="text-sm text-muted-foreground">{comp.startDate} - {comp.location}</p>
                        </div>
                      </div>
                      <Button size="sm">Register</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="live" className="mt-6">
              <div className="flex flex-col gap-4">
                {competitions.filter(c => c.status === "IN_PROGRESS").map((comp) => (
                  <Card key={comp.id} className="border-primary/30 bg-card">
                    <CardContent className="flex items-center justify-between p-6">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/20 animate-pulse">
                          <Zap className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-foreground">{comp.name}</p>
                          <p className="text-sm text-muted-foreground">{comp.entries} athletes competing</p>
                        </div>
                      </div>
                      <Button className="gap-2" asChild>
                        <Link href={`/competitions/${comp.id}`}>Watch Live <ArrowRight className="h-4 w-4" /></Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="upcoming" className="mt-6">
              <div className="flex flex-col gap-4">
                {competitions.filter(c => c.status === "DRAFT").map((comp) => (
                  <Card key={comp.id} className="border-border bg-card">
                    <CardContent className="flex items-center justify-between p-6">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-secondary">
                          <Clock className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-foreground">{comp.name}</p>
                          <p className="text-sm text-muted-foreground">{comp.startDate} - {comp.location}</p>
                        </div>
                      </div>
                      <Badge variant="secondary">Coming Soon</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  )
}
