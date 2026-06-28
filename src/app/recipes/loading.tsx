export default function RecipesLoading() {
  return (
    <main className="min-h-screen animate-pulse bg-muted/20">
      <div className="border-b border-border bg-background/95 px-4 py-4 sm:px-6 lg:px-10">
        <div className="grid w-full gap-4 lg:grid-cols-[minmax(12rem,1fr)_minmax(18rem,34rem)_minmax(12rem,1fr)] lg:items-center">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-muted" />
            <div className="h-6 w-40 rounded-lg bg-muted" />
          </div>
          <div className="h-10 rounded-xl bg-muted" />
          <div className="flex items-center gap-3 lg:justify-self-end">
            <div className="h-9 w-32 rounded-full bg-muted" />
            <div className="size-10 rounded-full bg-muted" />
          </div>
        </div>
      </div>
      <div className="bg-background">
        <div className="flex gap-2 overflow-hidden border-b border-border px-4 py-6 sm:px-7">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-9.5 w-24 shrink-0 rounded-full bg-muted" />
          ))}
        </div>
        <div className="flex items-center justify-between border-b border-border px-4 py-2 sm:px-7">
          <div className="h-5 w-28 rounded-lg bg-muted" />
          <div className="h-10 w-40 rounded-full bg-muted" />
        </div>
        <div className="grid gap-6 p-4 sm:grid-cols-2 sm:p-7 xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-[1.35rem] border border-border bg-card"
            >
              <div className="aspect-4/3 bg-muted" />
              <div className="p-4">
                <div className="h-5 w-3/4 rounded-lg bg-muted" />
                <div className="mt-4 h-4 w-32 rounded-full bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
