import * as React from 'react'
import { cn } from '@/lib/utils'

interface TableProps extends React.HTMLAttributes<HTMLDivElement> {
  stickyHeader?: boolean
}

export function Table({ className, stickyHeader, children, ...props }: TableProps) {
  return (
    <div className={cn('w-full overflow-auto', className)} {...props}>
      <table
        className={cn(
          'w-full border-collapse text-sm',
          stickyHeader && '[&_thead_th]:sticky [&_thead_th]:top-0 [&_thead_th]:z-10'
        )}
      >
        {children}
      </table>
    </div>
  )
}

export function TableHeader({ className, children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={cn('', className)} {...props}>
      {children}
    </thead>
  )
}

export function TableBody({ className, children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={cn('divide-y divide-white/5 [&_tr:last-child]:border-0', className)} {...props}>
      {children}
    </tbody>
  )
}

export function TableRow({ className, children, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        'transition-colors hover:bg-primary/5 data-[state=selected]:bg-primary/10',
        className
      )}
      {...props}
    >
      {children}
    </tr>
  )
}

export function TableHead({ className, children, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        'h-10 px-6 text-start text-xs font-bold uppercase tracking-wider text-on-surface-variant bg-surface-high/50 whitespace-nowrap',
        className
      )}
      {...props}
    >
      {children}
    </th>
  )
}

export function TableCell({ className, children, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn(
        'px-6 py-5 text-start text-sm text-on-surface-variant align-middle',
        className
      )}
      {...props}
    >
      {children}
    </td>
  )
}

export function TableFooter({ className, children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tfoot
      className={cn(
        'border-t border-white/5 bg-surface-high font-bold text-on-surface',
        className
      )}
      {...props}
    >
      {children}
    </tfoot>
  )
}

export function TableCaption({ className, children, ...props }: React.HTMLAttributes<HTMLTableCaptionElement>) {
  return (
    <caption
      className={cn('mt-4 text-sm text-outline', className)}
      {...props}
    >
      {children}
    </caption>
  )
}
