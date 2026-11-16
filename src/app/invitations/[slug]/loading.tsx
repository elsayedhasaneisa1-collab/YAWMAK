export default function InvitationLoading() {
  return (
    <div className="min-h-screen" style={{ background: "#FAF8F3" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-20 space-y-10">
        <div className="h-8 w-40 rounded-full bg-white/6 animate-pulse" />
        <div className="rounded-[28px] h-[420px] bg-white/5 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="h-40 rounded-3xl bg-white/5 animate-pulse" />
          <div className="h-40 rounded-3xl bg-white/5 animate-pulse" />
          <div className="h-40 rounded-3xl bg-white/5 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
