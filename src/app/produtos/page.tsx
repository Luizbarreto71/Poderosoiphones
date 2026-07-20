"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Search, Plus, Package, Edit, Trash2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { ProductFormModal } from "@/components/products/product-form-modal"

interface Product {
  id: string
  name: string
  brand: string
  model: string
  category: string
  color?: string
  capacity?: string
  condition?: string
  cost: number
  price: number
  stock: number
  min_stock: number
  specs?: string
  product_status: string
  created_at: string
}

export default function ProdutosPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("todos")
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSuccess = () => {
    loadProducts()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) throw error
      loadProducts()
    } catch (error) {
      console.error('Erro ao excluir produto:', error)
      alert("Erro ao excluir produto")
    }
  }

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                         p.brand.toLowerCase().includes(search.toLowerCase()) ||
                         p.model.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = selectedCategory === "todos" || p.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = ["todos", "iPhone", "Samsung", "Xiaomi", "Apple Watch", "AirPods", "Capinhas", "Películas", "Carregadores", "Cabos", "Fones", "Outros"]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Produtos</h1>
            <p className="page-subtitle">{products.length} produtos cadastrados</p>
          </div>
          <button 
            onClick={() => setShowForm(true)}
            className="btn btn-primary"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Novo Produto</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por marca ou modelo..."
              className="input-modern pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat 
                    ? "bg-blue-600 text-white" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat === "todos" ? "Todos" : cat}
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
                <Package className="h-6 w-6" />
              </div>
              <p className="empty-state-title">Nenhum produto encontrado</p>
              <p className="empty-state-text">Comece cadastrando um novo produto</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Categoria</th>
                  <th>Cor</th>
                  <th>Capacidade</th>
                  <th>Custo</th>
                  <th>Preço</th>
                  <th>Estoque</th>
                  <th>Status</th>
                  <th>Ações</th>
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
                    <td>{product.color || "-"}</td>
                    <td>{product.capacity || "-"}</td>
                    <td>{formatCurrency(product.cost)}</td>
                    <td className="font-medium">{formatCurrency(product.price)}</td>
                    <td>
                      <span className={`font-semibold ${product.stock <= product.min_stock ? "text-red-600" : "text-green-600"}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${product.product_status === "ativo" ? "badge-success" : "badge-danger"}`}>
                        {product.product_status === "ativo" ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Product Form Modal */}
        <ProductFormModal
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          onSuccess={handleSuccess}
        />
      </div>
    </DashboardLayout>
  )
}