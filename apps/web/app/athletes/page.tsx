"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, Filter, MapPin, Trophy, Users } from "lucide-react"

const athletes = [
  { name: "Yuki Tanaka", disciplines: ["Karate"], belt: "Black Belt", location: "Tokyo, Japan", wins: 45, club: "Rising Sun", avatar: "YT" },
  { name: "Carlos Rivera", disciplines: ["Judo", "BJJ"], belt: "Brown Belt", location: "Madrid, Spain", wins: 32, club: "Iron Fist", avatar: "CR" },
  { name: "Amir Hassan", disciplines: ["Karate", "Taekwondo"], belt: "Black Belt", location: "Cairo, Egypt", wins: 38, club: "Falcon Academy", avatar: "AH" },
  { name: "Lee Min-ho", disciplines: ["Judo"], belt: "Black Belt", location: "Seoul, Korea", wins: 52, club: "Tiger Gym", avatar: "LM" },
  { name: "Pierre Dupont", disciplines: ["Karate"], belt: "Brown Belt", location: "Paris, France", wins: 27, club: "Paris Dojo", avatar: "PD" },
  { name: "Maria Santos", disciplines: ["BJJ", "Judo"], belt: "Black Belt", location: "Rio de Janeiro, Brazil", wins: 41, club: "Santos BJJ", avatar: "MS" },
  { name: "James Wilson", disciplines: ["Taekwondo"], belt: "Red Belt", location: "London, UK", wins: 19, club: "London Kicks", avatar: "JW" },
  { name: "Fatima Al-Rashid", disciplines: ["Karate"], belt: "Black Belt", location: "Dubai, UAE", wins: 36, club: "Desert Warriors", avatar: "FA" },
]

const disciplines = ["All", "Karate", "Judo", "BJJ", "Taekwondo", "MMA"]

export default function AthletesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 pt-28 pb-20">
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Athletes</h1>
            <p className="mt-2 text-muted-foreground">Discover martial artists from around the world</p>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search athletes by name, discipline, or location..."
                className="h-11 w-full rounded-lg border border-border bg-secondary pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto">
              {disciplines.map((d) => (
                <Button key={d} variant={d === "All" ? "default" : "outline"} size="sm" className="shrink-0">
                  {d}
                </Button>
              ))}
            </div>
          </div>

          {/* Athletes Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {athletes.map((athlete, i) => (
              <Card key={i} className="border-border bg-card transition-all hover:border-primary/30 cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">{athlete.avatar}</AvatarFallback>
                    </Avatar>
                    <h3 className="mt-4 font-semibold text-foreground">{athlete.name}</h3>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {athlete.location}
                    </p>

                    <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                      {athlete.disciplines.map((d) => (
                        <Badge key={d} variant="secondary" className="text-xs">{d}</Badge>
                      ))}
                    </div>

                    <Badge className="mt-2 bg-primary/10 text-primary hover:bg-primary/20 text-xs">{athlete.belt}</Badge>

                    <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Trophy className="h-3 w-3" /> {athlete.wins} wins</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {athlete.club}</span>
                    </div>

                    <Button variant="outline" size="sm" className="mt-4 w-full">View Profile</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-center">
            <Button variant="outline" size="lg">Load More Athletes</Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
