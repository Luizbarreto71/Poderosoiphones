"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Smartphone, 
  Scan, 
  Users, 
  Shield, 
  Wrench, 
  DollarSign, 
  FileText, 
  Settings,
  LogOut,
  Package,
  ChevronLeft,
  Menu,
  X,
  BarChart3,
  ShoppingCart,
  ClipboardList,
  ArrowRightLeft
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface MenuGroup {
  label: string
  items: MenuItem[]
}

interface MenuItem {
  href: string
  label: string
  icon: React.ElementType
}

const menuGroups: MenuGroup[] = [
  {
    label: "Principal",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ]
  },
  {
    label: "Gestão",
    items: [
      { href: "/produtos", label: "Produtos", icon: Package },
      { href: "/imeis", label: "IMEIs", icon: Smartphone },
      { href: "/estoque", label: "Estoque", icon: ClipboardList },
    ]
  },
  {
    label: "Vendas",
    items: [
      { href: "/pdv", label: "PDV", icon: Scan },
      { href: "/vendas", label: "Vendas", icon: ShoppingCart },
      { href: "/trocas", label: "Trocas", icon: ArrowRightLeft },
      { href: "/clientes", label: "Clientes", icon: Users },
    ]
  },
  {
    label: "Serviços",
    items: [
      { href: "/garantias", label: "Garantias", icon: Shield },
      { href: "/servicos", label: "Ordens de Serviço", icon: Wrench },
    ]
  },
  {
    label: "Financeiro",
    items: [
      { href: "/financeiro", label: "Financeiro", icon: DollarSign },
      { href: "/relatorios", label: "Relatórios", icon: BarChart3 },
    ]
  },
  {
    label: "Sistema",
    items: [
      { href: "/configuracoes", label: "Configurações", icon: Settings },
      { href: "/configuracoes/usuarios", label: "Usuários", icon: Users },
    ]
  }
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  mobileOpen: boolean
  onMobileClose: () => void
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { signOut } = useAuth()

  const handleLogout = async () => {
    await signOut()
    router.push("/login")
  }

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Smartphone className="h-5 w-5 text-white" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-base font-bold text-white">Poderoso</span>
            <span className="text-xs text-white/50">iPhones</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {menuGroups.map((group) => (
          <div key={group.label} className="mb-4">
            {!collapsed && (
              <p className="px-3 mb-1 text-xs font-semibold text-white/40 uppercase tracking-wider">
                {group.label}
              </p>
            )}
            {group.items.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onMobileClose}
                  className={cn(
                    "sidebar-nav-item",
                    isActive && "active"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="nav-icon">
                    <Icon className="h-5 w-5" />
                  </span>
                  {!collapsed && <span className="sidebar-nav-label">{item.label}</span>}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <button
          onClick={handleLogout}
          className="sidebar-nav-item"
          title="Sair"
        >
          <span className="nav-icon">
            <LogOut className="h-5 w-5" />
          </span>
          {!collapsed && <span className="sidebar-nav-label">Sair</span>}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={cn(
        "sidebar hide-mobile",
        collapsed ? "sidebar-collapsed" : "sidebar-expanded"
      )}>
        {sidebarContent}
        
        {/* Toggle Button */}
        <button
          onClick={onToggle}
          className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:shadow transition-shadow"
        >
          <ChevronLeft className={cn("h-3 w-3 text-gray-500 transition-transform", collapsed && "rotate-180")} />
        </button>
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="mobile-overlay open" onClick={onMobileClose} />
      )}

      {/* Mobile Sidebar */}
      <aside className={cn(
        "sidebar md:hidden",
        mobileOpen ? "sidebar-expanded" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-end p-4">
          <button onClick={onMobileClose} className="text-white/60 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>
        {sidebarContent}
      </aside>
    </>
  )
}

