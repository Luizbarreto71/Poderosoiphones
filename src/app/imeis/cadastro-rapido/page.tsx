"use client"

import * as React from "react"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Smartphone, Scan, CheckCircle, XCircle, Package, DollarSign, MapPin, Zap, Save, RefreshCw } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { supabase } from "@/lib/supabase"

interface DeviceInfo {
  tac: string
  manufacturer: string
  brand: string
  model: string
}

interface FormData {
  imei: string
  serial_number: string
  capacity: string
  color: string
  condition: string
  cost: string
  price: string
  location: string
}

export default function CadastroRapidoImeiPage() {
  const [imeiInput, setImeiInput] = useState("")
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null)
  const [formData, setFormData] = useState<FormData>({
    imei: "",
    serial_number: "",
    capacity: "",
    color: "",
    condition: "novo",
    cost: "",
    price: "",
    location: "Vitrine",
  })
  const [loading, setLoading] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [lastSavedDevice, setLastSavedDevice] = useState<DeviceInfo | null>(null)
  
  const imeiRef = useRef<HTMLInputElement>(null)
  const inputBuffer = useRef<string>("")
  const bufferTimeout = useRef<ReturnType<typeof setTimeout>>()

  // Auto focus no campo de IMEI
  useEffect(() => {
    if (imeiRef.current) {
      setTimeout(() => imeiRef.current?.focus(), 100)
    }
  }, [])

  // Limpar mensagem após 3 segundos
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [message])

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

  // Extrair TAC do IMEI (primeiros 8 dígitos)
  const extractTAC = (imei: string): string => {
    return imei.substring(0, 8)
  }

  // Buscar informações do dispositivo pela TAC
  const lookupTAC = async (tac: string): Promise<DeviceInfo | null> => {
    const { data, error } = await supabase
      .from('device_tac_database')
      .select('*')
      .eq('tac', tac)
      .single()

    if (error || !data) return null

    return {
      tac: data.tac,
      manufacturer: data.manufacturer,
      brand: data.brand,
      model: data.model,
    }
  }

  // Processar IMEI escaneado
  const processIMEI = async (imei: string) => {
    // Limpar espaços e caracteres não numéricos
    const cleanIMEI = imei.replace(/\D/g, '')

    if (cleanIMEI.length !== 15) {
      setMessage({ type: "error", text: "IMEI inválido! Deve ter 15 dígitos." })
      return
    }

    if (!validateIMEI(cleanIMEI)) {
      setMessage({ type: "error", text: "IMEI inválido! Dígito verificador incorreto." })
      return
    }

    setLoading(true)
    setScanning(true)

    try {
      // Verificar se IMEI já existe
      const { data: existingIMEI } = await supabase
        .from('imeis')
        .select('id')
        .eq('imei_primary', cleanIMEI)
        .single()

      if (existingIMEI) {
        setMessage({ type: "error", text: "IMEI já cadastrado no sistema!" })
        setScanning(false)
        setLoading(false)
        return
      }

      // Extrair TAC e buscar informações
      const tac = extractTAC(cleanIMEI)
      const device = await lookupTAC(tac)

      if (!device) {
        setMessage({ type: "error", text: `TAC ${tac} não encontrado na base de dados.` })
        setScanning(false)
        setLoading(false)
        return
      }

      // Atualizar estado com informações do dispositivo
      setDeviceInfo(device)
      setFormData(prev => ({
        ...prev,
        imei: cleanIMEI,
      }))

      setMessage({ type: "success", text: `✅ ${device.brand} ${device.model} identificado!` })
      
      // Som de sucesso (beep)
      playBeep(800, 200)

    } catch (error) {
      console.error('Erro ao processar IMEI:', error)
      setMessage({ type: "error", text: "Erro ao processar IMEI. Tente novamente." })
    } finally {
      setScanning(false)
      setLoading(false)
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
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      
      // Se o buffer tem conteúdo, processar
      if (inputBuffer.current.length > 0) {
        processIMEI(inputBuffer.current)
        inputBuffer.current = ""
      }
    } else if (e.key.length === 1) {
      // Adicionar caractere ao buffer
      inputBuffer.current += e.key
      
      // Limpar buffer após 100ms sem digitação (leitor é rápido)
      if (bufferTimeout.current) {
        clearTimeout(bufferTimeout.current)
      }
      
      bufferTimeout.current = setTimeout(() => {
        // Se o buffer tem 15 dígitos, processar automaticamente
        if (inputBuffer.current.length === 15) {
          processIMEI(inputBuffer.current)
          inputBuffer.current = ""
        }
      }, 100)
    }
  }

  // Salvar aparelho
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.imei || !formData.cost || !formData.price) {
      setMessage({ type: "error", text: "Preencha todos os campos obrigatórios!" })
      return
    }

    setLoading(true)

    try {
      // Criar produto se não existir
      const productName = `${formData.capacity} ${deviceInfo?.brand || ''} ${deviceInfo?.model || ''}`.trim()
      
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert([{
          name: productName,
          brand: deviceInfo?.brand || 'Desconhecido',
          model: deviceInfo?.model || 'Desconhecido',
          category: deviceInfo?.brand === 'Apple' ? 'iPhone' : 
                    deviceInfo?.brand === 'Samsung' ? 'Samsung' : 
                    deviceInfo?.brand === 'Xiaomi' ? 'Xiaomi' : 'Outros',
          capacity: formData.capacity,
          color: formData.color,
          condition: formData.condition,
          cost: parseFloat(formData.cost),
          price: parseFloat(formData.price),
          stock: 1,
          min_stock: 1,
          product_status: "ativo"
        }])
        .select()
        .single()

      if (productError) throw productError

      // Criar registro de IMEI
      const { error: imeiError } = await supabase
        .from('imeis')
        .insert([{
          product_id: product.id,
          imei_primary: formData.imei,
          serial_number: formData.serial_number || null,
          imei_status: 'estoque',
          purchase_price: parseFloat(formData.cost),
          notes: `Cadastrado via leitor de código de barras`
        }])

      if (imeiError) throw imeiError

      setMessage({ type: "success", text: "✅ Aparelho cadastrado com sucesso!" })
      playBeep(1000, 300)

      // Salvar último dispositivo para preview
      setLastSavedDevice(deviceInfo)

      // Limpar formulário
      resetForm()

    } catch (error) {
      console.error('Erro ao salvar:', error)
      setMessage({ type: "error", text: "Erro ao salvar. Tente novamente." })
    } finally {
      setLoading(false)
    }
  }

  // Resetar formulário
  const resetForm = () => {
    setImeiInput("")
    setDeviceInfo(null)
    setFormData({
      imei: "",
      serial_number: "",
      capacity: "",
      color: "",
      condition: "novo",
      cost: "",
      price: "",
      location: "Vitrine",
    })
    inputBuffer.current = ""
    
    // Voltar foco para o campo de IMEI
    setTimeout(() => imeiRef.current?.focus(), 100)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="page-title flex items-center gap-3">
            <Scan className="h-8 w-8 text-blue-600" />
            Cadastro Rápido por IMEI
          </h1>
          <p className="page-subtitle">
            Bipe o código de barras do IMEI para cadastrar automaticamente
          </p>
        </div>

        {/* Mensagem */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`p-4 rounded-xl flex items-center gap-3 ${
                message.type === "success" 
                  ? "bg-green-50 border border-green-200 text-green-800" 
                  : "bg-red-50 border border-red-200 text-red-800"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
              <p className="font-medium">{message.text}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scanner Input */}
        <div className="chart-container">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Scan className="inline h-4 w-4 mr-2" />
                Escaneie ou bipe o IMEI
              </label>
              <input
                ref={imeiRef}
                type="text"
                inputMode="numeric"
                className={`input-modern text-2xl text-center font-mono tracking-wider ${
                  scanning ? "border-blue-500 animate-pulse" : ""
                }`}
                value={imeiInput}
                onChange={(e) => setImeiInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Aguardando leitura do leitor..."
                disabled={loading}
                autoComplete="off"
              />
              {scanning && (
                <p className="text-sm text-blue-600 mt-2 flex items-center gap-2">
                  <Zap className="h-4 w-4 animate-pulse" />
                  Processando IMEI...
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Device Info & Form */}
        {deviceInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="chart-container"
          >
            <div className="grid md:grid-cols-2 gap-6">
              {/* Preview do Aparelho */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                  📱 Aparelho Identificado
                </h3>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-blue-100">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Smartphone className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 text-lg">
                        {deviceInfo.brand} {deviceInfo.model}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {deviceInfo.manufacturer}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 font-mono">
                        TAC: {deviceInfo.tac}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Formulário Rápido */}
              <form onSubmit={handleSave} className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                  ⚡ Dados do Aparelho
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Capacidade *
                    </label>
                    <select
                      required
                      className="select-modern"
                      value={formData.capacity}
                      onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                    >
                      <option value="">Selecione...</option>
                      <option value="128GB">128GB</option>
                      <option value="256GB">256GB</option>
                      <option value="512GB">512GB</option>
                      <option value="1TB">1TB</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cor *
                    </label>
                    <select
                      required
                      className="select-modern"
                      value={formData.color}
                      onChange={(e) => setFormData({...formData, color: e.target.value})}
                    >
                      <option value="">Selecione...</option>
                      <option value="Preto">Preto</option>
                      <option value="Branco">Branco</option>
                      <option value="Azul">Azul</option>
                      <option value="Titânio Natural">Titânio Natural</option>
                      <option value="Titânio Azul">Titânio Azul</option>
                      <option value="Verde">Verde</option>
                      <option value="Amarelo">Amarelo</option>
                      <option value="Rosa">Rosa</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Custo (R$) *
                    </label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preço Venda (R$) *
                    </label>
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Localização
                  </label>
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

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn btn-secondary flex-1"
                    disabled={loading}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Limpar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary flex-1"
                    disabled={loading}
                  >
                    <Save className="h-4 w-4" />
                    {loading ? "Salvando..." : "Salvar Aparelho"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {/* Último Aparelho Salvo */}
        {lastSavedDevice && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="chart-container bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200"
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="font-bold text-green-900">Último Aparelho Salvo</p>
                <p className="text-sm text-green-700">
                  {lastSavedDevice.brand} {lastSavedDevice.model}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Instruções */}
        <div className="chart-container bg-blue-50 border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-3">📋 Como usar:</h3>
          <ol className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="font-bold">1.</span>
              <span>Clique no campo "Escaneie ou bipe o IMEI"</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">2.</span>
              <span>Bipe o código de barras da caixa do aparelho</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">3.</span>
              <span>O sistema identifica automaticamente marca e modelo</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">4.</span>
              <span>Preencha capacidade, cor, custo e preço</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">5.</span>
              <span>Clique em "Salvar Aparelho"</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">6.</span>
              <span>O sistema volta automaticamente para o campo de leitura</span>
            </li>
          </ol>
        </div>
      </div>
    </DashboardLayout>
  )
}