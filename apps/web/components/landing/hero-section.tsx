import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Zap, Users, Trophy } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-44 md:pb-32">
      {/* Background grid effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(0.22_0_0)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.22_0_0)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5">
            <Zap className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">The Professional Martial Arts Network</span>
          </div>

          {/* Headline */}
          <h1 className="max-w-4xl text-balance text-4xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl">
            Elevate Your
            <span className="text-primary"> Martial Arts</span>
            {' '}Career
          </h1>

          <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl">
            Connect with clubs, compete in tournaments, and build your professional profile. 
            Ogla is where athletes, clubs, and competitions come together.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <Button size="lg" className="gap-2 px-8" asChild>
              <Link href="/register">
                Join as Athlete <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="gap-2 px-8" asChild>
              <Link href="/register">Register Your Club</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-3 gap-8 md:gap-16">
            <div className="flex flex-col items-center gap-1">
              <Users className="mb-2 h-5 w-5 text-primary" />
              <span className="text-2xl font-bold text-foreground md:text-3xl">10K+</span>
              <span className="text-xs text-muted-foreground md:text-sm">Athletes</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Trophy className="mb-2 h-5 w-5 text-primary" />
              <span className="text-2xl font-bold text-foreground md:text-3xl">500+</span>
              <span className="text-xs text-muted-foreground md:text-sm">Competitions</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Zap className="mb-2 h-5 w-5 text-primary" />
              <span className="text-2xl font-bold text-foreground md:text-3xl">200+</span>
              <span className="text-xs text-muted-foreground md:text-sm">Clubs</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
