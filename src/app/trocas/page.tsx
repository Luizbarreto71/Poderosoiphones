"use client"

import * as React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Search, Plus, User, Phone, MapPin, Smartphone, ArrowRightLeft, Calendar } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface Trade {
  id: number
  customerName: string
  customerPhone: string
  customerAddress: string
  deviceReceived: string
  deviceReceivedImei: string
  deviceReceivedCondition: string
  deviceGiven: string
  deviceGivenPrice: number
  difference: number
  date: string
  status: "pending" | "completed" | "cancelled"
}

const trades: Trade[] = [
  {
    id: 1,
    customerName: "João Silva",
    customerPhone: "(11) 99999-9999",
    customerAddress: "Rua das Flores, 123 - São Paulo/SP",
    deviceReceived: "iPhone 13 Pro 128GB",
    deviceReceivedImei: "123456789012345",
    deviceReceivedCondition: "Usado - Bom estado",
    deviceGiven: "iPhone 14 128GB",
    deviceGivenPrice: 4500,
    difference: 1500,
    date: "2024-01-15",
    status: "completed"
  },
  {
    id: 2,
    customerName: "Maria Santos",
    customerPhone: "(11) 88888-8888",
    customerAddress: "Av. Paulista, 1000 - São Paulo/SP",
    deviceReceived: "Samsung S23 256GB",
    deviceReceivedImei: "987654321098765",
    deviceReceivedCondition: "Seminovo",
    deviceGiven: "Samsung S24 256GB",
    deviceGivenPrice: 5500,
    difference: 2000,
    date: "2024-01-16",
    status: "pending"
  },
]

export default function TrocasPage() {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    deviceReceived: "",
    deviceReceivedImei: "",
    deviceReceivedCondition: "",
    deviceGiven: "",
    deviceGivenPrice: "",
    difference: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert("Troca registrada com sucesso!")
    setShowForm(false)
    setFormData({
      customerName: "",
      customerPhone: "",
      customerAddress: "",
      deviceReceived: "",
      deviceReceivedImei: "",
      deviceReceivedCondition: "",
      deviceGiven: "",
      deviceGivenPrice: "",
      difference: "",
    })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Trocas</h1>
            <p className="page-subtitle">Gerencie trocas de aparelhos</p>
          </div>
          <button 
            onClick={() => setShowForm(true)}
            className="btn btn-primary"
          >
            <ArrowRightLeft className="h-4 w-4" />
            Nova Troca
          </button>
        </div>

        {/* Trade Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full my-8"
            >
              <h3 className="text-xl font-bold mb-6">Nova Troca</h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Customer Info */}
                <div>
                  <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    Dados do Cliente
                  </h4>
                  <div className="grid gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                      <input
                        type="text"
                        required
                        className="input-modern"
                        value={formData.customerName}
                        onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                        placeholder="Nome do cliente"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="tel"
                          required
                          className="input-modern pl-10"
                          value={formData.customerPhone}
                          onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
                          placeholder="(11) 99999-9999"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          required
                          className="input-modern pl-10"
                          value={formData.customerAddress}
                          onChange={(e) => setFormData({...formData, customerAddress: e.target.value})}
                          placeholder="Rua, número, bairro, cidade"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Device Received */}
                <div>
                  <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-green-600" />
                    Aparelho de Entrada (Cliente entrega)
                  </h4>
                  <div className="grid gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Modelo do Aparelho</label>
                      <input
                        type="text"
                        required
                        className="input-modern"
                        value={formData.deviceReceived}
                        onChange={(e) => setFormData({...formData, deviceReceived: e.target.value})}
                        placeholder="Ex: iPhone 13 Pro 128GB"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">IMEI</label>
                      <input
                        type="text"
                        required
                        className="input-modern"
                        value={formData.deviceReceivedImei}
                        onChange={(e) => setFormData({...formData, deviceReceivedImei: e.target.value})}
                        placeholder="Número IMEI do aparelho"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Condição</label>
                      <select
                        required
                        className="select-modern"
                        value={formData.deviceReceivedCondition}
                        onChange={(e) => setFormData({...formData, deviceReceivedCondition: e.target.value})}
                      >
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

                {/* Device Given */}
                <div>
                  <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <ArrowRightLeft className="h-5 w-5 text-blue-600" />
                    Aparelho de Saída (Cliente recebe)
                  </h4>
                  <div className="grid gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Modelo do Aparelho</label>
                      <input
                        type="text"
                        required
                        className="input-modern"
                        value={formData.deviceGiven}
                        onChange={(e) => setFormData({...formData, deviceGiven: e.target.value})}
                        placeholder="Ex: iPhone 14 128GB"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Valor do Aparelho (R$)</label>
                        <input
                          type="number"
                          required
                          className="input-modern"
                          value={formData.deviceGivenPrice}
                          onChange={(e) => setFormData({...formData, deviceGivenPrice: e.target.value})}
                          placeholder="0,00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Diferença a Pagar (R$)</label>
                        <input
                          type="number"
                          required
                          className="input-modern"
                          value={formData.difference}
                          onChange={(e) => setFormData({...formData, difference: e.target.value})}
                          placeholder="0,00"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="btn btn-secondary flex-1"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary flex-1"
                  >
                    <Calendar className="h-4 w-4" />
                    Registrar Troca
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Trades List */}
        <div className="chart-container">
          <h3 className="chart-title">Trocas Recentes</h3>
          <div className="space-y-3">
            {trades.map((trade) => (
              <div key={trade.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                    <ArrowRightLeft className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{trade.customerName}</p>
                    <p className="text-sm text-gray-500">{trade.deviceReceived} → {trade.deviceGiven}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {trade.customerPhone} • {trade.date}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600">
                    {formatCurrency(Number(trade.difference))}
                  </p>
                  <span className={`badge ${
                    trade.status === "completed" ? "badge-success" :
                    trade.status === "pending" ? "badge-warning" : "badge-danger"
                  }`}>
                    {trade.status === "completed" ? "Concluída" :
                     trade.status === "pending" ? "Pendente" : "Cancelada"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}