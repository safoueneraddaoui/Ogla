"use client"

import { useState } from "react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Search, Send, Plus, MoreVertical, Phone, Video, Paperclip, SmilePlus } from "lucide-react"

const conversations = [
  { id: "1", name: "Dragon Dojo Team", type: "GROUP" as const, lastMessage: "Training at 6pm tomorrow", time: "2m ago", unread: 3, avatar: "DD" },
  { id: "2", name: "Yuki Tanaka", type: "DM" as const, lastMessage: "Good luck in the tournament!", time: "1h ago", unread: 0, avatar: "YT" },
  { id: "3", name: "Carlos Rivera", type: "DM" as const, lastMessage: "Want to spar this weekend?", time: "3h ago", unread: 1, avatar: "CR" },
  { id: "4", name: "Iron Fist Coaches", type: "GROUP" as const, lastMessage: "Schedule updated for March", time: "1d ago", unread: 0, avatar: "IF" },
  { id: "5", name: "Amir Hassan", type: "DM" as const, lastMessage: "Thanks for the tips!", time: "2d ago", unread: 0, avatar: "AH" },
]

const messages = [
  { id: 1, sender: "Yuki Tanaka", content: "Hey John! I saw you registered for the National Open", time: "10:30 AM", isMine: false },
  { id: 2, sender: "You", content: "Yes! Really excited about it. Have you registered too?", time: "10:32 AM", isMine: true },
  { id: 3, sender: "Yuki Tanaka", content: "Of course! We might be in the same bracket", time: "10:33 AM", isMine: false },
  { id: 4, sender: "You", content: "That would be an amazing match. Let's train hard until then!", time: "10:35 AM", isMine: true },
  { id: 5, sender: "Yuki Tanaka", content: "Absolutely. Good luck in the tournament!", time: "10:36 AM", isMine: false },
]

export default function MessagesPage() {
  const [selectedChat, setSelectedChat] = useState("2")

  return (
    <DashboardShell role="athlete">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-foreground">Messages</h1>

        <div className="flex h-[calc(100vh-12rem)] overflow-hidden rounded-xl border border-border bg-card">
          {/* Conversation List */}
          <div className="w-80 shrink-0 border-r border-border flex flex-col">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h2 className="font-semibold text-foreground">Chats</h2>
              <Button variant="ghost" size="icon" className="h-8 w-8"><Plus className="h-4 w-4" /></Button>
            </div>
            <div className="p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="h-9 w-full rounded-lg border border-border bg-secondary pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedChat(conv.id)}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
                    selectedChat === conv.id ? "bg-primary/10" : "hover:bg-secondary"
                  )}
                >
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className={cn(
                        "text-xs font-bold",
                        conv.type === "GROUP" ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"
                      )}>
                        {conv.avatar}
                      </AvatarFallback>
                    </Avatar>
                    {conv.unread > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={cn("text-sm truncate", conv.unread > 0 ? "font-semibold text-foreground" : "text-foreground")}>{conv.name}</p>
                      <span className="text-[10px] text-muted-foreground shrink-0">{conv.time}</span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground mt-0.5">{conv.lastMessage}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex flex-1 flex-col">
            {/* Chat Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">YT</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-foreground">Yuki Tanaka</p>
                  <p className="text-xs text-muted-foreground">Online</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8"><Phone className="h-4 w-4 text-muted-foreground" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8"><Video className="h-4 w-4 text-muted-foreground" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4 text-muted-foreground" /></Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex flex-col gap-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={cn("flex", msg.isMine ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-[70%] rounded-2xl px-4 py-2.5",
                      msg.isMine
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-secondary text-foreground rounded-bl-md"
                    )}>
                      <p className="text-sm">{msg.content}</p>
                      <p className={cn(
                        "mt-1 text-[10px]",
                        msg.isMine ? "text-primary-foreground/60" : "text-muted-foreground"
                      )}>{msg.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Message Input */}
            <div className="border-t border-border p-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0"><Paperclip className="h-4 w-4 text-muted-foreground" /></Button>
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="h-10 w-full rounded-full border border-border bg-secondary px-4 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2">
                    <SmilePlus className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
                <Button size="icon" className="h-10 w-10 rounded-full shrink-0"><Send className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
