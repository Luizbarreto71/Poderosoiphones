"use client"

import * as React from "react"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Smartphone, Hash, MapPin, DollarSign, TrendingUp, FileText } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { supabase } from "@/lib/supabase"

interface ProductFormData {
  brand: string
  model: string
  category: string
  color: string
  capacity: string
  condition: string
  imei_primary: string
  imei_secondary: string
  serial_number: string
  stock: string
  min_stock: string
  location: string
  cost: string
  price: string
  specs: string
}

interface ProductFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ProductFormModal({ isOpen, onClose, onSuccess }: ProductFormModalProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    brand: "",
    model: "",
    category: "iPhone",
    color: "",
    capacity: "",
    condition: "novo",
    imei_primary: "",
    imei_secondary: "",
    serial_number: "",
    stock: "",
    min_stock: "5",
    location: "Vitrine",
    cost: "",
    price: "",
    specs: "",
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const brandRef = useRef<HTMLInputElement>(null)
  const modelRef = useRef<HTMLInputElement>(null)

  // Auto focus no primeiro campo
  useEffect(() => {
    if (isOpen && brandRef.current) {
      setTimeout(() => brandRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Calcular lucro e margem
  const cost = parseFloat(formData.cost) || 0
  const price = parseFloat(formData.price) || 0
  const profit = price - cost
  const margin = price > 0 ? ((profit / price) * 100).toFixed(1) : "0"

  // Nome automático do produto
  const productName = formData.brand && formData.model 
    ? `${formData.brand} ${formData.model}`
    : ""

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.brand.trim()) newErrors.brand = "Marca é obrigatória"
    if (!formData.model.trim()) newErrors.model = "Modelo é obrigatório"
    if (!formData.cost || parseFloat(formData.cost) <= 0) newErrors.cost = "Custo deve ser maior que 0"
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = "Preço deve ser maior que 0"
    if (!formData.stock || parseInt(formData.stock) < 0) newErrors.stock = "Estoque inválido"
    if (formData.imei_primary && formData.imei_primary.length !== 15) {
      newErrors.imei_primary = "IMEI deve ter 15 dígitos"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      alert("Preencha todos os campos obrigatórios corretamente")
      return
    }

    setLoading(true)

    try {
      const productName = `${formData.brand} ${formData.model}`
      
      console.log("=== CADASTRANDO PRODUTO ===")
      console.log("Nome:", productName)
      console.log("Marca:", formData.brand)
      console.log("Modelo:", formData.model)
      console.log("Categoria:", formData.category)
      console.log("Custo:", parseFloat(formData.cost))
      console.log("Preço:", parseFloat(formData.price))
      console.log("Estoque:", parseInt(formData.stock))
      console.log("Min Stock:", parseInt(formData.min_stock))

      const { data, error } = await supabase
        .from('products')
        .insert([{
          name: productName,
          brand: formData.brand,
          model: formData.model,
          category: formData.category,
          color: formData.color || null,
          capacity: formData.capacity || null,
          condition: formData.condition || null,
          cost: parseFloat(formData.cost),
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          min_stock: parseInt(formData.min_stock),
          specs: formData.specs || null
        }])
        .select()

      if (error) {
        console.error("=== ERRO DO SUPABASE ===")
        console.error("Código:", error.code)
        console.error("Mensagem:", error.message)
        console.error("Detalhes:", error.details)
        console.error("Hint:", error.hint)
        throw error
      }

      console.log("=== PRODUTO CADASTRADO COM SUCESSO ===")
      console.log("Dados:", data)

      // Reset form
      setFormData({
        brand: "",
        model: "",
        category: "iPhone",
        color: "",
        capacity: "",
        condition: "novo",
        imei_primary: "",
        imei_secondary: "",
        serial_number: "",
        stock: "",
        min_stock: "5",
        location: "Vitrine",
        cost: "",
        price: "",
        specs: "",
      })
      setErrors({})

      alert("Produto cadastrado com sucesso!")
      onSuccess()
      onClose()
    } catch (error) {
      console.error('=== ERRO AO CADASTRAR PRODUTO ===')
      console.error('Erro completo:', error)
      const errorMessage = (error as any)?.message || "Verifique os dados"
      alert("Erro ao cadastrar produto:\n\n" + errorMessage + "\n\nVerifique o console (F12) para mais detalhes.")
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, nextField?: () => void) => {
    if (e.key === 'Enter' && nextField) {
      e.preventDefault()
      nextField()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-[900px] max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Novo Produto</h2>
                <p className="text-blue-100 text-sm mt-1">Cadastre em menos de 30 segundos</p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto max-h-[calc(90vh-100px)]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Coluna Esquerda - Formulário */}
                <div className="space-y-6">
                  {/* Seção 1: Identificação */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-blue-600" />
                      Identificação
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Marca <span className="text-red-500">*</span>
                        </label>
                        <input
                          ref={brandRef}
                          type="text"
                          required
                          className={`input-modern ${errors.brand ? 'border-red-500' : ''}`}
                          value={formData.brand}
                          onChange={(e) => setFormData({...formData, brand: e.target.value})}
                          onKeyDown={(e) => handleKeyDown(e, modelRef.current?.focus)}
                          placeholder="Ex: Apple"
                        />
                        {errors.brand && <p className="text-red-500 text-xs mt-1">{errors.brand}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Modelo <span className="text-red-500">*</span>
                        </label>
                        <input
                          ref={modelRef}
                          type="text"
                          required
                          className={`input-modern ${errors.model ? 'border-red-500' : ''}`}
                          value={formData.model}
                          onChange={(e) => setFormData({...formData, model: e.target.value})}
                          placeholder="Ex: iPhone 15 Pro Max"
                        />
                        {errors.model && <p className="text-red-500 text-xs mt-1">{errors.model}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Categoria <span className="text-red-500">*</span>
                      </label>
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
                  </div>

                  {/* Seção 2: Características */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                      Características
                    </h3>
                    
                    <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Especificações</label>
                  <textarea
                    className="input-modern h-24 resize-none"
                    value={formData.specs}
                    onChange={(e) => setFormData({...formData, specs: e.target.value})}
                    placeholder="Ex: Aparelho importado, caixa original, bateria 100%..."
                  />
                </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Condição</label>
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
                  </div>

                  {/* Seção 3: Rastreamento */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                      <Hash className="h-4 w-4 text-blue-600" />
                      Rastreamento
                    </h3>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">IMEI Principal</label>
                        <input
                          type="text"
                          maxLength={15}
                          className={`input-modern ${errors.imei_primary ? 'border-red-500' : ''}`}
                          value={formData.imei_primary}
                          onChange={(e) => setFormData({...formData, imei_primary: e.target.value.replace(/\D/g, '')})}
                          placeholder="15 dígitos"
                        />
                        {errors.imei_primary && <p className="text-red-500 text-xs mt-1">{errors.imei_primary}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">IMEI Secundário</label>
                        <input
                          type="text"
                          maxLength={15}
                          className="input-modern"
                          value={formData.imei_secondary}
                          onChange={(e) => setFormData({...formData, imei_secondary: e.target.value.replace(/\D/g, '')})}
                          placeholder="15 dígitos (opcional)"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Número de Série</label>
                        <input
                          type="text"
                          className="input-modern"
                          value={formData.serial_number}
                          onChange={(e) => setFormData({...formData, serial_number: e.target.value})}
                          placeholder="Número de série (opcional)"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Seção 4: Estoque */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      Estoque
                    </h3>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Quantidade</label>
                        <input
                          type="number"
                          required
                          className={`input-modern ${errors.stock ? 'border-red-500' : ''}`}
                          value={formData.stock}
                          onChange={(e) => setFormData({...formData, stock: e.target.value})}
                          placeholder="0"
                        />
                        {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Estoque Mínimo</label>
                        <input
                          type="number"
                          className="input-modern"
                          value={formData.min_stock}
                          onChange={(e) => setFormData({...formData, min_stock: e.target.value})}
                          placeholder="5"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Localização</label>
                        <select
                          className="select-modern"
                          value={formData.location}
                          onChange={(e) => setFormData({...formData, location: e.target.value})}
                        >
                          <option value="Vitrine">Vitrine</option>
                          <option value="Gaveta A">Gaveta A</option>
                          <option value="Gaveta B">Gaveta B</option>
                          <option value="Gaveta C">Gaveta C</option>
                          <option value="Estoque">Estoque</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Coluna Direita - Preview e Comercial */}
                <div className="space-y-6">
                  {/* Preview do Produto */}
                  {productName && (
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                        Preview do Produto
                      </h3>
                      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Smartphone className="h-8 w-8 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 text-lg leading-tight">
                              {productName}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {formData.capacity && `${formData.capacity} • `}
                              {formData.condition === 'novo' ? 'Novo' : 
                               formData.condition === 'seminovo' ? 'Seminovo' :
                               formData.condition === 'usado' ? 'Usado' : 'Vitrine'}
                            </p>
                            {formData.color && (
                              <p className="text-sm text-gray-500 mt-0.5">{formData.color}</p>
                            )}
                          </div>
                        </div>
                        {formData.imei_primary && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="text-xs text-gray-500">
                              IMEI: {formData.imei_primary.slice(0, 6)}******{formData.imei_primary.slice(-3)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Seção 5: Comercial */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-blue-600" />
                      Comercial
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Custo (R$) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          required
                          step="0.01"
                          className={`input-modern ${errors.cost ? 'border-red-500' : ''}`}
                          value={formData.cost}
                          onChange={(e) => setFormData({...formData, cost: e.target.value})}
                          placeholder="0.00"
                        />
                        {errors.cost && <p className="text-red-500 text-xs mt-1">{errors.cost}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Preço (R$) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          required
                          step="0.01"
                          className={`input-modern ${errors.price ? 'border-red-500' : ''}`}
                          value={formData.price}
                          onChange={(e) => setFormData({...formData, price: e.target.value})}
                          placeholder="0.00"
                        />
                        {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                      </div>
                    </div>

                    {/* Cálculo automático */}
                    {price > 0 && (
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                            <span className="text-sm font-medium text-gray-700">Lucro</span>
                          </div>
                          <span className="text-lg font-bold text-green-600">
                            {formatCurrency(profit)}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-sm text-gray-600">Margem</span>
                          <span className="text-sm font-semibold text-gray-900">
                            {margin}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Seção 6: Observações */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      Observações
                    </h3>
                    <textarea
                      className="input-modern h-24 resize-none"
                      value={formData.specs}
                      onChange={(e) => setFormData({...formData, specs: e.target.value})}
                      placeholder="Ex: Aparelho importado, caixa original, bateria 100%..."
                    />
                  </div>
                </div>
              </div>

              {/* Botões */}
              <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-secondary flex-1"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                  disabled={loading}
                >
                  {loading ? "Salvando..." : "Cadastrar Produto"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}