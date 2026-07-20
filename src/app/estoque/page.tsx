"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Search, AlertTriangle, Package, TrendingUp, TrendingDown } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { supabase } from "@/lib/supabase"

interface Product {
  id: string
  name: string
  brand: string
  model: string
  category: string
  stock: number
  min_stock: number
  price: number
  product_status: string
}

export default function EstoquePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("todos")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name')

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                         p.brand.toLowerCase().includes(search.toLowerCase()) ||
                         p.model.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === "todos" || 
      (filter === "baixo" && p.stock <= p.min_stock && p.stock > 0) ||
      (filter === "critico" && p.stock === 0)
    return matchesSearch && matchesFilter
  })

  const stats = {
    total: products.length,
    ok: products.filter(p => p.stock > p.min_stock).length,
    low: products.filter(p => p.stock <= p.min_stock && p.stock > 0).length,
    critical: products.filter(p => p.stock === 0).length,
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
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Carregando...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Search className="h-6 w-6" />
              </div>
              <p className="empty-state-title">Nenhum produto encontrado</p>
              <p className="empty-state-text">Tente ajustar sua busca ou filtros</p>
            </div>
          ) : (
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
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.brand} {product.model}</p>
                      </div>
                    </td>
                    <td>{product.category}</td>
                    <td>
                      <span className={`font-semibold ${
                        product.stock === 0 ? "text-red-600" :
                        product.stock <= product.min_stock ? "text-yellow-600" : "text-green-600"
                      }`}>
                        {product.stock}
                      </span>
                    </td>
                    <td>{product.min_stock}</td>
                    <td>
                      <span className={`badge ${
                        product.stock === 0 ? "badge-danger" :
                        product.stock <= product.min_stock ? "badge-warning" : "badge-success"
                      }`}>
                        {product.stock === 0 ? "Crítico" :
                         product.stock <= product.min_stock ? "Baixo" : "OK"}
                      </span>
                    </td>
                    <td className="font-medium">{formatCurrency(product.price)}</td>
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