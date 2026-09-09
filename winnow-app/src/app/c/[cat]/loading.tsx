// Category loading skeleton: same rhythm as the loaded page, instrument-calm pulse
export default function Loading() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-8" aria-busy="true">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 rounded bg-zinc-900" />
        <div className="h-4 w-72 rounded bg-zinc-900" />
        <div className="mt-6 grid gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-20 card" />
          ))}
        </div>
      </div>
    </main>
  );
}
