export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-surface px-4">
      {/* Logo */}
      <div className="flex justify-center mb-8">
        <img src="/logo.png" alt="GarageOS" className="h-20 w-auto object-contain" />
      </div>

      {/* Content card */}
      <div className="w-full max-w-sm">
        {children}
      </div>
    </div>
  )
}
