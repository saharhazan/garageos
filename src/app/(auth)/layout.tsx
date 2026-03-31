export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-surface px-4">
      {/* Logo */}
      <div className="flex flex-col items-center gap-3 mb-8">
        <img src="/logo.png" alt="GarageOS" className="w-16 h-16 object-contain" />
        <span className="text-2xl font-black text-brand uppercase tracking-tighter">GarageOS</span>
      </div>

      {/* Content card */}
      <div className="w-full max-w-sm">
        {children}
      </div>
    </div>
  )
}
