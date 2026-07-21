"use client"

import * as React from "react"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Smartphone, Hash, MapPin, DollarSign, TrendingUp, Scan, CheckCircle, XCircle, Zap } from "lucide-react"
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
  })
  const [loading, setLoading] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [imeiMessage, setImeiMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [autoMode, setAutoMode] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const imeiRef = useRef<HTMLInputElement>(null)
  const brandRef = useRef<HTMLInputElement>(null)
  const modelRef = useRef<HTMLInputElement>(null)
  const inputBuffer = useRef<string>("")
  const bufferTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  // Auto focus no campo de IMEI
  useEffect(() => {
    if (isOpen && imeiRef.current) {
      setTimeout(() => imeiRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Limpar mensagem após 3 segundos
  useEffect(() => {
    if (imeiMessage) {
      const timer = setTimeout(() => setImeiMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [imeiMessage])

  // Calcular lucro e margem
  const cost = parseFloat(formData.cost) || 0
  const price = parseFloat(formData.price) || 0
  const profit = price - cost
  const margin = price > 0 ? ((profit / price) * 100).toFixed(1) : "0"

  // Nome automático do produto
  const productName = formData.brand && formData.model 
    ? `${formData.brand} ${formData.model}`
    : ""

  // Validar IMEI (algoritmo de Luhn)
  const validateIMEI = (imei: string): boolean => {
    if (!/^\d{15}$/.test(imei)) return false
    let sum = 0
    for (let i = 0; i < 15; i++) {
      let digit = parseInt(imei[i])
      if (i % 2 === 1) {
        digit *= 2
        if (digit > 9) digit -= 9
      }
      sum += digit
    }
    return sum % 10 === 0
  }

  // Extrair TAC do IMEI
  const extractTAC = (imei: string): string => imei.substring(0, 8)

  // Buscar dispositivo pela TAC
  const lookupTAC = async (tac: string) => {
    const { data, error } = await supabase
      .from('device_tac_database')
      .select('*')
      .eq('tac', tac)
      .single()

    if (error || !data) return null
    return data
  }

  // Processar IMEI escaneado
  const processIMEI = async (imei: string) => {
    const cleanIMEI = imei.replace(/\D/g, '')

    if (cleanIMEI.length !== 15) {
      setImeiMessage({ type: "error", text: "IMEI inválido! Deve ter 15 dígitos." })
      setScanning(false)
      return
    }

    if (!validateIMEI(cleanIMEI)) {
      setImeiMessage({ type: "error", text: "IMEI inválido! Dígito verificador incorreto." })
      setScanning(false)
      return
    }

    setScanning(true)

    try {
      // Verificar se IMEI já existe
      const { data: existingIMEI } = await supabase
        .from('imeis')
        .select('id')
        .eq('imei_primary', cleanIMEI)
        .single()

      if (existingIMEI) {
        setImeiMessage({ type: "error", text: "IMEI já cadastrado no sistema!" })
        setScanning(false)
        return
      }

      // Buscar na base TAC
      const tac = extractTAC(cleanIMEI)
      const device = await lookupTAC(tac)

      // Atualizar form com IMEI
      setFormData(prev => ({
        ...prev,
        imei_primary: cleanIMEI,
      }))

      if (device) {
        // Preencher automaticamente marca, modelo e categoria
        setFormData(prev => ({
          ...prev,
          imei_primary: cleanIMEI,
          brand: device.brand,
          model: device.model,
          category: device.brand === 'Apple' ? 'iPhone' : 
                    device.brand === 'Samsung' ? 'Samsung' : 
                    device.brand === 'Xiaomi' ? 'Xiaomi' : 'Outros',
        }))

        setImeiMessage({ type: "success", text: `✅ ${device.brand} ${device.model} identificado!` })
        playBeep(800, 200)
      } else {
        setImeiMessage({ type: "error", text: `TAC ${tac} não encontrado. Preencha manualmente.` })
      }

      setAutoMode(true)
    } catch (error) {
      console.error('Erro ao processar IMEI:', error)
      setImeiMessage({ type: "error", text: "Erro ao processar IMEI. Tente novamente." })
    } finally {
      setScanning(false)
    }
  }

  // Som de beep
  const playBeep = (frequency: number, duration: number) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      oscillator.frequency.value = frequency
      oscillator.type = 'sine'
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000)
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + duration / 1000)
    } catch (error) {
      console.error('Erro ao reproduzir som:', error)
    }
  }

  // Detectar entrada do leitor de código de barras
  const handleImeiKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const imei = formData.imei_primary.trim()
      if (imei.length > 0) {
        processIMEI(imei)
      }
    }
  }

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
      
      const { data: productData, error } = await supabase
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
          sale_price: parseFloat(formData.price),
          profit: parseFloat(formData.price) - parseFloat(formData.cost),
          stock: parseInt(formData.stock),
          min_stock: parseInt(formData.min_stock),
          product_status: "ativo"
        }])
        .select()
        .single()

      if (error) throw error

      // Se tiver IMEI, criar registro na tabela imeis
      if (formData.imei_primary && formData.imei_primary.length === 15) {
        const { error: imeiError } = await supabase
          .from('imeis')
          .insert([{
            product_id: productData.id,
            imei_primary: formData.imei_primary,
            imei_secondary: formData.imei_secondary || null,
            serial_number: formData.serial_number || null,
            imei_status: 'estoque',
            notes: formData.imei_secondary ? `IMEI Secundário: ${formData.imei_secondary}` : null
          }])

        if (imeiError) {
          console.error('Erro ao salvar IMEI:', imeiError)
        }
      }

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
      })
      setImeiMessage(null)
      setAutoMode(false)
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

            {/* Leitor de IMEI - Seção em Destaque */}
            <div className="px-8 pt-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Scan className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-blue-900 mb-1.5">
                      📱 Escaneie ou digite o IMEI
                    </label>
                    <div className="relative">
                      <input
                        ref={imeiRef}
                        type="text"
                        inputMode="numeric"
                        maxLength={15}
                        className={`w-full text-lg font-mono tracking-wider input-modern pr-10 ${
                          scanning ? "border-blue-500 animate-pulse" : ""
                        } ${imeiMessage?.type === "success" ? "border-green-500 bg-green-50" : ""} ${
                          imeiMessage?.type === "error" ? "border-red-500 bg-red-50" : ""
                        }`}
                        value={formData.imei_primary}
                        onChange={(e) => setFormData({...formData, imei_primary: e.target.value.replace(/\D/g, '')})}
                        onKeyDown={handleImeiKeyDown}
                        placeholder="Aguardando leitura do leitor..."
                        disabled={loading}
                        autoComplete="off"
                      />
                      {scanning && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Zap className="h-5 w-5 text-blue-600 animate-pulse" />
                        </div>
                      )}
                    </div>
                    {imeiMessage && (
                      <div className={`mt-2 flex items-center gap-1.5 text-sm ${
                        imeiMessage.type === "success" ? "text-green-700" : "text-red-700"
                      }`}>
                        {imeiMessage.type === "success" ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        <span>{imeiMessage.text}</span>
                      </div>
                    )}
                    <p className="text-xs text-blue-600 mt-1.5">
                      Leitor de código de barras USB/Bluetooth • Digite 15 dígitos
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="p-8 overflow-y-auto max-h-[calc(90vh-150px)]">
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
                          className={`input-modern ${errors.brand ? 'border-red-500' : ''} ${autoMode ? 'bg-green-50 border-green-300' : ''}`}
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
                          className={`input-modern ${errors.model ? 'border-red-500' : ''} ${autoMode ? 'bg-green-50 border-green-300' : ''}`}
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
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Cor</label>
                        <input
                          type="text"
                          className="input-modern"
                          value={formData.color}
                          onChange={(e) => setFormData({...formData, color: e.target.value})}
                          placeholder="Ex: Preto"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Capacidade</label>
                        <input
                          type="text"
                          className="input-modern"
                          value={formData.capacity}
                          onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                          placeholder="Ex: 128GB"
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
                      <div className="grid grid-cols-2 gap-3">
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
                  <div className={`rounded-2xl p-6 border transition-all ${
                    autoMode 
                      ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-300" 
                      : productName 
                        ? "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200" 
                        : ""
                  }`}>
                    {productName ? (
                      <>
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                          📱 Preview do Produto
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
                                {formData.color && `${formData.color} • `}
                                {formData.condition === 'novo' ? 'Novo' : 
                                 formData.condition === 'seminovo' ? 'Seminovo' :
                                 formData.condition === 'usado' ? 'Usado' : 'Vitrine'}
                              </p>
                              {formData.imei_primary && (
                                <p className="text-xs font-mono text-gray-500 mt-1">
                                  IMEI: {formData.imei_primary.slice(0, 6)}******{formData.imei_primary.slice(-3)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <Scan className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">Bipe o IMEI para ver o preview</p>
                      </div>
                    )}
                  </div>

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