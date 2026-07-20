"use client"

import * as React from "react"
import { useState } from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { cn } from "@/lib/utils"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main Content */}
      <div className={cn(
        "main-content transition-all duration-300",
        sidebarCollapsed ? "main-content-collapsed" : "main-content-expanded"
      )}>
        {/* Header */}
        <Header onMenuClick={() => setMobileOpen(true)} />

        {/* Page Content */}
        <main className="page">
          {children}
        </main>
      </div>
    </div>
  )
}