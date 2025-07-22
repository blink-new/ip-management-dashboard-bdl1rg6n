import { Badge } from './badge'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: string
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  className?: string
}

const statusConfig = {
  'new': { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'New' },
  'in-review': { color: 'bg-amber-100 text-amber-800 border-amber-200', label: 'In Review' },
  'approved': { color: 'bg-green-100 text-green-800 border-green-200', label: 'Approved' },
  'filed': { color: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Filed' },
  'active': { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', label: 'Active' },
  'expired': { color: 'bg-red-100 text-red-800 border-red-200', label: 'Expired' },
  'pending': { color: 'bg-orange-100 text-orange-800 border-orange-200', label: 'Pending' },
  'completed': { color: 'bg-green-100 text-green-800 border-green-200', label: 'Completed' },
  'cancelled': { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Cancelled' },
  'draft': { color: 'bg-slate-100 text-slate-800 border-slate-200', label: 'Draft' }
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status.toLowerCase().replace(/\s+/g, '-') as keyof typeof statusConfig] || statusConfig.new
  
  return (
    <Badge 
      variant="outline" 
      className={cn(config.color, 'font-medium', className)}
    >
      {config.label}
    </Badge>
  )
}