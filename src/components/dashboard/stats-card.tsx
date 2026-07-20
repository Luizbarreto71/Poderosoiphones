import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/utils"
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, Users } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon?: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger'
  className?: string
}

export function StatsCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  variant = 'default',
  className
}: StatsCardProps) {
  const isPositive = change && change > 0
  const isNegative = change && change < 0

  const variantStyles = {
    default: "border-gray-200",
    success: "border-green-200 bg-gradient-to-br from-green-50 to-white",
    warning: "border-yellow-200 bg-gradient-to-br from-yellow-50 to-white",
    danger: "border-red-200 bg-gradient-to-br from-red-50 to-white"
  }

  const iconColors = {
    default: "bg-blue-100 text-blue-600",
    success: "bg-green-100 text-green-600",
    warning: "bg-yellow-100 text-yellow-600",
    danger: "bg-red-100 text-red-600"
  }

  return (
    <Card className={cn("transition-all hover:shadow-md", variantStyles[variant], className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        {icon && (
          <div className={cn("rounded-lg p-2", iconColors[variant])}>
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">
          {typeof value === 'number' && (title.toLowerCase().includes('faturamento') || title.toLowerCase().includes('lucro') || title.toLowerCase().includes('valor'))
            ? formatCurrency(value)
            : typeof value === 'number' 
              ? value.toLocaleString('pt-BR') 
              : value}
        </div>
        {(change !== undefined || changeLabel) && (
          <div className="mt-2 flex items-center text-xs">
            {change !== undefined && (
              <>
                {isPositive && <TrendingUp className="mr-1 h-3 w-3 text-green-600" />}
                {isNegative && <TrendingDown className="mr-1 h-3 w-3 text-red-600" />}
                <span className={cn(
                  "font-medium",
                  isPositive && "text-green-600",
                  isNegative && "text-red-600",
                  !isPositive && !isNegative && "text-gray-600"
                )}>
                  {isPositive && '+'}
                  {change}%
                </span>
                <span className="ml-1 text-gray-500">
                  {changeLabel || 'vs. mês anterior'}
                </span>
              </>
            )}
            {change === undefined && changeLabel && (
              <span className="text-gray-500">{changeLabel}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}