"use client"

import * as React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Smartphone } from "lucide-react"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push("/dashboard")
      } else {
        router.push("/login")
      }
    })
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600">
          <Smartphone className="h-10 w-10 text-white animate-pulse" />
        </div>
        <p className="mt-4 text-gray-600">Carregando...</p>
      </div>
    </div>
  )
}