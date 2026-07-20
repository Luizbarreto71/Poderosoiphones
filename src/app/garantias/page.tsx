"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Search, Plus, Shield, Calendar, User, Phone, Smartphone, Eye, AlertTriangle } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { supabase } from "@/lib/supabase"

interface Warranty {
  id: string
  customer_name: string
  customer_phone: string
  product_name: string
  imei: string
  sale_date: string
  warranty_end_date: string
  warranty_months: number
  status: "active" | "expired" | "near_expiry"
  notes: string
}

export default function GarantiasPage() {
  const [warranties, setWarranties] = useState<Warranty[]>([])
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("todas")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWarranties()
  }, [])

  const loadWarranties = async () => {
    try {
      const { data, error } = await supabase
        .from('warranties')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Adicionar status calculado
      const today = new Date()
      const warrantiesWithStatus = (data || []).map(w => {
        const endDate = new Date(w.warranty_end_date)
        const daysUntilExpiry = Math.floor((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        
        let status: "active" | "expired" | "near_expiry" = "active"
        if (daysUntilExpiry < 0) {
          status = "expired"
        } else if (daysUntilExpiry <= 30) {
          status = "near_expiry"
        }
        
        return { ...w, status }
      })
      
      setWarranties(warrantiesWithStatus)
    } catch (error) {
      console.error('Erro ao carregar garantias:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredWarranties = warranties.filter(w => {
    const matchesSearch = w.customer_name.toLowerCase().includes(search.toLowerCase()) ||
                         w.product_name.toLowerCase().includes(search.toLowerCase()) ||
                         w.imei.includes(search)
    const matchesFilter = filter === "todas" || 
                         (filter === "ativas" && w.status === "active") ||
                         (filter === "vencendo" && w.status === "near_expiry") ||
                         (filter === "vencidas" && w.status === "expired")
    return matchesSearch && matchesFilter
  })

  const stats = {
    total: warranties.length,
    active: warranties.filter(w => w.status === "active").length,
    nearExpiry: warranties.filter(w => w.status === "near_expiry").length,
    expired: warranties.filter(w => w.status === "expired").length,
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return "badge-success"
      case "near_expiry": return "badge-warning"
      case "expired": return "badge-danger"
      default: return "badge-primary"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active": return "Ativa"
      case "near_expiry": return "Vencendo"
      case "expired": return "Vencida"
      default: return status
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="page-title">Garantias</h1>
          <p className="page-subtitle">Controle de garantias</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="stat-icon bg-blue-500 text-white">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="stat-value">{stats.total}</p>
                <p className="stat-label">Total</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="stat-icon bg-green-500 text-white">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="stat-value">{stats.active}</p>
                <p className="stat-label">Ativas</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="stat-icon bg-yellow-500 text-white">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="stat-value">{stats.nearExpiry}</p>
                <p className="stat-label">Vencendo</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="stat-icon bg-red-500 text-white">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="stat-value">{stats.expired}</p>
                <p className="stat-label">Vencidas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por cliente, produto ou IMEI..."
              className="input-modern pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {["todas", "ativas", "vencendo", "vencidas"].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  filter === f 
                    ? "bg-blue-600 text-white" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {f === "todas" ? "Todas" : f === "ativas" ? "Ativas" : f === "vencendo" ? "Vencendo" : "Vencidas"}
              </button>
            ))}
          </div>
        </div>

        {/* Warranties Table */}
        <div className="chart-container overflow-x-auto">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Carregando...</p>
            </div>
          ) : filteredWarranties.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Shield className="h-6 w-6" />
              </div>
              <p className="empty-state-title">Nenhuma garantia encontrada</p>
              <p className="empty-state-text">Registre garantias a partir do histórico de vendas</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Produto</th>
                  <th>IMEI</th>
                  <th>Data Venda</th>
                  <th>Vencimento</th>
                  <th>Período</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredWarranties.map((warranty) => (
                  <tr key={warranty.id}>
                    <td>
                      <div>
                        <p className="font-medium">{warranty.customer_name}</p>
                        <p className="text-xs text-gray-500">{warranty.customer_phone}</p>
                      </div>
                    </td>
                    <td>{warranty.product_name}</td>
                    <td>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">{warranty.imei}</code>
                    </td>
                    <td>{new Date(warranty.sale_date).toLocaleDateString('pt-BR')}</td>
                    <td>{new Date(warranty.warranty_end_date).toLocaleDateString('pt-BR')}</td>
                    <td>{warranty.warranty_months} meses</td>
                    <td>
                      <span className={`badge ${getStatusBadge(warranty.status)}`}>
                        {getStatusLabel(warranty.status)}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                          title="Ver Detalhes"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}