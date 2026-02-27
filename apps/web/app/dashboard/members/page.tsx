"use client"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus, MoreHorizontal, Check, X, UserPlus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const members = [
  { name: "John Doe", role: "Coach", belt: "Black Belt", disciplines: ["Karate"], joined: "Jan 2024", status: "Active" },
  { name: "Yuki Tanaka", role: "Member", belt: "Black Belt", disciplines: ["Karate", "Kata"], joined: "Mar 2024", status: "Active" },
  { name: "Carlos Rivera", role: "Member", belt: "Brown Belt", disciplines: ["Karate"], joined: "Jun 2024", status: "Active" },
  { name: "Maria Santos", role: "Member", belt: "Brown Belt", disciplines: ["Karate"], joined: "Aug 2024", status: "Active" },
  { name: "Lee Min-ho", role: "Assistant Coach", belt: "Black Belt", disciplines: ["Karate", "Judo"], joined: "Feb 2023", status: "Active" },
]

const pendingRequests = [
  { name: "Pierre Dupont", disciplines: ["Karate"], belt: "Brown Belt", requestDate: "Feb 24, 2026" },
  { name: "Amir Hassan", disciplines: ["Karate", "Taekwondo"], belt: "Black Belt", requestDate: "Feb 22, 2026" },
]

export default function MembersPage() {
  return (
    <DashboardShell role="club">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Members</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage your club members and affiliation requests</p>
          </div>
          <Button className="gap-2"><UserPlus className="h-4 w-4" /> Invite Member</Button>
        </div>

        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">Active Members ({members.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending Requests ({pendingRequests.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-4">
            <Card className="border-border bg-card">
              <CardHeader className="flex flex-row items-center gap-4 border-b border-border pb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search members..."
                    className="h-9 w-full rounded-lg border border-border bg-secondary pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="px-6 py-3 text-left font-medium text-muted-foreground">Member</th>
                        <th className="px-6 py-3 text-left font-medium text-muted-foreground">Role</th>
                        <th className="px-6 py-3 text-left font-medium text-muted-foreground">Belt</th>
                        <th className="px-6 py-3 text-left font-medium text-muted-foreground">Disciplines</th>
                        <th className="px-6 py-3 text-left font-medium text-muted-foreground">Joined</th>
                        <th className="px-6 py-3 text-left font-medium text-muted-foreground"><span className="sr-only">Actions</span></th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((member, i) => (
                        <tr key={i} className="border-b border-border last:border-0">
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-primary/10 text-primary text-xs">{member.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-foreground">{member.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-3"><Badge variant="outline" className="text-xs">{member.role}</Badge></td>
                          <td className="px-6 py-3"><Badge variant="secondary" className="text-xs">{member.belt}</Badge></td>
                          <td className="px-6 py-3">
                            <div className="flex gap-1">
                              {member.disciplines.map(d => <Badge key={d} variant="secondary" className="text-xs">{d}</Badge>)}
                            </div>
                          </td>
                          <td className="px-6 py-3 text-muted-foreground">{member.joined}</td>
                          <td className="px-6 py-3">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                  <MoreHorizontal className="h-3.5 w-3.5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>View Profile</DropdownMenuItem>
                                <DropdownMenuItem>Change Role</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">Remove</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending" className="mt-4">
            <div className="flex flex-col gap-4">
              {pendingRequests.map((req, i) => (
                <Card key={i} className="border-border border-dashed bg-card">
                  <CardContent className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-secondary text-foreground">{req.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-foreground">{req.name}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">{req.belt}</Badge>
                          {req.disciplines.map(d => <Badge key={d} variant="outline" className="text-xs">{d}</Badge>)}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">Requested on {req.requestDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" className="gap-1"><Check className="h-3.5 w-3.5" /> Accept</Button>
                      <Button variant="outline" size="sm" className="gap-1"><X className="h-3.5 w-3.5" /> Decline</Button>
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
