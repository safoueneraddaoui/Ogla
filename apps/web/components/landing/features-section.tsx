import { Shield, Users, Trophy, MessageCircle, BarChart3, Globe } from "lucide-react"

const features = [
  {
    icon: Users,
    title: "Professional Profiles",
    description: "Build your martial arts portfolio with belt rankings, achievements, competition history, and club affiliations.",
  },
  {
    icon: Shield,
    title: "Club Affiliations",
    description: "Connect with clubs through a LinkedIn-style affiliation system. Request, approve, and manage memberships.",
  },
  {
    icon: Trophy,
    title: "Competition Management",
    description: "Organize and participate in tournaments with bracket generation, weight classes, and live scoring.",
  },
  {
    icon: BarChart3,
    title: "Live Match Scoring",
    description: "Real-time score updates with WebSocket-powered live feeds. Never miss a moment of the action.",
  },
  {
    icon: MessageCircle,
    title: "Messaging & Chat",
    description: "Direct messages and group chats for teams, training partners, and competition organizers.",
  },
  {
    icon: Globe,
    title: "Multilingual Support",
    description: "Full support for English, Arabic (RTL), and French. Built for the global martial arts community.",
  },
]

export function FeaturesSection() {
  return (
    <section className="border-t border-border bg-secondary/30 py-20 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl text-balance">
            Everything You Need to Compete
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-pretty">
            A complete platform for athletes, clubs, and competition organizers.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:bg-card/80"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
