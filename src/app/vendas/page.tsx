"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Search, Plus, ShoppingCart, User, Calendar, DollarSign, Shield, Eye } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { supabase } from "@/lib/supabase"

interface Sale {
  id: string
  customer_name: string
  customer_phone: string
  product_name: string
  imei: string
  final_price: number
  payment_method: string
  date: string
  sale_status: string
}

export default function VendasPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [search, setSearch] = useState("")
  const [showWarrantyModal, setShowWarrantyModal] = useState(false)
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSales()
  }, [])

  const loadSales = async () => {
    try {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setSales(data || [])
    } catch (error) {
      console.error('Erro ao carregar vendas:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredSales = sales.filter(s => 
    s.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    s.product_name.toLowerCase().includes(search.toLowerCase()) ||
    s.imei.includes(search)
  )

  const handleOpenWarranty = (sale: Sale) => {
    setSelectedSale(sale)
    setShowWarrantyModal(true)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="page-title">Vendas</h1>
          <p className="page-subtitle">Histórico de vendas</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por cliente, produto ou IMEI..."
            className="input-modern pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Sales Table */}
        <div className="chart-container overflow-x-auto">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Carregando...</p>
            </div>
          ) : filteredSales.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <p className="empty-state-title">Nenhuma venda encontrada</p>
              <p className="empty-state-text">Comece fazendo uma venda no PDV</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Cliente</th>
                  <th>Produto</th>
                  <th>IMEI</th>
                  <th>Valor</th>
                  <th>Pagamento</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((sale) => (
                  <tr key={sale.id}>
                    <td>{new Date(sale.date).toLocaleDateString('pt-BR')}</td>
                    <td>
                      <div>
                        <p className="font-medium">{sale.customer_name}</p>
                        <p className="text-xs text-gray-500">{sale.customer_phone}</p>
                      </div>
                    </td>
                    <td>{sale.product_name}</td>
                    <td>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">{sale.imei}</code>
                    </td>
                    <td className="font-medium">{formatCurrency(sale.final_price)}</td>
                    <td>{sale.payment_method}</td>
                    <td>
                      <span className={`badge ${
                        sale.sale_status === "completed" ? "badge-success" :
                        sale.sale_status === "pending" ? "badge-warning" : "badge-danger"
                      }`}>
                        {sale.sale_status === "completed" ? "Concluída" :
                         sale.sale_status === "pending" ? "Pendente" : "Cancelada"}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenWarranty(sale)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Registrar Garantia"
                        >
                          <Shield className="h-4 w-4" />
                        </button>
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

        {/* Warranty Modal */}
        {showWarrantyModal && selectedSale && (
          <WarrantyModal
            sale={selectedSale}
            onClose={() => {
              setShowWarrantyModal(false)
              setSelectedSale(null)
            }}
            onSuccess={() => {
              setShowWarrantyModal(false)
              setSelectedSale(null)
            }}
          />
        )}
      </div>
    </DashboardLayout>
  )
}

interface WarrantyModalProps {
  sale: Sale
  onClose: () => void
  onSuccess: () => void
}

function WarrantyModal({ sale, onClose, onSuccess }: WarrantyModalProps) {
  const [formData, setFormData] = useState({
    warranty_months: "3",
    notes: "",
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const warrantyEnd = new Date()
      warrantyEnd.setMonth(warrantyEnd.getMonth() + parseInt(formData.warranty_months))

      const { error } = await supabase
        .from('warranties')
        .insert([{
          sale_id: sale.id,
          customer_name: sale.customer_name,
          customer_phone: sale.customer_phone,
          product_name: sale.product_name,
          imei: sale.imei,
          sale_date: sale.date,
          warranty_end_date: warrantyEnd.toISOString(),
          warranty_months: parseInt(formData.warranty_months),
          notes: formData.notes,
          status: "active"
        }])

      if (error) throw error

      alert("Garantia registrada com sucesso!")
      onSuccess()
    } catch (error) {
      console.error('Erro ao registrar garantia:', error)
      alert("Erro ao registrar garantia")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-6 max-w-md w-full"
      >
        <h3 className="text-xl font-bold mb-4">Registrar Garantia</h3>
        
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-600 mb-2"><strong>Cliente:</strong> {sale.customer_name}</p>
          <p className="text-sm text-gray-600 mb-2"><strong>Produto:</strong> {sale.product_name}</p>
          <p className="text-sm text-gray-600 mb-2"><strong>IMEI:</strong> {sale.imei}</p>
          <p className="text-sm text-gray-600"><strong>Data da Venda:</strong> {new Date(sale.date).toLocaleDateString('pt-BR')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Período de Garantia (meses)
            </label>
            <select
              className="select-modern"
              value={formData.warranty_months}
              onChange={(e) => setFormData({...formData, warranty_months: e.target.value})}
            >
              <option value="3">3 meses</option>
              <option value="6">6 meses</option>
              <option value="12">12 meses</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observações (opcional)
            </label>
            <textarea
              className="input-modern h-24"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Ex: Garantia contra defeitos de fabricação..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={loading}
            >
              {loading ? "Salvando..." : "Registrar Garantia"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}