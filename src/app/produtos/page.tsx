"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Search, Plus, Package, Edit, Trash2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { supabase } from "@/lib/supabase"

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
  image_url?: string
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
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    category: "iPhone",
    color: "",
    capacity: "",
    condition: "novo",
    cost: "",
    price: "",
    stock: "",
    min_stock: "5",
    image_url: "",
    specs: "",
  })

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const productName = `${formData.brand} ${formData.model}`
      
      const { error } = await supabase
        .from('products')
        .insert([{
          name: productName,
          brand: formData.brand,
          model: formData.model,
          category: formData.category,
          color: formData.color,
          capacity: formData.capacity,
          condition: formData.condition,
          cost: parseFloat(formData.cost),
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          min_stock: parseInt(formData.min_stock),
          image_url: formData.image_url,
          specs: formData.specs,
          product_status: "ativo"
        }])

      if (error) throw error

      alert("Produto cadastrado com sucesso!")
      setShowForm(false)
      setFormData({
        brand: "",
        model: "",
        category: "iPhone",
        color: "",
        capacity: "",
        condition: "novo",
        cost: "",
        price: "",
        stock: "",
        min_stock: "5",
        image_url: "",
        specs: "",
      })
      loadProducts()
    } catch (error) {
      console.error('Erro ao cadastrar produto:', error)
      alert("Erro ao cadastrar produto: " + (error as any)?.message || "Verifique os dados")
    }
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
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-xl font-bold mb-6">Novo Produto</h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Marca *</label>
                    <input
                      type="text"
                      required
                      className="input-modern"
                      value={formData.brand}
                      onChange={(e) => setFormData({...formData, brand: e.target.value})}
                      placeholder="Ex: Apple"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Modelo *</label>
                    <input
                      type="text"
                      required
                      className="input-modern"
                      value={formData.model}
                      onChange={(e) => setFormData({...formData, model: e.target.value})}
                      placeholder="Ex: iPhone 15 Pro Max"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
                  <select
                    required
                    className="select-modern"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="iPhone">iPhone</option>
                    <option value="Samsung">Samsung</option>
                    <option value="Xiaomi">Xiaomi</option>
                    <option value="Apple Watch">Apple Watch</option>
                    <option value="AirPods">AirPods</option>
                    <option value="Capinhas">Capinhas</option>
                    <option value="Películas">Películas</option>
                    <option value="Carregadores">Carregadores</option>
                    <option value="Cabos">Cabos</option>
                    <option value="Fones">Fones</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cor</label>
                    <input
                      type="text"
                      className="input-modern"
                      value={formData.color}
                      onChange={(e) => setFormData({...formData, color: e.target.value})}
                      placeholder="Ex: Preto"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Capacidade</label>
                    <input
                      type="text"
                      className="input-modern"
                      value={formData.capacity}
                      onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                      placeholder="Ex: 128GB"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Condição</label>
                    <select
                      className="select-modern"
                      value={formData.condition}
                      onChange={(e) => setFormData({...formData, condition: e.target.value})}
                    >
                      <option value="novo">Novo</option>
                      <option value="seminovo">Seminovo</option>
                      <option value="usado">Usado</option>
                      <option value="vitrine">Vitrine</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Custo (R$) *</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      className="input-modern"
                      value={formData.cost}
                      onChange={(e) => setFormData({...formData, cost: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$) *</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      className="input-modern"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estoque *</label>
                    <input
                      type="number"
                      required
                      className="input-modern"
                      value={formData.stock}
                      onChange={(e) => setFormData({...formData, stock: e.target.value})}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL da Imagem</label>
                  <input
                    type="text"
                    className="input-modern"
                    value={formData.image_url}
                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Especificações</label>
                  <textarea
                    className="input-modern h-20"
                    value={formData.specs}
                    onChange={(e) => setFormData({...formData, specs: e.target.value})}
                    placeholder="Ex: 6.7 polegadas, 48MP, 256GB"
                  />
                </div>

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
                    Cadastrar Produto
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}