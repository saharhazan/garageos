'use client'

import Link from 'next/link'
import { Zap } from 'lucide-react'
import { PLAN_DISPLAY_NAMES, NEXT_PLAN } from '@/lib/plan-limits'

interface UpgradePromptProps {
  feature: string
  currentPlan: string
}

export function UpgradePrompt({ feature, currentPlan }: UpgradePromptProps) {
  const nextPlan = NEXT_PLAN[currentPlan] ?? 'pro'
  const nextPlanName = PLAN_DISPLAY_NAMES[nextPlan] ?? 'מקצועי'

  return (
    <div className="bg-secondary-container/10 border border-secondary/20 rounded-xl p-6">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
          <Zap size={18} className="text-secondary" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-black text-on-surface mb-1">
            שדרגו לתוכנית {nextPlanName}
          </h3>
          <p className="text-sm text-on-surface-variant mb-4">
            שדרגו לתוכנית {nextPlanName} כדי {feature}
          </p>
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 bg-secondary-container text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:brightness-110 active:scale-95 transition-all"
          >
            <Zap size={14} />
            שדרג עכשיו
          </Link>
        </div>
      </div>
    </div>
  )
}
