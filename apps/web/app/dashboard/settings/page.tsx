"use client"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Camera, Globe, Bell, Shield, Trash2 } from "lucide-react"

export default function SettingsPage() {
  return (
    <DashboardShell role="athlete">
      <div className="flex flex-col gap-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your account preferences and privacy</p>
        </div>

        {/* Profile Settings */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Profile</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-primary/20 text-primary text-xl font-bold">JD</AvatarFallback>
                </Avatar>
                <button className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground" aria-label="Change avatar">
                  <Camera className="h-3.5 w-3.5" />
                </button>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Profile Photo</p>
                <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max 5MB.</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" defaultValue="John" className="h-10" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" defaultValue="Doe" className="h-10" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" defaultValue="john.doe@example.com" className="h-10" />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="bio">Bio</Label>
              <textarea
                id="bio"
                rows={3}
                defaultValue="Competitive martial artist with over 10 years of experience."
                className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <Button className="w-fit">Save Changes</Button>
          </CardContent>
        </Card>

        {/* Language */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground"><Globe className="h-4 w-4" /> Language & Region</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Language</p>
                <p className="text-xs text-muted-foreground">Select your preferred language</p>
              </div>
              <Select defaultValue="en">
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ar">Arabic</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground"><Bell className="h-4 w-4" /> Notifications</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {[
              { label: "Competition Updates", description: "Get notified about competition status changes" },
              { label: "Affiliation Requests", description: "Notify when clubs respond to your requests" },
              { label: "Chat Messages", description: "Show notifications for new messages" },
              { label: "Email Notifications", description: "Receive important updates via email" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                <Switch defaultChecked />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground"><Shield className="h-4 w-4" /> Security</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Change Password</p>
                <p className="text-xs text-muted-foreground">Update your account password</p>
              </div>
              <Button variant="outline" size="sm">Change</Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Two-Factor Authentication</p>
                <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/30 bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive"><Trash2 className="h-4 w-4" /> Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Delete Account</p>
                <p className="text-xs text-muted-foreground">Permanently remove your account and all data</p>
              </div>
              <Button variant="destructive" size="sm">Delete Account</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
