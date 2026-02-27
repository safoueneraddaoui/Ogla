"use client"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  Edit,
  MapPin,
  Calendar,
  Trophy,
  Medal,
  Building2,
  ExternalLink,
  Weight,
} from "lucide-react"

const achievements = [
  { title: "National Champion 2025", discipline: "Karate", medal: "Gold" },
  { title: "Regional Open 2024", discipline: "Karate", medal: "Silver" },
  { title: "Masters Cup 2024", discipline: "Judo", medal: "Bronze" },
  { title: "City Championship 2023", discipline: "Karate", medal: "Gold" },
]

const affiliations = [
  { club: "Dragon Dojo", role: "Member", since: "Jan 2024", status: "Active" },
  { club: "Iron Fist Academy", role: "Coach", since: "Mar 2023", status: "Active" },
  { club: "Phoenix Martial Arts", role: "Member", since: "Jun 2021", status: "Left" },
]

const matchHistory = [
  { opponent: "Yuki Tanaka", result: "Win", competition: "National Open 2025", score: "5-2" },
  { opponent: "Carlos Rivera", result: "Win", competition: "Masters Cup 2024", score: "3-1" },
  { opponent: "Amir Hassan", result: "Loss", competition: "Regional Open 2024", score: "2-4" },
  { opponent: "Lee Min-ho", result: "Win", competition: "City Championship 2024", score: "6-0" },
]

export default function AthleteProfilePage() {
  return (
    <DashboardShell role="athlete">
      <div className="flex flex-col gap-6">
        {/* Profile Header */}
        <Card className="border-border bg-card overflow-hidden">
          {/* Banner */}
          <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-accent/10" />
          <CardContent className="relative px-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div className="flex items-end gap-4 -mt-12">
                <Avatar className="h-24 w-24 border-4 border-card">
                  <AvatarFallback className="bg-primary/20 text-primary text-2xl font-bold">JD</AvatarFallback>
                </Avatar>
                <div className="pb-1">
                  <h1 className="text-2xl font-bold text-foreground">John Doe</h1>
                  <p className="text-sm text-muted-foreground">Karate & Judo Athlete</p>
                </div>
              </div>
              <Button variant="outline" className="gap-2">
                <Edit className="h-4 w-4" /> Edit Profile
              </Button>
            </div>

            <div className="mt-6 flex flex-wrap gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> Tokyo, Japan</span>
              <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Joined Jan 2023</span>
              <span className="flex items-center gap-1.5"><Weight className="h-4 w-4" /> 75kg</span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="secondary">Karate</Badge>
              <Badge variant="secondary">Judo</Badge>
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20">Black Belt</Badge>
            </div>

            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Competitive martial artist with over 10 years of experience in Karate and Judo. 
              Currently training with Dragon Dojo and competing nationally. Passionate about 
              pushing the boundaries of technique and sportsmanship.
            </p>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="achievements" className="w-full">
          <TabsList className="w-full justify-start bg-card border border-border rounded-lg p-1 h-auto flex-wrap">
            <TabsTrigger value="achievements" className="gap-1.5">
              <Medal className="h-4 w-4" /> Achievements
            </TabsTrigger>
            <TabsTrigger value="affiliations" className="gap-1.5">
              <Building2 className="h-4 w-4" /> Affiliations
            </TabsTrigger>
            <TabsTrigger value="matches" className="gap-1.5">
              <Trophy className="h-4 w-4" /> Match History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="achievements" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              {achievements.map((a, i) => (
                <Card key={i} className="border-border bg-card">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Medal className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{a.title}</p>
                      <p className="text-sm text-muted-foreground">{a.discipline}</p>
                    </div>
                    <Badge variant={a.medal === "Gold" ? "default" : "secondary"}>
                      {a.medal}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="affiliations" className="mt-4">
            <div className="flex flex-col gap-4">
              {affiliations.map((a, i) => (
                <Card key={i} className="border-border bg-card">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-secondary text-foreground text-sm">{a.club[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">{a.club}</p>
                        <p className="text-sm text-muted-foreground">{a.role} since {a.since}</p>
                      </div>
                    </div>
                    <Badge variant={a.status === "Active" ? "default" : "secondary"}>{a.status}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="matches" className="mt-4">
            <Card className="border-border bg-card">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Opponent</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Competition</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Score</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {matchHistory.map((m, i) => (
                        <tr key={i} className="border-b border-border last:border-0">
                          <td className="px-4 py-3 font-medium text-foreground">{m.opponent}</td>
                          <td className="px-4 py-3 text-muted-foreground">{m.competition}</td>
                          <td className="px-4 py-3 text-muted-foreground">{m.score}</td>
                          <td className="px-4 py-3">
                            <Badge variant={m.result === "Win" ? "default" : "destructive"} className="text-xs">
                              {m.result}
                            </Badge>
                          </td>
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
    </DashboardShell>
  )
}
