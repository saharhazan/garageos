'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Car } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Topbar } from '@/components/layout/topbar'
import { Spinner } from '@/components/ui/spinner'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'

interface VehicleRow {
  id: string
  license_plate: string
  make: string
  model: string
  year: number | null
  color: string | null
  customer_id: string
  customer: {
    full_name: string
    phone: string
  } | null
}

function LicensePlate({ plate }: { plate: string }) {
  return (
    <div className="bg-[#F5D015] text-black w-28 h-8 rounded-sm flex items-center overflow-hidden shadow-[0_0_15px_rgba(232,196,0,0.2)] mx-auto border border-black/10">
      <div className="bg-primary-container w-4 h-full flex flex-col items-center justify-center text-[8px] text-white">
        <span>IL</span>
      </div>
      <div className="flex-grow text-center font-mono font-bold text-lg tracking-widest tabular-nums">
        {plate}
      </div>
    </div>
  )
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<VehicleRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function fetchVehicles() {
      setLoading(true)
      const supabase = createClient()
      let query = supabase
        .from('vehicles')
        .select('*, customer:customers(full_name, phone)')
        .order('created_at', { ascending: false })

      if (search.trim()) {
        query = query.or(
          `license_plate.ilike.%${search}%,make.ilike.%${search}%,model.ilike.%${search}%`
        )
      }

      const { data } = await query
      setVehicles((data as VehicleRow[]) ?? [])
      setLoading(false)
    }
    fetchVehicles()
  }, [search])

  return (
    <div className="min-h-full bg-surface">
      <Topbar title="רכבים" />

      <div className="px-4 py-4 max-w-6xl mx-auto space-y-4">
        {/* Search */}
        <div className="relative">
          <Search
            size={15}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"
          />
          <input
            type="search"
            placeholder="חפש לפי לוחית, יצרן או דגם..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-lg border border-outline-variant/20 bg-surface-lowest pr-9 pl-3 text-sm text-on-surface placeholder:text-outline outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
          />
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        )}

        {/* Desktop table */}
        {!loading && (
          <>
            <div className="hidden md:block bg-surface-low rounded-xl overflow-hidden shadow-2xl">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">לוחית רישוי</TableHead>
                    <TableHead>יצרן</TableHead>
                    <TableHead>דגם</TableHead>
                    <TableHead>שנה</TableHead>
                    <TableHead>צבע</TableHead>
                    <TableHead>לקוח</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-on-surface-variant">
                        {search ? 'לא נמצאו רכבים' : 'אין רכבים במערכת'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    vehicles.map((vehicle) => (
                      <TableRow key={vehicle.id} className="cursor-pointer">
                        <TableCell className="text-center">
                          <Link href={`/customers/${vehicle.customer_id}`}>
                            <LicensePlate plate={vehicle.license_plate} />
                          </Link>
                        </TableCell>
                        <TableCell className="text-on-surface font-medium">
                          {vehicle.make || '-'}
                        </TableCell>
                        <TableCell className="text-on-surface-variant">
                          {vehicle.model || '-'}
                        </TableCell>
                        <TableCell className="text-on-surface-variant tabular-nums">
                          {vehicle.year ?? '-'}
                        </TableCell>
                        <TableCell className="text-on-surface-variant">
                          {vehicle.color ?? '-'}
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/customers/${vehicle.customer_id}`}
                            className="text-primary font-medium hover:underline"
                          >
                            {vehicle.customer?.full_name ?? '-'}
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile card list */}
            <div className="md:hidden space-y-3">
              {vehicles.length === 0 ? (
                <div className="rounded-xl bg-surface-high px-4 py-12 text-center">
                  <p className="text-sm text-on-surface-variant">
                    {search ? 'לא נמצאו רכבים' : 'אין רכבים במערכת'}
                  </p>
                </div>
              ) : (
                vehicles.map((vehicle) => (
                  <Link
                    key={vehicle.id}
                    href={`/customers/${vehicle.customer_id}`}
                    className="block rounded-xl bg-surface-high p-4 hover:bg-surface-highest transition-all active:scale-[0.98]"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="bg-[#F5D015] text-black inline-flex items-center rounded-sm overflow-hidden shadow-[0_0_15px_rgba(232,196,0,0.2)] border border-black/10 h-8">
                        <div className="bg-primary-container w-4 h-full flex flex-col items-center justify-center text-[8px] text-white">
                          <span>IL</span>
                        </div>
                        <div className="px-2 text-center font-mono font-bold text-base tracking-widest tabular-nums">
                          {vehicle.license_plate}
                        </div>
                      </div>
                      {vehicle.year && (
                        <span className="text-xs text-on-surface-variant tabular-nums">
                          {vehicle.year}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-on-surface mb-1">
                      {vehicle.make} {vehicle.model}
                    </p>
                    <div className="flex items-center justify-between text-xs text-on-surface-variant">
                      <div className="flex items-center gap-2">
                        {vehicle.color && <span>{vehicle.color}</span>}
                      </div>
                      <span className="text-primary font-medium">
                        {vehicle.customer?.full_name ?? '-'}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
