"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, MapPin, Users, Calendar, Building2, ExternalLink } from "lucide-react"

const clubs = [
  { name: "Dragon Dojo", disciplines: ["Karate", "Kata"], location: "Tokyo, Japan", members: 45, founded: 2015, description: "Traditional karate school with a focus on competitive kata and kumite.", logo: "DD" },
  { name: "Iron Fist Academy", disciplines: ["Judo", "BJJ"], location: "New York, USA", members: 82, founded: 2018, description: "Modern combat sports academy specializing in grappling disciplines.", logo: "IF" },
  { name: "Rising Sun Martial Arts", disciplines: ["Karate", "Aikido"], location: "Osaka, Japan", members: 67, founded: 2010, description: "A heritage dojo preserving traditional Japanese martial arts.", logo: "RS" },
  { name: "Eagle MMA Center", disciplines: ["MMA", "BJJ", "Wrestling"], location: "Los Angeles, USA", members: 150, founded: 2019, description: "State-of-the-art MMA facility with world-class coaching.", logo: "EM" },
  { name: "Lion Heart Academy", disciplines: ["Judo", "Wrestling"], location: "London, UK", members: 93, founded: 2016, description: "European grappling powerhouse producing national champions.", logo: "LH" },
  { name: "Falcon Academy", disciplines: ["Karate", "Taekwondo"], location: "Cairo, Egypt", members: 56, founded: 2017, description: "Premier martial arts academy in the Middle East.", logo: "FA" },
]

export default function ClubsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 pt-28 pb-20">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Clubs</h1>
              <p className="mt-2 text-muted-foreground">Find and connect with martial arts clubs worldwide</p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search clubs..."
                className="h-10 w-64 rounded-lg border border-border bg-secondary pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {clubs.map((club, i) => (
              <Card key={i} className="border-border bg-card transition-all hover:border-primary/30">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14">
                      <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">{club.logo}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{club.name}</h3>
                      <p className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" /> {club.location}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                    {club.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {club.disciplines.map((d) => (
                      <Badge key={d} variant="secondary" className="text-xs">{d}</Badge>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {club.members} members</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Founded {club.founded}</span>
                  </div>

                  <div className="mt-5 flex gap-2">
                    <Button size="sm" className="flex-1">Request Affiliation</Button>
                    <Button variant="outline" size="sm" className="gap-1">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
