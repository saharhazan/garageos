import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getApiAuth } from '@/lib/api-auth'
import type { DocType, DocumentData, OrderItem, GarageBusinessDetails } from '@/types'

const VALID_DOC_TYPES: DocType[] = [
  'invoice', 'receipt', 'invoice_receipt', 'quote', 'work_order', 'intake', 'release', 'warranty',
]

export async function POST(request: NextRequest) {
  const auth = await getApiAuth()
  if (auth.error) return auth.error
  const { profile } = auth

  const supabase = await createClient()

  let body: {
    doc_type: DocType
    order_id?: string
    quote_id?: string
    custom_data?: Record<string, string>
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'גוף הבקשה אינו תקין' }, { status: 400 })
  }

  if (!body.doc_type || !VALID_DOC_TYPES.includes(body.doc_type)) {
    return NextResponse.json({ error: 'סוג מסמך לא תקין' }, { status: 400 })
  }

  // Fetch garage details
  const { data: garage, error: garageError } = await supabase
    .from('garages')
    .select('*')
    .eq('id', profile.garageId)
    .single()

  if (garageError || !garage) {
    return NextResponse.json({ error: 'לא נמצא מוסך' }, { status: 404 })
  }

  const businessDetails = (garage.business_details || {}) as GarageBusinessDetails
  const garageSettings = garage.settings as { tax_rate?: number; job_prefix?: string }
  const taxRate = garageSettings?.tax_rate ?? 17

  // Fetch custom fields for this doc type
  const { data: customFields } = await supabase
    .from('custom_fields')
    .select('*')
    .eq('garage_id', profile.garageId)
    .eq('doc_type', body.doc_type)
    .order('sort_order', { ascending: true })

  // Build document data based on order or quote
  let orderData = null
  let quoteData = null
  let customerData = null
  let vehicleData = null
  let items: OrderItem[] = []
  let subtotal = 0
  let taxAmount = 0
  let totalAmount = 0

  if (body.order_id) {
    const { data: order } = await supabase
      .from('work_orders')
      .select(`
        *,
        customer:customers(full_name, phone, email),
        vehicle:vehicles(license_plate, make, model, year, color, vin),
        technician:users!work_orders_technician_id_fkey(full_name)
      `)
      .eq('id', body.order_id)
      .eq('garage_id', profile.garageId)
      .single()

    if (!order) {
      return NextResponse.json({ error: 'הזמנה לא נמצאה' }, { status: 404 })
    }

    orderData = order
    customerData = order.customer
    vehicleData = order.vehicle
    items = (order.items as unknown as OrderItem[]) || []
    subtotal = Number(order.subtotal) || 0
    taxAmount = Number(order.tax_amount) || 0
    totalAmount = Number(order.total_amount) || 0
  }

  if (body.quote_id) {
    const { data: quote } = await supabase
      .from('quotes')
      .select(`
        *,
        customer:customers(full_name, phone, email),
        vehicle:vehicles(license_plate, make, model, year, color, vin)
      `)
      .eq('id', body.quote_id)
      .eq('garage_id', profile.garageId)
      .single()

    if (!quote) {
      return NextResponse.json({ error: 'הצעת מחיר לא נמצאה' }, { status: 404 })
    }

    quoteData = quote
    customerData = quote.customer
    vehicleData = quote.vehicle
    items = (quote.items as unknown as OrderItem[]) || []
    subtotal = Number(quote.subtotal) || 0
    taxAmount = Number(quote.tax_amount) || 0
    totalAmount = Number(quote.total_amount) || 0
  }

  // Generate document number
  const { data: seqData, error: seqError } = await supabase.rpc('next_doc_number', {
    p_garage_id: profile.garageId,
    p_doc_type: body.doc_type,
  })

  if (seqError || seqData === null) {
    console.error('Error generating doc number:', seqError)
    return NextResponse.json({ error: 'שגיאה ביצירת מספר מסמך' }, { status: 500 })
  }

  const year = new Date().getFullYear()
  const docNumber = `${String(seqData).padStart(4, '0')}/${year}`

  // Build the full document data snapshot
  const documentData: DocumentData = {
    doc_type: body.doc_type,
    doc_number: docNumber,
    date: new Date().toISOString(),
    garage: {
      name: garage.name,
      legal_name: businessDetails.legal_name,
      osek_number: businessDetails.osek_number,
      address: businessDetails.address || garage.address || undefined,
      phone: businessDetails.phone || garage.phone || undefined,
      email: businessDetails.email,
      logo_url: businessDetails.logo_url,
      stamp_url: businessDetails.stamp_url,
      manager_name: businessDetails.manager_name,
      manager_license: businessDetails.manager_license,
      bank_name: businessDetails.bank_name,
      bank_branch: businessDetails.bank_branch,
      bank_account: businessDetails.bank_account,
      primary_color: businessDetails.primary_color,
      secondary_color: businessDetails.secondary_color,
    },
    customer: customerData
      ? {
          full_name: customerData.full_name,
          phone: customerData.phone,
          email: customerData.email,
        }
      : undefined,
    vehicle: vehicleData
      ? {
          license_plate: vehicleData.license_plate,
          make: vehicleData.make,
          model: vehicleData.model,
          year: vehicleData.year,
          color: vehicleData.color,
          vin: vehicleData.vin,
        }
      : undefined,
    order: orderData
      ? {
          job_number: orderData.job_number,
          status: orderData.status,
          priority: orderData.priority,
          notes: orderData.notes,
          mileage: orderData.mileage,
          created_at: orderData.created_at,
          updated_at: orderData.updated_at,
          completed_at: orderData.completed_at,
          technician_name: orderData.technician?.full_name || null,
        }
      : undefined,
    items,
    subtotal,
    tax_rate: taxRate,
    tax_amount: taxAmount,
    total_amount: totalAmount,
    custom_fields: body.custom_data || {},
    custom_field_definitions: customFields || [],
    // Quote-specific
    valid_until: quoteData?.valid_until || null,
    quote_number: quoteData?.quote_number,
  }

  // Save document record
  const { data: docRecord, error: docError } = await supabase
    .from('documents')
    .insert({
      garage_id: profile.garageId,
      order_id: body.order_id || null,
      quote_id: body.quote_id || null,
      doc_type: body.doc_type,
      doc_number: docNumber,
      data: documentData as unknown as Record<string, unknown>,
      total_amount: totalAmount || null,
    })
    .select()
    .single()

  if (docError) {
    console.error('Error saving document:', docError)
    return NextResponse.json({ error: 'שגיאה בשמירת מסמך' }, { status: 500 })
  }

  return NextResponse.json({ data: docRecord, document_data: documentData }, { status: 201 })
}
