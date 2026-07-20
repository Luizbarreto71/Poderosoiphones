"use client"

import * as React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Search, Filter, AlertTriangle, Package, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface Product {
  id: number
  name: string
  category: string
  stock: number
  minStock: number
  price: number
  status: "ok" | "low" | "critical"
  image: string
}

const products: Product[] = [
  { id: 1, name: "iPhone 15 Pro Max", category: "iPhone", stock: 5, minStock: 3, price: 9499, status: "ok", image: "📱" },
  { id: 2, name: "iPhone 15 Pro", category: "iPhone", stock: 2, minStock: 3, price: 7999, status: "low", image: "📱" },
  { id: 3, name: "iPhone 15", category: "iPhone", stock: 1, minStock: 3, price: 5299, status: "critical", image: "📱" },
  { id: 4, name: "Samsung S24 Ultra", category: "Samsung", stock: 2, minStock: 2, price: 7999, status: "ok", image: "📱" },
  { id: 5, name: "AirPods Pro 2", category: "AirPods", stock: 12, minStock: 5, price: 2499, status: "ok", image: "🎧" },
  { id: 6, name: "Capinha Siliconada", category: "Acessórios", stock: 25, minStock: 10, price: 199, status: "ok", image: "📦" },
  { id: 7, name: "Carregador 20W", category: "Carregadores", stock: 3, minStock: 5, price: 249, status: "low", image: "🔌" },
  { id: 8, name: "Cabo USB-C", category: "Cabos", stock: 0, minStock: 10, price: 89, status: "critical", image: "🔌" },
]

export default function EstoquePage() {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("todos")

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === "todos" || 
      (filter === "baixo" && p.status !== "ok") ||
      (filter === "critico" && p.status === "critical")
    return matchesSearch && matchesFilter
  })

  const stats = {
    total: products.length,
    ok: products.filter(p => p.status === "ok").length,
    low: products.filter(p => p.status === "low").length,
    critical: products.filter(p => p.status === "critical").length,
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="page-title">Estoque</h1>
          <p className="page-subtitle">Controle de estoque em tempo real</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="stat-icon bg-blue-500 text-white">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="stat-value">{stats.total}</p>
                <p className="stat-label">Total Produtos</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="stat-icon bg-green-500 text-white">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="stat-value">{stats.ok}</p>
                <p className="stat-label">Estoque OK</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="stat-icon bg-yellow-500 text-white">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="stat-value">{stats.low}</p>
                <p className="stat-label">Estoque Baixo</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="stat-icon bg-red-500 text-white">
                <TrendingDown className="h-5 w-5" />
              </div>
              <div>
                <p className="stat-value">{stats.critical}</p>
                <p className="stat-label">Crítico</p>
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
              placeholder="Buscar produto..."
              className="input-modern pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {["todos", "baixo", "critico"].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  filter === f 
                    ? "bg-blue-600 text-white" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {f === "todos" ? "Todos" : f === "baixo" ? "Estoque Baixo" : "Crítico"}
              </button>
            ))}
          </div>
        </div>

        {/* Products Table */}
        <div className="chart-container overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Categoria</th>
                <th>Estoque</th>
                <th>Mínimo</th>
                <th>Status</th>
                <th>Preço</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{product.image}</span>
                      <span className="font-medium">{product.name}</span>
                    </div>
                  </td>
                  <td>{product.category}</td>
                  <td>
                    <span className={`font-semibold ${
                      product.stock === 0 ? "text-red-600" :
                      product.stock <= product.minStock ? "text-yellow-600" : "text-green-600"
                    }`}>
                      {product.stock}
                    </span>
                  </td>
                  <td>{product.minStock}</td>
                  <td>
                    <span className={`badge ${
                      product.status === "ok" ? "badge-success" :
                      product.status === "low" ? "badge-warning" : "badge-danger"
                    }`}>
                      {product.status === "ok" ? "OK" :
                       product.status === "low" ? "Baixo" : "Crítico"}
                    </span>
                  </td>
                  <td className="font-medium">{formatCurrency(product.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredProducts.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Search className="h-6 w-6" />
              </div>
              <p className="empty-state-title">Nenhum produto encontrado</p>
              <p className="empty-state-text">Tente ajustar sua busca ou filtros</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}