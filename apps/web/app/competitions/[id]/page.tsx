"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  Calendar,
  MapPin,
  Users,
  Trophy,
  ArrowLeft,
  Zap,
  Clock,
  Swords,
} from "lucide-react"
import Link from "next/link"

const liveMatches = [
  { id: 1, athlete1: "John Doe", athlete2: "Yuki Tanaka", score1: 3, score2: 2, round: "Quarter Final", status: "LIVE", weightClass: "75kg" },
  { id: 2, athlete1: "Carlos Rivera", athlete2: "Amir Hassan", score1: 1, score2: 1, round: "Quarter Final", status: "LIVE", weightClass: "68kg" },
  { id: 3, athlete1: "Lee Min-ho", athlete2: "Pierre Dupont", score1: 4, score2: 0, round: "Quarter Final", status: "COMPLETED", weightClass: "80kg" },
]

const bracket = [
  { round: "Semi Final 1", athlete1: "TBD", athlete2: "TBD", time: "3:00 PM" },
  { round: "Semi Final 2", athlete1: "Lee Min-ho", athlete2: "TBD", time: "3:30 PM" },
  { round: "Final", athlete1: "TBD", athlete2: "TBD", time: "5:00 PM" },
]

const entries = [
  { name: "John Doe", club: "Dragon Dojo", weightClass: "75kg", beltRank: "Black Belt" },
  { name: "Yuki Tanaka", club: "Rising Sun", weightClass: "75kg", beltRank: "Black Belt" },
  { name: "Carlos Rivera", club: "Iron Fist", weightClass: "68kg", beltRank: "Brown Belt" },
  { name: "Amir Hassan", club: "Falcon Academy", weightClass: "68kg", beltRank: "Black Belt" },
  { name: "Lee Min-ho", club: "Tiger Gym", weightClass: "80kg", beltRank: "Black Belt" },
  { name: "Pierre Dupont", club: "Paris Dojo", weightClass: "80kg", beltRank: "Brown Belt" },
]

export default function CompetitionDetailPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 pt-28 pb-20">
        <div className="flex flex-col gap-8">
          {/* Back */}
          <Link href="/competitions" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground w-fit">
            <ArrowLeft className="h-4 w-4" /> Back to Competitions
          </Link>

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-foreground">Regional Karate Series - Round 3</h1>
                <Badge variant="destructive" className="gap-1">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-current animate-pulse" /> LIVE
                </Badge>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Feb 28 - Mar 1, 2026</span>
                <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> Osaka Budokan, Japan</span>
                <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> 64 athletes</span>
                <Badge variant="secondary">Karate</Badge>
              </div>
            </div>
            <Button className="gap-2"><Trophy className="h-4 w-4" /> Register Now</Button>
          </div>

          {/* Live Matches */}
          <Card className="border-primary/30 bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Zap className="h-5 w-5 text-primary" /> Live Matches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                {liveMatches.map((match) => (
                  <div
                    key={match.id}
                    className={`rounded-xl border p-5 ${
                      match.status === "LIVE" ? "border-primary/30 bg-primary/5" : "border-border bg-secondary/30"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{match.round}</Badge>
                        <Badge variant="secondary" className="text-xs">{match.weightClass}</Badge>
                      </div>
                      {match.status === "LIVE" ? (
                        <Badge variant="destructive" className="gap-1 text-xs">
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-current animate-pulse" /> LIVE
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Completed</Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/20 text-primary text-sm">{match.athlete1.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-foreground">{match.athlete1}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-3xl font-bold text-foreground">{match.score1}</span>
                        <span className="text-lg text-muted-foreground">-</span>
                        <span className="text-3xl font-bold text-foreground">{match.score2}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-foreground">{match.athlete2}</span>
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-accent/20 text-accent text-sm">{match.athlete2.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="bracket">
            <TabsList>
              <TabsTrigger value="bracket" className="gap-1.5"><Swords className="h-4 w-4" /> Bracket</TabsTrigger>
              <TabsTrigger value="entries" className="gap-1.5"><Users className="h-4 w-4" /> Entries</TabsTrigger>
            </TabsList>

            <TabsContent value="bracket" className="mt-4">
              <div className="flex flex-col gap-4">
                {bracket.map((b, i) => (
                  <Card key={i} className="border-border bg-card">
                    <CardContent className="flex items-center justify-between p-5">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                          <Swords className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{b.round}</p>
                          <p className="text-sm text-muted-foreground">{b.athlete1} vs {b.athlete2}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" /> {b.time}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="entries" className="mt-4">
              <Card className="border-border bg-card">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="px-4 py-3 text-left font-medium text-muted-foreground">Athlete</th>
                          <th className="px-4 py-3 text-left font-medium text-muted-foreground">Club</th>
                          <th className="px-4 py-3 text-left font-medium text-muted-foreground">Weight Class</th>
                          <th className="px-4 py-3 text-left font-medium text-muted-foreground">Belt Rank</th>
                        </tr>
                      </thead>
                      <tbody>
                        {entries.map((e, i) => (
                          <tr key={i} className="border-b border-border last:border-0">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-7 w-7">
                                  <AvatarFallback className="bg-primary/10 text-primary text-xs">{e.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium text-foreground">{e.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">{e.club}</td>
                            <td className="px-4 py-3 text-muted-foreground">{e.weightClass}</td>
                            <td className="px-4 py-3"><Badge variant="secondary" className="text-xs">{e.beltRank}</Badge></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  )
}
