"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Search, Smartphone, Hash, Package, AlertTriangle, CheckCircle, XCircle, Filter } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface IMEI {
  id: string
  imei_primary: string
  imei_secondary: string | null
  serial_number: string | null
  imei_status: string
  purchase_date: string | null
  purchase_price: number | null
  notes: string | null
  created_at: string
  product_id: string | null
  products: { name: string; brand: string; model: string } | null
}

export default function ImeisPage() {
  const [imeis, setImeis] = useState<IMEI[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("todos")

  useEffect(() => {
    loadIMEIs()
  }, [])

  const loadIMEIs = async () => {
    try {
      const { data, error } = await supabase
        .from('imeis')
        .select('*, products(name, brand, model)')
        .order('created_at', { ascending: false })

      if (error) throw error
      setImeis(data || [])
    } catch (error) {
      console.error('Erro ao carregar IMEIs:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('imeis')
      .update({ imei_status: status })
      .eq('id', id)

    if (error) {
      alert("Erro ao atualizar status")
      return
    }

    loadIMEIs()
  }

  const filteredImeis = imeis.filter(imei => {
    const matchesSearch = 
      imei.imei_primary.includes(search) ||
      (imei.imei_secondary && imei.imei_secondary.includes(search)) ||
      (imei.serial_number && imei.serial_number.toLowerCase().includes(search.toLowerCase())) ||
      (imei.products?.name?.toLowerCase().includes(search.toLowerCase()))

    const matchesStatus = statusFilter === "todos" || imei.imei_status === statusFilter

    return matchesSearch && matchesStatus
  })

  const statusCounts = {
    todos: imeis.length,
    estoque: imeis.filter(i => i.imei_status === 'estoque').length,
    vitrine: imeis.filter(i => i.imei_status === 'vitrine').length,
    vendido: imeis.filter(i => i.imei_status === 'vendido').length,
    defeito: imeis.filter(i => i.imei_status === 'defeito').length,
  }

  const statusColors: Record<string, string> = {
    estoque: 'bg-blue-100 text-blue-800',
    vitrine: 'bg-purple-100 text-purple-800',
    reservado: 'bg-yellow-100 text-yellow-800',
    vendido: 'bg-green-100 text-green-800',
    defeito: 'bg-red-100 text-red-800',
  }

  const statusLabels: Record<string, string> = {
    estoque: 'Em Estoque',
    vitrine: 'Vitrine',
    reservado: 'Reservado',
    vendido: 'Vendido',
    defeito: 'Defeito',
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="page-title">Controle de IMEIs</h1>
          <p className="page-subtitle">Gerencie todos os IMEIs cadastrados</p>
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(statusCounts).map(([key, count]) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                statusFilter === key
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {key === 'todos' ? 'Todos' : statusLabels[key]} ({count})
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por IMEI, número de série ou produto..."
            className="input-modern pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* IMEIs List */}
        <div className="chart-container">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Carregando...</p>
            </div>
          ) : filteredImeis.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Hash className="h-12 w-12 mx-auto mb-3" />
              <p>Nenhum IMEI encontrado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredImeis.map((imei) => (
                <div key={imei.id} className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <code className="text-sm font-mono font-bold bg-gray-100 px-2 py-1 rounded">
                          {imei.imei_primary}
                        </code>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[imei.imei_status] || 'bg-gray-100 text-gray-600'}`}>
                          {statusLabels[imei.imei_status] || imei.imei_status}
                        </span>
                      </div>
                      {imei.products && (
                        <p className="text-sm text-gray-600">
                          {imei.products.brand} {imei.products.model}
                        </p>
                      )}
                      <div className="flex gap-4 mt-1 text-xs text-gray-500">
                        {imei.imei_secondary && <span>IMEI2: {imei.imei_secondary}</span>}
                        {imei.serial_number && <span>SN: {imei.serial_number}</span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {imei.imei_status !== 'vendido' && (
                        <>
                          <button
                            onClick={() => updateStatus(imei.id, 'vitrine')}
                            className="px-3 py-1.5 text-xs font-medium bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100"
                          >
                            Vitrine
                          </button>
                          <button
                            onClick={() => updateStatus(imei.id, 'estoque')}
                            className="px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
                          >
                            Estoque
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => updateStatus(imei.id, 'defeito')}
                        className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-700 rounded-lg hover:bg-red-100"
                      >
                        Defeito
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}