"use client"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Trophy,
  Calendar,
  MapPin,
  Search,
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react"
import Link from "next/link"

const myCompetitions = [
  { name: "National Karate Open 2026", date: "Mar 15-17, 2026", location: "Tokyo Arena", status: "Confirmed", discipline: "Karate", weightClass: "75kg" },
  { name: "Judo Masters Cup", date: "Apr 2-4, 2026", location: "Seoul Sports Center", status: "Registered", discipline: "Judo", weightClass: "73kg" },
  { name: "BJJ Grand Prix Spring", date: "Apr 20-22, 2026", location: "Rio Convention Center", status: "Pending", discipline: "BJJ", weightClass: "76kg" },
]

const pastCompetitions = [
  { name: "Regional Karate Series R2", date: "Jan 20, 2026", result: "1st Place", matches: "4W 0L" },
  { name: "Winter Judo Open", date: "Dec 10, 2025", result: "3rd Place", matches: "3W 1L" },
  { name: "City Karate Championship", date: "Nov 5, 2025", result: "2nd Place", matches: "3W 1L" },
]

const statusIcon = {
  Confirmed: <CheckCircle className="h-4 w-4 text-green-500" />,
  Registered: <Clock className="h-4 w-4 text-primary" />,
  Pending: <Clock className="h-4 w-4 text-muted-foreground" />,
}

export default function CompetitionsDashboardPage() {
  return (
    <DashboardShell role="athlete">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Competitions</h1>
            <p className="mt-1 text-sm text-muted-foreground">Track your competition entries and results</p>
          </div>
          <Button className="gap-2" asChild>
            <Link href="/competitions">
              <Search className="h-4 w-4" /> Browse Competitions
            </Link>
          </Button>
        </div>

        <Tabs defaultValue="upcoming">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming ({myCompetitions.length})</TabsTrigger>
            <TabsTrigger value="past">Past Results</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-4">
            <div className="flex flex-col gap-4">
              {myCompetitions.map((comp, i) => (
                <Card key={i} className="border-border bg-card">
                  <CardContent className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                        <Trophy className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-foreground">{comp.name}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {comp.date}</span>
                          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {comp.location}</span>
                        </div>
                        <div className="mt-2 flex gap-2">
                          <Badge variant="secondary" className="text-xs">{comp.discipline}</Badge>
                          <Badge variant="outline" className="text-xs">{comp.weightClass}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        {statusIcon[comp.status as keyof typeof statusIcon]}
                        <span className="text-sm font-medium text-foreground">{comp.status}</span>
                      </div>
                      <Button variant="outline" size="sm" className="gap-1" asChild>
                        <Link href="/competitions/1">
                          <ExternalLink className="h-3.5 w-3.5" /> View
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="past" className="mt-4">
            <Card className="border-border bg-card">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="px-6 py-3 text-left font-medium text-muted-foreground">Competition</th>
                        <th className="px-6 py-3 text-left font-medium text-muted-foreground">Date</th>
                        <th className="px-6 py-3 text-left font-medium text-muted-foreground">Result</th>
                        <th className="px-6 py-3 text-left font-medium text-muted-foreground">Record</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pastCompetitions.map((comp, i) => (
                        <tr key={i} className="border-b border-border last:border-0">
                          <td className="px-6 py-4 font-medium text-foreground">{comp.name}</td>
                          <td className="px-6 py-4 text-muted-foreground">{comp.date}</td>
                          <td className="px-6 py-4">
                            <Badge variant={comp.result.includes("1st") ? "default" : "secondary"} className="text-xs">
                              {comp.result}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">{comp.matches}</td>
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
