"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { FileText, Download, TrendingUp, ShoppingCart, Package, DollarSign, Smartphone, Wrench, Shield, Calendar } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { supabase } from "@/lib/supabase"

export default function RelatoriosPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({
    totalSales: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCustomers: 0,
    totalServiceOrders: 0,
    totalWarranties: 0,
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [sales, products, customers, services, warranties] = await Promise.all([
        supabase.from('sales').select('final_total'),
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('customers').select('id', { count: 'exact', head: true }),
        supabase.from('service_orders').select('id', { count: 'exact', head: true }),
        supabase.from('warranties').select('id', { count: 'exact', head: true }),
      ])

      setData({
        totalSales: sales.data?.length || 0,
        totalRevenue: sales.data?.reduce((s, i) => s + Number(i.final_total || 0), 0) || 0,
        totalProducts: products.count || 0,
        totalCustomers: customers.count || 0,
        totalServiceOrders: services.count || 0,
        totalWarranties: warranties.count || 0,
      })
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const reports = [
    { title: "Relatório de Vendas", description: "Vendas por período, produto e vendedor", icon: ShoppingCart, color: "bg-blue-500" },
    { title: "Relatório de Estoque", description: "Produtos em estoque, baixo estoque e parados", icon: Package, color: "bg-green-500" },
    { title: "Relatório Financeiro", description: "Receitas, despesas e lucro líquido", icon: DollarSign, color: "bg-purple-500" },
    { title: "Relatório de IMEIs", description: "IMEIs cadastrados, vendidos e em estoque", icon: Smartphone, color: "bg-orange-500" },
    { title: "Relatório de Serviços", description: "Ordens de serviço por período e status", icon: Wrench, color: "bg-cyan-500" },
    { title: "Relatório de Garantias", description: "Garantias ativas, vencidas e vencendo", icon: Shield, color: "bg-pink-500" },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="page-title">Relatórios</h1>
          <p className="page-subtitle">Relatórios e análises do negócio</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: "Vendas", value: data.totalSales, icon: ShoppingCart, color: "bg-blue-500" },
            { label: "Faturamento", value: formatCurrency(data.totalRevenue), icon: DollarSign, color: "bg-green-500" },
            { label: "Produtos", value: data.totalProducts, icon: Package, color: "bg-purple-500" },
            { label: "Clientes", value: data.totalCustomers, icon: TrendingUp, color: "bg-orange-500" },
            { label: "OS", value: data.totalServiceOrders, icon: Wrench, color: "bg-cyan-500" },
            { label: "Garantias", value: data.totalWarranties, icon: Shield, color: "bg-pink-500" },
          ].map((item, i) => (
            <div key={i} className="stat-card">
              <div className={`stat-icon ${item.color} text-white`}>
                <item.icon className="h-5 w-5" />
              </div>
              <div className="stat-value text-lg">{item.value}</div>
              <div className="stat-label">{item.label}</div>
            </div>
          ))}
        </div>

        {/* Reports Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report, i) => {
            const Icon = report.icon
            return (
              <div key={i} className="chart-container hover:shadow-lg transition-all cursor-pointer group">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 ${report.color} rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{report.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{report.description}</p>
                    <button className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      Gerar Relatório
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </DashboardLayout>
  )
}