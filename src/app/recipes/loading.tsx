export default function RecipesLoading() {
  return (
    <main className="min-h-screen animate-pulse">
      <div className="border-b border-border bg-background/85 px-4 py-5 sm:px-6 lg:px-10">
        <div className="mx-auto flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="h-12 w-full max-w-xl rounded-xl bg-muted" />
          <div className="h-12 w-40 rounded-full bg-muted" />
        </div>
      </div>

      <div className="mx-auto px-4 py-8 sm:px-6 lg:px-10">
        <div className="h-12 w-72 rounded-2xl bg-muted" />
        <div className="mt-3 h-5 w-40 rounded-lg bg-muted" />
        <div className="mt-6 flex gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-10 w-24 rounded-full bg-muted" />
          ))}
        </div>
        <div className="mt-7 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="h-72 rounded-[1.35rem] border border-border bg-card"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
