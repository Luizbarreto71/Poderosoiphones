"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Search, Plus, Wrench, User, Smartphone, Clock, CheckCircle, XCircle, AlertTriangle, Eye, Camera } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { supabase } from "@/lib/supabase"

interface ServiceOrder {
  id: string
  customer_id: string | null
  customer_name: string
  customer_phone: string
  device_type: string
  device_brand: string
  device_model: string
  imei: string
  reported_defect: string
  technical_diagnosis: string
  service_value: number
  parts_cost: number
  service_status: string
  notes: string
  received_date: string
  completion_date: string
  customers: { name: string; phone: string } | null
}

export default function ServicosPage() {
  const [orders, setOrders] = useState<ServiceOrder[]>([])
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("todas")
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    device_type: "Smartphone",
    device_brand: "",
    device_model: "",
    imei: "",
    reported_defect: "",
    service_value: "",
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('service_orders')
        .select('*, customers(name, phone)')
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Erro ao carregar ordens:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, status: string) => {
    const updateData: any = { service_status: status }
    if (status === 'completed') {
      updateData.completion_date = new Date().toISOString().split('T')[0]
    }

    const { error } = await supabase
      .from('service_orders')
      .update(updateData)
      .eq('id', id)

    if (error) {
      alert("Erro ao atualizar status")
      return
    }
    loadOrders()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const { error } = await supabase
        .from('service_orders')
        .insert([{
          customer_name: formData.customer_name,
          customer_phone: formData.customer_phone,
          device_type: formData.device_type,
          device_brand: formData.device_brand,
          device_model: formData.device_model,
          imei: formData.imei || null,
          reported_defect: formData.reported_defect,
          service_value: parseFloat(formData.service_value) || 0,
          service_status: 'received'
        }])

      if (error) throw error

      alert("Ordem de serviço criada com sucesso!")
      setShowForm(false)
      setFormData({
        customer_name: "",
        customer_phone: "",
        device_type: "Smartphone",
        device_brand: "",
        device_model: "",
        imei: "",
        reported_defect: "",
        service_value: "",
      })
      loadOrders()
    } catch (error) {
      console.error('Erro ao criar ordem:', error)
      alert("Erro ao criar ordem de serviço")
    } finally {
      setSubmitting(false)
    }
  }

  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_phone.includes(search) ||
      (o.imei && o.imei.includes(search)) ||
      (o.device_brand && o.device_brand.toLowerCase().includes(search.toLowerCase()))
    
    const matchesFilter = filter === "todas" || o.service_status === filter
    
    return matchesSearch && matchesFilter
  })

  const statusCounts = {
    todas: orders.length,
    received: orders.filter(o => o.service_status === 'received').length,
    in_analysis: orders.filter(o => o.service_status === 'in_analysis').length,
    in_repair: orders.filter(o => o.service_status === 'in_repair').length,
    completed: orders.filter(o => o.service_status === 'completed').length,
    delivered: orders.filter(o => o.service_status === 'delivered').length,
  }

  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    received: { label: 'Recebido', color: 'bg-blue-100 text-blue-800', icon: Clock },
    in_analysis: { label: 'Em Análise', color: 'bg-yellow-100 text-yellow-800', icon: Wrench },
    waiting_parts: { label: 'Aguadando Peça', color: 'bg-orange-100 text-orange-800', icon: AlertTriangle },
    in_repair: { label: 'Em Reparo', color: 'bg-purple-100 text-purple-800', icon: Wrench },
    completed: { label: 'Finalizado', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    delivered: { label: 'Entregue', color: 'bg-gray-100 text-gray-800', icon: XCircle },
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Ordens de Serviço</h1>
            <p className="page-subtitle">Assistência técnica</p>
          </div>
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            <Plus className="h-4 w-4" />
            Nova OS
          </button>
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(statusCounts).map(([key, count]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === key ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {key === 'todas' ? 'Todas' : statusConfig[key]?.label || key} ({count})
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por cliente, telefone, IMEI..."
            className="input-modern pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* OS List */}
        <div className="chart-container">
          {loading ? (
            <div className="text-center py-12"><p className="text-gray-500">Carregando...</p></div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Wrench className="h-12 w-12 mx-auto mb-3" />
              <p>Nenhuma ordem de serviço encontrada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((order) => {
                const status = statusConfig[order.service_status] || { label: order.service_status, color: 'bg-gray-100 text-gray-600', icon: Clock }
                const StatusIcon = status.icon
                
                return (
                  <div key={order.id} className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-medium text-gray-900">{order.customer_name}</p>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                            <StatusIcon className="h-3 w-3 inline mr-1" />
                            {status.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {order.device_brand} {order.device_model} - {order.device_type}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">{order.reported_defect}</p>
                        <div className="flex gap-4 mt-1 text-xs text-gray-400">
                          <span>{order.customer_phone}</span>
                          {order.imei && <span>IMEI: {order.imei}</span>}
                          <span>Valor: {formatCurrency(order.service_value)}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {order.service_status === 'received' && (
                          <button onClick={() => updateStatus(order.id, 'in_analysis')} className="px-3 py-1.5 text-xs bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100">
                            Iniciar Análise
                          </button>
                        )}
                        {order.service_status === 'in_analysis' && (
                          <button onClick={() => updateStatus(order.id, 'in_repair')} className="px-3 py-1.5 text-xs bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100">
                            Iniciar Reparo
                          </button>
                        )}
                        {order.service_status === 'in_repair' && (
                          <button onClick={() => updateStatus(order.id, 'completed')} className="px-3 py-1.5 text-xs bg-green-50 text-green-700 rounded-lg hover:bg-green-100">
                            Finalizar
                          </button>
                        )}
                        {order.service_status === 'completed' && (
                          <button onClick={() => updateStatus(order.id, 'delivered')} className="px-3 py-1.5 text-xs bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100">
                            Dar Baixa
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* New OS Modal */}
        <AnimatePresence>
          {showForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl p-6 max-w-md w-full"
              >
                <h3 className="text-xl font-bold mb-6">Nova Ordem de Serviço</h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
                    <input type="text" required className="input-modern" value={formData.customer_name} onChange={(e) => setFormData({...formData, customer_name: e.target.value})} placeholder="Nome do cliente" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
                    <input type="tel" required className="input-modern" value={formData.customer_phone} onChange={(e) => setFormData({...formData, customer_phone: e.target.value})} placeholder="(11) 99999-9999" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                      <select className="select-modern" value={formData.device_type} onChange={(e) => setFormData({...formData, device_type: e.target.value})}>
                        <option value="Smartphone">Smartphone</option>
                        <option value="Tablet">Tablet</option>
                        <option value="Smartwatch">Smartwatch</option>
                        <option value="Notebook">Notebook</option>
                        <option value="AirPods">AirPods</option>
                        <option value="Outro">Outro</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                      <input type="text" className="input-modern" value={formData.device_brand} onChange={(e) => setFormData({...formData, device_brand: e.target.value})} placeholder="Ex: Apple" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
                      <input type="text" className="input-modern" value={formData.device_model} onChange={(e) => setFormData({...formData, device_model: e.target.value})} placeholder="Ex: iPhone 14" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">IMEI</label>
                      <input type="text" className="input-modern" value={formData.imei} onChange={(e) => setFormData({...formData, imei: e.target.value})} placeholder="Opcional" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Defeito Informado *</label>
                    <textarea required className="input-modern h-20" value={formData.reported_defect} onChange={(e) => setFormData({...formData, reported_defect: e.target.value})} placeholder="Descreva o defeito relatado pelo cliente" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valor do Serviço (R$)</label>
                    <input type="number" step="0.01" className="input-modern" value={formData.service_value} onChange={(e) => setFormData({...formData, service_value: e.target.value})} placeholder="0.00" />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary flex-1">Cancelar</button>
                    <button type="submit" className="btn btn-primary flex-1" disabled={submitting}>
                      {submitting ? "Salvando..." : "Criar OS"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  )
}