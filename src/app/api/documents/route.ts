import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getApiAuth } from '@/lib/api-auth'

export async function GET(request: NextRequest) {
  const auth = await getApiAuth()
  if (auth.error) return auth.error
  const { profile } = auth

  const supabase = await createClient()

  const { searchParams } = new URL(request.url)
  const docType = searchParams.get('doc_type')
  const orderId = searchParams.get('order_id')
  const quoteId = searchParams.get('quote_id')
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit = Math.min(100, parseInt(searchParams.get('limit') ?? '20', 10))
  const offset = (page - 1) * limit

  let query = supabase
    .from('documents')
    .select('*', { count: 'exact' })
    .eq('garage_id', profile.garageId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (docType) {
    query = query.eq('doc_type', docType)
  }
  if (orderId) {
    query = query.eq('order_id', orderId)
  }
  if (quoteId) {
    query = query.eq('quote_id', quoteId)
  }
  if (from) {
    query = query.gte('created_at', from)
  }
  if (to) {
    query = query.lte('created_at', to)
  }

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json({ error: 'שגיאה בטעינת מסמכים' }, { status: 500 })
  }

  return NextResponse.json({ data: data ?? [], total: count ?? 0 })
}
