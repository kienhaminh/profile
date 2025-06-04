export default function Home(): JSX.Element {
  return (
    <section className="flex flex-col items-center justify-center text-center gap-6 py-24 bg-gradient-to-br from-black via-fuchsia-800/30 to-black">
      <h1 className="neon text-5xl font-bold sm:text-6xl">Welcome to My Portfolio</h1>
      <p className="neon text-xl max-w-2xl">
        Experienced developer crafting responsive and high-performance web applications.
      </p>
    </section>
  )
}
