import { createClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/layout/topbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

export default async function ReportsPage() {
  const supabase = await createClient()

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const { data: monthOrders } = await supabase
    .from('work_orders')
    .select('total_amount, status, created_at')
    .gte('created_at', monthStart.toISOString())

  const monthRevenue = monthOrders?.filter((o) => o.status === 'delivered')
    .reduce((sum, o) => sum + (o.total_amount ?? 0), 0) ?? 0

  const totalOrders = monthOrders?.length ?? 0
  const deliveredOrders = monthOrders?.filter((o) => o.status === 'delivered').length ?? 0

  const { data: topCustomers } = await supabase
    .from('work_orders')
    .select('customer_id, total_amount, customer:customers(full_name)')
    .eq('status', 'delivered')
    .gte('created_at', monthStart.toISOString())
    .order('total_amount', { ascending: false })
    .limit(5)

  return (
    <div className="min-h-full">
      <Topbar title="דוחות" />

      <div className="px-4 py-5 max-w-4xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card>
            <CardHeader><CardTitle>הכנסות החודש</CardTitle></CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-[#22c55e]">{formatCurrency(monthRevenue)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>עבודות החודש</CardTitle></CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">{totalOrders}</p>
              <p className="text-xs text-outline mt-1">{deliveredOrders} נמסרו</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>ממוצע לעבודה</CardTitle></CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-on-surface">
                {deliveredOrders > 0 ? formatCurrency(Math.round(monthRevenue / deliveredOrders)) : '—'}
              </p>
            </CardContent>
          </Card>
        </div>

        {topCustomers && topCustomers.length > 0 && (
          <Card>
            <CardHeader><CardTitle>לקוחות מובילים החודש</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-white/5">
                {topCustomers.map((row, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-outline w-4">{i + 1}</span>
                      <span className="text-sm text-on-surface">
                        {(row.customer as { full_name: string }[] | null)?.[0]?.full_name ?? '—'}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-on-surface tabular-nums">
                      {formatCurrency(row.total_amount)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
