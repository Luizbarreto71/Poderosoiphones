"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Search, Plus, User, Phone, MapPin, Smartphone, ArrowRightLeft, Calendar, DollarSign, Upload, Trash2, Check, Camera, FileText } from "lucide-react"
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

interface SuggestedPrice {
  id: string
  brand: string
  model: string
  capacity: string
  suggested_price: number
}

export default function TrocasPage() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [suggestedPrices, setSuggestedPrices] = useState<SuggestedPrice[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showPricesForm, setShowPricesForm] = useState(false)
  const [activeTab, setActiveTab] = useState<"new" | "history" | "prices">("new")
  
  // Form data
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
    description: "",
    device_received_photo: null as File | null,
    device_given_photo: null as File | null,
  })
  
  const [photoPreviewReceived, setPhotoPreviewReceived] = useState<string | null>(null)
  const [photoPreviewGiven, setPhotoPreviewGiven] = useState<string | null>(null)

  // Suggested price form
  const [priceFormData, setPriceFormData] = useState({
    brand: "",
    model: "",
    capacity: "",
    suggested_price: "",
  })
  const [bulkImport, setBulkImport] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadTrades()
    loadSuggestedPrices()
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

  const loadSuggestedPrices = async () => {
    try {
      const { data, error } = await supabase
        .from('suggested_prices')
        .select('*')
        .order('brand, model, capacity')

      if (error) throw error
      setSuggestedPrices(data || [])
    } catch (error) {
      console.error('Erro ao carregar preços sugeridos:', error)
    }
  }

  // Buscar preço sugerido
  const findSuggestedPrice = (brand: string, model: string, capacity: string): SuggestedPrice | null => {
    return suggestedPrices.find(p => 
      p.brand.toLowerCase() === brand.toLowerCase() &&
      p.model.toLowerCase() === model.toLowerCase() &&
      p.capacity === capacity
    ) || null
  }

  const uploadPhoto = async (file: File | null): Promise<string | null> => {
    if (!file) return null
    
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`
      const filePath = `trade-photos/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Erro ao fazer upload da foto:', error)
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Upload das fotos
      const receivedPhotoUrl = await uploadPhoto(formData.device_received_photo)
      const givenPhotoUrl = await uploadPhoto(formData.device_given_photo)

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
          description: formData.description || null,
          device_received_photo: receivedPhotoUrl,
          device_given_photo: givenPhotoUrl,
          trade_status: 'completed'
        }])

      if (error) {
        console.error('Erro ao salvar troca:', error)
        alert(`Erro ao registrar troca: ${error.message}`)
        return
      }

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
        description: "",
        device_received_photo: null,
        device_given_photo: null,
      })
      setPhotoPreviewReceived(null)
      setPhotoPreviewGiven(null)
      loadTrades()
    } catch (error) {
      console.error('Erro ao registrar troca:', error)
      alert("Erro ao registrar troca")
    } finally {
      setSubmitting(false)
    }
  }

  const handlePriceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const { error } = await supabase
        .from('suggested_prices')
        .insert([{
          brand: priceFormData.brand,
          model: priceFormData.model,
          capacity: priceFormData.capacity,
          suggested_price: parseFloat(priceFormData.suggested_price)
        }])

      if (error) throw error

      alert("Preço sugerido cadastrado!")
      setPriceFormData({ brand: "", model: "", capacity: "", suggested_price: "" })
      loadSuggestedPrices()
    } catch (error) {
      console.error('Erro ao cadastrar preço:', error)
      alert("Erro ao cadastrar preço")
    } finally {
      setSubmitting(false)
    }
  }

  const handleBulkImport = async () => {
    if (!bulkImport.trim()) return

    const lines = bulkImport.split('\n').filter(line => line.trim())
    const pricesToInsert = []

    for (const line of lines) {
      // Formato esperado: "iPhone 13 128GB - 2300" ou "iPhone 13 128GB 2300"
      const match = line.match(/(.+?)\s+(\d+GB)\s+[-–]\s*(\d+\.?\d*)/i) || 
                    line.match(/(.+?)\s+(\d+GB)\s+(\d+\.?\d*)/i)
      
      if (match) {
        const [, model, capacity, price] = match
        // Extrair marca do modelo (primeira palavra)
        const brand = model.split(' ')[0]
        const modelName = model.replace(brand, '').trim()
        
        pricesToInsert.push({
          brand,
          model: modelName,
          capacity,
          suggested_price: parseFloat(price)
        })
      }
    }

    if (pricesToInsert.length > 0) {
      try {
        const { error } = await supabase
          .from('suggested_prices')
          .insert(pricesToInsert)

        if (error) throw error

        alert(`${pricesToInsert.length} preços importados com sucesso!`)
        setBulkImport("")
        loadSuggestedPrices()
      } catch (error) {
        console.error('Erro na importação:', error)
        alert("Erro ao importar preços")
      }
    } else {
      alert("Nenhum preço válido encontrado. Use o formato:\niPhone 13 128GB - 2300")
    }
  }

  const deletePrice = async (id: string) => {
    if (!confirm("Deseja excluir este preço?")) return

    const { error } = await supabase
      .from('suggested_prices')
      .delete()
      .eq('id', id)

    if (error) {
      alert("Erro ao excluir")
      return
    }

    loadSuggestedPrices()
  }

  const useSuggestedPrice = (price: number) => {
    setFormData({...formData, device_given_price: price.toString()})
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
        <div>
          <h1 className="page-title">Trocas</h1>
          <p className="page-subtitle">Gerencie trocas de aparelhos</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("new")}
            className={`px-4 py-2 font-medium transition-all ${
              activeTab === "new"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Plus className="h-4 w-4 inline mr-2" />
            Nova Troca
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 font-medium transition-all ${
              activeTab === "history"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Search className="h-4 w-4 inline mr-2" />
            Histórico
          </button>
          <button
            onClick={() => setActiveTab("prices")}
            className={`px-4 py-2 font-medium transition-all ${
              activeTab === "prices"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <DollarSign className="h-4 w-4 inline mr-2" />
            Preços Sugeridos
          </button>
        </div>

        {/* Tab: Nova Troca */}
        {activeTab === "new" && (
          <div className="chart-container">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Nova Troca</h3>
              <button onClick={() => setShowForm(true)} className="btn btn-primary">
                <Plus className="h-4 w-4" />
                Nova Troca
              </button>
            </div>
            <div className="text-center py-12 text-gray-400">
              <ArrowRightLeft className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Clique em "Nova Troca" para registrar uma troca</p>
            </div>
          </div>
        )}

        {/* Tab: Histórico */}
        {activeTab === "history" && (
          <div className="space-y-4">
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
          </div>
        )}

        {/* Tab: Preços Sugeridos */}
        {activeTab === "prices" && (
          <div className="space-y-6">
            {/* Add Price Form */}
            <div className="chart-container">
              <h3 className="text-lg font-semibold mb-4">Cadastrar Preço Sugerido</h3>
              <form onSubmit={handlePriceSubmit} className="grid md:grid-cols-5 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Marca (ex: Apple)"
                  className="input-modern"
                  value={priceFormData.brand}
                  onChange={(e) => setPriceFormData({...priceFormData, brand: e.target.value})}
                />
                <input
                  type="text"
                  required
                  placeholder="Modelo (ex: iPhone 13)"
                  className="input-modern"
                  value={priceFormData.model}
                  onChange={(e) => setPriceFormData({...priceFormData, model: e.target.value})}
                />
                <input
                  type="text"
                  required
                  placeholder="Capacidade (ex: 128GB)"
                  className="input-modern"
                  value={priceFormData.capacity}
                  onChange={(e) => setPriceFormData({...priceFormData, capacity: e.target.value})}
                />
                <input
                  type="number"
                  required
                  step="0.01"
                  placeholder="Preço (R$)"
                  className="input-modern"
                  value={priceFormData.suggested_price}
                  onChange={(e) => setPriceFormData({...priceFormData, suggested_price: e.target.value})}
                />
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? "Salvando..." : "Cadastrar"}
                </button>
              </form>
            </div>

            {/* Bulk Import */}
            <div className="chart-container">
              <h3 className="text-lg font-semibold mb-4">Importação Rápida</h3>
              <p className="text-sm text-gray-600 mb-3">
                Cole uma lista no formato: <code className="bg-gray-100 px-2 py-1 rounded">iPhone 13 128GB - 2300</code>
              </p>
              <textarea
                className="input-modern h-32 mb-3"
                value={bulkImport}
                onChange={(e) => setBulkImport(e.target.value)}
                placeholder="iPhone 13 128GB - 2300
iPhone 13 256GB - 2600
iPhone 14 128GB - 3100"
              />
              <button onClick={handleBulkImport} className="btn btn-secondary">
                <Upload className="h-4 w-4" />
                Importar Lista
              </button>
            </div>

            {/* Prices List */}
            <div className="chart-container">
              <h3 className="text-lg font-semibold mb-4">Preços Cadastrados ({suggestedPrices.length})</h3>
              {suggestedPrices.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhum preço cadastrado</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Marca</th>
                        <th>Modelo</th>
                        <th>Capacidade</th>
                        <th>Preço Sugerido</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {suggestedPrices.map((price) => (
                        <tr key={price.id}>
                          <td className="font-medium">{price.brand}</td>
                          <td>{price.model}</td>
                          <td>{price.capacity}</td>
                          <td className="font-bold text-green-600">{formatCurrency(price.suggested_price)}</td>
                          <td>
                            <button
                              onClick={() => deletePrice(price.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              title="Excluir"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

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
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                          <input 
                            type="tel" 
                            required 
                            className="input-modern pl-10 w-full" 
                            value={formData.customer_phone} 
                            onChange={(e) => setFormData({...formData, customer_phone: e.target.value})} 
                            placeholder="(11) 99999-9999" 
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Endereço *</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                          <input 
                            type="text" 
                            required 
                            className="input-modern pl-10 w-full" 
                            value={formData.customer_address} 
                            onChange={(e) => setFormData({...formData, customer_address: e.target.value})} 
                            placeholder="Rua, número, bairro, cidade" 
                          />
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
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Foto do Aparelho de Entrada</label>
                        <div className="flex items-center gap-3">
                          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                            <Camera className="h-4 w-4" />
                            <span className="text-sm">Escolher Foto</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  setFormData({...formData, device_received_photo: file})
                                  const reader = new FileReader()
                                  reader.onloadend = () => {
                                    setPhotoPreviewReceived(reader.result as string)
                                  }
                                  reader.readAsDataURL(file)
                                }
                              }}
                            />
                          </label>
                          {photoPreviewReceived && (
                            <img src={photoPreviewReceived} alt="Preview" className="h-16 w-16 object-cover rounded-lg border border-gray-200" />
                          )}
                        </div>
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
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Foto do Aparelho de Saída</label>
                        <div className="flex items-center gap-3">
                          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                            <Camera className="h-4 w-4" />
                            <span className="text-sm">Escolher Foto</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  setFormData({...formData, device_given_photo: file})
                                  const reader = new FileReader()
                                  reader.onloadend = () => {
                                    setPhotoPreviewGiven(reader.result as string)
                                  }
                                  reader.readAsDataURL(file)
                                }
                              }}
                            />
                          </label>
                          {photoPreviewGiven && (
                            <img src={photoPreviewGiven} alt="Preview" className="h-16 w-16 object-cover rounded-lg border border-gray-200" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FileText className="inline h-4 w-4 mr-2" />
                      Descrição da Troca
                    </label>
                    <textarea
                      className="input-modern h-24"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Descreva detalhes da troca, observações, estado dos aparelhos, etc."
                    />
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