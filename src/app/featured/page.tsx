const skills = [
  { name: 'JavaScript', description: 'Modern ES2015+ syntax' },
  { name: 'TypeScript', description: 'Typed JavaScript at scale' },
  { name: 'React', description: 'Building interactive UIs' },
  { name: 'Next.js', description: 'Server-side rendering and routing' },
] as const

export default function Skills() {
  return (
    <section className="p-4 grid gap-4">
      <h1 className="text-2xl font-bold mb-4">Skills</h1>
      {skills.map(({ name, description }) => (
        <div
          key={name}
          className="p-4 border rounded-lg shadow-md animate-in fade-in zoom-in"
        >
          <h2 className="text-xl font-semibold">{name}</h2>
          <p>{description}</p>
        </div>
      ))}
    </section>
  )
}
