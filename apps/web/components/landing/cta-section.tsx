import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CtaSection() {
  return (
    <section className="border-t border-border py-20 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-10 md:p-16">
          {/* Decorative corner accents */}
          <div className="absolute top-0 right-0 h-32 w-32 bg-primary/5 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-32 w-32 bg-accent/5 blur-3xl" />

          <div className="relative flex flex-col items-center text-center">
            <h2 className="max-w-2xl text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Ready to Step on the Mat?
            </h2>
            <p className="mt-4 max-w-xl text-pretty text-lg text-muted-foreground">
              Join thousands of martial artists building their professional network on Ogla.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
              <Button size="lg" className="gap-2 px-8" asChild>
                <Link href="/register">
                  Create Free Account <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="ghost" asChild>
                <Link href="/competitions">Browse Competitions</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
