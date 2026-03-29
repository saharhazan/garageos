import { cn } from '@/lib/utils'

interface SpinnerProps {
  size?: 'sm' | 'default' | 'lg'
  className?: string
}

const sizeMap = {
  sm: 'h-4 w-4',
  default: 'h-5 w-5',
  lg: 'h-8 w-8',
}

export function Spinner({ size = 'default', className }: SpinnerProps) {
  return (
    <svg
      className={cn('animate-spin text-[#3b82f6]', sizeMap[size], className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-label="טוען..."
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}
