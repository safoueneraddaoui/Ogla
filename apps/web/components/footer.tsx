import Link from "next/link"

const links = {
  Platform: [
    { label: "Athletes", href: "/athletes" },
    { label: "Clubs", href: "/clubs" },
    { label: "Competitions", href: "/competitions" },
    { label: "Live Scores", href: "/competitions" },
  ],
  Resources: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Help Center", href: "#" },
    { label: "Contact", href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-background py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-sm font-bold text-primary-foreground font-mono">O</span>
              </div>
              <span className="text-lg font-bold tracking-tight text-foreground font-mono">OGLA</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              The professional network for martial arts athletes, clubs, and competitions.
            </p>
          </div>
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="mb-4 text-sm font-semibold text-foreground">{category}</h4>
              <ul className="flex flex-col gap-2">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-border pt-8 text-center">
          <p className="text-xs text-muted-foreground">
            {'2026 Ogla. All rights reserved.'}
          </p>
        </div>
      </div>
    </footer>
  )
}
