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
    <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props}>
      {children}
    </tbody>
  )
}

export function TableRow({ className, children, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        'border-b border-[#27272a] transition-colors hover:bg-white/[0.02] data-[state=selected]:bg-white/[0.04]',
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
        'h-9 px-4 text-start text-xs font-medium text-[#52525b] bg-[#09090b] border-b border-[#27272a] whitespace-nowrap',
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
        'h-11 px-4 text-start text-sm text-[#a1a1aa] align-middle',
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
        'border-t border-[#27272a] bg-[#18181b] font-medium text-[#fafafa]',
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
      className={cn('mt-4 text-sm text-[#52525b]', className)}
      {...props}
    >
      {children}
    </caption>
  )
}
