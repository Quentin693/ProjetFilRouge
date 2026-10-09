export default function VoyagesLoading() {
  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <div className="h-20 border-b border-white/5" />

      <div className="pt-32 pb-16 px-6 text-center animate-pulse">
        <div className="h-10 w-80 max-w-full mx-auto rounded-lg bg-white/10 mb-4" />
        <div className="h-4 w-96 max-w-full mx-auto rounded bg-white/5" />
      </div>

      <div className="container mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl overflow-hidden border border-white/5 bg-[#111111] animate-pulse"
            >
              <div className="h-56 bg-white/5" />
              <div className="p-5 space-y-3">
                <div className="h-5 w-2/3 rounded bg-white/10" />
                <div className="h-4 w-1/2 rounded bg-white/5" />
                <div className="h-4 w-full rounded bg-white/5" />
                <div className="h-4 w-1/3 rounded bg-white/10 mt-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
