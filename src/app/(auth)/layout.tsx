export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-surface px-4">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-8">
        <span className="text-2xl font-black text-brand uppercase tracking-tighter">GarageOS</span>
      </div>

      {/* Content card */}
      <div className="w-full max-w-sm">
        {children}
      </div>
    </div>
  )
}
