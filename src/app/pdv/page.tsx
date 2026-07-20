"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Search, Plus, Minus, Trash2, ShoppingCart, User, CreditCard, QrCode } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"

interface Product {
  id: string
  name: string
  price: number
  stock: number
  image: string
}

interface CartItem extends Product {
  quantity: number
}

export default function PdvPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [search, setSearch] = useState("")
  const [showPayment, setShowPayment] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, stock, image_url')
        .gt('stock', 0)
        .order('name')

      if (error) throw error
      
      const formattedProducts = (data || []).map(p => ({
        ...p,
        image: p.image_url || '📱'
      }))
      
      setProducts(formattedProducts)
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.id === product.id)
    if (existing) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, { ...product, quantity: 1 }])
    }
  }

  const updateQuantity = (id: string, delta: number) => {
    setCart(cart.map(item => 
      item.id === id 
        ? { ...item, quantity: Math.max(1, item.quantity + delta) }
        : item
    ).filter(item => item.quantity > 0))
  }

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id))
  }

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleFinishSale = async () => {
    if (cart.length === 0 || !customerName || !customerPhone) {
      alert("Preencha os dados do cliente")
      return
    }
    setShowPayment(true)
  }

  const handlePayment = async (method: string) => {
    setPaymentMethod(method)
    
    try {
      // Buscar ou criar cliente
      let { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('phone', customerPhone)
        .single()

      if (!customer) {
        const { data: newCustomer, error: customerError } = await supabase
          .from('customers')
          .insert([{
            name: customerName,
            phone: customerPhone
          }])
          .select('id')
          .single()

        if (customerError) throw customerError
        customer = newCustomer
      }

      // Registrar cada item do carrinho como uma venda
      for (const item of cart) {
        const { error: saleError } = await supabase
          .from('sales')
          .insert([{
            user_id: user?.id || null,
            customer_id: customer.id,
            customer_name: customerName,
            customer_phone: customerPhone,
            product_id: item.id,
            product_name: item.name,
            imei: `SEM-IMEI-${Date.now()}-${item.id}`,
            quantity: item.quantity,
            unit_price: item.price,
            total: item.price * item.quantity,
            total_price: item.price * item.quantity,
            final_price: item.price * item.quantity,
            payment_method: method,
            sale_status: "completed",
            date: new Date().toISOString().split('T')[0]
          }])

        if (saleError) throw saleError

        // Atualizar estoque
        const { error: stockError } = await supabase
          .from('products')
          .update({ stock: item.stock - item.quantity })
          .eq('id', item.id)

        if (stockError) console.error('Erro ao atualizar estoque:', stockError)
      }

      alert(`Venda finalizada com ${method}! Total: ${formatCurrency(total)}`)
      setCart([])
      setShowPayment(false)
      setCustomerName("")
      setCustomerPhone("")
      loadProducts()
    } catch (error) {
      console.error('Erro ao finalizar venda:', error)
      alert("Erro ao finalizar venda")
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="page-title">PDV</h1>
          <p className="page-subtitle">Ponto de Venda</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Products */}
          <div className="lg:col-span-2 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar produto por nome..."
                className="input-modern pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Carregando produtos...</p>
              </div>
            ) : (
              <div className="grid-auto">
                {filteredProducts.map((product) => (
                  <motion.button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="product-card text-left"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="product-image">
                      <span className="text-5xl">{product.image}</span>
                    </div>
                    <div className="product-info">
                      <p className="product-name">{product.name}</p>
                      <p className="product-price">{formatCurrency(product.price)}</p>
                      <p className="text-xs text-gray-500 mt-1">Estoque: {product.stock}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* Cart */}
          <div className="lg:col-span-1">
            <div className="chart-container sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="chart-title mb-0">Carrinho</h3>
                <ShoppingCart className="h-5 w-5 text-gray-400" />
              </div>

              {/* Customer Info */}
              <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                <input
                  type="text"
                  placeholder="Nome do cliente"
                  className="input-modern"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
                <input
                  type="tel"
                  placeholder="Telefone"
                  className="input-modern"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Carrinho vazio</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2 max-h-96 overflow-y-auto mb-4">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <span className="text-2xl">{item.image}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                          <p className="text-sm font-semibold text-gray-900">{formatCurrency(item.price)}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-6 h-6 flex items-center justify-center bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-6 h-6 flex items-center justify-center bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-200 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">{formatCurrency(total)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-blue-600">{formatCurrency(total)}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleFinishSale}
                    className="btn btn-primary w-full mt-4"
                  >
                    <CreditCard className="h-4 w-4" />
                    Finalizar Venda
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Payment Modal */}
        {showPayment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-bold mb-4">Forma de Pagamento</h3>
              <p className="text-gray-600 mb-6">Total: <span className="text-2xl font-bold text-blue-600">{formatCurrency(total)}</span></p>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handlePayment("PIX")}
                  className="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-600 hover:bg-blue-50 transition-all"
                >
                  <QrCode className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <p className="font-medium">PIX</p>
                </button>
                <button
                  onClick={() => handlePayment("Dinheiro")}
                  className="p-4 border-2 border-gray-200 rounded-xl hover:border-green-600 hover:bg-green-50 transition-all"
                >
                  <span className="text-2xl">💵</span>
                  <p className="font-medium">Dinheiro</p>
                </button>
                <button
                  onClick={() => handlePayment("Débito")}
                  className="p-4 border-2 border-gray-200 rounded-xl hover:border-purple-600 hover:bg-purple-50 transition-all"
                >
                  <CreditCard className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <p className="font-medium">Débito</p>
                </button>
                <button
                  onClick={() => handlePayment("Crédito")}
                  className="p-4 border-2 border-gray-200 rounded-xl hover:border-orange-600 hover:bg-orange-50 transition-all"
                >
                  <CreditCard className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                  <p className="font-medium">Crédito</p>
                </button>
              </div>

              <button
                onClick={() => setShowPayment(false)}
                className="w-full mt-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
              >
                Cancelar
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}