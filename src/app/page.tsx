import Link from "next/link"

type OverviewSection = {
  readonly title: string
  readonly description: string
  readonly href: string
  readonly label: string
}

const overviewSections: readonly OverviewSection[] = [
  {
    title: "About",
    description: "Learn about my background and skills.",
    href: "/about",
    label: "Read more",
  },
  {
    title: "Projects",
    description: "Explore some of my work.",
    href: "/projects",
    label: "View projects",
  },
  {
    title: "Skills",
    description: "Check out technologies I use.",
    href: "/featured",
    label: "See skills",
  },
  {
    title: "Contact",
    description: "Get in touch for collaborations or opportunities.",
    href: "/contact",
    label: "Contact me",
  },
] as const

export default function Home() {
  return (
    <div className="grid gap-12 p-8 text-center">
      <section className="relative flex flex-col items-center justify-center gap-6 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 p-16 shadow-xl">
        <h1 className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-5xl font-bold tracking-tight text-transparent drop-shadow-lg">
          Welcome to My Portfolio
        </h1>
        <p className="text-lg text-muted-foreground">Showcasing projects and experience.</p>
      </section>
      <div className="grid gap-6 sm:grid-cols-2">
        {overviewSections.map(({ title, description, href, label }) => (
          <section
            key={title}
            className="group rounded-xl border border-border bg-card/70 p-6 shadow-lg backdrop-blur-md transition-transform hover:scale-105"
          >
            <h2 className="text-2xl font-bold group-hover:text-primary">{title}</h2>
            <p className="text-muted-foreground">{description}</p>
            <Link
              href={href}
              className="mt-2 inline-block rounded-md bg-primary px-4 py-2 text-primary-foreground shadow hover:shadow-md"
            >
              {label}
            </Link>
          </section>
        ))}
      </div>
    </div>
  )
}
