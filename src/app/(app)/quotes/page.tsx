import { Topbar } from '@/components/layout/topbar'
import { Button } from '@/components/ui/button'
import { FileText, Plus, Wrench } from 'lucide-react'
import Link from 'next/link'

export default function QuotesPage() {
  return (
    <div className="min-h-full">
      <Topbar
        title="הצעות מחיר"
        actions={
          <Button variant="primary" size="sm">
            <Plus size={14} />
            הצעה חדשה
          </Button>
        }
      />
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <FileText size={40} className="text-[#3f3f46]" />
        <div className="text-center">
          <h2 className="text-sm font-semibold text-[#fafafa]">הצעות מחיר</h2>
          <p className="text-xs text-[#52525b] mt-1">תכונה זו תהיה זמינה בקרוב</p>
        </div>
        <Link href="/orders/new">
          <Button variant="default" size="default">
            <Wrench size={14} />
            צור עבודה חדשה
          </Button>
        </Link>
      </div>
    </div>
  )
}
