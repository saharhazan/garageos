'use client'

import { Button } from '@/components/ui/button'

export default function AppError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="w-full max-w-sm rounded-xl bg-surface-high border border-white/5 p-6 text-center">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-error/10 mx-auto mb-4">
          <svg
            className="w-7 h-7 text-error"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>
        <h1 className="text-lg font-black text-on-surface mb-2 tracking-tight">משהו השתבש</h1>
        <p className="text-sm text-on-surface-variant mb-6">
          אירעה שגיאה בלתי צפויה. נסה שוב.
        </p>
        <Button
          type="button"
          variant="primary"
          size="lg"
          className="w-full"
          onClick={reset}
        >
          נסה שוב
        </Button>
      </div>
    </div>
  )
}
