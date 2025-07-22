import { Card, CardContent, CardHeader, CardTitle } from './card'
import { cn } from '@/lib/utils'
import { ComponentType } from 'react'

interface MetricCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: ComponentType<{ className?: string }>
  gradient: string
  className?: string
}

export function MetricCard({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon: Icon, 
  gradient,
  className 
}: MetricCardProps) {
  const changeColors = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600'
  }

  return (
    <Card className={cn(
      'border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden',
      gradient,
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium opacity-90">{title}</CardTitle>
        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
          <Icon className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-white mb-2">{value}</div>
        {change && (
          <p className={cn('text-xs font-medium', 'text-white/80')}>
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  )
}