"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Search, Plus, User, Phone, MapPin, Smartphone, ArrowRightLeft, Calendar, DollarSign } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { supabase } from "@/lib/supabase"

interface Trade {
  id: string
  customer_name: string
  customer_phone: string
  customer_address: string
  device_received: string
  device_received_imei: string
  device_received_condition: string
  device_given: string
  device_given_price: number
  difference: number
  date: string
  trade_status: string
  notes: string
  created_at: string
}

export default function TrocasPage() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    customer_address: "",
    device_received: "",
    device_received_imei: "",
    device_received_condition: "",
    device_given: "",
    device_given_price: "",
    difference: "",
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadTrades()
  }, [])

  const loadTrades = async () => {
    try {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTrades(data || [])
    } catch (error) {
      console.error('Erro ao carregar trocas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const { error } = await supabase
        .from('trades')
        .insert([{
          customer_name: formData.customer_name,
          customer_phone: formData.customer_phone,
          customer_address: formData.customer_address,
          device_received: formData.device_received,
          device_received_imei: formData.device_received_imei,
          device_received_condition: formData.device_received_condition,
          device_given: formData.device_given,
          device_given_price: parseFloat(formData.device_given_price),
          difference: parseFloat(formData.difference),
          trade_status: 'completed'
        }])

      if (error) throw error

      alert("Troca registrada com sucesso!")
      setShowForm(false)
      setFormData({
        customer_name: "",
        customer_phone: "",
        customer_address: "",
        device_received: "",
        device_received_imei: "",
        device_received_condition: "",
        device_given: "",
        device_given_price: "",
        difference: "",
      })
      loadTrades()
    } catch (error) {
      console.error('Erro ao registrar troca:', error)
      alert("Erro ao registrar troca")
    } finally {
      setSubmitting(false)
    }
  }

  const filteredTrades = trades.filter(t => 
    t.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    t.customer_phone.includes(search) ||
    t.device_received.toLowerCase().includes(search.toLowerCase()) ||
    t.device_given.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Trocas</h1>
            <p className="page-subtitle">Gerencie trocas de aparelhos</p>
          </div>
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            <ArrowRightLeft className="h-4 w-4" />
            Nova Troca
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por cliente, telefone ou aparelho..."
            className="input-modern pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Trades List */}
        <div className="chart-container">
          {loading ? (
            <div className="text-center py-12"><p className="text-gray-500">Carregando...</p></div>
          ) : filteredTrades.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <ArrowRightLeft className="h-12 w-12 mx-auto mb-3" />
              <p>Nenhuma troca encontrada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTrades.map((trade) => (
                <div key={trade.id} className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <ArrowRightLeft className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{trade.customer_name}</p>
                        <p className="text-sm text-gray-600">
                          {trade.device_received} → {trade.device_given}
                        </p>
                        <div className="flex gap-3 mt-1 text-xs text-gray-400">
                          <span>{trade.customer_phone}</span>
                          <span>Diferença: {formatCurrency(trade.difference)}</span>
                          <span>{new Date(trade.date).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">{formatCurrency(trade.difference)}</p>
                      <span className="badge badge-success">Concluída</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* New Trade Modal */}
        <AnimatePresence>
          {showForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl p-6 max-w-2xl w-full my-8"
              >
                <h3 className="text-xl font-bold mb-6">Nova Troca</h3>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-600" />
                      Dados do Cliente
                    </h4>
                    <div className="grid gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
                        <input type="text" required className="input-modern" value={formData.customer_name} onChange={(e) => setFormData({...formData, customer_name: e.target.value})} placeholder="Nome do cliente" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input type="tel" required className="input-modern pl-10" value={formData.customer_phone} onChange={(e) => setFormData({...formData, customer_phone: e.target.value})} placeholder="(11) 99999-9999" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Endereço *</label>
                        <div className="relative">
                          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input type="text" required className="input-modern pl-10" value={formData.customer_address} onChange={(e) => setFormData({...formData, customer_address: e.target.value})} placeholder="Rua, número, bairro, cidade" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Smartphone className="h-5 w-5 text-green-600" />
                      Aparelho de Entrada (Cliente entrega)
                    </h4>
                    <div className="grid gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Modelo *</label>
                        <input type="text" required className="input-modern" value={formData.device_received} onChange={(e) => setFormData({...formData, device_received: e.target.value})} placeholder="Ex: iPhone 13 Pro 128GB" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">IMEI *</label>
                        <input type="text" required className="input-modern" value={formData.device_received_imei} onChange={(e) => setFormData({...formData, device_received_imei: e.target.value})} placeholder="Número IMEI do aparelho" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Condição *</label>
                        <select required className="select-modern" value={formData.device_received_condition} onChange={(e) => setFormData({...formData, device_received_condition: e.target.value})}>
                          <option value="">Selecione...</option>
                          <option value="novo">Novo</option>
                          <option value="seminovo">Seminovo</option>
                          <option value="usado-bom">Usado - Bom estado</option>
                          <option value="usado-regular">Usado - Estado regular</option>
                          <option value="defeito">Com defeito</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <ArrowRightLeft className="h-5 w-5 text-blue-600" />
                      Aparelho de Saída (Cliente recebe)
                    </h4>
                    <div className="grid gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Modelo *</label>
                        <input type="text" required className="input-modern" value={formData.device_given} onChange={(e) => setFormData({...formData, device_given: e.target.value})} placeholder="Ex: iPhone 14 128GB" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$) *</label>
                          <input type="number" required step="0.01" className="input-modern" value={formData.device_given_price} onChange={(e) => setFormData({...formData, device_given_price: e.target.value})} placeholder="0,00" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Diferença (R$) *</label>
                          <input type="number" required step="0.01" className="input-modern" value={formData.difference} onChange={(e) => setFormData({...formData, difference: e.target.value})} placeholder="0,00" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary flex-1">Cancelar</button>
                    <button type="submit" className="btn btn-primary flex-1" disabled={submitting}>
                      {submitting ? "Salvando..." : "Registrar Troca"}
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