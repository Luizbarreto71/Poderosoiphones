"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DollarSign, TrendingUp, ShoppingCart, Package, AlertTriangle, Users, Smartphone, Wrench, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts"

export default function DashboardPage() {
  const [stats, setStats] = useState({
    todayRevenue: 0,
    monthRevenue: 0,
    monthProfit: 0,
    todaySales: 0,
    totalProducts: 0,
    lowStock: 0,
    activeCustomers: 0,
    activeWarranties: 0,
  })
  const [salesData, setSalesData] = useState<{date: string, vendas: number}[]>([])
  const [categoryData, setCategoryData] = useState<{name: string, value: number}[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Carregar vendas do mês
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const { data: sales } = await supabase
        .from('sales')
        .select('*')
        .gte('date', startOfMonth.toISOString().split('T')[0])

      // Calcular estatísticas
      const today = new Date().toISOString().split('T')[0]
      const todaySales = sales?.filter(s => s.date === today) || []
      
      const monthRevenue = sales?.reduce((sum, s) => sum + Number(s.final_total || s.final_price), 0) || 0
      const todayRevenue = todaySales.reduce((sum, s) => sum + Number(s.final_total || s.final_price), 0)
      
      // Carregar produtos
      const { data: products } = await supabase
        .from('products')
        .select('*')
      
      const lowStock = products?.filter(p => p.stock <= p.min_stock).length || 0
      
      // Carregar clientes
      const { data: customers } = await supabase
        .from('customers')
        .select('*')
      
      // Carregar garantias ativas
      const { data: warranties } = await supabase
        .from('warranties')
        .select('*')
        .eq('warranty_status', 'active')

      setStats({
        todayRevenue,
        monthRevenue,
        monthProfit: monthRevenue * 0.3, // Estimativa
        todaySales: todaySales.length,
        totalProducts: products?.length || 0,
        lowStock,
        activeCustomers: customers?.length || 0,
        activeWarranties: warranties?.length || 0,
      })

      // Dados de vendas por dia (últimos 7 dias)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (6 - i))
        return date.toISOString().split('T')[0]
      })

      const salesByDay = last7Days.map(date => {
        const daySales = sales?.filter(s => s.date === date) || []
        return {
          date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          vendas: daySales.reduce((sum, s) => sum + Number(s.final_total || s.final_price), 0)
        }
      })

      setSalesData(salesByDay)

      // Dados por categoria
      const categoryStats = products?.reduce((acc, p) => {
        acc[p.category] = (acc[p.category] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      const categoryChartData = Object.entries(categoryStats).map(([name, value]) => ({
        name,
        value: value as number
      }))

      setCategoryData(categoryChartData)

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const kpis = [
    { title: "Faturamento Hoje", value: stats.todayRevenue, change: 0, icon: DollarSign, color: "bg-blue-500", changeType: "up" as const },
    { title: "Faturamento Mês", value: stats.monthRevenue, change: 0, icon: TrendingUp, color: "bg-green-500", changeType: "up" as const },
    { title: "Lucro do Mês", value: stats.monthProfit, change: 0, icon: DollarSign, color: "bg-purple-500", changeType: "up" as const },
    { title: "Vendas Hoje", value: stats.todaySales, change: 0, icon: ShoppingCart, color: "bg-orange-500", changeType: "neutral" as const },
    { title: "Produtos em Estoque", value: stats.totalProducts, change: 0, icon: Package, color: "bg-cyan-500", changeType: "neutral" as const },
    { title: "Estoque Baixo", value: stats.lowStock, change: 0, icon: AlertTriangle, color: "bg-red-500", changeType: "down" as const },
    { title: "Clientes Ativos", value: stats.activeCustomers, change: 0, icon: Users, color: "bg-pink-500", changeType: "up" as const },
    { title: "Garantias Ativas", value: stats.activeWarranties, change: 0, icon: Smartphone, color: "bg-indigo-500", changeType: "neutral" as const },
  ]

  const COLORS = ['#2563EB', '#22C55E', '#F59E0B', '#64748B', '#8B5CF6', '#EC4899']

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500">Carregando...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Page Header */}
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Visão geral do seu negócio - {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* KPI Grid */}
        <div className="kpi-grid">
          {kpis.map((kpi, index) => {
            const Icon = kpi.icon
            return (
              <div key={index} className="stat-card">
                <div className="flex items-start justify-between mb-3">
                  <div className={`stat-icon ${kpi.color} text-white`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="stat-value">
                  {kpi.title.includes("Faturamento") || kpi.title.includes("Lucro") 
                    ? formatCurrency(kpi.value) 
                    : kpi.value}
                </div>
                <div className="stat-label">{kpi.title}</div>
              </div>
            )
          })}
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Sales Chart */}
          <div className="chart-container">
            <h3 className="chart-title">Evolução de Vendas (7 dias)</h3>
            {salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} />
                  <YAxis stroke="#94A3B8" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px' }}
                    formatter={(value: any) => formatCurrency(value)}
                  />
                  <Area type="monotone" dataKey="vendas" stroke="#2563EB" fillOpacity={1} fill="url(#colorVendas)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-300 text-gray-400">
                <p>Nenhuma venda registrada</p>
              </div>
            )}
          </div>

          {/* Category Chart */}
          <div className="chart-container">
            <h3 className="chart-title">Produtos por Categoria</h3>
            {categoryData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-3 mt-4">
                  {categoryData.map((cat, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-sm text-gray-600">{cat.name}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-300 text-gray-400">
                <p>Nenhum produto cadastrado</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  )
}