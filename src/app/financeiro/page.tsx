"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Plus, TrendingUp, TrendingDown, DollarSign, Wallet, CreditCard, ArrowUpCircle, ArrowDownCircle, Search, Calendar } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { supabase } from "@/lib/supabase"

interface Transaction {
  id: string
  type: string
  category: string
  description: string
  amount: number
  payment_method: string
  due_date: string
  paid_date: string
  transaction_status: string
  created_at: string
}

export default function FinanceiroPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("todas")
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    type: "receita",
    category: "venda",
    description: "",
    amount: "",
    payment_method: "pix",
    due_date: "",
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('financial_transactions')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTransactions(data || [])
    } catch (error) {
      console.error('Erro ao carregar transações:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const { error } = await supabase
        .from('financial_transactions')
        .insert([{
          type: formData.type,
          category: formData.category,
          description: formData.description,
          amount: parseFloat(formData.amount),
          payment_method: formData.payment_method || null,
          due_date: formData.due_date || null,
          transaction_status: 'paid'
        }])

      if (error) throw error

      alert("Transação registrada com sucesso!")
      setShowForm(false)
      setFormData({ type: "receita", category: "venda", description: "", amount: "", payment_method: "pix", due_date: "" })
      loadTransactions()
    } catch (error) {
      console.error('Erro ao registrar:', error)
      alert("Erro ao registrar transação")
    } finally {
      setSubmitting(false)
    }
  }

  const receitas = transactions.filter(t => t.type === 'receita')
  const despesas = transactions.filter(t => t.type === 'despesa')
  const totalReceitas = receitas.reduce((s, t) => s + Number(t.amount), 0)
  const totalDespesas = despesas.reduce((s, t) => s + Number(t.amount), 0)
  const saldo = totalReceitas - totalDespesas

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === "todas" || t.type === filter
    return matchesSearch && matchesFilter
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Financeiro</h1>
            <p className="page-subtitle">Controle financeiro completo</p>
          </div>
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            <Plus className="h-4 w-4" />
            Nova Transação
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="stat-card bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <ArrowUpCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-green-600 font-medium">Receitas</p>
                <p className="text-xl font-bold text-green-700">{formatCurrency(totalReceitas)}</p>
              </div>
            </div>
          </div>
          <div className="stat-card bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <ArrowDownCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-red-600 font-medium">Despesas</p>
                <p className="text-xl font-bold text-red-700">{formatCurrency(totalDespesas)}</p>
              </div>
            </div>
          </div>
          <div className={`stat-card bg-gradient-to-br ${saldo >= 0 ? 'from-blue-50 to-indigo-50 border-blue-200' : 'from-red-50 to-rose-50 border-red-200'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 ${saldo >= 0 ? 'bg-blue-100' : 'bg-red-100'} rounded-xl flex items-center justify-center`}>
                <DollarSign className={`h-6 w-6 ${saldo >= 0 ? 'text-blue-600' : 'text-red-600'}`} />
              </div>
              <div>
                <p className="text-xs font-medium">Saldo</p>
                <p className={`text-xl font-bold ${saldo >= 0 ? 'text-blue-700' : 'text-red-700'}`}>{formatCurrency(saldo)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'todas', label: 'Todas' },
            { key: 'receita', label: 'Receitas' },
            { key: 'despesa', label: 'Despesas' },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === f.key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{f.label}</button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" placeholder="Buscar transações..." className="input-modern pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {/* Transactions */}
        <div className="chart-container">
          {loading ? (
            <div className="text-center py-12"><p className="text-gray-500">Carregando...</p></div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Wallet className="h-12 w-12 mx-auto mb-3" />
              <p>Nenhuma transação encontrada</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTransactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-3">
                    {t.type === 'receita' ? (
                      <ArrowUpCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <ArrowDownCircle className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <p className="font-medium text-sm">{t.description}</p>
                      <p className="text-xs text-gray-400">{t.category} • {new Date(t.created_at).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <p className={`font-bold ${t.type === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === 'receita' ? '+' : '-'}{formatCurrency(t.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* New Transaction Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-6">Nova Transação</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setFormData({...formData, type: "receita"})} className={`p-3 rounded-xl border-2 text-center transition-all ${formData.type === 'receita' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                    <ArrowUpCircle className="h-6 w-6 mx-auto mb-1 text-green-600" />
                    <span className="text-sm font-medium">Receita</span>
                  </button>
                  <button type="button" onClick={() => setFormData({...formData, type: "despesa"})} className={`p-3 rounded-xl border-2 text-center transition-all ${formData.type === 'despesa' ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
                    <ArrowDownCircle className="h-6 w-6 mx-auto mb-1 text-red-600" />
                    <span className="text-sm font-medium">Despesa</span>
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                  <select className="select-modern" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                    <option value="venda">Venda</option>
                    <option value="servico">Serviço</option>
                    <option value="aluguel">Aluguel</option>
                    <option value="fornecedor">Fornecedor</option>
                    <option value="salario">Salário</option>
                    <option value="imposto">Imposto</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição *</label>
                  <input type="text" required className="input-modern" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Descrição da transação" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$) *</label>
                    <input type="number" required step="0.01" className="input-modern" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} placeholder="0.00" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pagamento</label>
                    <select className="select-modern" value={formData.payment_method} onChange={(e) => setFormData({...formData, payment_method: e.target.value})}>
                      <option value="pix">PIX</option>
                      <option value="dinheiro">Dinheiro</option>
                      <option value="debito">Débito</option>
                      <option value="credito">Crédito</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary flex-1">Cancelar</button>
                  <button type="submit" className="btn btn-primary flex-1" disabled={submitting}>{submitting ? "Salvando..." : "Registrar"}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}