import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getApiAuth } from '@/lib/api-auth'

export async function GET(request: NextRequest) {
  const auth = await getApiAuth()
  if (auth.error) return auth.error
  const { profile } = auth

  const { searchParams } = new URL(request.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  if (!from || !to) {
    return NextResponse.json({ error: 'חסרים פרמטרים: from, to' }, { status: 400 })
  }

  const supabase = await createClient()
  const garageId = profile.garageId

  // --- 1. All orders in date range ---
  const { data: orders, error: ordersError } = await supabase
    .from('work_orders')
    .select('id, status, total_amount, created_at, customer_id, technician_id, items')
    .eq('garage_id', garageId)
    .gte('created_at', from)
    .lte('created_at', to)

  if (ordersError) {
    console.error('Reports: error fetching orders', ordersError)
    return NextResponse.json({ error: 'שגיאה בטעינת נתונים' }, { status: 500 })
  }

  const allOrders = orders ?? []

  // Revenue: only delivered orders
  const deliveredOrders = allOrders.filter((o) => o.status === 'delivered')
  const revenue = deliveredOrders.reduce((sum, o) => sum + (o.total_amount ?? 0), 0)
  const orderCount = deliveredOrders.length
  const avgPerOrder = orderCount > 0 ? Math.round(revenue / orderCount) : 0

  // --- 2. Previous period for comparison ---
  const fromDate = new Date(from)
  const toDate = new Date(to)
  const periodMs = toDate.getTime() - fromDate.getTime()
  const prevFrom = new Date(fromDate.getTime() - periodMs).toISOString()
  const prevTo = from

  const { data: prevOrders } = await supabase
    .from('work_orders')
    .select('total_amount, status')
    .eq('garage_id', garageId)
    .gte('created_at', prevFrom)
    .lte('created_at', prevTo)
    .eq('status', 'delivered')

  const prevRevenue = (prevOrders ?? []).reduce((sum, o) => sum + (o.total_amount ?? 0), 0)
  const revenueChange = prevRevenue > 0
    ? Math.round(((revenue - prevRevenue) / prevRevenue) * 100)
    : revenue > 0 ? 100 : 0

  const prevOrderCount = (prevOrders ?? []).length
  const orderCountChange = prevOrderCount > 0
    ? Math.round(((orderCount - prevOrderCount) / prevOrderCount) * 100)
    : orderCount > 0 ? 100 : 0

  // --- 3. New customers in range ---
  const { count: newCustomersCount } = await supabase
    .from('customers')
    .select('id', { count: 'exact', head: true })
    .eq('garage_id', garageId)
    .gte('created_at', from)
    .lte('created_at', to)

  // Previous period new customers
  const { count: prevNewCustomersCount } = await supabase
    .from('customers')
    .select('id', { count: 'exact', head: true })
    .eq('garage_id', garageId)
    .gte('created_at', prevFrom)
    .lte('created_at', prevTo)

  const newCustomers = newCustomersCount ?? 0
  const prevNewCustomers = prevNewCustomersCount ?? 0
  const newCustomersChange = prevNewCustomers > 0
    ? Math.round(((newCustomers - prevNewCustomers) / prevNewCustomers) * 100)
    : newCustomers > 0 ? 100 : 0

  // --- 4. Daily revenue (delivered orders) ---
  const dailyMap: Record<string, number> = {}
  for (const o of deliveredOrders) {
    const day = o.created_at.slice(0, 10) // YYYY-MM-DD
    dailyMap[day] = (dailyMap[day] ?? 0) + (o.total_amount ?? 0)
  }

  // Fill in all days in range even if 0
  const dailyRevenue: { date: string; value: number }[] = []
  const cursor = new Date(from)
  const end = new Date(to)
  while (cursor <= end) {
    const key = cursor.toISOString().slice(0, 10)
    dailyRevenue.push({ date: key, value: dailyMap[key] ?? 0 })
    cursor.setDate(cursor.getDate() + 1)
  }

  // --- 5. Status breakdown ---
  const statusMap: Record<string, number> = {}
  for (const o of allOrders) {
    statusMap[o.status] = (statusMap[o.status] ?? 0) + 1
  }
  const statusBreakdown = Object.entries(statusMap).map(([status, count]) => ({
    status,
    count,
  }))

  // --- 6. Top customers by revenue ---
  const customerRevMap: Record<string, { total: number; count: number }> = {}
  for (const o of deliveredOrders) {
    if (!o.customer_id) continue
    if (!customerRevMap[o.customer_id]) {
      customerRevMap[o.customer_id] = { total: 0, count: 0 }
    }
    customerRevMap[o.customer_id].total += o.total_amount ?? 0
    customerRevMap[o.customer_id].count += 1
  }

  const topCustomerIds = Object.entries(customerRevMap)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 10)
    .map(([id]) => id)

  let topCustomers: { id: string; name: string; orders: number; revenue: number }[] = []
  if (topCustomerIds.length > 0) {
    const { data: customerNames } = await supabase
      .from('customers')
      .select('id, full_name')
      .in('id', topCustomerIds)

    const nameMap: Record<string, string> = {}
    for (const c of customerNames ?? []) {
      nameMap[c.id] = c.full_name
    }

    topCustomers = topCustomerIds.map((id) => ({
      id,
      name: nameMap[id] ?? '-',
      orders: customerRevMap[id].count,
      revenue: customerRevMap[id].total,
    }))
  }

  // --- 7. Top items/services ---
  interface ItemEntry { description: string; quantity: number; total: number }
  const itemMap: Record<string, { count: number; revenue: number }> = {}
  for (const o of deliveredOrders) {
    const items = (o.items ?? []) as ItemEntry[]
    for (const item of items) {
      const key = item.description?.trim()
      if (!key) continue
      if (!itemMap[key]) itemMap[key] = { count: 0, revenue: 0 }
      itemMap[key].count += item.quantity ?? 1
      itemMap[key].revenue += item.total ?? (item.quantity ?? 1) * 0
    }
  }

  const topItems = Object.entries(itemMap)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 15)
    .map(([description, data]) => ({
      description,
      count: data.count,
      revenue: data.revenue,
    }))

  // --- 8. Technician performance ---
  const techMap: Record<string, { orders: number; revenue: number }> = {}
  for (const o of deliveredOrders) {
    const tid = o.technician_id
    if (!tid) continue
    if (!techMap[tid]) techMap[tid] = { orders: 0, revenue: 0 }
    techMap[tid].orders += 1
    techMap[tid].revenue += o.total_amount ?? 0
  }

  const techIds = Object.keys(techMap)
  let technicianStats: { id: string; name: string; orders: number; revenue: number; avgPerOrder: number }[] = []
  if (techIds.length > 0) {
    const { data: techNames } = await supabase
      .from('users')
      .select('id, full_name')
      .in('id', techIds)

    const techNameMap: Record<string, string> = {}
    for (const t of techNames ?? []) {
      techNameMap[t.id] = t.full_name
    }

    technicianStats = techIds
      .map((id) => ({
        id,
        name: techNameMap[id] ?? '-',
        orders: techMap[id].orders,
        revenue: techMap[id].revenue,
        avgPerOrder: techMap[id].orders > 0
          ? Math.round(techMap[id].revenue / techMap[id].orders)
          : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)
  }

  return NextResponse.json({
    data: {
      revenue,
      revenueChange,
      orderCount,
      orderCountChange,
      avgPerOrder,
      newCustomers,
      newCustomersChange,
      dailyRevenue,
      statusBreakdown,
      topCustomers,
      topItems,
      technicianStats,
    },
  })
}
