import { Spinner } from '@/components/ui/spinner'

export default function AppLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Spinner size="lg" />
    </div>
  )
}
