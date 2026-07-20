"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Search, Plus, User, Phone, MapPin, Calendar, Crown, Eye } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { supabase } from "@/lib/supabase"

interface Customer {
  id: string
  name: string
  phone: string
  address: string
  total_spent: number
  last_purchase: string
  classification: "bronze" | "prata" | "ouro" | "diamante"
  created_at: string
}

export default function ClientesPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCustomers(data || [])
    } catch (error) {
      console.error('Erro ao carregar clientes:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  )

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case "diamante": return "badge-primary"
      case "ouro": return "badge-warning"
      case "prata": return "badge-success"
      default: return "badge-danger"
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Clientes</h1>
            <p className="page-subtitle">{customers.length} clientes cadastrados</p>
          </div>
          <button className="btn btn-primary">
            <Plus className="h-4 w-4" />
            Novo Cliente
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou telefone..."
            className="input-modern pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Customers Table */}
        <div className="chart-container overflow-x-auto">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Carregando...</p>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <User className="h-6 w-6" />
              </div>
              <p className="empty-state-title">Nenhum cliente encontrado</p>
              <p className="empty-state-text">Comece cadastrando um novo cliente</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Telefone</th>
                  <th>Endereço</th>
                  <th>Total Gasto</th>
                  <th>Última Compra</th>
                  <th>Classificação</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <span className="font-medium">{customer.name}</span>
                      </div>
                    </td>
                    <td>{customer.phone}</td>
                    <td>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin className="h-3 w-3" />
                        {customer.address}
                      </div>
                    </td>
                    <td className="font-medium">{formatCurrency(customer.total_spent)}</td>
                    <td>
                      {customer.last_purchase ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          {new Date(customer.last_purchase).toLocaleDateString('pt-BR')}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${getClassificationColor(customer.classification)}`}>
                        {customer.classification.charAt(0).toUpperCase() + customer.classification.slice(1)}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                          title="Ver Histórico"
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