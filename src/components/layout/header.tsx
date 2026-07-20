"use client"

import * as React from "react"
import { Menu, Bell, Search, User } from "lucide-react"

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="header glass">
      {/* Mobile Menu Button */}
      <button onClick={onMenuClick} className="md:hidden p-2 hover:bg-gray-100 rounded-lg">
        <Menu className="h-5 w-5 text-gray-600" />
      </button>

      {/* Search */}
      <div className="header-search">
        <span className="search-icon">
          <Search className="h-4 w-4" />
        </span>
        <input type="text" placeholder="Buscar produtos, clientes, vendas..." />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Notifications */}
        <button className="relative p-2 hover:bg-gray-100 rounded-lg">
          <Bell className="h-5 w-5 text-gray-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Profile */}
        <button className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-lg">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-gray-900">Admin</p>
            <p className="text-xs text-gray-500">admin@poderoso.com</p>
          </div>
        </button>
      </div>
    </header>
  )
}