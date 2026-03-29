export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-[#09090b] px-4">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-8">
        <div className="flex items-center justify-center w-8 h-8 rounded-[6px] bg-[#3b82f6]">
          <span className="text-white text-base font-bold leading-none">G</span>
        </div>
        <span className="text-lg font-semibold text-[#fafafa]">GarageOS</span>
      </div>

      {/* Content card */}
      <div className="w-full max-w-sm">
        {children}
      </div>
    </div>
  )
}
