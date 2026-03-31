import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-surface px-4">
      <div className="text-center max-w-sm">
        <img src="/logo.png" alt="GarageOS" className="h-16 w-auto object-contain mx-auto mb-8" />
        <p className="text-8xl font-black text-outline-variant/30 mb-4">404</p>
        <h1 className="text-xl font-black text-on-surface mb-2 tracking-tight">הדף לא נמצא</h1>
        <p className="text-sm text-on-surface-variant mb-8">
          הדף שחיפשת לא קיים או שהועבר למקום אחר.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center h-12 px-8 bg-primary-container text-white font-bold rounded-md machined-button hover:brightness-110 active:scale-95 transition-all"
        >
          חזרה ללוח הבקרה
        </Link>
      </div>
    </div>
  )
}
